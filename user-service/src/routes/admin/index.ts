import { Router } from 'express';
import userRoutes from '@/routes/admin/users.routes';
import authRoutes from '@/routes/admin/auth.routes';
import zoneManagerRoutes from '@/routes/admin/zoneManager.routes';

const router = Router();

// Admin authentication routes
router.use('/auth', authRoutes);

// Admin user management routes
router.use('/users', userRoutes);

// Zone manager routes
router.use('/zonemanager', zoneManagerRoutes);

export default router;
