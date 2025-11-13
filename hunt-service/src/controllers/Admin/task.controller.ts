import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../../services/task.service';
import { QuestionService } from '../../services/question.service';
import { ClueService } from '../../services/clue.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { TCreateTaskData, TUpdateTaskData, TTaskQueryParams, TAuthenticatedAdminRequest, TCreateQuestionData } from '../../types';

export class TaskController {
  /**
   * Create a new task
   */
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData: TCreateTaskData = {
        ...req.body,
        created_by: req.admin?.adminId as string,
        updated_by: req.admin?.adminId as string,
      };

      // Validate that if task type is 'question', questions array is provided
      if (taskData.type === 'question') {
        if (!taskData.questions || taskData.questions.length === 0) {
          ResponseHandler.validationError(res, "Questions are required when task type is 'question'");
          return;
        }

        // Validate each question
        for (const question of taskData.questions) {
          if (!question.question || !question.answer) {
            ResponseHandler.validationError(res, "Each question must have 'question' and 'answer' fields");
            return;
          }

          // If question type is MCQ, validate options
          if (question.question_type === 'mcq') {
            if (!question.options || question.options.length === 0) {
              ResponseHandler.validationError(res, "MCQ questions must have options");
              return;
            }
          }
        }
      }

      const task = await TaskService.create(taskData);

      // If task type is 'question' and questions are provided, create questions
      if (taskData.type === 'question' && taskData.questions && taskData.questions.length > 0) {
        const questionsToCreate: TCreateQuestionData[] = taskData.questions.map(q => ({
          question: q.question,
          task_id: task.id,
          answer: q.answer,
          question_type: q.question_type || 'text',
          options: q.options,
          created_by: req.admin?.adminId as string,
        }));

        await QuestionService.createMultiple(questionsToCreate);
      }
      console.log(task);
      ResponseHandler.created(res, task, "Task created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tasks with pagination and filtering
   */
  static async getAll(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TTaskQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        status: req.query.status as 'active' | 'inactive' | undefined,
        search: req.query.search as string | undefined,
      };

      const result = await TaskService.getAll(queryParams);

      ResponseHandler.success(res, result, "Tasks retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   */
  static async getById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      //get task with taskId and clues and questions
      const task = await TaskService.getById(taskId);
      // const clues = await ClueService.getCluesByTaskId(taskId);
      const questions = await QuestionService.getByTaskId(taskId);
      
      if (!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      ResponseHandler.success(res, { task, questions }, "Task retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task by ID
   */
  static async update(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const updateData: TUpdateTaskData = {
        ...req.body,
        updated_by: req.admin?.adminId as string,
      };

      const result = await TaskService.update(taskId, updateData);

      ResponseHandler.success(res, result, "Task updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete task by ID
   */
  static async delete(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      await TaskService.delete(taskId);

      ResponseHandler.success(res, {}, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active tasks only
   */
  static async getActiveTasks(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await TaskService.getActiveTasks();

      ResponseHandler.success(res, tasks, "Active tasks retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle task status
   */
  static async toggleStatus(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const { updated_by } = req.body;

      if (!updated_by) {
        ResponseHandler.validationError(res, "updated_by field is required");
        return;
      }

      const result = await TaskService.toggleStatus(taskId, updated_by);

      ResponseHandler.success(res, result, "Task status toggled successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add clues to task
   */
  static async addCluesToTask(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const { clue_ids } = req.body;

      if (!clue_ids || !Array.isArray(clue_ids) || clue_ids.length === 0) {
        ResponseHandler.validationError(res, "clue_ids array is required");
        return;
      }

      // Get current task to check if it exists
      const existingTask = await TaskService.getById(taskId);
      if (!existingTask) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      // Get current clue associations
      const currentClueIds = existingTask.clue_ids || [];
      
      // Merge with new clue IDs (avoid duplicates)
      const updatedClueIds = [...new Set([...currentClueIds, ...clue_ids])];

      // Update task with new clue associations
      const result = await TaskService.update(taskId, {
        clue_ids: updatedClueIds,
        updated_by: req.admin?.adminId as string,
      });

      ResponseHandler.success(res, result, "Clues added to task successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove clues from task
   */
  static async removeCluesFromTask(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const { clue_ids } = req.body;

      if (!clue_ids || !Array.isArray(clue_ids) || clue_ids.length === 0) {
        ResponseHandler.validationError(res, "clue_ids array is required");
        return;
      }

      // Get current task to check if it exists
      const existingTask = await TaskService.getById(taskId);
      if (!existingTask) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      // Get current clue associations and remove specified ones
      const currentClueIds = existingTask.clue_ids || [];
      const updatedClueIds = currentClueIds.filter(id => !clue_ids.includes(id));

      // Update task with updated clue associations
      const result = await TaskService.update(taskId, {
        clue_ids: updatedClueIds,
        updated_by: req.admin?.adminId as string,
      });

      ResponseHandler.success(res, result, "Clues removed from task successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get clues for a specific task
   */
  static async getTaskClues(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      // Get task to check if it exists
      const task = await TaskService.getById(taskId);
      if (!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      // Get clue details for each clue ID
      const clues = await Promise.all(
        (task.clue_ids || []).map(async (clueId) => {
          try {
            return await ClueService.getClueById(clueId);
          } catch (error) {
            // If clue doesn't exist, return null
            return null;
          }
        })
      );

      // Filter out null values (non-existent clues)
      const validClues = clues.filter(clue => clue !== null);

      ResponseHandler.success(res, validClues, "Task clues retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}