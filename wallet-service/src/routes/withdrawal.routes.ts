import { Router } from 'express';
import Joi from 'joi';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { authenticateJWT } from '../middlewares/auth';
import { validateRequest, validateQuery, validateParams } from '../middlewares/validation';
import { withdrawalValidation } from '../validations/withdrawal.validation';

const router = Router();

// Create withdrawal request
router.post(
  '/request',
  authenticateJWT,
  validateRequest(withdrawalValidation.createRequest),
  WithdrawalController.createWithdrawalRequest
);

// Get user's withdrawal history (paginated)
router.get(
  '/',
  authenticateJWT,
  validateQuery(withdrawalValidation.pagination),
  WithdrawalController.getUserWithdrawals
);

// Get withdrawal by ID
router.get(
  '/:id',
  authenticateJWT,
  validateParams(Joi.object({ id: Joi.string().uuid().required() })),
  WithdrawalController.getWithdrawalById
);

export default router;
