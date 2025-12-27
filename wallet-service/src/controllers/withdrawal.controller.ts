import { Request, Response, NextFunction } from 'express';
import { WithdrawalService } from '../services/withdrawal.service';
import { TAuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';
import { ResponseHandler } from '../utils/responseHandler';

export class WithdrawalController {
  /**
   * Create withdrawal request
   */
  static async createWithdrawalRequest(
    req: TAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { coins } = req.body as { coins: number };

      if (!coins || coins <= 0 || !Number.isInteger(coins)) {
        throw new AppError('Invalid coins amount. Must be a positive integer', 400);
      }

      const withdrawal = await WithdrawalService.createWithdrawalRequest({
        user_id: userId,
        coins,
      });

      ResponseHandler.created(res, withdrawal, 'Withdrawal request created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's withdrawal history
   */
  static async getUserWithdrawals(
    req: TAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (page < 1 || limit < 1) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      const result = await WithdrawalService.getUserWithdrawals(userId, page, limit);

      ResponseHandler.success(res, result, 'Withdrawals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get withdrawal by ID
   */
  static async getWithdrawalById(
    req: TAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { id } = req.params;

      const withdrawal = await WithdrawalService.getWithdrawalById(id);

      if (!withdrawal) {
        throw new AppError('Withdrawal not found', 404);
      }

      // Ensure user can only view their own withdrawals
      if (withdrawal.user_id !== userId) {
        throw new AppError('Unauthorized to view this withdrawal', 403);
      }

      ResponseHandler.success(res, withdrawal, 'Withdrawal retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
