import { db } from '../config/database';
import { huntsTable, huntClaimTable, huntTasksTable, completeTaskTable } from '../models/schema';
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
  static async getTotalHuntDone(userId: string): Promise<number> {
    try {
      const totalHuntDone = await db.select({ count: sql<number>`count(*)` })
        .from(huntClaimTable)
        .where(eq(huntClaimTable.user_id, userId));
      return Number(totalHuntDone[0]?.count) ?? 0;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }
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
      console.error("Error in huntClaimService.createHuntClaim=>", error);
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
      console.error("Error in huntClaimService.getCurrrentClaimByUserId=>", error);
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
      console.error("Error in huntClaimService.updateStatus=>", error);
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
      console.error("Error in huntClaimService.getById=>", error);
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
      console.error("Error in huntClaimService.findMyHuntClaim=>", error);
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
      console.error("Error in huntClaimService.completeHuntClaim=>", error);
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
      console.error("Error in huntClaimService.getHuntHistory=>", error);
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Check if all tasks in a hunt are completed for a user and update completed_at if so
   */
  static async checkAndCompleteHuntClaim(userId: string, huntId: string): Promise<void> {
    try {
      // Get all tasks for this hunt
      const allTasks = await db
        .select({ task_id: huntTasksTable.task_id })
        .from(huntTasksTable)
        .where(eq(huntTasksTable.hunt_id, huntId));

      if (allTasks.length === 0) {
        // No tasks in this hunt, nothing to check
        return;
      }

      // Get all completed tasks for this user in this hunt (with status 'completed')
      const completedTasks = await db
        .select({ task_id: completeTaskTable.task_id })
        .from(completeTaskTable)
        .where(
          and(
            eq(completeTaskTable.hunt_id, huntId),
            eq(completeTaskTable.user_id, userId),
            eq(completeTaskTable.status, 'completed')
          )
        );

      // Check if all tasks are completed
      const allTaskIds = allTasks.map(t => t.task_id);
      const completedTaskIds = completedTasks.map(t => t.task_id);
      const allCompleted = allTaskIds.every(taskId => completedTaskIds.includes(taskId));

      if (allCompleted) {
        // All tasks are completed, update hunt_claim with completed_at
        const huntClaim = await this.findMyHuntClaim(huntId, userId);
        if (huntClaim && !huntClaim.completed_at) {
          // Only update if completed_at is not already set
          await db
            .update(huntClaimTable)
            .set({
              status: 'completed',
              completed_at: new Date(),
              updated_at: new Date(),
            })
            .where(
              and(
                eq(huntClaimTable.hunt_id, huntId),
                eq(huntClaimTable.user_id, userId)
              )
            );
          console.log(`Hunt claim ${huntClaim.id} marked as completed - all tasks completed for user ${userId} in hunt ${huntId}`);
        }
      }
    } catch (error) {
      console.error("Error in huntClaimService.checkAndCompleteHuntClaim=>", error);
      // Don't throw error, just log it - we don't want to fail task completion if this check fails
    }
  }
}