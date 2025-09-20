import { Router } from 'express';
import { ServiceLocationController } from '../../controllers/admin/serviceLocation.controller';
import { authenticateAdminToken } from '../../middlewares/auth';
import { validateRequest, validateQuery } from '../../middlewares/validation';
import { serviceLocationValidation } from '../../validations/serviceLocationValidation';

const router = Router();

// Service Location routes
router.post('/', 
  authenticateAdminToken, 
  validateRequest(serviceLocationValidation.create), 
  ServiceLocationController.createServiceLocation
);

router.get('/', 
  authenticateAdminToken, 
  validateQuery(serviceLocationValidation.query), 
  ServiceLocationController.getAllServiceLocations
);

router.get('/:id', 
  authenticateAdminToken, 
  ServiceLocationController.getServiceLocationById
);

router.put('/:id', 
  authenticateAdminToken, 
  validateRequest(serviceLocationValidation.update), 
  ServiceLocationController.updateServiceLocation
);

router.delete('/:id', 
  authenticateAdminToken, 
  ServiceLocationController.deleteServiceLocation
);

export default router;