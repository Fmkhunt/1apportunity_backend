import { Response, NextFunction } from 'express';
import { ResponseHandler } from '@/utils/responseHandler';
import { AppError } from '@/utils/AppError';
import { TAdminCreate, TAdminUpdate, TAuthenticatedAdminRequest } from '@/types/admin';
import { ZoneManagerService } from '@/services/admin/zoneManager.service';

export class ZoneManagerController {
  static async create(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction) {
    try {
      const data: TAdminCreate = { ...req.body, role: 'zone_manager' };
      const result = await ZoneManagerService.create(data);
      ResponseHandler.created(res, result, 'Zone manager created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;
      const result = await ZoneManagerService.getAll(Number(page), Number(limit), search as string | null);
      ResponseHandler.success(res, result, 'Zone managers fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const admin = await ZoneManagerService.getById(id);
      if (!admin) {
        throw new AppError('Zone manager not found', 404);
      }
      ResponseHandler.success(res, admin, 'Zone manager fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: TAdminUpdate = req.body;
      const updated = await ZoneManagerService.update(id, updateData);
      if (!updated) {
        throw new AppError('Zone manager not found', 404);
      }
      ResponseHandler.success(res, updated, 'Zone manager updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await ZoneManagerService.delete(id);
      if (!deleted) {
        throw new AppError('Zone manager not found', 404);
      }
      ResponseHandler.success(res, {}, 'Zone manager deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}