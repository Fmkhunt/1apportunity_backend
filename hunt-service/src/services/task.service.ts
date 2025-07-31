import { db } from '../config/database';
import { tasksTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  TTask,
  TCreateTaskData,
  TUpdateTaskData,
  TTaskQueryParams,
} from '../types';

export class TaskService {
  /**
   * Create a new task
   */
  static async create(taskData: TCreateTaskData): Promise<TTask> {
    try {
      const [newTask] = await db
        .insert(tasksTable)
        .values({
          ...taskData,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return newTask as TTask;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get all tasks with pagination and filtering
   */
  static async getAll(queryParams: TTaskQueryParams): Promise<{
    tasks: TTask[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, status, search, task_type } = queryParams;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (status) {
        whereConditions.push(eq(tasksTable.status, status));
      }

      if (task_type) {
        whereConditions.push(eq(tasksTable.task_type, task_type));
      }

      if (search) {
        whereConditions.push(
          or(
            like(tasksTable.name, `%${search}%`),
            like(tasksTable.description, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get tasks with pagination
      const tasks = await db
        .select()
        .from(tasksTable)
        .where(whereClause)
        .orderBy(desc(tasksTable.created_at))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasksTable)
        .where(whereClause);

      const totalPages = Math.ceil(count / limit);

      return {
        tasks: tasks as TTask[],
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
   * Get task by ID
   */
  static async getById(taskId: string): Promise<TTask | null> {
    try {
      const task = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, taskId))
        .limit(1);

      return task[0] as TTask || null;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update task by ID
   */
  static async update(taskId: string, updateData: TUpdateTaskData): Promise<TTask> {
    try {
      // Check if task exists
      const existingTask = await this.getById(taskId);
      if (!existingTask) {
        throw new AppError('Task not found', 404);
      }

      const [updatedTask] = await db
        .update(tasksTable)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(tasksTable.id, taskId))
        .returning();

      return updatedTask as TTask;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Delete task by ID
   */
  static async delete(taskId: string): Promise<void> {
    try {
      // Check if task exists
      const existingTask = await this.getById(taskId);
      if (!existingTask) {
        throw new AppError('Task not found', 404);
      }

      await db
        .delete(tasksTable)
        .where(eq(tasksTable.id, taskId));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get active tasks only
   */
  static async getActiveTasks(): Promise<TTask[]> {
    try {
      const tasks = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.status, 'active'))
        .orderBy(desc(tasksTable.created_at));

      return tasks as TTask[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Toggle task status
   */
  static async toggleStatus(taskId: string, updatedBy: string): Promise<TTask> {
    try {
      const existingTask = await this.getById(taskId);
      if (!existingTask) {
        throw new AppError('Task not found', 404);
      }

      const newStatus = existingTask.status === 'active' ? 'inactive' : 'active';

      const [updatedTask] = await db
        .update(tasksTable)
        .set({
          status: newStatus,
          updated_at: new Date(),
        })
        .where(eq(tasksTable.id, taskId))
        .returning();

      return updatedTask as TTask;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }
}