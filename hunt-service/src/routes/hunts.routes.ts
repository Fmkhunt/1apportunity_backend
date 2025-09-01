import { Router } from 'express';
import { HuntController } from '../controllers/hunt.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { huntValidation } from '../validations/huntValidation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
// Create a new hunt
router.get('/', authenticateJWT,validateQuery(huntValidation.getHuntForUser), HuntController.getHunt);
router.post('/updateStatus/:huntId', authenticateJWT,validateRequest(huntValidation.updateStatus), HuntController.updateStatus);
router.post('/completeHunt', authenticateJWT,validateRequest(huntValidation.completeHuntClaim), HuntController.completeHuntClaim);


export default router;