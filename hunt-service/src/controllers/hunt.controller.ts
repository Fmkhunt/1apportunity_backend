import { Request, Response, NextFunction } from 'express';
import { HuntService } from '../services/hunt.service';
import { HuntClaimService } from '../services/huntClaim.service';

import { ResponseHandler } from '../utils/responseHandler';
import {  TgetHuntUserQueryParams, TAuthenticatedRequest,THuntWithClaim } from '../types';

export class HuntController {

  /**
   * Get all hunts with pagination and filtering
   */
  static async getHunt(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TgetHuntUserQueryParams = {
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
      };
      // const userClaim = await HuntClaimService.getCurrrentClaimByUserId(req.user?.userId);
      
      const result = await HuntService.getNewNearByHunt(req.user?.userId,null, queryParams);
      if(!result){
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }
      // if(!userClaim){
        const claim = await HuntClaimService.createHuntClaim(req.user?.userId, result.id, result.duration);
        result.claim = claim;
      // }else{
        // result.claim = userClaim;
      // }
      
      ResponseHandler.success(res, result, "Hunts retrieved successfully");
      return;
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hunt by ID
   */
  static async getById(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

  static async updateStatus(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { huntId } = req.params;
      const { status } = req.body;

      const hunt = await HuntClaimService.updateStatus(huntId,status);

      if (!hunt) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }

      ResponseHandler.success(res, hunt, "Hunt updated successfully");
    } catch (error) {
      next(error);
    }
  }

}
