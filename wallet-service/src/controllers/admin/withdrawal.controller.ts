import { Request, Response, NextFunction } from 'express';
import { WithdrawalService } from '../../services/withdrawal.service';
import { TAuthenticatedAdminRequest } from '../../types';
import { AppError } from '../../utils/AppError';
import { ResponseHandler } from '../../utils/responseHandler';

export class AdminWithdrawalController {
  /**
   * Get all pending withdrawals
   */
  static async getPendingWithdrawals(
    req: TAuthenticatedAdminRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.admin?.adminId;
      if (!adminId) {
        throw new AppError('Admin not authenticated', 401);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (page < 1 || limit < 1) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      const result = await WithdrawalService.getPendingWithdrawals(page, limit);

      ResponseHandler.success(res, result, 'Pending withdrawals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve withdrawal
   */
  static async approveWithdrawal(
    req: TAuthenticatedAdminRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.admin?.adminId;
      if (!adminId) {
        throw new AppError('Admin not authenticated', 401);
      }

      const { id } = req.params;

      const withdrawal = await WithdrawalService.approveWithdrawal(id, adminId);

      ResponseHandler.success(res, withdrawal, 'Withdrawal approved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject withdrawal
   */
  static async rejectWithdrawal(
    req: TAuthenticatedAdminRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.admin?.adminId;
      if (!adminId) {
        throw new AppError('Admin not authenticated', 401);
      }

      const { id } = req.params;
      const { reason } = req.body as { reason?: string };

      const withdrawal = await WithdrawalService.rejectWithdrawal(id, adminId, reason);

      ResponseHandler.success(res, withdrawal, 'Withdrawal rejected successfully');
    } catch (error) {
      next(error);
    }
  }
}
