import { Request, Response, NextFunction } from 'express';
import { HuntService } from '../../services/hunt.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { TCreateHuntData, TUpdateHuntData, THuntQueryParams, TAuthenticatedAdminRequest } from '../../types';

export class HuntController {
  /**
   * Create a new hunt
   */
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const huntData: TCreateHuntData = {
        ...req.body,
        created_by: req.admin?.adminId as string,
      };
      
      const result = await HuntService.create(huntData);

      ResponseHandler.created(res, result, "Hunt created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all hunts with pagination and filtering
   */
  static async getAll(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: THuntQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string | undefined,
        task_id: req.query.task_id as string | undefined,
        claim_id: req.query.claim_id as string | undefined,
        admin_id: req.query.admin_id as string | undefined,
      };

      const result = await HuntService.getAll(queryParams);

      ResponseHandler.success(res, result, "Hunts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hunt by ID
   */
  static async getById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { huntId } = req.params;

      const hunt = await HuntService.getById(huntId);

      if (!hunt) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }

      ResponseHandler.success(res, hunt, "Hunt retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update hunt by ID
   */
  static async update(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { huntId } = req.params;
      const updateData: TUpdateHuntData = req.body;
      const result = await HuntService.update(huntId, updateData);

      ResponseHandler.success(res, result, "Hunt updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete hunt by ID
   */
  static async delete(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { huntId } = req.params;

      await HuntService.delete(huntId);

      ResponseHandler.success(res, {}, "Hunt deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hunts by task ID
   */
  static async getByTaskId(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const hunts = await HuntService.getByTaskId(taskId);

      ResponseHandler.success(res, hunts, "Hunts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hunts by claim ID
   */
  static async getByClaimId(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimId } = req.params;

      const hunts = await HuntService.getByClaimId(claimId);

      ResponseHandler.success(res, hunts, "Hunts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
