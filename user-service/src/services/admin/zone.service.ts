import { db } from '../../config/database';
import { ZoneTable, ServiceLocationTable } from '../../models/schema';
import { eq, and, or, like, desc, asc, sql, getTableColumns } from 'drizzle-orm';
import { TZone, TZoneCreate, TZoneUpdate } from '../../types/zone';
import { AppError } from '../../utils/AppError';
import wellknown from 'wellknown';

export interface TZoneQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  service_location_id?: string;
}

export class ZoneService {
  /**
   * Create a new zone
   */
  static async createZone(zoneData: TZoneCreate): Promise<TZone> {
    try {
      // Prepare zone data - exclude coordinates as it's not a database field
      const { coordinates, ...zoneFields } = zoneData as any;
      
      // If coordinates are provided, convert them to WKT and set area
      if (coordinates) {
        const polygon = this.coordinatesToWKT(coordinates);
        zoneFields.area = polygon;
      }

      const [zone] = await db.insert(ZoneTable).values({
        ...zoneFields,
        updated_at: new Date(),
      }).returning();

      return zone as TZone;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create zone', 500);
    }
  }

  /**
   * Get all zones with pagination, search, and filters
   */
  static async getAllZones(queryParams: TZoneQueryParams): Promise<{
    zones: TZone[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        name, 
        service_location_id 
      } = queryParams;
      
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (name) {
        whereConditions.push(eq(ZoneTable.name, name));
      }

      if (service_location_id) {
        whereConditions.push(eq(ZoneTable.service_location_id, service_location_id));
      }

      if (search) {
        whereConditions.push(
          or(
            like(ZoneTable.name, `%${search}%`),
            like(ZoneTable.description, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get zones with pagination and service location details
      const zones = await db
        .select({
          ...getTableColumns(ZoneTable),
          coordinates_arr: sql<any>`
              CASE 
                WHEN ${ZoneTable.area} IS NOT NULL THEN 
                ST_AsGeoJSON(${ZoneTable.area})::jsonb
                ELSE NULL 
              END
            `
        })
        .from(ZoneTable)
        .leftJoin(ServiceLocationTable, eq(ZoneTable.service_location_id, ServiceLocationTable.id))
        .where(whereClause)
        .orderBy(desc(ZoneTable.created_at))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(ZoneTable)
        .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        zones: zones as TZone[],
        totalRecords: Number(count),
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new AppError('Failed to get zones', 500);
    }
  }

  /**
   * Get zone by ID
   */
  static async getZoneById(id: string): Promise<TZone> {
    try {
      // also add service location details in object
      const [result] = await db
        .select({
          ...getTableColumns(ZoneTable),
          coordinates_arr: sql<any>`
            CASE 
              WHEN ${ZoneTable.area} IS NOT NULL THEN 
              ST_AsGeoJSON(${ZoneTable.area})::jsonb
              ELSE NULL 
            END
          `,
          service_location: ServiceLocationTable
        })
        .from(ZoneTable)
        .leftJoin(ServiceLocationTable, eq(ZoneTable.service_location_id, ServiceLocationTable.id))
        .where(eq(ZoneTable.id, id))
        .limit(1);

      const zone = result;
      if (!zone) {
        throw new AppError('Zone not found', 404);
      }
      
      return zone as TZone;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get zone', 500);
    }
  }

  /**
   * Get zones by service location ID
   */
  static async getZonesByServiceLocationId(serviceLocationId: string): Promise<TZone[]> {
    try {
      const zones = await db
        .select({
          ...getTableColumns(ZoneTable),
          coordinates_arr: sql<any>`
            CASE 
              WHEN ${ZoneTable.area} IS NOT NULL THEN 
              ST_AsGeoJSON(${ZoneTable.area})::jsonb
              ELSE NULL 
            END
          `
        })
        .from(ZoneTable)
        .where(eq(ZoneTable.service_location_id, serviceLocationId));
      
      return zones as TZone[];
    } catch (error) {
      throw new AppError('Failed to get zones by service location', 500);
    }
  }

  /**
   * Update zone
   */
  static async updateZone(id: string, updateData: TZoneUpdate): Promise<TZone> {
    try {
      // Check if zone exists
      const existingZone = await db.query.ZoneTable.findFirst({
        where: eq(ZoneTable.id, id),
      });
      
      if (!existingZone) {
        throw new AppError('Zone not found', 404);
      }

      // Prepare update fields - exclude coordinates as it's not a database field
      const { coordinates, ...updateFields } = updateData as any;
      
      // If coordinates are provided, convert them to WKT and set area
      if (coordinates) {
        const polygon = this.coordinatesToWKT(coordinates);
        updateFields.area = polygon;
      }

      const [zone] = await db
        .update(ZoneTable)
        .set({
          ...updateFields,
          updated_at: new Date(),
        })
        .where(eq(ZoneTable.id, id))
        .returning();

      if (!zone) {
        throw new AppError('Failed to update zone', 500);
      }

      return zone as TZone;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new AppError('Failed to update zone', 500);
    }
  }

  /**
   * Delete zone
   */
  static async deleteZone(id: string): Promise<boolean> {
    try {
      // Check if zone exists
      const existingZone = await db.query.ZoneTable.findFirst({
        where: eq(ZoneTable.id, id),
      });
      
      if (!existingZone) {
        throw new AppError('Zone not found', 404);
      }

      const result = await db
        .delete(ZoneTable)
        .where(eq(ZoneTable.id, id));

      return result.rowCount > 0;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete zone', 500);
    }
  }

  static coordinatesToWKT(coords: { latitude: number; longitude: number }[]): string {
    const points = coords.map(c => `${c.longitude} ${c.latitude}`).join(', ');
    // Close the polygon by repeating the first point
    const firstPoint = `${coords[0].longitude} ${coords[0].latitude}`;
    return `POLYGON((${points}, ${firstPoint}))`;
  }
  
  static async getZoneByCoordinates(latitude: number, longitude: number): Promise<TZone | null> {
    try {
      const zone = await db.query.ZoneTable.findFirst({
        where: sql`ST_Within(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ST_SetSRID(${ZoneTable.area}, 4326))`,
      });
      return zone as TZone | null;
    } catch (error) {
      console.error(error);
      throw new AppError('Failed to get zone by coordinates', 500);
    }
  }
}