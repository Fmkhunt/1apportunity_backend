import { db } from '../config/database';
import { cluesTable, clueTasksTable, tasksTable } from '../models/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import type { TClue, TCreateClueData, TUpdateClueData, TClueQueryParams } from '../types';

export class ClueService {
  /**
   * Create a new clue with optional task associations
   */
  static async createClue(data: TCreateClueData): Promise<TClue> {
    try {
      return await db.transaction(async (tx) => {
        // Create the clue
        const [newClue] = await tx
          .insert(cluesTable)
          .values({
            title: data.title,
            description: data.description,
            token: data.token,
            created_by: data.created_by,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        // If taskIds are provided, associate them with the clue
        if (data.task_ids?.length) {
          await tx.insert(clueTasksTable).values(
            data.task_ids.map(taskId => ({
              clue_id: newClue.id,
              task_id: taskId,
              created_by: data.created_by,
              created_at: new Date(),
            }))
          );
        }

        return {
          ...newClue,
          task_ids: data.task_ids || []
        };
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to create clue',
        500
      );
    }
  }

  /**
   * Get a clue by ID with its associated task IDs
   */
  static async getClueById(id: string): Promise<TClue> {
    try {
      const clue = await db.query.cluesTable.findFirst({
        where: eq(cluesTable.id, id),
      });

      if (!clue) {
        throw new AppError('Clue not found', 404);
      }

      // Get associated task IDs
      const clueTasks = await db.query.clueTasksTable.findMany({
        where: eq(clueTasksTable.clue_id, id),
        columns: { task_id: true },
      });

      return {
        ...clue,
        task_ids: clueTasks.map(ct => ct.task_id),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch clue', 500);
    }
  }

  /**
   * Update a clue and its task associations
   */
  static async updateClue(
    id: string,
    data: TUpdateClueData
  ): Promise<TClue> {
    try {
      // return await db.transaction(async (tx) => {
        // Update the clue
        const [updatedClue] = await db
          .update(cluesTable)
          .set({
            ...data,
            updated_at: new Date(),
          })
          .where(eq(cluesTable.id, id))
          .returning();

        if (!updatedClue) {
          throw new AppError('Clue not found', 404);
        }

        // If task_ids are provided, update the associations
        if (data.task_ids) {
          // Remove all existing task associations
          await db
            .delete(clueTasksTable)
            .where(eq(clueTasksTable.clue_id, id));

          // Add the new associations if any
          if (data.task_ids.length > 0) {
            await db.insert(clueTasksTable).values(
              data.task_ids.map(taskId => ({
                clue_id: id,
                task_id: taskId,
                created_at: new Date(),
              }))
            );
          }
        }

        // Return the updated clue with its tasks
      // });
      return this.getClueById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update clue', 500);
    }
  }

  /**
   * Delete a clue and its task associations
   */
  static async deleteClue(id: string): Promise<{ success: boolean }> {
    try {
      const result = await db
        .delete(cluesTable)
        .where(eq(cluesTable.id, id));

      if (result.rowCount === 0) {
        throw new AppError('Clue not found', 404);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete clue', 500);
    }
  }

  /**
   * List all clues with pagination
   */
  static async listClues({
    page = 1,
    limit = 10,
    search,
  }: TClueQueryParams = {}): Promise<{ data: TClue[]; totalRecords: number; page: number; limit: number; totalPages: number }> {
    try {
      const whereConditions = [];
      if (search) {
        whereConditions.push(
          sql`LOWER(${cluesTable.title}) LIKE ${`%${search.toLowerCase()}%`}`
        );
      }

      const [data, total] = await Promise.all([
        db.query.cluesTable.findMany({
          where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
          limit,
          offset: (page - 1) * limit,
          orderBy: (cluesTable, { desc }) => [desc(cluesTable.created_at)],
        }),
        db
          .select({ count: sql<number>`count(*)` })
          .from(cluesTable)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .then((res) => Number(res[0].count)),
      ]);

      // Get task IDs for each clue
      const cluesWithTasks = await Promise.all(
        data.map(async (clue) => {
          const clueTasks = await db.query.clueTasksTable.findMany({
            where: eq(clueTasksTable.clue_id, clue.id),
            columns: { task_id: true },
          });

          return {
            ...clue,
            task_ids: clueTasks.map(ct => ct.task_id),
          };
        })
      );

      return {
        data: cluesWithTasks,
        totalRecords: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new AppError('Failed to list clues', 500);
    }
  }

}