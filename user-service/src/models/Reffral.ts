import { referralTable, UsersTable } from '@/models/schema';
import { db } from '@/config/database';
import { eq, and, isNull, lt, gt } from 'drizzle-orm';
import { NewUsers, Users, UsersWithMethods } from './Users';

// Types
export type Reffral = typeof referralTable.$inferSelect;
export type NewReffral = typeof referralTable.$inferInsert;

export class ReffralModel {
    static async create(reffralData: NewReffral): Promise<Reffral> {
      const insertedReffral = await db.insert(referralTable).values({
        ...reffralData,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning();

      const reffral = insertedReffral[0];

      if (!reffral) {
          throw new Error("Failed to create reffral: No data returned from insert operation.");
      }

      return reffral;
    }
}