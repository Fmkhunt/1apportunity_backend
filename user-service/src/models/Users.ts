import { UsersTable } from '../models/schema';
import { db } from '../config/database';
import { eq, and, isNull, lt, gt } from 'drizzle-orm';
import  crypto from 'node:crypto';

// Types
export type Users = typeof UsersTable.$inferSelect;
export type NewUsers = typeof UsersTable.$inferInsert;

// Corrected: No need to omit 'password' if it's not there
export interface UsersWithMethods extends Users {
  toJSON(): Users & { profileUrl?: string | null };
}

export class UserModel {
  static async create(userData: NewUsers): Promise<UsersWithMethods> {
    const insertedUsers = await db.insert(UsersTable).values({
      ...userData,
      email: userData.email.toLowerCase(),
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    const user = insertedUsers[0];

    if (!user) {
        throw new Error("Failed to create user: No data returned from insert operation.");
    }

    return this.addMethods(user);
  }

  private static addMethods(user: Users): UsersWithMethods {
    return {
      ...user,
      toJSON: function(): Users & { profileUrl?: string | null } {
        // No need to deconstruct 'password' if it doesn't exist
        const result: Users & { profileUrl?: string | null } = { ...this }; // Create a copy of 'this' (the user object)

        if (result.profile) {
          result.profileUrl = `${process.env.APP_URL}/public/profiles/${result.profile}`;
        }

        return result;
      }
    };
  }

  // You might also want a method to find a user and then add methods
  static async findUserById(id: string): Promise<UsersWithMethods | null> {
      const user = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.id, id)
      });
      if (!user) return null;
      return this.addMethods(user);
  }
}