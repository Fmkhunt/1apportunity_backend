import { db } from '../config/database';
import { huntsTable, huntClaimTable, huntTasksTable, tasksTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql, getTableColumns,isNull, ne, notExists, lte, gte } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THunt,
  TCreateHuntData,
  TUpdateHuntData,
  THuntQueryParams,
  TgetHuntUserQueryParams,
  THuntWithClaim,
  TTask
} from '../types';
import { trpcUser } from '../trpc/client';

export class HuntService {
  /**
   * Convert coordinates to WKT format for PostgreSQL geography type
   */
  private static coordinatesToWKT(coordinates: string | { latitude: number; longitude: number }): string {
    if (typeof coordinates === 'string') {
      // If it's already a WKT string, ensure it has SRID
      if (coordinates.toUpperCase().startsWith('POINT')) {
        return `SRID=4326;${coordinates}`;
      }
      return coordinates;
    }
    
    // Convert object to WKT POINT format with SRID for geography type
    return `SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})`;
  }

  /**
   * Parse a WKT POLYGON string to an array of [lng, lat]
   */
  private static parseWktPolygon(wkt: string): [number, number][] {
    // Expect formats like: 'POLYGON((lng lat, lng lat, ...))' or with SRID prefix
    const polyStr = wkt.includes('POLYGON') ? wkt : wkt.toUpperCase();
    const start = polyStr.indexOf('POLYGON');
    if (start === -1) return [];
    const open = polyStr.indexOf('(', start);
    const close = polyStr.lastIndexOf(')');
    const inner = wkt.slice(open + 1, close).replace(/\(/g, '').replace(/\)/g, '');
    return inner
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(pair => {
        const [lngStr, latStr] = pair.split(/\s+/);
        return [Number(lngStr), Number(latStr)] as [number, number];
      });
  }

