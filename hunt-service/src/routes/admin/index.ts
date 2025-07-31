import { Router } from 'express';
import taskRoutes from './task.routes';
const router = Router();

// Admin authentication routes
router.use('/task', taskRoutes);


export default router;
