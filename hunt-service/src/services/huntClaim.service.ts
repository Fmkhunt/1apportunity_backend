import { db } from '../config/database';
import { huntsTable, huntClaimTable } from '../models/schema';
import { eq, and,gt, or, like, desc, asc, sql, getTableColumns,isNull } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THuntClaimStatus,
} from '../types';
import { parseDurationToSeconds } from '../utils/Helper';
export class HuntClaimService {
  /**
   * Convert coordinates to WKT format for PostgreSQL geography type
   */
  /**
   * Create a new hunt
   */
  static async createHuntClaim(userId: string, huntId: string, duration: string): Promise<any> {
    try {
      const expiredAt = new Date();
      expiredAt.setSeconds(expiredAt.getSeconds() + parseDurationToSeconds(duration));
      const [newHuntClaim] = await db
        .insert(huntClaimTable)
        .values({
          user_id: userId,
          hunt_id: huntId,
          status: "search",
          expire_at: expiredAt,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return newHuntClaim;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  static async getCurrrentClaimByUserId(userId: string): Promise<any> {
    try {
      const result = await db
        .select()
        .from(huntClaimTable)
        .where(
          and(
            eq(huntClaimTable.user_id, userId),
            gt(huntClaimTable.expire_at, new Date()) // expire_at > current time
          )
        ).limit(1);

      return result[0];
    } catch (error) {
      console.log(error)
      throw new AppError(error.message, 500);
    }
  }
  static async updateStatus(huntClaimId: string,status: THuntClaimStatus): Promise<any> {
    try {
      const result = await db
        .update(huntClaimTable)
        .set({
          status: status,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(huntClaimTable.id, huntClaimId),
          )
        ).returning();

      return result[0];
    } catch (error) {
      console.log(error)
      throw new AppError(error.message, 500);
    }
  }

}