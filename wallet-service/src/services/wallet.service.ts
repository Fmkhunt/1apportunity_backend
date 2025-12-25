import { db } from '../config/database';
import { walletTable } from '../models/schema';
import { TWallet } from '../types';
import { desc, eq, and, sql } from 'drizzle-orm';
import { AppError } from '../utils/AppError';

export interface CreateWalletData {
  user_id: string;
  balance: number;
  created_by: string;
}

export interface CreditWalletData {
  wallet_id: string;
  amount: number;
  description: string;
  reference_type: string;
  reference_id: string;
  created_by: string;
  payment_transaction_id?: string;
}

export class WalletService {
  static async getLifetimeEarnings(userId: string): Promise<number> {
    const lifetimeEarnings = await db.select({ sum: sql<number>`sum(coins)`.as('sum') })
      .from(walletTable)
      .where(and(eq(walletTable.userId, userId), eq(walletTable.transaction_type, 'credit'), eq(walletTable.type, 'task')))
    return Number(lifetimeEarnings[0]?.sum) ?? 0;
  }

  static async getList(userId: string, page: number, limit: number): Promise<TWallet[]> {
    const offset = (page - 1) * limit;
    const wallet = await db.select().from(walletTable).where(eq(walletTable.userId, userId)).orderBy(desc(walletTable.created_at)).offset(offset).limit(limit);
    return wallet;
  }

  /**
   * Get wallet by user ID
   */
  static async getByUserId(userId: string): Promise<TWallet | null> {
    try {
      const [wallet] = await db
        .select()
        .from(walletTable)
        .where(eq(walletTable.userId, userId))
        .limit(1);

      return wallet || null;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Create a new wallet for user
   */
  static async create(walletData: CreateWalletData): Promise<TWallet> {
    try {
      const [newWallet] = await db
        .insert(walletTable)
        .values({
          userId: walletData.user_id,
          coins: walletData.balance,
          transaction_type: 'credit',
          type: 'task',
          description: 'Initial wallet creation',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return newWallet;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Credit amount to wallet
   */
  static async credit(creditData: CreditWalletData): Promise<TWallet> {
    try {
      // Determine type based on reference_type
      let transactionType = 'task';
      if (creditData.reference_type === 'payment') {
        transactionType = 'payment';
      } else if (creditData.reference_type === 'referral') {
        transactionType = 'referral';
      }

      // Create credit transaction
      const [creditTransaction] = await db
        .insert(walletTable)
        .values({
          userId: creditData.wallet_id, // This is actually the user ID
          coins: creditData.amount,
          transaction_type: 'credit',
          type: transactionType as any,
          payment_transaction_id: creditData.payment_transaction_id || null,
          description: creditData.description,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      console.log(`Credited ${creditData.amount} coins to user ${creditData.wallet_id}`);

      return creditTransaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get wallet balance for user
   */
  static async getBalance(userId: string): Promise<number> {
    try {
      const result = await db
        .select({
          totalCredits: sql<number>`COALESCE(SUM(CASE WHEN ${walletTable.transaction_type} = 'credit' THEN ${walletTable.coins} ELSE 0 END), 0)`,
          totalDebits: sql<number>`COALESCE(SUM(CASE WHEN ${walletTable.transaction_type} = 'debit' THEN ${walletTable.coins} ELSE 0 END), 0)`,
        })
        .from(walletTable)
        .where(eq(walletTable.userId, userId));

      const balance = (result[0]?.totalCredits || 0) - (result[0]?.totalDebits || 0);
      return balance;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }
}