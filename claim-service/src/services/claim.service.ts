import { db } from '../config/database';
import { claimsTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  TClaim,
  TCreateClaimData,
  TUpdateClaimData,
  TClaimQueryParams,
} from '../types';

export class ClaimService {
  /**
   * Create a new claim
   */
  static async create(claimData: TCreateClaimData): Promise<TClaim> {
    
    try {
      if (typeof claimData.levels === 'string') {
        try {
          claimData.levels = JSON.parse(claimData.levels);
        } catch {
          throw new AppError('Invalid levels format', 400);
        }
      }
            
      const [newClaim] = await db
        .insert(claimsTable)
        .values({
          ...claimData,
          levels: claimData.levels || null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return newClaim as TClaim;
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get all claims with pagination and filtering
   */
  static async getAll(queryParams: TClaimQueryParams): Promise<{
    claims: TClaim[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, claim_type, search } = queryParams;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (claim_type) {
        whereConditions.push(eq(claimsTable.claim_type, claim_type));
      }

      if (search) {
        whereConditions.push(
          or(
            like(claimsTable.claim_type, `%${search}%`),
            like(claimsTable.coupen_code, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get claims with pagination
      const claims = await db
        .select()
        .from(claimsTable)
        .where(whereClause)
        .orderBy(desc(claimsTable.created_at))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(claimsTable)
        .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        claims: claims as TClaim[],
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
   * Get claim by ID
   */
  static async getById(claimId: string): Promise<TClaim | null> {
    try {
      const claim = await db
        .select()
        .from(claimsTable)
        .where(eq(claimsTable.id, claimId))
        .limit(1);

      return claim[0] as TClaim || null;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update claim by ID
   */
  static async update(claimId: string, updateData: TUpdateClaimData): Promise<TClaim> {
    try {
      // Check if claim exists
      const existingClaim = await this.getById(claimId);
      if (!existingClaim) {
        throw new AppError('Claim not found', 404);
      }

      const [updatedClaim] = await db
        .update(claimsTable)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(claimsTable.id, claimId))
        .returning();

      return updatedClaim as TClaim;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Delete claim by ID
   */
  static async delete(claimId: string): Promise<void> {
    try {
      // Check if claim exists
      const existingClaim = await this.getById(claimId);
      if (!existingClaim) {
        throw new AppError('Claim not found', 404);
      }

      await db
        .delete(claimsTable)
        .where(eq(claimsTable.id, claimId));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get claims by type
   */
  static async getByType(claimType: string): Promise<TClaim[]> {
    try {
      const claims = await db
        .select()
        .from(claimsTable)
        .where(eq(claimsTable.claim_type, claimType))
        .orderBy(desc(claimsTable.created_at));

      return claims as TClaim[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }
} 