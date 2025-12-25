import { NextFunction, Response } from 'express';
import { S3Service } from '../services/s3.service';
import { TAuthenticatedRequest, TStorageType } from '../types';
import { AppError } from '../utils/AppError';
import { ResponseHandler } from '../utils/responseHandler';

export class StorageController {
  static async upload(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.body as { type: TStorageType };

      if (!req.file) {
        throw new AppError('File is required', 400);
      }

      const result = await S3Service.uploadObject(req.file, type);
      ResponseHandler.created(res, result, 'File uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: TAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.body as { key: string };

      await S3Service.deleteObject(key);
      ResponseHandler.success(res, { key }, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
