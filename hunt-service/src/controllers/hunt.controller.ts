import { Request, Response, NextFunction } from 'express';
import { HuntService } from '../services/hunt.service';
import { HuntClaimService } from '../services/huntClaim.service';
import { TaskService } from '../services/task.service';
import { trpc, trpcUser } from '../trpc/client';

import { ResponseHandler } from '../utils/responseHandler';
import {  TgetHuntUserQueryParams, TAuthenticatedRequest } from '../types';
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
      let result = null;
      let admin: any = null;
      try {
        admin = await (trpcUser as any).admin.getByCoordinates.query({ latitude: queryParams.latitude, longitude: queryParams.longitude });
      } catch (e) {
        console.error(e);
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }

      if (!admin) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }
      result = await HuntService.getNewNearByHunt(req.user?.userId, queryParams, admin.id);
      if (!result) {
        ResponseHandler.notFound(res, "Hunt not found");
        return;
      }
      ResponseHandler.success(res, result, "Hunts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
  /**
   * Claim a hunt for the current user
   * - Checks if an entry already exists in hunt_claim for the same user and hunt
   * - If not, creates a new hunt_claim with expiry based on hunt.duration
   */
  static async claimHunt(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { hunt_id } = req.body as { hunt_id: string };

      // Validate hunt exists
      const hunt = await HuntService.getById(hunt_id);
      if (!hunt) {
        ResponseHandler.notFound(res, 'Hunt not found');
        return;
      }

      // Check if already claimed by this user
      const existing = await HuntClaimService.findMyHuntClaim(hunt_id, userId);
      if (existing) {
        ResponseHandler.conflict(res, 'You have already claimed this hunt');
        return;
      }

      if (!hunt.duration) {
        ResponseHandler.validationError(res, 'Hunt duration not configured');
        return;
      }

      // Create the hunt claim
      const created = await HuntClaimService.createHuntClaim(
        userId,
        hunt_id,
        hunt.duration as string,
      );

      ResponseHandler.created(res, created, 'Hunt claimed successfully');
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
      const { hunt_id, task_id, answers } = req.body;
      
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

      // Get task and claim data via tRPC
      const task = await TaskService.getById(task_id);
      if (!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }

      // Get claim data using tRPC
      let claimData = null;
      if (task.claim_id) {
        try {
          claimData = await (trpc as any).claim.getById.query(task.claim_id);
        } catch (error) {
          console.error(error);
          ResponseHandler.error(res, "Claim not found via tRPC");
          return;
        }
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
      const completedClaim = await HuntClaimService.completeHuntClaim(huntClaim.id, hunt_id, task_id, claimData);
      
      const response = {
        huntClaim: completedClaim
      };
        
      ResponseHandler.success(res, response, "Hunt claim completed successfully");
    } catch (error) {
      next(error);
    }
  }

  static async completeHuntHistory(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const userId= req.user.userId
      const response = await HuntClaimService.getHuntHistory(userId, parseInt(page as string) | 1, parseInt(limit as string) | 10);
        
      ResponseHandler.success(res, response, "Hunt history retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

}
