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
  last_task_at?: {
    instagram: Date | null;
    youtube: Date | null;
    web: Date | null;
  };
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

// Task related types
export type TTask = {
  id: string;
  name: string;
  description: string;
  duration: string;
  reward: number;
  status: 'active' | 'inactive';
  created_by: string;
  updated_by: string;
  task_type: 'mission' | 'question';
  created_at?: Date;
  updated_at?: Date;
}

export type TCreateTaskData = {
  name: string;
  description: string;
  duration: string;
  reward: number;
  status?: 'active' | 'inactive';
  created_by: string;
  updated_by: string;
}

export type TUpdateTaskData = {
  name?: string;
  description?: string;
  duration?: string;
  reward?: number;
  status?: 'active' | 'inactive';
  updated_by: string;
}

export type TTaskQueryParams = {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
  task_type?: 'mission' | 'question';
}

// Hunt related types
export type THunt = {
  id: string;
  task_id: string;
  claim_id: string;
  name: string;
  description: string;
  start_date?: Date;
  end_date?: Date;
  coordinates: string;
  duration?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TCreateHuntData = {
  task_id: string;
  claim_id: string;
  name: string;
  description: string;
  start_date?: Date;
  end_date?: Date;
  coordinates: string | { latitude: number; longitude: number };
  duration?: string;
}

export type TUpdateHuntData = {
  task_id?: string;
  claim_id?: string;
  name?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  coordinates?: string | { latitude: number; longitude: number };
  duration?: string;
}

export type THuntQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  task_id?: string;
  claim_id?: string;
}

// Claim related types
export type TClaim = {
  id: string;
  reward: number;
  claim_type: string;
  levels?: Array<{
    level: number;
    user_count: number;
    rewards: number;
  }>;
  coupen_code?: string;
  product_img?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TCreateClaimData = {
  reward: number;
  claim_type: string;
  levels?: Array<{
    level: number;
    user_count: number;
    rewards: number;
  }>;
  coupen_code?: string;
  product_img?: string;
}

export type TUpdateClaimData = {
  reward?: number;
  claim_type?: string;
  levels?: Array<{
    level: number;
    user_count: number;
    rewards: number;
  }>;
  coupen_code?: string;
  product_img?: string;
}

export type TClaimQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  claim_type?: string;
}

export type TAuthenticatedAdminRequest = Request & {
  admin?: TAdminJwtPayload;
}