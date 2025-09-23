import { Router } from 'express';
import { HuntController } from '../../controllers/Admin/hunt.controller';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { huntValidation } from '../../validations/huntValidation';
import { authenticateAdminToken } from '../../middlewares/auth';

const router = Router();

// Create a new hunt
router.post('/', authenticateAdminToken, validateRequest(huntValidation.create), HuntController.create);

// Get all hunts with pagination and filtering
router.get('/', authenticateAdminToken, validateQuery(huntValidation.query), HuntController.getAll);

// Get hunt by ID
router.get('/:huntId', authenticateAdminToken, HuntController.getById);

// Update hunt by ID
router.put('/:huntId', authenticateAdminToken, validateRequest(huntValidation.update), HuntController.update);

// Delete hunt by ID
router.delete('/:huntId', authenticateAdminToken, HuntController.delete);

// Get hunts by task ID
router.get('/task/:taskId', authenticateAdminToken, HuntController.getByTaskId);

// Get hunts by claim ID
// router.get('/claim/:claimId', authenticateAdminToken, HuntController.getByClaimId);

export default router;