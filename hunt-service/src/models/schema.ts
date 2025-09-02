import { pgTable, text, timestamp, integer, varchar, jsonb, uuid, time, unique } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';
import { relations } from "drizzle-orm";

// Define schema
export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  duration:time('duration').notNull(),
  reward:integer('reward').notNull(),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  type:varchar('type', { enum: ['mission', 'question'] }).default('mission'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const questionsTable = pgTable('questions', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text('question').notNull(),
  task_id: uuid('task_id').references(() => tasksTable.id),
  answer: text('answer').notNull(),
  question_type:varchar('question_type', { enum: ['text', 'mcq'] }).default('text'),
  options: jsonb('options').$type<
    { option: string; text: string }[]
  >(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const claimsTable = pgTable('claims', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  rewards:integer('rewards').notNull(),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const huntsTable = pgTable('hunts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  task_id: uuid('task_id').references(() => tasksTable.id).notNull(),
  claim_id: uuid('claim_id').references(() => claimsTable.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  coordinates: text('coordinates').notNull(), // Store as WKT string that will be cast to geography in queries
  duration: time('duration'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
export const UsersTable = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  profile: varchar('profile', { length: 255 }).default(''),
  balance: integer('balance').default(0),
  referral_code: varchar('referral_code', { length: 10 }).notNull().unique(),
  referral_by: varchar('referral_by', { length: 10 }).references(() => UsersTable.referral_code),
  status: varchar('status', { enum: ['active', 'inactive', 'pending'] }).default('pending'),
  last_task_at: jsonb('last_task_at').$type<{
    instagram: Date | null;
    youtube: Date | null;
    web: Date | null;
  }>(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const huntClaimTable = pgTable('hunt_claim', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: uuid('user_id').references(() => UsersTable.id).notNull(), // References users table in another service
  hunt_id: uuid('hunt_id').references(() => huntsTable.id).notNull(),
  task_id: uuid('task_id').references(() => tasksTable.id),
  status: varchar('status', { enum: ['search', 'claimed', 'started', 'arrived', 'completed'] }).default("search"),
  claim_id: uuid('claim_id').references(() => claimsTable.id),
  coins: integer('coins'),
  expire_at: timestamp('expire_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed_at: timestamp('completed_at'),
  rank: integer('rank'),
}, (table) => {
  return {
    userClaimUnique: unique().on(table.user_id, table.hunt_id),
  };
});




// Users ↔ Hunt Claims
export const usersRelations = relations(UsersTable, ({ many }) => ({
  huntClaims: many(huntClaimTable),
}));

// Hunts ↔ Hunt Claims
export const huntsRelations = relations(huntsTable, ({ many, one }) => ({
  task: one(tasksTable, {
    fields: [huntsTable.task_id],
    references: [tasksTable.id],
  }),
  claim: one(claimsTable, {
    fields: [huntsTable.claim_id],
    references: [claimsTable.id],
  }),
  huntClaims: many(huntClaimTable),
}));

// Tasks ↔ Hunts & Questions
export const tasksRelations = relations(tasksTable, ({ many }) => ({
  hunts: many(huntsTable),
  questions: many(questionsTable),
}));

// Claims ↔ Hunts & HuntClaims
export const claimsRelations = relations(claimsTable, ({ many }) => ({
  hunts: many(huntsTable),
  huntClaims: many(huntClaimTable),
}));

// HuntClaim ↔ Users, Hunts, Tasks, Claims
export const huntClaimRelations = relations(huntClaimTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [huntClaimTable.user_id],
    references: [UsersTable.id],
  }),
  hunt: one(huntsTable, {
    fields: [huntClaimTable.hunt_id],
    references: [huntsTable.id],
  }),
  task: one(tasksTable, {
    fields: [huntClaimTable.task_id],
    references: [tasksTable.id],
  }),
  claim: one(claimsTable, {
    fields: [huntClaimTable.claim_id],
    references: [claimsTable.id],
  }),
}));

// Questions ↔ Tasks
export const questionsRelations = relations(questionsTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [questionsTable.task_id],
    references: [tasksTable.id],
  }),
}));
