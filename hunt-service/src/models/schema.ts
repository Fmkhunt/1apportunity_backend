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
  created_by:varchar('created_by', { length: 255 }).notNull(),
  updated_by:varchar('updated_by', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const huntsTable = pgTable('hunts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  task_id: uuid('task_id').references(() => tasksTable.id),
  status:varchar('status', { enum: ['active', 'inactive'] }).default('active'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
