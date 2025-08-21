import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../../services/admin/adminAuth.service';
import { ResponseHandler } from '../../utils/responseHandler';
import { AppError } from '../../utils/AppError';
import { TAdminLoginData, TAuthenticatedAdminRequest, TAdmin } from '../../types/admin';

export class AdminAuthController {
  /**
   * Admin login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: TAdminLoginData = req.body;

      const result = await AdminAuthService.login(loginData);

      ResponseHandler.created(res, result, "Admin logged in successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh admin access token
   */
  static async refreshToken(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = req.admin as TAdmin;
      if (!admin) {
        throw new AppError('Authentication required', 401);
      }
      const result = await AdminAuthService.refreshToken(admin);

      ResponseHandler.success(res, result, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current admin profile
   */
  static async getProfile(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.admin?.id;

      if (!adminId) {
        throw new AppError('Authentication required', 401);
      }

      const admin = await AdminAuthService.getAdminById(adminId);

      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Remove password from response
      const { password, ...adminWithoutPassword } = admin;

      ResponseHandler.success(res, adminWithoutPassword, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout admin (client-side token removal)
   */
  static async logout(req: TAuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by removing the token. However, you could implement a blacklist here
      // for additional security if needed.

      ResponseHandler.success(res, {}, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}