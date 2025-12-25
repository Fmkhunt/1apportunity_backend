import crypto from 'crypto';
import { RAZORPAY_WEBHOOK_SECRET } from '../config/payment';
import { PaymentService } from './payment.service';
import { AppError } from '../utils/AppError';

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id: string | null;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: Record<string, string>;
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_step: string | null;
        error_reason: string | null;
        acquirer_data: Record<string, any>;
        created_at: number;
      };
    };
  };
}

export class RazorpayWebhookService {
  /**
   * Verify Razorpay webhook signature
   * Razorpay sends signature as: HMAC SHA256 of (payload + webhook_secret)
   */
  static verifySignature(
    payload: string,
    signature: string
  ): boolean {
    try {
      if (!RAZORPAY_WEBHOOK_SECRET) {
        throw new AppError('Razorpay webhook secret not configured', 500);
      }

      // Razorpay signature format: HMAC SHA256 of payload
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      const providedSignature = Buffer.from(signature, 'utf8');
      const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

      if (providedSignature.length !== expectedSignatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer);
    } catch (error) {
      console.error('Razorpay signature verification error:', error);
      return false;
    }
  }

  /**
   * Process Razorpay webhook
   */
  static async processWebhook(
    payload: RazorpayWebhookPayload,
    signature: string
  ): Promise<void> {
    try {
      // Verify webhook signature
      const payloadString = JSON.stringify(payload);
      const isValid = this.verifySignature(payloadString, signature);

      if (!isValid) {
        throw new AppError('Invalid Razorpay webhook signature', 400);
      }

      // Handle different event types
      switch (payload.event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        default:
          console.log(`Unhandled Razorpay event type: ${payload.event}`);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to process Razorpay webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Handle successful payment capture
   */
  private static async handlePaymentCaptured(
    payload: RazorpayWebhookPayload
  ): Promise<void> {
    try {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const notes = payment.notes || {};

      const userId = notes.userId;
      const paymentType = notes.paymentType as 'tokens' | 'credits';
      const quantity = parseInt(notes.quantity || '0', 10);
      const paymentTransactionId = notes.paymentTransactionId;

      if (!userId || !paymentType || !quantity || !paymentTransactionId) {
        throw new AppError('Invalid payment notes', 400);
      }

      // Update payment transaction status
      await PaymentService.updatePaymentTransaction(
        orderId,
        'success',
        {
          razorpayPaymentId: payment.id,
          razorpayOrderId: orderId,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
        }
      );

      // Get the payment transaction to verify it hasn't been processed
      const transaction = await PaymentService.getPaymentTransactionByOrderId(orderId);
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

      console.log(`Successfully processed Razorpay payment: ${paymentTransactionId} for user ${userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to handle payment captured: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(
    payload: RazorpayWebhookPayload
  ): Promise<void> {
    try {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const notes = payment.notes || {};
      const paymentTransactionId = notes.paymentTransactionId;

      if (!paymentTransactionId) {
        throw new AppError('Payment transaction ID not found in notes', 400);
      }

      // Update payment transaction status to failed
      await PaymentService.updatePaymentTransaction(
        orderId,
        'failed',
        {
          razorpayPaymentId: payment.id,
          razorpayOrderId: orderId,
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
          errorReason: payment.error_reason,
        }
      );

      console.log(`Razorpay payment failed for transaction: ${paymentTransactionId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to handle payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }
}
