import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { ResponseHandler } from '../utils/responseHandler';
import { TCreateTaskData, TUpdateTaskData, TTaskQueryParams, TAuthenticatedAdminRequest } from '../types';

export class TaskController {
  /**
   * Create a new task
   */
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData: TCreateTaskData = req.body;

      const result = await TaskService.create(taskData);

      ResponseHandler.created(res, result, "Task created successfully");
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

      const task = await TaskService.getById(taskId);

      if (!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      ResponseHandler.success(res, task, "Task retrieved successfully");
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
      const updateData: TUpdateTaskData = req.body;
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
}