import { Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/wallet.service';
import { ResponseHandler } from '../utils/responseHandler';
import { TAuthenticatedRequest } from '../types';

export class WalletController {

  /**
   * Get wallet by ID
   */
  static async getWallet(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;

        const wallet = await WalletService.getList(req.user?.userId, Number(page), Number(limit));

      if (!wallet) {
        ResponseHandler.notFound(res, "Wallet not found");
        return;
      }

      ResponseHandler.success(res, wallet, "Wallet retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getLifetimeEarnings(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.user;
      const lifetimeEarnings = await WalletService.getLifetimeEarnings(userId);
      ResponseHandler.success(res, { lifetimeEarnings }, "Lifetime earnings retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
