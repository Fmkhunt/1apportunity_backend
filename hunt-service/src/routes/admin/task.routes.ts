import { Router } from 'express';
import { TaskController } from '../../controllers/Admin/task.controller';
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

// Get completed tasks history
router.get('/completed-tasks-history', authenticateAdminToken, validateQuery(taskValidation.completedTasksHistory), TaskController.getCompletedTasksHistory);

router.patch('/update-completed-task-status', authenticateAdminToken, validateRequest(taskValidation.updateCompletedTaskStatus), TaskController.updateCompletedTaskStatus);

// Get task by ID
router.get( '/:taskId', authenticateAdminToken, TaskController.getById );

// Update task by ID
router.put('/:taskId', authenticateAdminToken, validateRequest(taskValidation.update), TaskController.update);

// Toggle task status
router.patch( '/:taskId/toggle-status', authenticateAdminToken, TaskController.toggleStatus );

// Delete task by ID
router.delete( '/:taskId', authenticateAdminToken, TaskController.delete);

// Add clues to task
router.post('/:taskId/clues', authenticateAdminToken, TaskController.addCluesToTask);

// Remove clues from task
router.delete('/:taskId/clues', authenticateAdminToken, TaskController.removeCluesFromTask);

// Get clues for a specific task
router.get('/:taskId/clues', authenticateAdminToken, TaskController.getTaskClues);


export default router;