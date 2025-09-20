import { Router } from 'express';
import userRoutes from './users.routes';
import authRoutes from './auth.routes';
import zoneManagerRoutes from './zoneManager.routes';
import serviceLocationRoutes from './serviceLocation.routes';
import zoneRoutes from './zone.routes';

const router = Router();

// Admin authentication routes
router.use('/auth', authRoutes);

// Admin user management routes
router.use('/users', userRoutes);

// Zone manager routes
router.use('/zonemanager', zoneManagerRoutes);

// Service location routes
router.use('/service-locations', serviceLocationRoutes);

// Zone routes
router.use('/zones', zoneRoutes);

export default router;
