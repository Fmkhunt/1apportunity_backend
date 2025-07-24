import { Router } from 'express';
import { AdminAuthController } from '@/controllers/admin/auth.controller';
import { authenticateAdminRefreshToken, authenticateAdminToken } from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validation';
import { authValidation } from '@/validations/adminValidation';

const router = Router();

// Public routes (no authentication required)
router.post('/login', validateRequest(authValidation.login), AdminAuthController.login);
router.post('/refresh-token', authenticateAdminRefreshToken, AdminAuthController.refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateAdminToken, AdminAuthController.getProfile);
router.post('/logout', authenticateAdminToken, AdminAuthController.logout);

export default router;