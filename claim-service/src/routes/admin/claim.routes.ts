import { Router } from 'express';
import { ClaimController } from '../../controllers/claim.controller';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { claimValidation } from '../../validations/claimValidation';
import { authenticateAdminToken } from '../../middlewares/auth';

const router = Router();

// Create a new claim
router.post('/', authenticateAdminToken, validateRequest(claimValidation.create), ClaimController.create);

// Get all claims with pagination and filtering
router.get('/', authenticateAdminToken, validateQuery(claimValidation.query), ClaimController.getAll);

// Get claims by type
router.get('/type/:claimType', authenticateAdminToken, ClaimController.getByType);

// Get claim by ID
router.get('/:claimId', authenticateAdminToken, ClaimController.getById);

// Update claim by ID
router.put('/:claimId', authenticateAdminToken, validateRequest(claimValidation.update), ClaimController.update);

// Delete claim by ID
router.delete('/:claimId', authenticateAdminToken, ClaimController.delete);

export default router;