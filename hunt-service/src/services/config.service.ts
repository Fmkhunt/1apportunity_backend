import { db } from '../config/database';
import { configTable } from '../models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/AppError';

export class ConfigService {
  static async getConfigByKey(key: string): Promise<any> {
    try {
      const [config] = await db.select().from(configTable).where(eq(configTable.key, key)).limit(1);

      return config;
    } catch (error) {
      console.error('Failed to fetch config:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch config', 500);
    }
  }

}