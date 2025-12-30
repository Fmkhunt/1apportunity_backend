import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ResponseHandler } from '../utils/responseHandler';
import { TAuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';
import { ZoneService } from '../services/admin/zone.service';
import { ServiceLocationService } from '../services/admin/serviceLocation.service';

export class UserController {


  /**
   * Get current user profile
   */
  static async getProfile(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
    //   const user = await UserService.getUserById(req.user.userId);

    //   if (!user) {
    //     throw new AppError('User not found', 404);
    //   }

      ResponseHandler.success(res, req.user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
  static async getProfileDetails(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const user = req.user;
      const zone = await ZoneService.getZoneByCoordinates(latitude, longitude);
      const service_location = await ServiceLocationService.getServiceLocationById(zone?.service_location_id);
      ResponseHandler.success(res, {user, zone, service_location}, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's service location
   */
  static async getServiceLocation(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      const serviceLocation = await UserService.getUserServiceLocation(req.user.id);
      ResponseHandler.success(res, serviceLocation, 'Service location retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

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