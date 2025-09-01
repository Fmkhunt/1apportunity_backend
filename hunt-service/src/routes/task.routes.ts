import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { taskValidation } from '../validations/taskValidation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
// Create a new hunt
router.get('/:taskId', authenticateJWT, TaskController.getTask);


export default router;