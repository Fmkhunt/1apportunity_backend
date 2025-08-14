import { db } from '../config/database';
import { huntsTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THunt,
  TCreateHuntData,
  TUpdateHuntData,
  THuntQueryParams,
} from '../types';

export class HuntService {
  /**
   * Convert coordinates to WKT format
   */
  private static coordinatesToWKT(coordinates: string | { latitude: number; longitude: number }): string {
    if (typeof coordinates === 'string') {
      return coordinates;
    }
    
    // Convert object to WKT POINT format
    return `POINT(${coordinates.longitude} ${coordinates.latitude})`;
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

      return newHunt as THunt;
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

      // Get hunts with pagination
      const hunts = await db
        .select()
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
      const hunt = await db
        .select()
        .from(huntsTable)
        .where(eq(huntsTable.id, huntId))
        .limit(1);

      return hunt[0] as THunt || null;
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

      return updatedHunt as THunt;
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
        .select()
        .from(huntsTable)
        .where(eq(huntsTable.task_id, taskId))
        .orderBy(desc(huntsTable.created_at));

      return hunts;
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
        .select()
        .from(huntsTable)
        .where(eq(huntsTable.claim_id, claimId))
        .orderBy(desc(huntsTable.created_at));

      return hunts;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }
} 