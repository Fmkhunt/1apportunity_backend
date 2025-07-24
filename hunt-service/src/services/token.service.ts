import jwt from 'jsonwebtoken';
import { authConfig } from '@/config/auth';
import { TJwtPayload, TUsers } from '@/types';
import { AppError } from '@/utils/AppError';
import { db } from '@/config/database';
import { eq } from 'drizzle-orm';

export class TokenService {
  static verifyToken(token: string): TJwtPayload {
    try {
      return jwt.verify(token, authConfig.jwt.secret) as TJwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
//   static async getUserById(userId: string): Promise<TUsers | null> {
//     const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));
//     return user[0] || null;
//   }
}