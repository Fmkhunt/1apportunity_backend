import { Request } from 'express';

// API Response types
export type TApiResponse<T = any> = {
  data: T;
  message: string;
  success: boolean;
}
export type TUsers = {
  id: string;
  email: string;
  name: string;
  phone: string;
  profile?: string;
  balance?: number;
  referral_code?: string;
  referral_by?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TWallet = {
  id: string;
  userId: string;
  coins: number;
  transaction_type: string;
  type: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

// Authentication types
export type TJwtPayload = {
  userId: string;
  tokenType: 'accessToken';
  role?: string;
  iat?: number;
  exp?: number;
}

export type TAdminJwtPayload = {
  adminId: string;
  tokenType: 'accessToken';
  role?: string;
  iat?: number;
  exp?: number;
}
export type TAuthenticatedRequest = Request & {
  user?: TJwtPayload;
}

// Error types
export type TAppError = Error & {
  statusCode?: number;
  isOperational?: boolean;
}

// Validation types
export type TValidationError = {
  field: string;
  message: string;
}

// Environment types
export type TEnvironment = {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  APP_NAME: string;
  APP_URL: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: number;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
};

export type TUpdateTaskData = {
  name?: string;
  description?: string;
  duration?: string;
  reward?: number;
  status?: 'active' | 'inactive';
  updated_by: string;
  claim_id?: string;
  clue_ids?: string[];
}

export type TTaskQueryParams = {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
  type?: 'mission' | 'question';
}

export type TAuthenticatedAdminRequest = Request & {
  admin?: TAdminJwtPayload;
}
