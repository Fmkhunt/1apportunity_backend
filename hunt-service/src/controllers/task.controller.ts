import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { HuntClaimService } from '../services/huntClaim.service';

import { ResponseHandler } from '../utils/responseHandler';
import { TAuthenticatedRequest } from '../types';
import { QuestionService } from '../services/question.service';

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
      // changes at 13-10-2025
      // const huntClaim = await HuntClaimService.findMyHuntClaim(huntId, userId);
      // if(!huntClaim) {
      //   ResponseHandler.notFound(res, "Hunt claim not found");
      //   return;
      // }

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
      const task=await TaskService.getById(task_id);
      if(!task) {
        ResponseHandler.notFound(res, "Task not found");
        return;
      }
      const isAlreadyCompleted = await TaskService.verifyAlreadyCompleted(userId, hunt_id, task_id);
      if(isAlreadyCompleted) {
        ResponseHandler.error(res, "Task already completed");
        return;
      }
      if (!answers || answers.length === 0) {
        ResponseHandler.error(res, "Answers are required for question type tasks");
        return;
      }
      const answerResult = await QuestionService.verifyAnswer(task_id, answers);
      if(!answerResult.isPass) {
        const result = await TaskService.completeFailedTask(userId, hunt_id, task);
        result.answerResult = answerResult;
        ResponseHandler.error(res, "Task failed due to incorrect answers", 400, result);
        return;
      }
      const completedTask = await TaskService.completeTask(userId, hunt_id, task);
      completedTask.answerResult = answerResult;
      ResponseHandler.success(res, completedTask, "Task completed successfully");
    } catch (error) {
      next(error);
    }
  }
}
