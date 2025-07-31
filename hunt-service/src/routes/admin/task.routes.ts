import { Router } from 'express';
import { TaskController } from '../../controllers/task.controller';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { taskValidation } from '../../validations/taskValidation';
import { authenticateAdminToken } from '@/middlewares/auth';

const router = Router();

// Create a new task
router.post('/', authenticateAdminToken, validateRequest(taskValidation.create),  TaskController.create );

// Get all tasks with pagination and filtering
router.get('/', authenticateAdminToken, validateQuery(taskValidation.query), TaskController.getAll );

// Get active tasks only
router.get('/active',authenticateAdminToken,TaskController.getActiveTasks);

// Get task by ID
router.get( '/:taskId', authenticateAdminToken, TaskController.getById );

// Update task by ID
router.put('/:taskId', authenticateAdminToken, validateRequest(taskValidation.update), TaskController.update);

// Toggle task status
router.patch( '/:taskId/toggle-status', authenticateAdminToken, TaskController.toggleStatus );

// Delete task by ID
router.delete( '/:taskId', authenticateAdminToken, TaskController.delete);

export default router;