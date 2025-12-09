import { Router } from 'express';
import { AdminReferralController } from '../../controllers/admin/referral.controller';
import { authenticateAdminToken } from '../../middlewares/auth';

const router = Router();

router.get('/tree', authenticateAdminToken, AdminReferralController.getReferralTree);

export default router;
