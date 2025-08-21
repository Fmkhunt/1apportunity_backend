import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  authenticateRefreshToken,
} from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { authValidation } from '../validations/authValidation';

const router = Router();

// Public routes
router.post('/register', validateRequest(authValidation.register), AuthController.register);
router.post('/login', validateRequest(authValidation.login), AuthController.login);
router.post('/refresh-token', authenticateRefreshToken, AuthController.refreshToken);
router.post('/send-otp',validateRequest(authValidation.sendOtp), AuthController.sendOtp);

// // Protected routes
// router.get('/profile', authenticateJWT, requireActiveUser, UserController.getProfile);
// router.put('/profile', authenticateJWT, requireActiveUser, validateRequest(authValidation.updateProfile), UserController.updateProfile);
// router.post('/change-password', authenticateJWT, requireActiveUser, validateRequest(authValidation.changePassword), UserController.changePassword);
// router.post('/logout', authenticateJWT, UserController.logout);

// Admin routes (you might want to add role-based authorization)
// router.get('/user/:userId', authenticateJWT, UserController.getUserById);

export default router;