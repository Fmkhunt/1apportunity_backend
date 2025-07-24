import { Request, Response, NextFunction } from 'express';
import { TAuthenticatedRequest, TJwtPayload, TUsers } from '@/types';
import { AppError } from '@/utils/AppError';
import { TokenService } from '@/services/token.service';

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
    const decoded = TokenService.verifyToken(token);

    if (decoded.tokenType !== 'accessToken') {
      throw new AppError('Invalid token type', 401);
    }

    // Check if user exists
    // const user = await TokenService.getUserById(decoded.userId);
    // if (!user) {
    //   throw new AppError('User not found', 401);
    // }

    // Add user to request
    req.user = decoded as TJwtPayload;
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
/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This will be handled by express-rate-limit in the main app
  next();
};