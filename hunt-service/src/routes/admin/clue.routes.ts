import { Router } from 'express';
import { AdminClueController } from '../../controllers/Admin/clue.controller';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { clueValidation } from '../../validations/clueValidation';
import { authenticateAdminToken } from '../../middlewares/auth';

const router = Router();

router.post('/',
  authenticateAdminToken,
  validateRequest(clueValidation.create), 
  AdminClueController.create
);

router.get('/', 
  authenticateAdminToken, 
  validateQuery(clueValidation.query), 
  AdminClueController.getAll
);

router.get('/:clueId', 
  authenticateAdminToken, 
  AdminClueController.getById
);

router.put('/:clueId', 
  authenticateAdminToken, 
  validateRequest(clueValidation.update), 
  AdminClueController.update
);

router.delete('/:clueId', 
  authenticateAdminToken, 
  AdminClueController.delete
);

router.get('/:clueId/tasks', 
  authenticateAdminToken, 
  AdminClueController.getClueTasks
);

router.put('/:clueId/tasks', 
  authenticateAdminToken, 
  validateRequest(clueValidation.updateTasks), 
  AdminClueController.updateClueTasks
);

export default router;
