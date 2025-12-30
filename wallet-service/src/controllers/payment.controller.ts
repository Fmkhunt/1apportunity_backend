import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { StripeWebhookService } from '../services/stripeWebhook.service';
import { RazorpayWebhookService } from '../services/razorpayWebhook.service';
import { TAuthenticatedRequest, TPaymentType } from '../types';
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

      const { count, payment_type, platform } = req.body as {
        count: number;
        payment_type: TPaymentType;
        platform?: 'web' | 'mobile';
      };

      if (!count || count <= 0 || !Number.isInteger(count)) {
        throw new AppError('Invalid count. Count must be a positive integer', 400);
      }

      if (!payment_type || !['tokens', 'credits'].includes(payment_type)) {
        throw new AppError('Invalid payment type. Must be "tokens" or "credits"', 400);
      }

      // Default to 'web' if platform not specified
      const paymentPlatform = platform || 'mobile';

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
      let clientSecret = '';
      let paymentIntentId = '';

      // Create payment session/order based on gateway and platform
      if (paymentGateway === 'stripe') {
        if (paymentPlatform === 'mobile') {
          // Use Payment Intent for mobile/Flutter
          const paymentIntent = await PaymentService.createStripePaymentIntent(
            userId,
            amount,
            currency,
            quantity,
            payment_type,
            paymentTransactionId
          );
          clientSecret = paymentIntent.clientSecret;
          paymentIntentId = paymentIntent.paymentIntentId;

          // Update transaction with payment intent ID and metadata
          await PaymentService.updatePaymentTransactionById(
            paymentTransactionId,
            {
              paymentIntentId: paymentIntentId,
              status: 'pending',
              metadata: {
                paymentIntentId: paymentIntentId,
                userId,
                paymentType: payment_type,
                quantity,
                amount,
                currency,
                platform: 'mobile',
              }
            }
          );
        } else {
          // Use Checkout Session for web
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

          // Update transaction with session ID and metadata
          await PaymentService.updatePaymentTransactionById(
            paymentTransactionId,
            {
              gatewaySessionId: sessionId,
              status: 'pending',
              metadata: {
                sessionId: sessionId,
                userId,
                paymentType: payment_type,
                quantity,
                amount,
                currency,
                platform: 'web',
              }
            }
          );
        }
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

        // Update transaction with order ID and metadata
        await PaymentService.updatePaymentTransactionById(
          paymentTransactionId,
          {
            gatewayOrderId: orderId,
            status: 'pending',
            metadata: {
              orderId: orderId,
              userId,
              paymentType: payment_type,
              quantity,
              amount,
              currency,
              platform: paymentPlatform,
            }
          }
        );
      }

      // Build response based on platform
      const responseData: any = {
        gateway: paymentGateway,
        amount,
        currency,
        payment_type,
        quantity,
        payment_transaction_id: paymentTransactionId,
      };

      if (paymentGateway === 'stripe' && paymentPlatform === 'mobile') {
        responseData.client_secret = clientSecret;
        responseData.payment_intent_id = paymentIntentId;
      } else if (paymentGateway === 'stripe' && paymentPlatform === 'web') {
        responseData.payment_url = paymentUrl;
        responseData.session_id = sessionId;
      } else if (paymentGateway === 'razorpay') {
        responseData.payment_url = paymentUrl;
        responseData.order_id = orderId;
      }

      ResponseHandler.created(res, responseData, 'Payment session created successfully');
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
      const rawBody = (req as any).rawBody as Buffer; //(req as any).rawBody as Buffer;
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
