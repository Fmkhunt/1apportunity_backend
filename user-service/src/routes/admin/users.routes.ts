import { Router } from 'express';
import { AdminUserController } from '@/controllers/admin/user.controller';
import {
    authenticateAdminToken,
  requireActiveUser,
} from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validation';
import { authValidation } from '@/validations/authValidation';

const router = Router();
router.get('/list', authenticateAdminToken, AdminUserController.getAllUsers);

export default router;