import { Router } from 'express';
import { ZoneManagerController } from '@/controllers/admin/zoneManager.controller';
import { validateQuery, validateRequest } from '@/middlewares/validation';
import { zoneManagerValidation } from '@/validations/zoneManagerValidation';
import { authenticateAdminToken } from '@/middlewares/auth';

const router = Router();

// Create zone manager
router.post('/create', validateRequest(zoneManagerValidation.zoneManagerCreate), authenticateAdminToken, ZoneManagerController.create);
router.get('/list', validateQuery(zoneManagerValidation.listValidation), authenticateAdminToken, ZoneManagerController.getAll);
router.get('/:id', authenticateAdminToken, ZoneManagerController.getById);
router.put('/:id', validateRequest(zoneManagerValidation.zoneManagerUpdate), authenticateAdminToken, ZoneManagerController.update);
router.delete('/:id', authenticateAdminToken, ZoneManagerController.delete);

export default router;