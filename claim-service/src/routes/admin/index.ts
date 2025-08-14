import { Router } from 'express';
import claimRoutes from './claim.routes';

const router = Router();

// Admin authentication routes
router.use('/claim', claimRoutes);

export default router;
