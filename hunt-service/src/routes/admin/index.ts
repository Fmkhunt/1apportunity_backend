import { Router } from 'express';
import taskRoutes from './task.routes';
import huntRoutes from './hunt.routes';

const router = Router();

// Admin authentication routes
router.use('/task', taskRoutes);
router.use('/hunt', huntRoutes);

export default router;
