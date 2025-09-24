import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { HuntClaimService } from '../services/huntClaim.service';

import { ResponseHandler } from '../utils/responseHandler';
import { TAuthenticatedRequest } from '../types';

export class TaskController {
  static async getTask(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.taskId;
      // const userClaim = await HuntClaimService.getCurrrentClaimByUserId(req.user?.userId);
      
      const result = await TaskService.getTaskDetails(taskId);
      if(!result){
        ResponseHandler.notFound(res, "Task not found");
        return;
      }
      
      ResponseHandler.success(res, result, "Task retrieved successfully");
      return;
    } catch (error) {
      next(error);
    }
  }
  
  static async getTaskList(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const huntId = req.params.huntId;
      const userId = req.user?.userId;

      // const userClaim = await HuntClaimService.getCurrrentClaimByUserId(req.user?.userId);
      const huntClaim = await HuntClaimService.findMyHuntClaim(huntId, userId);
      if(!huntClaim) {
        ResponseHandler.notFound(res, "Hunt claim not found");
        return;
      }

      const result = await TaskService.getTaskListForUsers(req.user?.userId, huntId);
      if(!result){
        ResponseHandler.notFound(res, "Task list not found");
        return;
      }
      
      ResponseHandler.success(res, result, "Task retrieved successfully");
      return;
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hunt_id, task_id, answers } = req.body;
      const userId = req.user?.userId;
      // check its claim or not
      const huntClaim = await HuntClaimService.findMyHuntClaim(hunt_id, userId);
      if(!huntClaim) {
        ResponseHandler.notFound(res, "Hunt claim not found");
        return;
      }
      const result = await TaskService.completeTask(userId, hunt_id, task_id, answers);
      
      ResponseHandler.success(res, result, "Task completed successfully");
    } catch (error) {
      next(error);
    }
  }

}
