import Stripe from 'stripe';
import { stripeClient, STRIPE_WEBHOOK_SECRET } from '../config/payment';
import { PaymentService } from './payment.service';
import { AppError } from '../utils/AppError';

export class StripeWebhookService {
  /**
   * Verify and process Stripe webhook
   */
  static async processWebhook(
    rawBody: Buffer,
    signature: string
  ): Promise<void> {
    try {
      console.log("Stripe Raw Body👉=>", rawBody);
      console.log("Stripe Signature👉=>", signature);
      console.log("Stripe Webhook Secret👉=>", STRIPE_WEBHOOK_SECRET);
      if (!STRIPE_WEBHOOK_SECRET) {
        throw new AppError('Stripe webhook secret not configured', 500);
      }

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripeClient.webhooks.constructEvent(rawBody as Buffer,signature,STRIPE_WEBHOOK_SECRET);
      } catch (error: any) {
        console.error("Stripe Error👉=>", error);
        throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
      }

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'checkout.session.async_payment_succeeded':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'checkout.session.async_payment_failed':
          await this.handleCheckoutSessionFailed(event.data.object as Stripe.Checkout.Session);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to process Stripe webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Handle successful checkout session
   */
  private static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    try {
      const metadata = session.metadata;
      if (!metadata) {
        throw new AppError('Session metadata not found', 400);
      }

      const paymentTransactionId = metadata.paymentTransactionId;
      const userId = metadata.userId;
      const paymentType = metadata.paymentType as 'tokens' | 'credits';
      const quantity = parseInt(metadata.quantity || '0', 10);

      if (!paymentTransactionId || !userId || !paymentType || !quantity) {
        throw new AppError('Invalid session metadata', 400);
      }

      // Update payment transaction status
      await PaymentService.updatePaymentTransactionBySessionId(
        session.id,
        'success',
        {
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent,
          customerId: session.customer,
        }
      );

      // Get the payment transaction to verify it hasn't been processed
      const transaction = await PaymentService.getPaymentTransactionBySessionId(session.id);
      if (!transaction) {
        throw new AppError('Payment transaction not found', 404);
      }

      // Check if already processed (idempotency)
      if (transaction.status === 'success') {
        console.log(`Payment transaction ${paymentTransactionId} already processed`);
        return;
      }

      // Credit tokens or coins based on payment type
      if (paymentType === 'tokens') {
        await PaymentService.creditTokensToUser(userId, quantity, paymentTransactionId);
      } else if (paymentType === 'credits') {
        await PaymentService.creditCoinsToUser(userId, quantity, paymentTransactionId);
      }

      console.log(`Successfully processed payment: ${paymentTransactionId} for user ${userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to handle checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Handle failed checkout session
   */
  private static async handleCheckoutSessionFailed(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    try {
      const metadata = session.metadata;
      if (!metadata) {
        throw new AppError('Session metadata not found', 400);
      }

      const paymentTransactionId = metadata.paymentTransactionId;

      if (!paymentTransactionId) {
        throw new AppError('Payment transaction ID not found in metadata', 400);
      }

      // Update payment transaction status to failed
      await PaymentService.updatePaymentTransactionBySessionId(
        session.id,
        'failed',
        {
          stripeSessionId: session.id,
          failureReason: 'Payment failed',
        }
      );

      console.log(`Payment failed for transaction: ${paymentTransactionId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to handle failed checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }
}
