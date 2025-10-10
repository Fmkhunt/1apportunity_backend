import { Request } from 'express';

// User related types
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


// Authentication types
export type TJwtPayload = {
  userId: string;
  tokenType: 'accessToken' | 'refreshToken';
  role?: string;
  iat?: number;
  exp?: number;
}

export type TAuthenticatedRequest = Request & {
  user?: TUsers;
}

// API Response types
export type TApiResponse<T = any> = {
  data: T;
  message: string;
  success: boolean;
}

// Social login types

// Login types
export type TLoginData = {
  phone: string;
  otp: number;
}

export type TSendOtpData = {
  phone: string;
  type: 'register' | 'login';
}

// Registration types
export type TRegistrationData = {
  email: string;
  phone: string;
  otp: number;
  name: string;
  referral_by?: string;
  device_token?: string;
}

// Token response types
export type TTokenResponse = {
  accessToken: string;
  refreshToken: string;
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

// File upload types
export type TFileUpload = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
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

export type TCreateProductData = {
  name: string;
  description?: string;
  price: number;
  category?: string;
  brand?: string;
  sku?: string;
  stock_quantity: number;
  images?: string[];
  is_active?: boolean;
};

export type TUpdateProductData = {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  sku?: string;
  stock_quantity?: number;
  images?: string[];
  is_active?: boolean;
}
