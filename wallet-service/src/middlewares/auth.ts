import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { authenticatedRequest, jwtPayload } from '@/types';
import { AppError } from '@/utils/AppError';

/**
 * Authenticate JWT token middleware
 */
export const authenticateJWT = async (
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = AuthService.verifyToken(token);

    if (decoded.tokenType !== 'accessToken') {
      throw new AppError('Invalid token type', 401);
    }

    // Check if user exists
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

/**
 * Authorize by role middleware
 */
export const authorizeRole = (roles: string | string[]) => {
  return (req: authenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const userRole = req.user.role || 'user';
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = AuthService.verifyToken(token);

        if (decoded.tokenType === 'accessToken') {
          const user = await AuthService.getUserById(decoded.userId);
          if (user) {
            req.user = decoded;
          }
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token middleware
 */
export const authenticateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = AuthService.verifyToken(refreshToken, true);

    if (decoded.tokenType !== 'refreshToken') {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if user exists
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Add user info to request for potential use
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Refresh token validation failed', 401));
    }
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This will be handled by express-rate-limit in the main app
  next();
};

/**
 * Check if user is confirmed middleware
 */
export const requireEmailConfirmation = async (
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_confirm === '0') {
      throw new AppError('Please confirm your email before accessing this resource', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is not deleted middleware
 */
export const requireActiveUser = async (
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.deleted_at) {
      throw new AppError('User account has been deactivated', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};