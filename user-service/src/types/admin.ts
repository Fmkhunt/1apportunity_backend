import { Request } from "express";
import { TUsers } from ".";

export type TAdminRequest = Request & {
  user?: TUsers;
}
export type TAdmin = {
  id: string;
  email: string;
  password: string;
  role: string;
  zone_id?: string;
  permissions?: string[];
  created_at: Date;
  updated_at: Date;
}

export type TAdminCreate = {
  email: string;
  password: string;
  role?: string;
  zone_id?: string;
  permissions?: string[];
}

export type TAdminUpdate = {
  email?: string;
  password?: string;
  role?: string;
  zone_id?: string;
  permissions?: string[];
}

export type TAdminLoginData = {
  email: string;
  password: string;
}

export type TAdminTokenResponse = {
  accessToken: string;
  refreshToken: string;
}

export type TAdminJwtPayload = {
  adminId: string;
  email: string;
  role: string;
  tokenType: 'accessToken' | 'refreshToken';
  iat?: number;
  exp?: number;
}

export type TAuthenticatedAdminRequest = Request & {
  admin?: TAdmin;
}