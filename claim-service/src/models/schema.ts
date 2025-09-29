import { pgTable, text, timestamp, integer, varchar, jsonb, uuid, time } from 'drizzle-orm/pg-core';
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
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});


export const claimsTable = pgTable('claims', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  reward: integer('reward').notNull(),
  claim_type: varchar('claim_type', { length: 255 }).notNull(),
  levels: jsonb('levels').$type<Array<{ level: number; user_count: number; rewards: number }> | null>(),
  coupen_code: varchar('coupen_code', { length: 100 }),
  product_img: varchar('product_img', { length: 255 }),
  created_by: uuid('created_by'),
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
  coordinates: text('coordinates').notNull(), // GEOGRAPHY - stored as text
  duration: time('duration'),
  created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
