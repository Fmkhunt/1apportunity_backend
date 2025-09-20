import { pgTable, text, timestamp, integer, varchar, jsonb, uuid, time, unique, pgEnum } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';
import { relations } from "drizzle-orm";

// Clue related schema

// Define schema
export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  duration:time('duration').notNull(),
  reward:integer('reward').notNull(),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  type:varchar('type', { enum: ['mission', 'question'] }).default('mission'),
  claim_id: uuid('claim_id').references(() => claimsTable.id),
  created_by: uuid('created_by'),
  updated_by: uuid('updated_by'),
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
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const claimsTable = pgTable('claims', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  rewards:integer('rewards').notNull(),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const huntsTable = pgTable('hunts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  admin_id: uuid('admin_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  coordinates: text('coordinates').notNull(), // Store as WKT string that will be cast to geography in queries
  duration: time('duration'),
  created_by: uuid('created_by'),
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
  status: varchar('status', { enum: ['search', 'claimed', 'started', 'arrived', 'completed'] }).default("search"),
  expire_at: timestamp('expire_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed_at: timestamp('completed_at'),
}, (table) => {
  return {
    userClaimUnique: unique().on(table.user_id, table.hunt_id),
  };
});

// Clues
export const cluesTable = pgTable('clues', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const clueTasksTable = pgTable('clue_tasks', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clue_id: uuid('clue_id').notNull().references(() => cluesTable.id, { onDelete: 'cascade' }),
  task_id: uuid('task_id').notNull().references(() => tasksTable.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unq: unique().on(table.clue_id, table.task_id),
}));




// Users ↔ Hunt Claims
export const usersRelations = relations(UsersTable, ({ many }) => ({
  huntClaims: many(huntClaimTable),
}));

// Hunts ↔ Hunt Claims
export const huntTasksTable = pgTable('hunt_tasks', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  hunt_id: uuid('hunt_id').notNull().references(() => huntsTable.id, { onDelete: 'cascade' }),
  task_id: uuid('task_id').notNull().references(() => tasksTable.id, { onDelete: 'cascade' }),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unq: unique().on(table.hunt_id, table.task_id),
}));

export const huntsRelations = relations(huntsTable, ({ many }) => ({
  huntTasks: many(huntTasksTable),
  huntClaims: many(huntClaimTable),
}));

// Tasks ↔ Questions & ClueTasks
export const tasksRelations = relations(tasksTable, ({ many, one }) => ({
  claim: one(claimsTable, {
    fields: [tasksTable.claim_id],
    references: [claimsTable.id],
  }),
  huntTasks: many(huntTasksTable),
  questions: many(questionsTable),
  clueTasks: many(clueTasksTable),
}));

// Claims ↔ HuntClaims
export const claimsRelations = relations(claimsTable, ({ many }) => ({
  tasks: many(tasksTable),
  huntClaims: many(huntClaimTable),
}));


// Relations
export const cluesRelations = relations(cluesTable, ({ many }) => ({
  clueTasks: many(clueTasksTable),
}));

export const clueTasksRelations = relations(clueTasksTable, ({ one }) => ({
  clue: one(cluesTable, {
    fields: [clueTasksTable.clue_id],
    references: [cluesTable.id],
  }),
  task: one(tasksTable, {
    fields: [clueTasksTable.task_id],
    references: [tasksTable.id],
  }),
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
}));

// Questions ↔ Tasks
export const questionsRelations = relations(questionsTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [questionsTable.task_id],
    references: [tasksTable.id],
  }),
}));
