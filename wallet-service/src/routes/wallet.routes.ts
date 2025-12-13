import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { validateRequest, validateQuery } from '../middlewares/validation';
import { walletValidation } from '../validations/wallet.validation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
// Create a new hunt
router.get('/', authenticateJWT,validateQuery(walletValidation.pagination), WalletController.getWallet);
router.get('/lifetime-earnings', authenticateJWT, WalletController.getLifetimeEarnings);


export default router;