import { pgTable, text, timestamp, integer, boolean, varchar, jsonb, PgDateString, uuid, decimal } from 'drizzle-orm/pg-core';
import  crypto from 'node:crypto';
import { sql } from 'drizzle-orm';

// Define schema
export const UsersTable = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  ccode: varchar('ccode', { length: 10 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  profile: varchar('profile', { length: 255 }).default(''),
  balance: integer('balance').default(0),
  referral_code: varchar('referral_code', { length: 10 }).notNull().unique(),
  referral_by: varchar('referral_by', { length: 10 }).references(() => UsersTable.referral_code),
  status: varchar('status', { enum: ['active', 'inactive', 'pending'] }).default('pending'),
  service_location_id: uuid('service_location_id').references(() => ServiceLocationTable.id),
  token: integer('token').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const otpTable = pgTable('otp', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: uuid('user_id').references(() => UsersTable.id),
    phone: varchar('phone', { length: 15 }).notNull(),
    ccode: varchar('ccode', { length: 5 }).notNull(),
    otp: integer('otp').notNull(),
    expires_at: timestamp('expire_at').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const referralTable = pgTable('reffral', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  refer_by: uuid('refer_by').references(() => UsersTable.id),
  referred: uuid('referred').references(() => UsersTable.id),
  coin: integer('coin').notNull().default(0),
  // created_by: uuid('created_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Service Location table schema
export const ServiceLocationTable = pgTable('service_location', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  country: varchar('country', { length: 100 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull(),
  currency: varchar('currency', { length: 50 }),
  currency_sign: varchar('currency_sign', { length: 10 }).notNull(),
  map: varchar('map', { length: 50 }).notNull(), // google, apple, etc.
  payment_gateway: varchar('payment_gateway', { length: 50 }).notNull(), // stripe, paypal, etc.
  coin_rate: decimal('coin_rate', { precision: 10, scale: 4 }).notNull().default(`0.0000`),
  token_rate: decimal('token_rate', { precision: 10, scale: 4 }).notNull().default(`0.0000`),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Zone table schema
export const ZoneTable = pgTable('zone', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  area: text('area'), // GEOMETRY(POLYGON, 4326) - stored as text for now
  service_location_id: uuid('service_location_id').references(() => ServiceLocationTable.id).notNull(),
  city: varchar('city', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Admin table schema
export const AdminTable = pgTable('admin', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 15 }),
  email: varchar('email', { length: 200 }).notNull().unique(),
  password: varchar('password', { length: 200 }).notNull(),
  role: varchar('role', { length: 50 }).default('manager'),
  zone_id: uuid('zone_id').references(() => ZoneTable.id),
  permissions: jsonb('permissions').$type<string[]>(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});