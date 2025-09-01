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

}
