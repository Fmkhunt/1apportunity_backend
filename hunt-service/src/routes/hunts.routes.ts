import { Router } from 'express';
import { HuntController } from '../controllers/hunt.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { huntValidation } from '../validations/huntValidation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Create a new hunt
router.get('/', authenticateJWT, HuntController.getAll);

// Get all hunts with pagination and filtering
router.get('/', authenticateJWT, validateQuery(huntValidation.query), HuntController.getAll);


export default router;