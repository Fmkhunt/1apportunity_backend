import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
    authenticateJWT,
  requireActiveUser,
} from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { authValidation } from '../validations/authValidation';

const router = Router();

router.get('/profile', authenticateJWT, requireActiveUser, UserController.getProfile);

export default router;