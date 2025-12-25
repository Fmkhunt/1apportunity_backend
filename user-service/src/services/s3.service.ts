import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createId } from '@paralleldrive/cuid2';
import path from 'path';
import { AWS_S3_BUCKET, getS3PublicUrl, s3Client } from '../config/aws';
import { AppError } from '../utils/AppError';
import { TStorageType } from '../types';

export class S3Service {
  private static getExtension(file: Express.Multer.File): string {
    const extFromName = path.extname(file.originalname || '');
    if (extFromName) return extFromName;

    const mimeParts = (file.mimetype || '').split('/');
    return mimeParts[1] ? `.${mimeParts[1]}` : '';
  }

  private static buildKey(type: TStorageType, file: Express.Multer.File): string {
    const extension = this.getExtension(file);
    return `${type}/${createId()}${extension}`;
  }

  static async uploadObject(file: Express.Multer.File, type: TStorageType): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new AppError('File is required', 400);
    }

    const key = this.buildKey(type, file);

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        })
      );

      return {
        key,
        url: getS3PublicUrl(key),
      };
    } catch (error) {
      throw new AppError('Failed to upload file to storage', 500);
    }
  }

  static async deleteObject(key: string): Promise<void> {
    if (!key) {
      throw new AppError('File key is required', 400);
    }

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: key,
        })
      );
    } catch (error) {
      throw new AppError('Failed to delete file from storage', 500);
    }
  }
}
