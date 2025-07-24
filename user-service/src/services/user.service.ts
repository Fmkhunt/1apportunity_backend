import jwt from 'jsonwebtoken';
import { UsersTable, otpTable } from '@/models/schema';
import { db } from '@/config/database';
import { eq, and, isNotNull, lt, gt } from 'drizzle-orm';
import { UserModel } from '@/models/Users';
import { authConfig } from '@/config/auth';
import {
  TUsers,
} from '@/types';
import { AppError } from '@/utils/AppError';

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
}