import { Request, Response, NextFunction } from 'express';
import { PaymentService, PaymentType } from '../services/payment.service';
import { StripeWebhookService } from '../services/stripeWebhook.service';
import { RazorpayWebhookService } from '../services/razorpayWebhook.service';
import { TAuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';
import { ResponseHandler } from '../utils/responseHandler';

export class PaymentController {
  /**
   * Create payment session
   */
  static async createPaymentSession(
    req: TAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { count, payment_type } = req.body as {
        count: number;
        payment_type: PaymentType;
      };

      if (!count || count <= 0 || !Number.isInteger(count)) {
        throw new AppError('Invalid count. Count must be a positive integer', 400);
      }

      if (!payment_type || !['tokens', 'credits'].includes(payment_type)) {
        throw new AppError('Invalid payment type. Must be "tokens" or "credits"', 400);
      }

      // Get user's service location
      const serviceLocation = await PaymentService.getUserServiceLocation(userId);

      // Determine rate based on payment type
      const rate = payment_type === 'tokens'
        ? serviceLocation.token_rate
        : serviceLocation.coin_rate;

      // Calculate amount based on count and rate
      const amount = PaymentService.calculateAmount(count, rate);

      if (amount <= 0) {
        throw new AppError('Calculated amount is invalid. Please check the count and rate.', 400);
      }

      // Quantity is the count requested by user
      const quantity = count;

      // Determine payment gateway from service location
      const paymentGateway = serviceLocation.payment_gateway.toLowerCase();
      if (!['stripe', 'razorpay'].includes(paymentGateway)) {
        throw new AppError(`Unsupported payment gateway: ${paymentGateway}`, 400);
      }

      const currency = serviceLocation.currency_sign || 'USD';

      // Create payment transaction first
      const paymentTransactionId = await PaymentService.createPaymentTransaction({
        userId,
        amount,
        currency,
        quantity,
        paymentType: payment_type,
        paymentGateway: paymentGateway as 'stripe' | 'razorpay',
      });

      let paymentUrl = '';
      let sessionId = '';
      let orderId = '';

      // Create payment session/order based on gateway
      if (paymentGateway === 'stripe') {
        const session = await PaymentService.createStripeSession(
          userId,
          amount,
          currency,
          quantity,
          payment_type,
          paymentTransactionId
        );
        paymentUrl = session.sessionUrl;
        sessionId = session.sessionId;

        // Update transaction with session ID
        await PaymentService.updatePaymentTransactionBySessionId(
          sessionId,
          'pending',
          { sessionId }
        );
      } else if (paymentGateway === 'razorpay') {
        const order = await PaymentService.createRazorpayOrder(
          userId,
          amount,
          currency,
          quantity,
          payment_type,
          paymentTransactionId
        );
        paymentUrl = order.paymentUrl;
        orderId = order.orderId;

        // Update transaction with order ID
        await PaymentService.updatePaymentTransaction(
          orderId,
          'pending',
          { orderId }
        );
      }

      ResponseHandler.created(res, {
        payment_url: paymentUrl,
        session_id: sessionId || undefined,
        order_id: orderId || undefined,
        gateway: paymentGateway,
        amount,
        currency,
        payment_type,
        quantity,
        payment_transaction_id: paymentTransactionId,
      }, 'Payment session created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Stripe webhook
   */
  static async handleStripeWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        throw new AppError('Stripe signature header missing', 400);
      }

      // Get raw body (should be available from middleware)
      const rawBody = (req as any).rawBody as Buffer;
      if (!rawBody) {
        throw new AppError('Raw body not available', 400);
      }

      await StripeWebhookService.processWebhook(rawBody, signature);

      ResponseHandler.success(res, { received: true }, 'Webhook processed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Razorpay webhook
   */
  static async handleRazorpayWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        throw new AppError('Razorpay signature header missing', 400);
      }

      const payload = req.body;
      if (!payload) {
        throw new AppError('Webhook payload missing', 400);
      }

      await RazorpayWebhookService.processWebhook(payload, signature);

      ResponseHandler.success(res, { received: true }, 'Webhook processed successfully');
    } catch (error) {
      next(error);
    }
  }
}
