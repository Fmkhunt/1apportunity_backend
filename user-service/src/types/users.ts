import { Request } from 'express';

export interface IUserMaster {
  id: string;
  email: string;
  password?: string;
  name: string;
  profile?: string;
  device_id?: string;
  device_token?: string;
  device_type?: string;
  is_fb?: number;
  fb_id?: string;
  is_google?: number;
  google_id?: string;
  is_apple?: number;
  apple_id?: string;
  is_confirm?: string;
  deleted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}
