import { Router } from 'express';
import { TaskController } from '@/controllers/task.controller';
import { validateRequest, validateQuery } from '@/middlewares/validation';
import { taskValidation } from '@/validations/taskValidation';

const router = Router();

// Create a new task
router.post(
  '/',
  validateRequest(taskValidation.create),
  TaskController.create
);

// Get all tasks with pagination and filtering
router.get(
  '/',
  validateQuery(taskValidation.query),
  TaskController.getAll
);

// Get active tasks only
router.get(
  '/active',
  TaskController.getActiveTasks
);

// Get task by ID
router.get(
  '/:taskId',
  TaskController.getById
);

// Update task by ID
router.put(
  '/:taskId',
  validateRequest(taskValidation.update),
  TaskController.update
);

// Toggle task status
router.patch(
  '/:taskId/toggle-status',
  TaskController.toggleStatus
);

// Delete task by ID
router.delete(
  '/:taskId',
  TaskController.delete
);

export default router;