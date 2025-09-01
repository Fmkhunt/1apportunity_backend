import { Request, Response, NextFunction } from 'express';
import { HuntService } from '../services/hunt.service';
import { HuntClaimService } from '../services/huntClaim.service';
import { TaskService } from '../services/task.service';
import { trpc } from '../trpc/client';

import { ResponseHandler } from '../utils/responseHandler';
import {  TgetHuntUserQueryParams, TAuthenticatedRequest,THuntWithClaim } from '../types';
import { QuestionService } from '../services/question.service';

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
      let result= null;
      const userClaim = await HuntClaimService.getCurrrentClaimByUserId(req.user?.userId);
      if (!userClaim) {
        result = await HuntService.getNewNearByHunt(req.user?.userId,null, queryParams);
        if(!result){
          ResponseHandler.notFound(res, "Hunt not found");
          return;
        }
        const claim = await HuntClaimService.createHuntClaim(req.user?.userId, result.id, result.claim_id, result.task_id, result.duration);
        result.claim = claim;
        ResponseHandler.success(res, result, "Hunts retrieved successfully");
        return;
      } else {
        result = await HuntService.getById(userClaim.hunt_id);
        if(!result){
          ResponseHandler.notFound(res, "Hunt not found");
          return;
        }
        result.claim = userClaim;
        ResponseHandler.success(res, result, "Hunts retrieved successfully");
        return;
      }
      // const result = await HuntService.getNewNearByHunt(req.user?.userId,null, queryParams);
      // if(!result){
      //   ResponseHandler.notFound(res, "Hunt not found");
      //   return;
      // }
      // if(!userClaim){
      //   const claim = await HuntClaimService.createHuntClaim(req.user?.userId, result.id, result.duration, );
      //   result.claim = claim;
      // }else{
      //   result.claim = userClaim;
      // }
      
      // ResponseHandler.success(res, result, "Hunts retrieved successfully");
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

      const hunt = await HuntClaimService.updateStatus(huntId, status);
      
      if (!hunt) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }

      ResponseHandler.success(res, hunt, "Hunt updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async completeHuntClaim(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { huntClaim_id, hunt_id, task_id, answers } = req.body;
      
      const hunt = await HuntService.getById(hunt_id);
      if (!hunt) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }
      const user= req.user
      const user_id= user.userId
      const huntClaim = await HuntClaimService.findMyHuntClaim(hunt_id, user_id);
      if (!huntClaim) {
        ResponseHandler.notFound(res, "Hunt claim not found");
        return;
      }

      // Get claim data using tRPC
      let claimData = null;
      const claim_id=huntClaim.claim_id
      if (huntClaim.claim_id) {
        try {
          claimData = await (trpc as any).claim.getById.query(huntClaim.claim_id);
        } catch (error) {
          console.error(error);
          ResponseHandler.error(res, "Claim not found via tRPC");
          return;
        }
      }
      
      const task = await TaskService.getById(task_id);
      if (!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }
      console.log("task.type",task.type)
      if (task.type == 'question') {
        console.log("if")
        const checkAns=await QuestionService.verifyAnswer(task_id, answers)
        console.log("checkAns",checkAns)
        if(!checkAns){
          ResponseHandler.error(res, "answers are incorrect");
          return;
        }
      }
      const completedClaim = await HuntClaimService.completeHuntClaim(huntClaim.id, hunt_id, claimData);
      
      const response = {
        huntClaim: completedClaim
      };
        
      ResponseHandler.success(res, response, "Hunt claim completed successfully");
    } catch (error) {
      next(error);
    }
  }
}
