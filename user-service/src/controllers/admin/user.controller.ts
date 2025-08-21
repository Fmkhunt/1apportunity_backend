import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { TAuthenticatedAdminRequest } from '../../types/admin';
import { AppError } from '../../utils/AppError';
import { AdminUserService } from '../../services/admin/user.service';

export class AdminUserController {

  /**
   * Get all users
   */
  static async getAllUsers(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search } = req.query;
      const users = await AdminUserService.getUserList(Number(page), Number(limit), search as string | null );
      ResponseHandler.created(res, users, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
