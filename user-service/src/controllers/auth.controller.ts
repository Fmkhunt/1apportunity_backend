import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../utils/responseHandler';
import { TRegistrationData, TLoginData, TSendOtpData, TAuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: TRegistrationData = req.body;

      const result = await AuthService.register(userData);

      ResponseHandler.created(res, result, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */

  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reqData: TSendOtpData = req.body;

      const result = await AuthService.sendOtp(reqData.phone, reqData.type);

      ResponseHandler.success(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: TLoginData = req.body;

      const result = await AuthService.login(userData);

      ResponseHandler.created(res, result, "User logged in successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refreshToken(req.user);

      ResponseHandler.success(res, result, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  // /**
  //  * Get current user profile
  //  */
  // static async getProfile(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     if (!req.user) {
  //       throw new AppError('Authentication required', 401);
  //     }

  //     const user = await AuthService.getUserById(req.user.userId);

  //     if (!user) {
  //       throw new AppError('User not found', 404);
  //     }

  //     ResponseHandler.success(res, user, 'Profile retrieved successfully');
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // /**
  //  * Update user profile
  //  */
  // static async updateProfile(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     if (!req.user) {
  //       throw new AppError('Authentication required', 401);
  //     }

  //     const updateData = req.body;
  //     const result = await AuthService.updateProfile(req.user.userId, updateData);

  //     ResponseHandler.success(res, result.data, result.message);
  //   } catch (error) {
  //     next(error);
  //   }
  // }


  // /**
  //  * Logout user (client-side token removal)
  //  */
  // static async logout(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     // In a stateless JWT system, logout is typically handled client-side
  //     // by removing the token. However, you could implement a blacklist here
  //     // for additional security if needed.

  //     ResponseHandler.success(res, {}, 'Logged out successfully');
  //   } catch (error) {
  //     next(error);
  //   }
  // }



  // /**
  //  * Get user by ID (admin only)
  //  */
  // static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const { userId } = req.params;

  //     const user = await AuthService.getUserById(userId);

  //     if (!user) {
  //       throw new AppError('User not found', 404);
  //     }

  //     ResponseHandler.success(res, user, 'User retrieved successfully');
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}