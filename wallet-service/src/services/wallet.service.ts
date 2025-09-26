import { db } from '../config/database';
import { walletTable } from '../models/schema';
import { TWallet } from '../types';
import { desc, eq } from 'drizzle-orm';

export class WalletService {
  static async getList(userId: string, page: number, limit: number): Promise<TWallet[]> {
    const offset = (page - 1) * limit;
    const wallet = await db.select().from(walletTable).where(eq(walletTable.userId, userId)).orderBy(desc(walletTable.created_at)).offset(offset).limit(limit);
    return wallet;
  }
}