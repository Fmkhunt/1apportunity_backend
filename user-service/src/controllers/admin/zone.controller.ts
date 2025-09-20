import { Request, Response, NextFunction } from 'express';
import { ZoneService, TZoneQueryParams } from '../../services/admin/zone.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { TAuthenticatedAdminRequest } from '../../types/admin';
import { AppError } from '../../utils/AppError';

export class ZoneController {
  /**
   * Create a new zone
   */
  static async createZone(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // const polygon = this.coordinatesToWKT(req.body.coordinates || []);
      // req.body.area = polygon;
      
      const zone = await ZoneService.createZone(req.body);
      ResponseHandler.created(res, zone, "Zone created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get zone by ID
   */
  static async getZoneById(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const zone = await ZoneService.getZoneById(id);
      ResponseHandler.success(res, zone, "Zone retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all zones with pagination, search, and filters
   */
  static async getAllZones(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TZoneQueryParams = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
        name: req.query.name as string,
        service_location_id: req.query.service_location_id as string,
      };

      const result = await ZoneService.getAllZones(queryParams);
      ResponseHandler.success(res, result, "Zones retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get zones by service location ID
   */
  static async getZonesByServiceLocationId(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceLocationId } = req.params;
      const zones = await ZoneService.getZonesByServiceLocationId(serviceLocationId);
      ResponseHandler.success(res, zones, "Zones retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update zone
   */
  static async updateZone(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const zone = await ZoneService.updateZone(id, req.body);
      ResponseHandler.success(res, zone, "Zone updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete zone
   */
  static async deleteZone(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await ZoneService.deleteZone(id);
      ResponseHandler.success(res, null, "Zone deleted successfully");
    } catch (error) {
      next(error);
    }
  }

}