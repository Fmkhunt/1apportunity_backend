import { Router } from 'express';
import { ClueController } from '../controllers/clue.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { clueValidation } from '../validations/clueValidation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
// Create a new hunt
router.get('/:taskId/list', authenticateJWT, ClueController.getClueList);
router.get('/:taskId/clue/:clueId', authenticateJWT, ClueController.getClueById);


export default router;