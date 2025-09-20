import { Response, NextFunction } from 'express';
import { ClueService } from '../../services/clue.service';
import { ResponseHandler } from '../../utils/responseHandler';
import {
  TCreateClueData,
  TUpdateClueData,
  TClueQueryParams,
  TAuthenticatedAdminRequest
} from '../../types';

export class AdminClueController {
  /**
   * Create a new clue
   */
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clueData: TCreateClueData = {
        ...req.body,
        created_by: req.admin?.adminId as string,
      };
      
      const result = await ClueService.createClue(clueData);

      ResponseHandler.created(res, result, 'Clue created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all clues with pagination and search
   */
  static async getAll(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TClueQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string | undefined,
      };

      const result = await ClueService.listClues(queryParams);

      ResponseHandler.success(res, result, 'Clues retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get clue by ID
   */
  static async getById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clueId } = req.params;

      const clue = await ClueService.getClueById(clueId);
      ResponseHandler.success(res, clue, 'Clue retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a clue
   */
  static async update(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clueId } = req.params;
      const updateData: TUpdateClueData = req.body;

      const updatedClue = await ClueService.updateClue(clueId, updateData);
      ResponseHandler.success(res, updatedClue, 'Clue updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a clue
   */
  static async delete(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clueId } = req.params;

      await ClueService.deleteClue(clueId);
      ResponseHandler.success(res, null, 'Clue deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tasks for a specific clue
   */
  static async getClueTasks(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clueId } = req.params;
      
      const clue = await ClueService.getClueById(clueId);
      ResponseHandler.success(res, { tasks: clue.task_ids }, 'Clue tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update tasks for a specific clue
   */
  static async updateClueTasks(
    req: TAuthenticatedAdminRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { clueId } = req.params;
      const { task_ids } = req.body as { task_ids: string[] };

      if (!Array.isArray(task_ids)) {
        ResponseHandler.badRequest(res, 'task_ids must be an array of task IDs');
        return;
      }

      const updatedClue = await ClueService.updateClue(clueId, { task_ids });
      ResponseHandler.success(res, updatedClue, 'Clue tasks updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default AdminClueController;
