import { Router } from 'express';
import multer from 'multer';
import { StorageController } from '../controllers/storage.controller';
import { authenticateJWT } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { storageValidation } from '../validations/storage.validation';

const router = Router();
const maxFileSizeMb = Number(process.env.AWS_S3_MAX_FILE_SIZE_MB || '25');
const resolvedMaxFileSize = Number.isFinite(maxFileSizeMb) ? maxFileSizeMb : 25;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: resolvedMaxFileSize * 1024 * 1024, // MB to bytes
  },
});

router.post(
  '/upload',
  authenticateJWT,
  upload.single('file'),
  validateRequest(storageValidation.upload),
  StorageController.upload
);

router.delete('/', authenticateJWT, validateRequest(storageValidation.remove), StorageController.remove);

export default router;
