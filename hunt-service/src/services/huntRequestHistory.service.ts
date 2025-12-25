import { db } from '../config/database';
import { huntsTable, huntClaimTable, huntTasksTable, tasksTable, huntRequestHistoryTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql, getTableColumns,isNull, ne, notExists, lte, gte, gt } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  THunt,
  TCreateHuntData,
  TUpdateHuntData,
  THuntQueryParams,
  TgetHuntUserQueryParams,
  THuntWithClaim,
  TTask,
  THuntRequestHistory
} from '../types';
import { trpcUser } from '../trpc/client';

export class HuntRequestHistoryService {


  /**
   * Create a new hunt request history
   */
  static async create(userId: string): Promise<THuntRequestHistory> {
    try {

        const [huntRequestHistory] = await db
        .insert(huntRequestHistoryTable)
        .values({
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
      return huntRequestHistory as THuntRequestHistory;
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }
  static async getLastDailyRequestHistory(userId: string): Promise<THuntRequestHistory[]> {
    try {

        const huntRequestHistory = await db
        .select()
        .from(huntRequestHistoryTable)
        .where(
          and(
            eq(huntRequestHistoryTable.user_id, userId),
            gt(huntRequestHistoryTable.created_at, new Date(Date.now() - 1000 * 60 * 60 * 24)) // 24 hours ago
          )
        )
        .orderBy(desc(huntRequestHistoryTable.created_at))

      return huntRequestHistory as THuntRequestHistory[];
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, 500);
    }
  }
}