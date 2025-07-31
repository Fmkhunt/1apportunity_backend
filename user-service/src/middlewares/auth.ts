import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { TAuthenticatedRequest, TUsers } from '@/types';
import { TAuthenticatedAdminRequest } from '@/types/admin';
import { AppError } from '@/utils/AppError';

/**
 * Authenticate JWT token middleware
 */
export const authenticateJWT = async (
  req: TAuthenticatedRequest,
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
    if(decoded.role !== 'user'){
      throw new AppError('Invalid user', 401);
    }
    // Check if user exists
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Add user to request
    req.user = user as TUsers;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

export const authenticateAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Import AdminAuthService dynamically to avoid circular dependency
    const { AdminAuthService } = await import('@/services/admin/adminAuth.service');

    // Verify admin token
    const decoded = AdminAuthService.verifyToken(token);

    if (decoded.tokenType !== 'accessToken') {
      throw new AppError('Invalid token type', 401);
    }
    if(decoded.role == 'user'){
      throw new AppError('Invalid admin', 401);
    }
    // Check if admin exists
    const admin = await AdminAuthService.getAdminById(decoded.adminId);
    if (!admin) {
      throw new AppError('Admin not found', 401);
    }
    // Add admin to request
    (req as TAuthenticatedAdminRequest).admin = admin;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Admin authentication failed', 401));
    }
  }
};

/**
 * Authorize by role middleware
 */
// export const authorizeRole = (roles: string | string[]) => {
//   return (req: TAuthenticatedRequest, res: Response, next: NextFunction): void => {
//     try {
//       if (!req.user) {
//         throw new AppError('Authentication required', 401);
//       }

//       const userRole = req.user.role || 'user';
//       const allowedRoles = Array.isArray(roles) ? roles : [roles];

//       if (!allowedRoles.includes(userRole)) {
//         throw new AppError('Insufficient permissions', 403);
//       }

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: TAuthenticatedRequest,
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
            req.user = user as unknown as TUsers;
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
  req: TAuthenticatedRequest,
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
    const decoded = AuthService.verifyToken(token, true);

    if (decoded.tokenType !== 'refreshToken') {
      throw new AppError('Invalid token type', 401);
    }

    // Check if user exists
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Add user to request
    req.user = user as TUsers;
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
 * Authnticate admin refresh token
 */
export const authenticateAdminRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Import AdminAuthService dynamically to avoid circular dependency
    const { AdminAuthService } = await import('@/services/admin/adminAuth.service');

    // Verify admin token
    const decoded = AdminAuthService.verifyToken(token, true);

    if (decoded.tokenType !== 'refreshToken') {
      throw new AppError('Invalid token type', 401);
    }

    // Check if admin exists
    const admin = await AdminAuthService.getAdminById(decoded.adminId);
    if (!admin) {
      throw new AppError('Admin not found', 401);
    }
    // Add admin to request
    (req as TAuthenticatedAdminRequest).admin = admin;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Admin authentication failed', 401));
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
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === 'pending') {
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
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === 'inactive') {
      throw new AppError('User account has been deactivated', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};