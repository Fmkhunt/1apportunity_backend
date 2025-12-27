import { pgTable, text, timestamp, integer, varchar, jsonb, uuid, time, unique, pgEnum, index, decimal } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';
import { relations } from "drizzle-orm";

// Clue related schema

// Define schema
export const walletTable = pgTable('wallet', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull(),
  coins: integer('coins').notNull(),
  transaction_type: varchar('transaction_type', { enum: ['credit', 'debit'] }).notNull(),
  type: varchar('type', { enum: ['task', 'referral','withdrawal', 'payment'] }).notNull(),
  payment_transaction_id: uuid('payment_transaction_id'),
  description: text('description').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_user_id: index('idx_user_id').on(table.userId),
    idx_created_at: index('idx_created_at').on(table.created_at),
    idx_type: index('idx_type').on(table.type),
    idx_transaction_type: index('idx_transaction_type').on(table.transaction_type),
    idx_payment_transaction_id: index('idx_wallet_payment_transaction_id').on(table.payment_transaction_id),
  };
});


export const TokenWalletTable = pgTable('token_wallet', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull(),
  token: integer('token').notNull(),
  transaction_type: varchar('transaction_type', { enum: ['credit', 'debit'] }).notNull(),
  clue_id: uuid('clue_id'),
  payment_transaction_id: uuid('payment_transaction_id'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_user_id: index('idx_twallet_user_id').on(table.userId),
    idx_created_at: index('idx_twallet_created_at').on(table.created_at),
    idx_clue_id: index('idx_twallet_clue_id').on(table.clue_id),
    idx_transaction_type: index('idx_twallet_transaction_type').on(table.transaction_type),
    idx_payment_transaction_id: index('idx_twallet_payment_transaction_id').on(table.payment_transaction_id),
  };
});

// Payment Transactions table
export const paymentTransactionsTable = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 4 }).notNull(), // Amount in smallest currency unit (cents/paise)
  currency: varchar('currency', { length: 10 }).notNull(),
  quantity: integer('quantity').notNull(), // Calculated tokens or credits
  payment_type: varchar('payment_type', { enum: ['tokens', 'credits'] }).notNull(),
  payment_gateway: varchar('payment_gateway', { length: 50 }).notNull(), // stripe, razorpay
  gateway_order_id: varchar('gateway_order_id', { length: 255 }),
  gateway_session_id: varchar('gateway_session_id', { length: 255 }),
  status: varchar('status', { enum: ['pending', 'success', 'failed'] }).notNull().default('pending'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_user_id: index('idx_payment_user_id').on(table.userId),
    idx_gateway_order_id: index('idx_payment_gateway_order_id').on(table.gateway_order_id),
    idx_gateway_session_id: index('idx_payment_gateway_session_id').on(table.gateway_session_id),
    idx_status: index('idx_payment_status').on(table.status),
    idx_created_at: index('idx_payment_created_at').on(table.created_at),
  };
});

// Withdrawals table
export const withdrawalsTable = pgTable('withdrawals', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: uuid('user_id').notNull(),
  coins: integer('coins').notNull(),
  conversion_rate: decimal('conversion_rate', { precision: 10, scale: 4 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  currency_amount: decimal('currency_amount', { precision: 10, scale: 4 }).notNull(),
  status: varchar('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  rejection_reason: text('rejection_reason'),
  processed_by: uuid('processed_by'),
  processed_at: timestamp('processed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
},(table) => {
  return {
    idx_withdrawal_user_id: index('idx_withdrawal_user_id').on(table.user_id),
    idx_withdrawal_status: index('idx_withdrawal_status').on(table.status),
    idx_withdrawal_created_at: index('idx_withdrawal_created_at').on(table.created_at),
  };
});

// export const walletRelations = relations(walletTable, ({ many }) => ({
//   user: one(usersTable, {
//     fields: [walletTable.userId],
//     references: [usersTable.id],
//   }),
// }));
