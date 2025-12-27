import { Router } from 'express';
import Joi from 'joi';
import { AdminWithdrawalController } from '../../controllers/admin/withdrawal.controller';
import { authenticateAdminToken } from '../../middlewares/auth';
import { validateRequest, validateQuery, validateParams } from '../../middlewares/validation';
import { withdrawalValidation } from '../../validations/withdrawal.validation';

const router = Router();

// Get all pending withdrawals (paginated)
router.get(
  '/pending',
  authenticateAdminToken,
  validateQuery(withdrawalValidation.pagination),
  AdminWithdrawalController.getPendingWithdrawals
);

// Approve withdrawal
router.post(
  '/:id/approve',
  authenticateAdminToken,
  validateParams(Joi.object({ id: Joi.string().uuid().required() })),
  AdminWithdrawalController.approveWithdrawal
);

// Reject withdrawal
router.post(
  '/:id/reject',
  authenticateAdminToken,
  validateParams(Joi.object({ id: Joi.string().uuid().required() })),
  validateRequest(withdrawalValidation.reject),
  AdminWithdrawalController.rejectWithdrawal
);

export default router;
