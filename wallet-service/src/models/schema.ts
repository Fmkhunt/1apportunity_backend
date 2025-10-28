import { pgTable, text, timestamp, integer, varchar, jsonb, uuid, time, unique, pgEnum, index } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';
import { relations } from "drizzle-orm";

// Clue related schema

// Define schema
export const walletTable = pgTable('wallet', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull(),
  coins: integer('coins').notNull(),
  transaction_type: varchar('transaction_type', { enum: ['credit', 'debit'] }).notNull(),
  type: varchar('type', { enum: ['task', 'referral','withdrawal'] }).notNull(),
  description: text('description').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_user_id: index('idx_user_id').on(table.userId),
    idx_created_at: index('idx_created_at').on(table.created_at),
    idx_type: index('idx_type').on(table.type),
    idx_transaction_type: index('idx_transaction_type').on(table.transaction_type),
  };
});


export const TokenWalletTable = pgTable('token_wallet', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull(),
  token: integer('token').notNull(),
  transaction_type: varchar('transaction_type', { enum: ['credit', 'debit'] }).notNull(),
  clue_id: uuid('clue_id'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_user_id: index('idx_twallet_user_id').on(table.userId),
    idx_created_at: index('idx_twallet_created_at').on(table.created_at),
    idx_clue_id: index('idx_twallet_clue_id').on(table.clue_id),
    idx_transaction_type: index('idx_twallet_transaction_type').on(table.transaction_type),
  };
});

// export const walletRelations = relations(walletTable, ({ many }) => ({
//   user: one(usersTable, {
//     fields: [walletTable.userId],
//     references: [usersTable.id],
//   }),
// }));

