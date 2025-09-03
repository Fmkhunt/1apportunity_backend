import { db } from '../config/database';
import { huntsTable, huntClaimTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql, getTableColumns,isNull, ne, notExists } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THunt,
  TCreateHuntData,
  TUpdateHuntData,
  THuntQueryParams,
  TgetHuntUserQueryParams,
  THuntWithClaim
} from '../types';

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
   * Create a new hunt
   */
  static async create(huntData: TCreateHuntData): Promise<THunt> {
    try {
      const coordinates = this.coordinatesToWKT(huntData.coordinates);
      
      const [newHunt] = await db
        .insert(huntsTable)
        .values({
          ...huntData,
          coordinates,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
        
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
      const { page = 1, limit = 10, search, task_id, claim_id } = queryParams;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (task_id) {
        whereConditions.push(eq(huntsTable.task_id, task_id));
      }

      if (claim_id) {
        whereConditions.push(eq(huntsTable.claim_id, claim_id));
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
        .where(whereClause)
        .orderBy(desc(huntsTable.created_at))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(huntsTable)
        .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        hunts: hunts as THunt[],
        totalRecords: count,
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
  static async getById(huntId: string): Promise<THunt | null> {
    try {
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

      const hunt = result[0];
      if (!hunt) return null;
      
      return hunt;
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

      const [updatedHunt] = await db
        .update(huntsTable)
        .set({
          ...updateData,
          coordinates: coordinates as string | null,
          updated_at: new Date(),
        })
        .where(eq(huntsTable.id, huntId))
        .returning();

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
        .where(eq(huntsTable.task_id, taskId))
        .orderBy(desc(huntsTable.created_at));

      return hunts as THunt[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get hunts by claim ID
   */
  static async getByClaimId(claimId: string): Promise<THunt[]> {
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
        .where(eq(huntsTable.claim_id, claimId))
        .orderBy(desc(huntsTable.created_at));

      return hunts as THunt[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get new near by hunt
   */
  static async getNewNearByHunt(userId: string ,queryParams: TgetHuntUserQueryParams): Promise<THuntWithClaim> {
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
          )
        )
        .limit(1);
        
      console.log(hunts);
      return  hunts[0] as THunt;
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }

}