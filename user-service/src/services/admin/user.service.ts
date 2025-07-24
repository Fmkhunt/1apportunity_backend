import { UsersTable, otpTable } from '@/models/schema';
import { db } from '@/config/database';
import { eq, and, isNotNull, lt, gt, desc } from 'drizzle-orm';
import {
  TUsers,
} from '@/types';
import { AppError } from '@/utils/AppError';

export class AdminUserService {
  /**
   * Get user by id
   */
  static async getUserList(page: number, limit: number, search: string | null): Promise<any> {
    const users = await db.query.UsersTable.findMany({
      limit: limit,
      offset: (page - 1) * limit,
      orderBy: [desc(UsersTable.created_at)],
      where: isNotNull(UsersTable.id),
    });
    return {
      users,
      total: users.length,
      page,
      limit,
    };
  }
}