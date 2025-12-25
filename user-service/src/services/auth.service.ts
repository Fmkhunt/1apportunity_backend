import jwt from 'jsonwebtoken';
import { ServiceLocationTable, UsersTable, otpTable } from '../models/schema';
import { db } from '../config/database';
import { eq, and, isNotNull, lt, gt } from 'drizzle-orm';
import { UserModel } from '../models/Users';
import { authConfig } from '../config/auth';
import {
  TTokenResponse,
  TJwtPayload,
  TUsers,
  TRegistrationData,
  TLoginData,
} from '../types';
import { AppError } from '../utils/AppError';
import { generateRandomString } from '../utils/Helper';
import { ReffralModel } from '../models/Reffral';

export class AuthService {
  /**
   * Generate JWT tokens
   */
  private static generateTokens(userId: string ): TTokenResponse {
    const accessTokenPayload = { userId, role:"user", tokenType: 'accessToken' as const };
    const refreshTokenPayload = { userId, role:"user", tokenType: 'refreshToken' as const };
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
   * Register user
   */
  static async register(userData: TRegistrationData): Promise<any> {
    try {
      const { email, phone, otp, name, referral_by, device_token, ccode, country } = userData;
      const otpData = await db.query.otpTable.findFirst({where:and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode), gt(otpTable.expires_at, new Date()))});
      if (!otpData || otpData.otp !== otp) {
        throw new AppError('Invalid OTP', 500);
      }
      await db.delete(otpTable).where(and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode)));

      const user = await db.query.UsersTable.findFirst({where:and(eq(UsersTable.phone, phone), eq(UsersTable.ccode, ccode))});
      if (user) {
        throw new AppError('User already exists', 500);
      }
      let referralUser = null;
      if(referral_by){
        referralUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.referral_code, referral_by),
        });
        if (!referralUser) {
          throw new AppError('Referral code is invalid', 500);
        }
      }
      const referral_code = await this.generateReferralCode();
      const serviceLocation = await db.query.ServiceLocationTable.findFirst({where:eq(ServiceLocationTable.country, country)});
      if (!serviceLocation) {
        throw new AppError('Service location not found', 500);
      }
      const newUser = await UserModel.create({
        email,
        phone,
        name,
        referral_by,
        referral_code,
        ccode,
        country,
        service_location_id: serviceLocation.id,
        status: 'active',
        token: 0,
      })
      if(referralUser){
        await ReffralModel.create({
          refer_by: referralUser.id,
          referred: newUser.id,
          coin: Number(process.env.REFERRAL_COIN) || 0,
        });
      }
      await db.delete(otpTable).where(and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode)));
      return {user: newUser, token: this.generateTokens(newUser.id)};
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, error.statusCode);
    }
  }

  /**
   * Login user
   */
  static async login(userData: TLoginData): Promise<any> {
    try {
      const { phone, otp, ccode } = userData;
      const otpData = await db.query.otpTable.findFirst({where:and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode), eq(otpTable.otp, otp),isNotNull(otpTable.user_id), gt(otpTable.expires_at, new Date()))});
      if (!otpData) {
        throw new AppError('Invalid OTP', 500);
      }
      const user = await db.query.UsersTable.findFirst({where:eq(UsersTable.id, otpData.user_id)});
      if (!user) {
        throw new AppError('User not found', 404);
      }
      await db.delete(otpTable).where(and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode)));
      return {user: user, token: this.generateTokens(user.id)};
    } catch (error) {
      console.error(error);
      throw new AppError(error.message, error.statusCode);
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string, isRefreshToken = false): TJwtPayload {
    try {
      const secret = isRefreshToken ? authConfig.jwt.refreshSecret : authConfig.jwt.secret;
      return jwt.verify(token, secret) as TJwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  static async sendOtp(phone: string, ccode: string, type: 'register' | 'login'): Promise<any> {
    try {
      const user = await db.query.UsersTable.findFirst({where:and(eq(UsersTable.phone, phone), eq(UsersTable.ccode, ccode))});
      if (type === 'register') {
        if (user) {
          throw new AppError('User already exists', 400);
        }
      }else{
        if (!user) {
          throw new AppError('User not found', 404);
        }
      }
      await db.delete(otpTable).where(and(eq(otpTable.phone, phone), eq(otpTable.ccode, ccode)));
      // const code: number = Math.floor(100000 + Math.random() * 900000);
      const code: number=1234;

      const newOtp = await db.insert(otpTable).values({
        phone: phone,
        user_id: user?.id || null,
        otp: code,
        ccode: ccode,
        expires_at: new Date(Date.now() + 1000 * 60 * 5),
      });

      // send otp to user
      return {
        data: {},
        message: 'OTP sent successfully',
        success: true,
      };

    } catch (error) {
      console.error(error);
      throw new AppError(error.message, error.statusCode);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(user: TUsers): Promise<TTokenResponse> {
    try {

      // Generate new tokens

      const tokens = this.generateTokens(user.id);

      return tokens;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) throw error;
      throw new AppError('Token refresh failed', 500);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<TUsers | null> {
    try {
      const user = await db.query.UsersTable.findFirst({where:eq(UsersTable.id, userId)});
      return user as TUsers | null;
    } catch (error) {
      return null;
    }
  }

  // /**
  //  * Update user profile
  //  */
  // static async updateProfile(userId: string, updateData: Partial<TUsers>): Promise<TApiResponse> {
  //   try {
  //     const user = await UserModel.updateById(userId, updateData);
  //     if (!user) {
  //       throw new AppError('User not found', 404);
  //     }

  //     return {
  //       data: {
  //         user: user.toJSON(),
  //       },
  //       status: 1,
  //       message: 'Profile updated successfully',
  //       success: true,
  //     };
  //   } catch (error) {
  //     if (error instanceof AppError) throw error;
  //     throw new AppError('Profile update failed', 500);
  //   }
  // }


  private static async generateReferralCode(count: number = 0): Promise<string> {

    const referralCode = 'TH' + generateRandomString(count > 5 ? 8 : 6).toUpperCase();
    const user = await db.query.UsersTable.findFirst({where:eq(UsersTable.referral_code, referralCode)});
    if (user) {
      return this.generateReferralCode(count + 1);
    }
    return referralCode;
  }

}