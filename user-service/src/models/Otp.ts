import { otpTable } from '../models/schema';

// Define schema

// Types
export type Otp = typeof otpTable.$inferSelect;
export type NewOtp = typeof otpTable.$inferInsert;
