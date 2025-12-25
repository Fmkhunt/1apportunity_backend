import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { paymentValidation } from '../validations/payment.validation';

const router = Router();

// Create payment session (authenticated) test
router.post(
  '/create-session',
  authenticateJWT,
  validateRequest(paymentValidation.createSession),
  PaymentController.createPaymentSession
);

// Stripe webhook (public, no auth, raw body required for signature verification)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    // Store raw body for signature verification
    (req as any).rawBody = req.body;
    next();
  },
  PaymentController.handleStripeWebhook
);

// Razorpay webhook (public, no auth)
router.post(
  '/webhook/razorpay',
  express.json(),
  PaymentController.handleRazorpayWebhook
);

export default router;
