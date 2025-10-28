import { Request, Response, NextFunction } from 'express';

import { ResponseHandler } from '../utils/responseHandler';
import {  TAuthenticatedRequest } from '../types';
import { ClueService } from '../services/clue.service';

export class ClueController {

  /**
   * Get all clues for a task
   */
  static async getClueList(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {

        const task = await ClueService.getListForUser(req.params.taskId);
        
        if (!task) {
            ResponseHandler.notFound(res, "Task not found");
            return;
        }
        ResponseHandler.success(res, task, "Clues retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get clue by id
   */
  static async getClueById(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {

        const clue = await ClueService.getClueById(req.params.clueId);
        
        if (!clue) {
            ResponseHandler.notFound(res, "Clue not found");
            return;
        }
        ResponseHandler.success(res, clue, "Clue retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get clue by id
   */
  static async buyClue(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.userId as string;
        const clue = await ClueService.buyClue(req.params.clueId, userId);
        
        if (!clue) {
            ResponseHandler.notFound(res, "Clue not found");
            return;
        }
        
        ResponseHandler.success(res, clue, "Clue purchased successfully");
    } catch (error) {
      next(error);
    }
  }

}
