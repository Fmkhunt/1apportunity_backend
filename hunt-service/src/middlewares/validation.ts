import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationError } from '../utils/AppError';
import { ResponseHandler } from '../utils/responseHandler';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        throw new ValidationError('Invalid parameters', validationErrors);
      }

      // Replace req.body with validated data
      req.body = value;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHandler.validationError(res, error.message, error.validationErrors);
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        throw new ValidationError('Invalid parameters', validationErrors);
      }

      // Replace req.params with validated data
      req.params = value;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHandler.validationError(res, error.message, error.validationErrors);
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        throw new ValidationError('Invalid query parameters', validationErrors);
      }

      // Replace req.query with validated data
      req.query = value;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHandler.validationError(res, error.message, error.validationErrors);
      } else {
        next(error);
      }
    }
  };
};