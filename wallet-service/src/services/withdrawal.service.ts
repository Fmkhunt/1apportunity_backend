import { db } from '../config/database';
import { usersTable, withdrawalsTable } from '../models/schema';
import { eq, desc, and, sql, getTableColumns } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import { PaymentService } from './payment.service';
import { WalletService } from './wallet.service';
import { trpcUser } from '../trpc/client';
import { TCreateWithdrawalData, TWithdrawal, TWithdrawalListResponse } from '../types/withdrawal';

export class WithdrawalService {
  /**
   * Get minimum withdrawal coin limit from environment
   */
  private static getMinimumWithdrawalCoins(): number {
    const minCoins = Number(process.env.MIN_WITHDRAWAL_COINS || '0');
    return Number.isFinite(minCoins) && minCoins > 0 ? minCoins : 0;
  }

  /**
   * Validate withdrawal request - check if user has sufficient balance from users table
   */
  static async validateWithdrawalRequest(userId: string, coins: number): Promise<void> {
    try {
      // Check minimum coin limit
      const minCoins = this.getMinimumWithdrawalCoins();
      if (minCoins > 0 && coins < minCoins) {
        throw new AppError(`Minimum withdrawal amount is ${minCoins} coins. You requested ${coins} coins.`, 400);
      }

      // Get user balance from users table via TRPC
      let userBalance = 0;
      try {
        const balanceResult = await (trpcUser as any).user.getBalance.query(userId);
        if (balanceResult && balanceResult.success) {
          userBalance = balanceResult.balance || 0;
        } else {
          throw new AppError('Failed to fetch user balance', 500);
        }
      } catch (trpcError: any) {
        throw new AppError(`Failed to get user balance: ${trpcError.message}`, 500);
      }

      // Check if user has sufficient balance
      if (userBalance < coins) {
        throw new AppError(`Insufficient balance. Available: ${userBalance} coins, Requested: ${coins} coins`, 400);
      }

      // Check if user has any pending withdrawals (optional - prevent multiple pending requests)
      const pendingWithdrawals = await db
        .select()
        .from(withdrawalsTable)
        .where(and(eq(withdrawalsTable.user_id, userId), eq(withdrawalsTable.status, 'pending')));

      // Optional: You can limit pending withdrawals if needed
      // if (pendingWithdrawals.length > 0) {
      //   throw new AppError('You already have a pending withdrawal request', 400);
      // }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to validate withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Create withdrawal request
   */
  static async createWithdrawalRequest(data: TCreateWithdrawalData): Promise<TWithdrawal> {
    try {
      // Validate withdrawal request
      await this.validateWithdrawalRequest(data.user_id, data.coins);

      // Get user's service location to get conversion rate and currency
      const serviceLocation = await PaymentService.getUserServiceLocation(data.user_id);

      const conversionRate = parseFloat(serviceLocation.coin_rate || '0');
      if (conversionRate <= 0) {
        throw new AppError('Invalid conversion rate', 500);
      }

      // Calculate currency amount
      const currencyAmount = data.coins * conversionRate;
      const currency = serviceLocation.currency_sign || 'USD';

      // Create withdrawal record
      const [withdrawal] = await db
        .insert(withdrawalsTable)
        .values({
          user_id: data.user_id,
          coins: data.coins,
          conversion_rate: conversionRate.toString(),
          currency: currency,
          currency_amount: currencyAmount.toString(),
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      if (!withdrawal) {
        throw new AppError('Failed to create withdrawal request', 500);
      }

      return withdrawal as TWithdrawal;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Get user's withdrawal history
   */
  static async getUserWithdrawals(userId: string, page: number, limit: number): Promise<TWithdrawalListResponse> {
    try {
      const offset = (page - 1) * limit;

      // Get withdrawals
      const withdrawals = await db
        .select()
        .from(withdrawalsTable)
        .where(eq(withdrawalsTable.user_id, userId))
        .orderBy(desc(withdrawalsTable.created_at))
        .offset(offset)
        .limit(limit);

      // Get total count
      const totalRecords = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(withdrawalsTable)
        .where(eq(withdrawalsTable.user_id, userId));

      return {
        withdrawals: withdrawals as TWithdrawal[],
        totalRecords: Number(totalRecords[0]?.count) || 0,
        page,
        limit,
      };
    } catch (error: any) {
      throw new AppError(`Failed to get user withdrawals: ${error.message}`, 500);
    }
  }

  /**
   * Get all pending withdrawals (for admin)
   */
  static async getPendingWithdrawals(page: number, limit: number): Promise<any> {
    try {
      const offset = (page - 1) * limit;

      // Get pending withdrawals
      // join with users table
      const withdrawals = await db
        .select({
          ...getTableColumns(withdrawalsTable),
          user:{
            id: usersTable.id,
            name: usersTable.name,
            phone: usersTable.phone,
            ccode: usersTable.ccode,
            country: usersTable.country,
            profile: usersTable.profile,
          },
        })
        .from(withdrawalsTable)
        .leftJoin(usersTable, eq(withdrawalsTable.user_id, usersTable.id))
        .where(eq(withdrawalsTable.status, 'pending'))
        .orderBy(desc(withdrawalsTable.created_at))
        .offset(offset)
        .limit(limit);

      // Get total count
      const totalRecords = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(withdrawalsTable)
        .where(eq(withdrawalsTable.status, 'pending'));

      return {
        withdrawals: withdrawals,
        totalRecords: Number(totalRecords[0]?.count) || 0,
        page,
        limit,
      };
    } catch (error: any) {
      throw new AppError(`Failed to get pending withdrawals: ${error.message}`, 500);
    }
  }

  /**
   * Get withdrawal by ID
   */
  static async getWithdrawalById(id: string): Promise<TWithdrawal | null> {
    try {
      const [withdrawal] = await db
        .select()
        .from(withdrawalsTable)
        .where(eq(withdrawalsTable.id, id))
        .limit(1);

      return withdrawal as TWithdrawal | null;
    } catch (error: any) {
      throw new AppError(`Failed to get withdrawal: ${error.message}`, 500);
    }
  }

  /**
   * Approve withdrawal
   */
  static async approveWithdrawal(withdrawalId: string, adminId: string): Promise<TWithdrawal> {
    try {
      // Get withdrawal
      const withdrawal = await this.getWithdrawalById(withdrawalId);
      if (!withdrawal) {
        throw new AppError('Withdrawal not found', 404);
      }

      if (withdrawal.status !== 'pending') {
        throw new AppError(`Withdrawal is already ${withdrawal.status}`, 400);
      }

      // Validate balance again (in case it changed)
      await this.validateWithdrawalRequest(withdrawal.user_id, withdrawal.coins);

      // Update withdrawal status
      const [updatedWithdrawal] = await db
        .update(withdrawalsTable)
        .set({
          status: 'approved',
          processed_by: adminId,
          processed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(withdrawalsTable.id, withdrawalId))
        .returning();

      if (!updatedWithdrawal) {
        throw new AppError('Failed to update withdrawal', 500);
      }

      // Debit coins from wallet table
      await WalletService.debit({
        wallet_id: withdrawal.user_id,
        amount: withdrawal.coins,
        description: `Withdrawal request ${withdrawalId}`,
        reference_type: 'withdrawal',
        reference_id: withdrawalId,
        created_by: adminId,
      });

      // Deduct balance from users table via TRPC
      try {
        const result = await (trpcUser as any).user.deductBalance.mutate({
          userId: withdrawal.user_id,
          amount: withdrawal.coins,
        });

        if (!result || !result.success) {
          // Rollback withdrawal status if TRPC fails
          await db
            .update(withdrawalsTable)
            .set({
              status: 'pending',
              processed_by: null,
              processed_at: null,
              updated_at: new Date(),
            })
            .where(eq(withdrawalsTable.id, withdrawalId));

          throw new AppError('Failed to deduct balance from user account', 500);
        }

        console.log(`Successfully deducted ${withdrawal.coins} coins from user ${withdrawal.user_id}. New balance: ${result.newBalance}`);
      } catch (trpcError: any) {
        // Rollback withdrawal status if TRPC fails
        await db
          .update(withdrawalsTable)
          .set({
            status: 'pending',
            processed_by: null,
            processed_at: null,
            updated_at: new Date(),
          })
          .where(eq(withdrawalsTable.id, withdrawalId));

        throw new AppError(`Failed to deduct balance: ${trpcError.message}`, 500);
      }

      return updatedWithdrawal as TWithdrawal;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to approve withdrawal: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Reject withdrawal
   */
  static async rejectWithdrawal(withdrawalId: string, adminId: string, reason?: string): Promise<TWithdrawal> {
    try {
      // Get withdrawal
      const withdrawal = await this.getWithdrawalById(withdrawalId);
      if (!withdrawal) {
        throw new AppError('Withdrawal not found', 404);
      }

      if (withdrawal.status !== 'pending') {
        throw new AppError(`Withdrawal is already ${withdrawal.status}`, 400);
      }

      // Update withdrawal status
      const [updatedWithdrawal] = await db
        .update(withdrawalsTable)
        .set({
          status: 'rejected',
          rejection_reason: reason || null,
          processed_by: adminId,
          processed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(withdrawalsTable.id, withdrawalId))
        .returning();

      if (!updatedWithdrawal) {
        throw new AppError('Failed to update withdrawal', 500);
      }

      return updatedWithdrawal as TWithdrawal;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to reject withdrawal: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }
}
