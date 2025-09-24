import 'module-alias/register';
import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { setupRoutes } from './routes';
import { authConfig } from './config/auth';
import { AppError } from './utils/AppError';
import { ResponseHandler } from './utils/responseHandler';

// Global variables
declare global {
  var basedir: string;
  var APP_NAME: string;
  var APP_URL: string;
}

global.basedir = __dirname;
global.APP_NAME = process.env.APP_NAME || 'TechMultiverse';
global.APP_URL = process.env.APP_URL || 'http://localhost:3001';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const corsOptions = {
      origin: [process.env.APP_URL, process.env.FRONTEND_URL],
      credentials: true,
      optionsSuccessStatus: 200,
    };
    this.app.use(cors(corsOptions));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit(authConfig.rateLimit);
    this.app.use(limiter);

    // Auth-specific rate limiting
    const authLimiter = rateLimit(authConfig.authRateLimit);
    this.app.use('/api/auth', authLimiter);

    // Static files
    this.app.use('/public', express.static(`${__dirname}/../public`));

    // Request logging (in development)
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    setupRoutes(this.app);
  }

  private initializeErrorHandling(): void {
    // Handle 404 errors
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const error = new AppError(`Route ${req.originalUrl} not found`, 404);
      next(error);
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', error);

      if (error instanceof AppError) {
        return ResponseHandler.error(res, error.message, error.statusCode);
      }

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationError = error as any;
        const errors = Object.values(validationError.errors).map((err: any) => ({
          field: err.path,
          message: err.message,
        }));
        return ResponseHandler.validationError(res, 'Validation failed', errors);
      }

      // Handle Mongoose duplicate key errors
      if (error.name === 'MongoError' && (error as any).code === 11000) {
        return ResponseHandler.conflict(res, 'Duplicate field value');
      }

      // Handle JWT errors
      if (error.name === 'JsonWebTokenError') {
        return ResponseHandler.unauthorized(res, 'Invalid token');
      }

      if (error.name === 'TokenExpiredError') {
        return ResponseHandler.unauthorized(res, 'Token expired');
      }

      // Handle other errors
      const isDevelopment = process.env.NODE_ENV === 'development';
      const message = isDevelopment ? error.message : 'Internal server error';
      const statusCode = isDevelopment ? 500 : 500;

      return ResponseHandler.error(res, message, statusCode);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      const PORT = process.env.PORT || 3000;
      this.app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 App URL: ${global.APP_URL}`);
        console.log(`📊 Health check: ${global.APP_URL}/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();
app.start().catch((error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});

export default app;