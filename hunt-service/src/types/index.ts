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
  type: 'mission' | 'question' | 'qr_code';
  claim_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
  clue_ids?: string[];
}

export type TCreateTaskData = {
  name: string;
  description: string;
  duration: string;
  reward: number;
  status?: 'active' | 'inactive';
  type?: 'mission' | 'question' | 'qr_code';
  claim_id?: string;
  created_by: string;
  updated_by: string;
  clue_ids?: string[];
  questions?: {
    question: string;
    answer: string;
    question_type?: 'text' | 'mcq';
    options?: { option: string; text: string }[];
  }[];
}

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
  type?: 'mission' | 'question' | 'qr_code';
}

// Clue related types
export type TClue = {
  id: string;
  title: string;
  description: string;
  token?: number;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  task_ids?: string[];
};

export type TCreateClueData = {
  title: string;
  description: string;
  token?: number;
  created_by: string;
  task_ids?: string[];
};

export type TUpdateClueData = {
  title?: string;
  description?: string;
  task_ids?: string[];
};

export type TClueQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

// Hunt related types
export type THunt = {
  id: string;
  name: string;
  description: string;
  start_date?: Date;
  end_date?: Date;
  coordinates: string;
  coordinates_obj?: { latitude: number; longitude: number } | null;
  duration?: string;
  max_users?: number;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  task_ids?: string[];
}

export type TCreateHuntData = {
  zone_id: string;
  name: string;
  description: string;
  start_date?: Date;
  end_date?: Date;
  radius?: number;
  coordinates: string | { latitude: number; longitude: number };
  duration?: string;
  max_users?: number;
  created_by: string;
  task_ids?: string[];
}
export type TCreateClue = {
  name: string;
  description: string;
}

export type TUpdateHuntData = {
  name?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  radius?: number;
  coordinates?: string | { latitude: number; longitude: number };
  duration?: string;
  task_ids?: string[];
}

export type THuntQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  task_id?: string;
  zone_id?: string;
}
export type TgetHuntUserQueryParams = {
  latitude?: number;
  longitude?: number;
}
export type THuntClaim = {
  id: string;
  user_id: string;
  hunt_id: string;
  status: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  expire_at?: Date;
  completed_at?: Date;
}
export type THuntWithClaim = THunt & {
  claim?: THuntClaim | null;
};

export type TAuthenticatedAdminRequest = Request & {
  admin?: TAdminJwtPayload;
}

export type THuntClaimStatus = 'search' | 'claimed' | 'started' | 'arrived' | 'completed';

export type TCreateQuestionData = {
  question: string;
  task_id: string;
  answer: string;
  question_type?: 'text' | 'mcq';
  options?: { option: string; text: string }[];
  created_by?: string;
}

export type TQuestion = {
  id: string;
  question: string;
  task_id: string;
  answer: string;
  question_type: 'text' | 'mcq';
  options?: { option: string; text: string }[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export type THuntRequestHistory = {
  id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}
export type TCompleteTaskStatus = 'pending' | 'completed' | 'rejected' | 'failed';

export type TCompleteTask = {
  id: string;
  hunt_id: string;
  task_id: string;
  user_id: string;
  status: TCompleteTaskStatus;
  asset_urls: string[];
  rank: number | null;
  reward: number;
  claim_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
export type TCompleteTaskHistory = {
  id: string;
  hunt_id: string;
  task_id: string;
  user_id: string;
  status: TCompleteTaskStatus;
  asset_urls: string[];
}