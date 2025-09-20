import { Response } from 'express';
import { TApiResponse } from '../types';
import { send } from 'process';

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T = any>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: TApiResponse<T> = {
      data,
      message,
      success: true,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Error occurred',
    statusCode: number = 500,
    data: any = null
  ): Response {
    const response: TApiResponse<any> = {
      data,
      message,
      success: false,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    errors: any = null
  ): Response {
    return this.error(res, message, 400, errors);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad Request',
    data: any = null
  ): Response {
    return this.error(res, message, 400, data);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    return this.error(res, message, 403);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response {
    return this.error(res, message, 409);
  }

  /**
   * Send created response
   */
  static created<T = any>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}