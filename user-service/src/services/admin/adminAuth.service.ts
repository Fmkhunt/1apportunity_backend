import jwt from 'jsonwebtoken';
import { AdminModel } from '../../models/Admin';
import { TAdmin, TAdminJwtPayload, TAdminLoginData, TAdminTokenResponse } from '../../types/admin';
import { authConfig } from '../../config/auth';
import { AppError } from '../../utils/AppError';

export class AdminAuthService {
  /**
   * Generate JWT tokens for admin
   */
  private static generateTokens(admin: TAdmin): TAdminTokenResponse {
    const accessTokenPayload: TAdminJwtPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      tokenType: 'accessToken'
    };

    const refreshTokenPayload: TAdminJwtPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      tokenType: 'refreshToken'
    };

    const accessToken = (jwt.sign as any)(
      accessTokenPayload,
      authConfig.jwt.secret,
      {
        expiresIn: authConfig.jwt.expiresIn,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }
    );

    const refreshToken = (jwt.sign as any)(
      refreshTokenPayload,
      authConfig.jwt.refreshSecret,
      {
        expiresIn: authConfig.jwt.refreshExpiresIn,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Admin login
   */
  static async login(loginData: TAdminLoginData): Promise<any> {
    try {
      const { email, password } = loginData;

      // Find admin by email
      const admin = await AdminModel.findByEmail(email);
      if (!admin) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isPasswordValid = await AdminModel.verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate tokens
      const token = this.generateTokens(admin);

      // Return admin data without password
      const { password: _, ...adminWithoutPassword } = admin;

      return {
        admin: adminWithoutPassword,
        token
      };
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Verify admin JWT token
   */
  static verifyToken(token: string, isRefreshToken = false): TAdminJwtPayload {
    try {
      const secret = isRefreshToken ? authConfig.jwt.refreshSecret : authConfig.jwt.secret;
      const decoded = jwt.verify(token, secret) as TAdminJwtPayload;

      // Verify token type
      if (isRefreshToken && decoded.tokenType !== 'refreshToken') {
        throw new AppError('Invalid token type', 401);
      }

      if (!isRefreshToken && decoded.tokenType !== 'accessToken') {
        throw new AppError('Invalid token type', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  /**
   * Refresh admin access token
   */
  static async refreshToken(admin: TAdmin): Promise<TAdminTokenResponse> {
    try {

      // Generate new tokens
      const tokens = this.generateTokens(admin);

      return tokens;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Token refresh failed', 500);
    }
  }

  /**
   * Get admin by ID
   */
  static async getAdminById(adminId: string): Promise<TAdmin | null> {
    try {
      console.log("adminId", adminId);
      const admin = await AdminModel.findById(adminId);
      return admin;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create new admin (for super admin use)
   */
  static async createAdmin(adminData: any): Promise<TAdmin> {
    try {
      // Check if admin with email already exists
      const existingAdmin = await AdminModel.findByEmail(adminData.email);
      if (existingAdmin) {
        throw new AppError('Admin with this email already exists', 400);
      }

      const admin = await AdminModel.create(adminData);
      return admin;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create admin', 500);
    }
  }
}