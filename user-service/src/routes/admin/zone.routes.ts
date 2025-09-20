import { Router } from 'express';
import { ZoneController } from '../../controllers/admin/zone.controller';
import { authenticateAdminToken } from '../../middlewares/auth';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { zoneValidation } from '../../validations/zoneValidation';

const router = Router();

// Zone routes
router.post('/', 
  authenticateAdminToken, 
  validateRequest(zoneValidation.create), 
  ZoneController.createZone
);

router.get('/', 
  authenticateAdminToken, 
  validateQuery(zoneValidation.query), 
  ZoneController.getAllZones
);

router.get('/:id', 
  authenticateAdminToken, 
  ZoneController.getZoneById
);

router.get('/service-location/:serviceLocationId', 
  authenticateAdminToken, 
  ZoneController.getZonesByServiceLocationId
);

router.put('/:id', 
  authenticateAdminToken, 
  validateRequest(zoneValidation.update), 
  ZoneController.updateZone
);

router.delete('/:id', 
  authenticateAdminToken, 
  ZoneController.deleteZone
);

export default router;