import { Router } from 'express';
import taskRoutes from './task.routes';
import huntRoutes from './hunt.routes';
import clueRoutes from './clue.routes';

const router = Router();

// Admin routes
router.use('/task', taskRoutes);
router.use('/hunt', huntRoutes);
router.use('/clue', clueRoutes);

export default router;
