import { pgTable, text, timestamp, integer, boolean, varchar, jsonb, PgDateString, uuid, time } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';

// Define schema
export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  duration:time('duration').notNull(),
  reward:integer('reward').notNull(),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  task_type:varchar('task_type', { enum: ['mission', 'question'] }).default('mission'),
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

export const huntsTable = pgTable('hunts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  duration:time('duration').notNull(),
  task_id: uuid('task_id').references(() => tasksTable.id),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
