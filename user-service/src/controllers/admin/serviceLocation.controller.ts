import { Request, Response, NextFunction } from 'express';
import { ServiceLocationService, TServiceLocationQueryParams } from '../../services/admin/serviceLocation.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { TAuthenticatedAdminRequest } from '../../types/admin';
import { AppError } from '../../utils/AppError';

export class ServiceLocationController {
  /**
   * Create a new service location
   */
  static async createServiceLocation(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceLocation = await ServiceLocationService.createServiceLocation(req.body);
      ResponseHandler.created(res, serviceLocation, "Service location created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service location by ID
   */
  static async getServiceLocationById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const serviceLocation = await ServiceLocationService.getServiceLocationById(id);
      ResponseHandler.success(res, serviceLocation, "Service location retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all service locations with pagination, search, and filters
   */
  static async getAllServiceLocations(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TServiceLocationQueryParams = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
        country: req.query.country as string,
        timezone: req.query.timezone as string,
        currency: req.query.currency as string,
        map: req.query.map as string,
        payment_gateway: req.query.payment_gateway as string,
      };

      const result = await ServiceLocationService.getAllServiceLocations(queryParams);
      ResponseHandler.success(res, result, "Service locations retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update service location
   */
  static async updateServiceLocation(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const serviceLocation = await ServiceLocationService.updateServiceLocation(id, req.body);
      ResponseHandler.success(res, serviceLocation, "Service location updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete service location
   */
  static async deleteServiceLocation(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await ServiceLocationService.deleteServiceLocation(id);
      ResponseHandler.success(res, null, "Service location deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}