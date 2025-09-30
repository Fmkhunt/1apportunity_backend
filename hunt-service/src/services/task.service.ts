import { db } from '../config/database';
import { tasksTable, clueTasksTable, huntTasksTable, completeTaskTable } from '../models/schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import {
  TTask,
  TCreateTaskData,
  TUpdateTaskData,
  TTaskQueryParams,
  TQuestion,
} from '../types';
import { QuestionService } from './question.service';
import { HuntClaimService } from './huntClaim.service';
import { trpc } from '../trpc/client';

export class TaskService {
  /**
   * Create a new task
   */
  static async create(taskData: TCreateTaskData): Promise<TTask> {
    try {
      return await db.transaction(async (tx) => {
        // Extract questions and clue_ids from taskData
        const { questions, clue_ids, ...taskDataWithoutExtras } = taskData;
        // Create the task
        const [newTask] = await tx
          .insert(tasksTable)
          .values({
            ...taskDataWithoutExtras,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        // If clue_ids are provided, create clue-task associations
        if (clue_ids && clue_ids.length > 0) {
          await tx.insert(clueTasksTable).values(
            clue_ids.map(clueId => ({
              clue_id: clueId,
              task_id: newTask.id,
              created_by: taskData.created_by,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          );
        }

        return {
          ...newTask,
          clue_ids: clue_ids || []
        } as TTask;
      });
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
      const { page = 1, limit = 10, status, search, type } = queryParams;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (status) {
        whereConditions.push(eq(tasksTable.status, status));
      }

      if (type) {
        whereConditions.push(eq(tasksTable.type, type));
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

      // Get clue associations for each task
      const tasksWithClues = await Promise.all(
        tasks.map(async (task) => {
          const clueTasks = await db.query.clueTasksTable.findMany({
            where: eq(clueTasksTable.task_id, task.id),
            columns: { clue_id: true },
          });

          return {
            ...task,
            clue_ids: clueTasks.map(ct => ct.clue_id),
          } as TTask;
        })
      );

      return {
        tasks: tasksWithClues,
        totalRecords: Number(count),
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
        const task = await db.query.tasksTable.findFirst({
          where: eq(tasksTable.id, taskId),
          with: {
            questions: true,
            clueTasks: {
              with: {
                clue: true,
              },
            },
          },
        });

      if (!task) {
        return null;
      }

      // Get clue associations
      // const clueTasks = await db.query.clueTasksTable.findMany({
      //   where: eq(clueTasksTable.task_id, taskId),
      //   columns: { clue_id: true },
      // });

      return {
        ...task,
        // clue_ids: clueTasks.map(ct => ct.clue_id),
      } as TTask;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update task by ID
   */
  static async update(taskId: string, updateData: TUpdateTaskData): Promise<TTask> {
    try {
      return await db.transaction(async (tx) => {
        // Check if task exists
        const existingTask = await tx
          .select()
          .from(tasksTable)
          .where(eq(tasksTable.id, taskId))
          .limit(1);

        if (!existingTask[0]) {
          throw new AppError('Task not found', 404);
        }

        // Extract clue_ids from updateData
        const { clue_ids, claim_id, ...taskUpdateData } = updateData;

        // Update the task
        const [updatedTask] = await tx
          .update(tasksTable)
          .set({
            ...taskUpdateData,
            claim_id: claim_id,
            updated_at: new Date(),
          })
          .where(eq(tasksTable.id, taskId))
          .returning();

        // If clue_ids are provided, update the associations
        if (clue_ids !== undefined) {
          // Remove all existing clue associations
          await tx
            .delete(clueTasksTable)
            .where(eq(clueTasksTable.task_id, taskId));

          // Add the new associations if any
          if (clue_ids.length > 0) {
            await tx.insert(clueTasksTable).values(
              clue_ids.map(clueId => ({
                clue_id: clueId,
                task_id: taskId,
                created_at: new Date(),
              }))
            );
          }
        }

        // Get updated clue associations
        const clueTasks = await tx.query.clueTasksTable.findMany({
          where: eq(clueTasksTable.task_id, taskId),
          columns: { clue_id: true },
        });

        return {
          ...updatedTask,
          clue_ids: clueTasks.map(ct => ct.clue_id),
        } as TTask;
      });
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

      // Get clue associations for each task
      const tasksWithClues = await Promise.all(
        tasks.map(async (task) => {
          const clueTasks = await db.query.clueTasksTable.findMany({
            where: eq(clueTasksTable.task_id, task.id),
            columns: { clue_id: true },
          });

          return {
            ...task,
            clue_ids: clueTasks.map(ct => ct.clue_id),
          } as TTask;
        })
      );

      return tasksWithClues;
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

      return {
        ...updatedTask,
        clue_ids: existingTask.clue_ids || [],
      } as TTask;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get task details with questions if task type is 'question'
   */
  static async getTaskDetails(taskId: string): Promise<TTask & { questions?: TQuestion[] }> {
    try {
      const task = await this.getById(taskId);
      
      if (!task) {
        throw new AppError('Task not found', 404);
      }
      
      // If task type is 'question', fetch associated questions
      if (task.type === 'question') {
        const questions = await QuestionService.getByTaskId(taskId);
        return { ...task, questions };
      }
      
      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }
    /**
   * Complete task
   */
    static async getTaskListForUsers(userId: string, huntId: string): Promise<any> {
      try {
        const huntClaim = await db
        .select({
          id: tasksTable.id,
          name: tasksTable.name,
          description: tasksTable.description,
          duration: tasksTable.duration,
          reward: tasksTable.reward,
          type: tasksTable.type,
          status: tasksTable.status,
          taskStatus: sql<string>`
            CASE 
              WHEN ${completeTaskTable.id} IS NOT NULL THEN 'completed'
              ELSE 'pending'
            END
          `,
        })
        .from(huntTasksTable)
        .innerJoin(tasksTable, eq(huntTasksTable.task_id, tasksTable.id))
        .leftJoin(
          completeTaskTable,
          and(
            eq(completeTaskTable.task_id, tasksTable.id),
            eq(completeTaskTable.hunt_id, huntTasksTable.hunt_id),
            eq(completeTaskTable.user_id, userId)
          )
        )
        .where(eq(huntTasksTable.hunt_id, huntId));

      return huntClaim;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(error.message, 500);
      }
    }

  /**
   * Complete a task for a user
   */
  static async completeTask(
    userId: string, 
    huntId: string, 
    taskId: string, 
    answers?: { question_id: string, answer: string }[]
  ): Promise<any> {
    try {
      return await db.transaction(async (tx) => {
        // Check if task exists and get task details
        const [task] = await tx
          .select()
          .from(tasksTable)
          .where(eq(tasksTable.id, taskId))
          .limit(1);

        if (!task) {
          throw new AppError('Task not found', 404);
        }
        // Check if user has already completed this task
        const existingCompletion = await tx
          .select()
          .from(completeTaskTable)
          .where(
            and(
              eq(completeTaskTable.hunt_id, huntId),
              eq(completeTaskTable.task_id, taskId),
              eq(completeTaskTable.user_id, userId)
            )
          )
          .limit(1);

        if (existingCompletion[0]) {
          throw new AppError('Task already completed by this user', 400);
        }
        // Verify answers if task type is question
        if (task.type === 'question') {
          if (!answers || answers.length === 0) {
            throw new AppError('Answers are required for question type tasks', 400);
          }
          
          const isCorrect = await QuestionService.verifyAnswer(taskId, answers);
          if (!isCorrect) {
            throw new AppError('Incorrect answers provided', 400);
          }
        }
        // Get claim data if task has claim_id
        let claimData = null;
        if (task.claim_id) {
          try {
            // Import trpc client dynamically to avoid circular dependency
            console.log("task.claim_id", task.claim_id);
            claimData = await (trpc as any).claim.getById.query(task.claim_id);

          } catch (error) {
            console.error('Error fetching claim data:', error);
            throw new AppError('Error fetching claim data', 500);
            // Continue without claim data if not available
          }
        }
        // Calculate rank (count of users who completed this task before)
        const completedCount = await tx
          .select({ count: sql<number>`count(*)` })
          .from(completeTaskTable)
          .where(
            and(
              eq(completeTaskTable.hunt_id, huntId),
              eq(completeTaskTable.task_id, taskId)
            )
          );
        const rank = Number(completedCount[0].count) + 1;

        // Calculate reward based on claim levels and rank
        let reward = 0;
        if (claimData && claimData.levels && Array.isArray(claimData.levels)) {
          // Find the appropriate level based on rank
          // Sort levels by level number to ensure correct order
          const sortedLevels = claimData.levels.sort((a, b) => a.level - b.level);
          console.log("sortedLevels", sortedLevels);
          // Calculate cumulative user counts for each level
          let cumulativeCount = 0;
          for (const level of sortedLevels) {
            cumulativeCount += level.user_count;
            if (rank <= cumulativeCount) {
              reward = level.rewards;
              break;
            }
          }
        }

        // Insert the completed task
        const [completedTask] = await tx
          .insert(completeTaskTable)
          .values({
            hunt_id: huntId,
            task_id: taskId,
            user_id: userId,
            claim_id: task.claim_id,
            rank: rank,
            reward: reward,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        return completedTask;
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
  
}