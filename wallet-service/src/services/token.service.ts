import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { TAdminJwtPayload, TJwtPayload, TUsers } from '../types';
import { AppError } from '../utils/AppError';
import { db } from '../config/database';
import { eq } from 'drizzle-orm';
import { TokenWalletTable } from '../models/schema';

export class TokenService {
  static verifyToken(token: string): TJwtPayload {
    try {
      return jwt.verify(token, authConfig.jwt.secret) as TJwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
  static verifyAdminToken(token: string): TAdminJwtPayload {
    try {
      return jwt.verify(token, authConfig.jwt.secret) as TAdminJwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Credit tokens to user's token wallet
   */
  static async creditTokens(
    userId: string,
    quantity: number,
    paymentTransactionId: string,
    description?: string
  ): Promise<void> {
    try {
      await db.insert(TokenWalletTable).values({
        userId,
        token: quantity,
        transaction_type: 'credit',
        payment_transaction_id: paymentTransactionId,
        description: description || `Payment transaction ${paymentTransactionId}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error: any) {
      throw new AppError(`Failed to credit tokens: ${error.message}`, 500);
    }
  }

  /**
   * Debit tokens from user's token wallet
   */
  static async debitTokens(
    userId: string,
    quantity: number,
    description?: string,
    clueId?: string
  ): Promise<void> {
    try {
      await db.insert(TokenWalletTable).values({
        userId,
        token: quantity,
        transaction_type: 'debit',
        clue_id: clueId || null,
        description: description || 'Token debit',
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error: any) {
      throw new AppError(`Failed to debit tokens: ${error.message}`, 500);
    }
  }

//   static async getUserById(userId: string): Promise<TUsers | null> {
//     const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));
//     return user[0] || null;
//   }
}