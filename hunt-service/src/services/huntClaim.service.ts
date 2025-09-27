import { db } from '../config/database';
import { huntsTable, huntClaimTable } from '../models/schema';
import { eq, and,gt, or, like, desc, asc, sql, getTableColumns,isNull, isNotNull } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THuntClaim,
  THuntWithClaim,
  THuntClaimStatus,
} from '../types';
import { parseDurationToSeconds } from '../utils/Helper';
import { TaskService } from './task.service';
import { trpc } from '../trpc/client';
import { numeric } from 'drizzle-orm/pg-core';

export class HuntClaimService {
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
          status: "claimed",
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
  static async getById(huntClaimId: string): Promise<THuntClaim | null> {
    try {
      const result = await db
        .select()
        .from(huntClaimTable)
        .where(
          and(
            eq(huntClaimTable.id, huntClaimId),
          )
        ).limit(1);
      return result[0];
    } catch (error) {
      console.log(error)
      throw new AppError(error.message, 500);
    }
  }

  static async findMyHuntClaim(huntId: string, userId: string): Promise<THuntClaim | null> {
    try {
      const result = await db
        .select()
        .from(huntClaimTable)
        .where(
          and(
            eq(huntClaimTable.hunt_id, huntId),
            eq(huntClaimTable.user_id, userId),
          )
        ).limit(1);

      return result[0];
    } catch (error) {
      console.log(error)
      throw new AppError(error.message, 500);
    }
  }
  
  static async completeHuntClaim(huntClaimId: string, hunt_id: string, task_id: string, claimData: any): Promise<THuntClaim> {
    try {
      const result = await db
        .update(huntClaimTable)
        .set({
          status: "completed",
          completed_at: new Date(),
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

  static async getHuntHistory(user_id: string | null, page: number, limit: number): Promise<{ hunts: THuntWithClaim[]; totalRecords: number; page: number; limit: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;

      let conditions=[eq(huntClaimTable.status, 'completed')];
      if(user_id){
        conditions.push(eq(huntClaimTable.user_id, user_id));
      }
      const whereCondition =and(...conditions);
      const hunts = await db.query.huntClaimTable
        .findMany({
          where: whereCondition,
          orderBy: desc(huntClaimTable.created_at),
          with: { hunt: true },
          limit: limit,
          offset: offset,
        });
      const totalRecords = await db
        .select({ count: sql<number>`count(*)` })
        .from(huntClaimTable)
        .where(whereCondition);

        const totalPages = Math.ceil((totalRecords[0]?.count ?? 0) / limit);
      return { hunts: hunts as unknown as THuntWithClaim[], totalRecords: Number(totalRecords[0]?.count) ?? 0, page, limit, totalPages };
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }
}