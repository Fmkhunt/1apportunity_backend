import jwt from 'jsonwebtoken';
import { UsersTable, otpTable, ServiceLocationTable } from '../models/schema';
import { db } from '../config/database';
import { eq, and, isNotNull, lt, gt } from 'drizzle-orm';
import { UserModel } from '../models/Users';
import { authConfig } from '../config/auth';
import {
  TUsers,
} from '../types';
import { AppError } from '../utils/AppError';

export class UserService {
  /**
   * Get user by id
   */
  static async getUserById(userId: string): Promise<any> {
    const user = await db.query.UsersTable.findFirst({where:eq(UsersTable.id, userId)});
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Get user's service location
   */
  static async getUserServiceLocation(userId: string): Promise<any> {
    try {
      // Get user first
      const user = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.id, userId))
        .limit(1);

      if (!user || user.length === 0) {
        throw new AppError('User not found', 404);
      }

      if (!user[0].service_location_id) {
        throw new AppError('User does not have a service location assigned', 404);
      }

      // Get service location
      const serviceLocation = await db
        .select()
        .from(ServiceLocationTable)
        .where(eq(ServiceLocationTable.id, user[0].service_location_id))
        .limit(1);

      if (!serviceLocation || serviceLocation.length === 0) {
        throw new AppError('Service location not found', 404);
      }

      return serviceLocation[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to get user service location: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }
}