  /**
   * Ray-casting algorithm for point-in-polygon (lng,lat)
   */
  private static isPointInPolygon(point: { latitude: number; longitude: number }, polygon: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const x = point.longitude, y = point.latitude;
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Create a new hunt
   */
  static async create(huntData: TCreateHuntData): Promise<THunt> {
    try {
      // 1) Validate zone
      if (!huntData.zone_id) {
        throw new AppError('zone_id is required', 400);
      }

      let zone: any = null;
      try {
        zone = await (trpcUser as any).zone.getById.query(huntData.zone_id);
      } catch (e) {
        console.error(e)
        throw new AppError('Failed to validate zone via user-service', 502);
      }
      if (!zone) {
        throw new AppError('Zone not found', 404);
      }

      // 2) Validate coordinates inside zone area (if area exists)
      const coordinates = this.coordinatesToWKT(huntData.coordinates);
      let coordsObj: { latitude: number; longitude: number } | null = null;
      if (typeof huntData.coordinates === 'string') {
        // try to parse POINT(lng lat)
        const m = huntData.coordinates.match(/POINT\s*\(([-\d\.]+)\s+([-\d\.]+)\)/i);
        if (m) {
          coordsObj = { longitude: Number(m[1]), latitude: Number(m[2]) };
        }
      } else {
        coordsObj = huntData.coordinates;
      }
      if (zone.coordinates_arr && coordsObj) {
        const poly = JSON.parse(zone.coordinates_arr).coordinates[0];
        if (poly.length >= 3) {
          const inside = this.isPointInPolygon(coordsObj, poly);
          if (!inside) {
            throw new AppError('Coordinates are outside the zone geo area', 400);
          }
        }
      }
      
      const { task_ids, ...huntCore } = huntData as any;
      const [newHunt] = await db
        .insert(huntsTable)
        .values({
          ...huntCore,
          coordinates,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      // map tasks if provided
      if (task_ids && Array.isArray(task_ids) && task_ids.length > 0) {
        await db.insert(huntTasksTable).values(
          task_ids.map(tid => ({
            hunt_id: newHunt.id,
            task_id: tid,
            created_by: huntCore.created_by,
            created_at: new Date(),
            updated_at: new Date(),
          }))
        );
      }
        
      // Fetch the created hunt with coordinates extracted using PostgreSQL functions
      const result = await db
        .select({
          ...getTableColumns(huntsTable),
          coordinates_obj: sql<{ latitude: number; longitude: number } | null>`
          CASE 
            WHEN ${huntsTable.coordinates} IS NOT NULL THEN 
              jsonb_build_object(
                'latitude', ST_Y(${huntsTable.coordinates}::geometry), 
                'longitude', ST_X(${huntsTable.coordinates}::geometry)
              )
            ELSE NULL 
          END
        `
        })
        .from(huntsTable)
        .where(eq(huntsTable.id, newHunt.id))
        .limit(1);
      
      return result[0] as THunt;
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get all hunts with pagination and filtering
   */
  static async getAll(queryParams: THuntQueryParams): Promise<{
    hunts: THunt[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search, task_id, zone_id } = queryParams;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      // task filter handled via join below

      if (zone_id) {
        whereConditions.push(eq(huntsTable.zone_id as any, zone_id));
      }

      if (search) {
        whereConditions.push(
          or(
            like(huntsTable.name, `%${search}%`),
            like(huntsTable.description, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get hunts with pagination - use PostgreSQL's ST_X and ST_Y functions to extract coordinates directly
      const baseSelect = db
        .select({
          ...getTableColumns(huntsTable),
          coordinates_obj: sql<{ latitude: number; longitude: number } | null>`
            CASE 
              WHEN ${huntsTable.coordinates} IS NOT NULL THEN 
                jsonb_build_object(
                  'latitude', ST_Y(${huntsTable.coordinates}::geometry), 
                  'longitude', ST_X(${huntsTable.coordinates}::geometry)
                )
              ELSE NULL 
            END
          `
        })
        .from(huntsTable);

      const hunts = task_id
        ? await baseSelect
            .innerJoin(huntTasksTable, eq(huntTasksTable.hunt_id, huntsTable.id))
            .where(
              whereClause
                ? and(eq(huntTasksTable.task_id, task_id), whereClause)
                : eq(huntTasksTable.task_id, task_id)
            )
            .orderBy(desc(huntsTable.created_at))
            .limit(limit)
            .offset(offset)
        : await baseSelect
            .where(whereClause)
            .orderBy(desc(huntsTable.created_at))
            .limit(limit)
            .offset(offset);

      // Get total count
      const [{ count }] = task_id
        ? await db
            .select({ count: sql<number>`count(*)` })
            .from(huntsTable)
            .innerJoin(huntTasksTable, eq(huntTasksTable.hunt_id, huntsTable.id))
            .where(
              whereClause
                ? and(eq(huntTasksTable.task_id, task_id), whereClause)
                : eq(huntTasksTable.task_id, task_id)
            )
        : await db
            .select({ count: sql<number>`count(*)` })
            .from(huntsTable)
            .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        hunts: hunts as THunt[],
        totalRecords: Number(count),
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get hunt by ID
   */
  static async getById(huntId: string): Promise<THunt & { tasks: TTask[] } | null> {
    try {
      // Get hunt with its associated tasks
      const huntRows = await db
        .select({
          ...getTableColumns(huntsTable),
        })
        .from(huntsTable)
        .where(eq(huntsTable.id, huntId))
        .limit(1);

      if (!huntRows.length) return null;
      const hunt = huntRows[0];

      // Get tasks associated with this hunt
      const taskRows = await db
        .select({
          ...getTableColumns(tasksTable),
        })
        .from(huntTasksTable)
        .innerJoin(tasksTable, eq(huntTasksTable.task_id, tasksTable.id))
        .where(eq(huntTasksTable.hunt_id, huntId));

      // Combine hunt and tasks into result
      return {
        ...hunt,
        tasks: taskRows.map((row) => row)
      };
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update hunt by ID
   */
  static async update(huntId: string, updateData: TUpdateHuntData): Promise<THunt> {
    try {
      // Check if hunt exists
      const existingHunt = await this.getById(huntId);
      if (!existingHunt) {
        throw new AppError('Hunt not found', 404);
      }

      let coordinates = updateData.coordinates;
      if (coordinates) {
        coordinates = this.coordinatesToWKT(coordinates);
      }

      const { task_ids, ...updateCore } = updateData as any;
      const [updatedHunt] = await db
        .update(huntsTable)
        .set({
          ...updateCore,
          coordinates: coordinates as string | null,
          updated_at: new Date(),
        })
        .where(eq(huntsTable.id, huntId))
        .returning();

      // if task_ids provided, reset mappings
      if (task_ids) {
        await db.delete(huntTasksTable).where(eq(huntTasksTable.hunt_id, huntId));
        if (task_ids.length > 0) {
          await db.insert(huntTasksTable).values(task_ids.map(tid => ({
            hunt_id: huntId,
            task_id: tid,
            created_at: new Date(),
            updated_at: new Date(),
          })));
        }
      }

      // Fetch the updated hunt with coordinates extracted using PostgreSQL functions
      const result = await db
        .select({
          ...getTableColumns(huntsTable),  
          coordinates_obj: sql<{ latitude: number; longitude: number } | null>`
            CASE 
              WHEN ${huntsTable.coordinates} IS NOT NULL THEN 
                jsonb_build_object(
                  'latitude', ST_Y(${huntsTable.coordinates}::geometry), 
                  'longitude', ST_X(${huntsTable.coordinates}::geometry)
                )
              ELSE NULL 
            END
          `
        })
        .from(huntsTable)
        .where(eq(huntsTable.id, huntId))
        .limit(1);
      
      return result[0] as THunt & { coordinates_obj: { latitude: number; longitude: number } | null };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Delete hunt by ID
   */
  static async delete(huntId: string): Promise<void> {
    try {
      // Check if hunt exists
      const existingHunt = await this.getById(huntId);
      if (!existingHunt) {
        throw new AppError('Hunt not found', 404);
      }

      await db
        .delete(huntsTable)
        .where(eq(huntsTable.id, huntId));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get hunts by task ID
   */
  static async getByTaskId(taskId: string): Promise<THunt[]> {
    try {
      const hunts = await db
        .select({
          ...getTableColumns(huntsTable),
          coordinates_obj: sql<{ latitude: number; longitude: number } | null>`
            CASE 
              WHEN ${huntsTable.coordinates} IS NOT NULL THEN 
                jsonb_build_object(
                  'latitude', ST_Y(${huntsTable.coordinates}::geometry), 
                  'longitude', ST_X(${huntsTable.coordinates}::geometry)
                )
              ELSE NULL 
            END
          `
        })
        .from(huntsTable)
        .innerJoin(huntTasksTable, eq(huntTasksTable.hunt_id, huntsTable.id))
        .where(eq(huntTasksTable.task_id, taskId))
        .orderBy(desc(huntsTable.created_at));

      return hunts as THunt[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }


  /**
   * Get new near by hunt
   */
  static async getNewNearByHunt(userId: string ,queryParams: TgetHuntUserQueryParams, zone_id: string): Promise<THunt[]> {
    try {
      // Get hunts with pagination - use PostgreSQL's ST_X and ST_Y functions to extract coordinates directly
      // let whereClause = and(isNull(huntClaimTable.user_id));
      const hunts = await db
        .select({
          ...getTableColumns(huntsTable),
          coordinates_obj: sql<{ latitude: number; longitude: number } | null>`
            CASE 
              WHEN ${huntsTable.coordinates} IS NOT NULL THEN 
                jsonb_build_object(
                  'latitude', ST_Y(${huntsTable.coordinates}::geometry), 
                  'longitude', ST_X(${huntsTable.coordinates}::geometry)
                )
              ELSE NULL 
            END
          `
        })
        .from(huntsTable)
        .where(
          and(
            notExists(
              db
              .select()
              .from(huntClaimTable)
              .where(
                and(
                  eq(huntClaimTable.hunt_id, huntsTable.id),
                  eq(huntClaimTable.user_id, userId)
                )
              )
            ),
            eq(huntsTable.zone_id, zone_id),
            lte(huntsTable.start_date, new Date()),
            gte(huntsTable.end_date, new Date())
          )
        )
        .limit(10);
        
      return  hunts as THunt[];
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }

}