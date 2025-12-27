import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { taskValidation } from '../validations/taskValidation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
// Create a new hunt
router.get('/list/:huntId', authenticateJWT, TaskController.getTaskList);
router.post('/complete', authenticateJWT, validateRequest(taskValidation.completeTask), TaskController.completeTask);
router.post('/complete-mission', authenticateJWT, validateRequest(taskValidation.completeMissionTask), TaskController.completeMissionTask);
router.post('/complete-qr-code-mission', authenticateJWT, validateRequest(taskValidation.completeQRCodeMissionTask), TaskController.completeQRCodeMissionTask);
router.get('/latest-completed-task', authenticateJWT, TaskController.getLatestCompletedTask);
router.get('/:taskId', authenticateJWT, TaskController.getTask);

export default router;