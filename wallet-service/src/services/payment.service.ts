import { db } from '../config/database';
import { paymentTransactionsTable } from '../models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import { stripeClient, PAYMENT_SUCCESS_URL, PAYMENT_FAILURE_URL } from '../config/payment';
import { razorpayClient } from '../config/payment';
import { trpcUser } from '../trpc/client';
import { WalletService } from './wallet.service';

export type PaymentType = 'tokens' | 'credits';
export type PaymentGateway = 'stripe' | 'razorpay';

export interface ServiceLocation {
  id: string;
  payment_gateway: string;
  token_rate: string;
  coin_rate: string;
  currency: string;
  currency_sign: string;
}

export interface CreatePaymentSessionData {
  userId: string;
  amount: number; // Amount in smallest currency unit (cents/paise)
  paymentType: PaymentType;
}

export interface PaymentTransactionData {
  userId: string;
  amount: number;
  currency: string;
  quantity: number;
  paymentType: PaymentType;
  paymentGateway: PaymentGateway;
  gatewayOrderId?: string;
  gatewaySessionId?: string;
  metadata?: any;
}

export class PaymentService {
  /**
   * Get user's service location via TRPC
   */
  static async getUserServiceLocation(userId: string): Promise<ServiceLocation> {
    try {
      // Use TRPC to get user's service location
      const serviceLocation = await (trpcUser as any).user.getServiceLocation.query(userId) as {
        id: string;
        payment_gateway: string;
        token_rate: string;
        coin_rate: string;
        currency: string | null;
        currency_sign: string;
      } | null;

      if (!serviceLocation) {
        throw new AppError('User service location not found', 404);
      }

      if (!serviceLocation.payment_gateway) {
        throw new AppError('Service location payment gateway not configured', 500);
      }

      return {
        id: serviceLocation.id,
        payment_gateway: serviceLocation.payment_gateway,
        token_rate: serviceLocation.token_rate,
        coin_rate: serviceLocation.coin_rate,
        currency: serviceLocation.currency,
        currency_sign: serviceLocation.currency_sign || 'USD',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to get user service location: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  /**
   * Calculate quantity based on amount and rate
   */
  static calculateQuantity(amount: number, rate: string): number {
    const rateValue = parseFloat(rate || '0');
    if (rateValue <= 0) {
      throw new AppError('Invalid rate for quantity calculation', 400);
    }
    // Amount is in smallest currency unit, rate is per currency unit
    // So we need to convert amount to currency units first
    const amountInCurrencyUnits = amount / 100; // Assuming cents/paise
    const quantity = Math.floor(amountInCurrencyUnits / rateValue);
    return quantity;
  }

  /**
   * Calculate amount based on count (quantity) and rate
   * Returns amount in smallest currency unit (cents/paise)
   */
  static calculateAmount(count: number, rate: string): number {
    const rateValue = parseFloat(rate || '0');
    if (rateValue <= 0) {
      throw new AppError('Invalid rate for amount calculation', 400);
    }
    if (count <= 0) {
      throw new AppError('Count must be positive', 400);
    }
    // Rate is per currency unit, so multiply count by rate to get currency units
    // Then convert to smallest currency unit (multiply by 100)
    const amountInCurrencyUnits = count * rateValue;
    const amountInSmallestUnit = Math.ceil(amountInCurrencyUnits * 100); // Round up to avoid underpayment
    return amountInSmallestUnit;
  }

  /**
   * Create Stripe Checkout Session
   */
  static async createStripeSession(
    userId: string,
    amount: number,
    currency: string,
    quantity: number,
    paymentType: PaymentType,
    paymentTransactionId: string
  ): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Purchase ${quantity} ${paymentType}`,
                description: `Buying ${quantity} ${paymentType} for ${amount / 100} ${currency}`,
              },
              unit_amount: amount, // Amount in smallest currency unit
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&transaction_id=${paymentTransactionId}`,
        cancel_url: `${PAYMENT_FAILURE_URL}?transaction_id=${paymentTransactionId}`,
        metadata: {
          userId,
          paymentType,
          quantity: quantity.toString(),
          paymentTransactionId,
        },
      });

      return {
        sessionUrl: session.url || '',
        sessionId: session.id,
      };
    } catch (error: any) {
      throw new AppError(`Failed to create Stripe session: ${error.message}`, 500);
    }
  }

  /**
   * Create Razorpay Order
   */
  static async createRazorpayOrder(
    userId: string,
    amount: number,
    currency: string,
    quantity: number,
    paymentType: PaymentType,
    paymentTransactionId: string
  ): Promise<{ orderId: string; paymentUrl: string }> {
    try {
      const options = {
        amount: amount, // Amount in smallest currency unit (paise for INR)
        currency: currency.toUpperCase(),
        receipt: paymentTransactionId,
        notes: {
          userId,
          paymentType,
          quantity: quantity.toString(),
          paymentTransactionId,
        },
      };

      const order = await razorpayClient.orders.create(options);

      // Razorpay doesn't provide a direct payment URL like Stripe
      // The frontend needs to use Razorpay Checkout with the order ID
      // We'll return the order ID and the frontend will handle the payment UI
      return {
        orderId: order.id,
        paymentUrl: `razorpay://order/${order.id}`, // Custom scheme for mobile app
      };
    } catch (error: any) {
      throw new AppError(`Failed to create Razorpay order: ${error.message}`, 500);
    }
  }

  /**
   * Create payment transaction in database
   */
  static async createPaymentTransaction(data: PaymentTransactionData): Promise<string> {
    try {
      const [transaction] = await db
        .insert(paymentTransactionsTable)
        .values({
          userId: data.userId,
          amount: (data.amount/1000).toFixed(4), //decimal
          currency: data.currency,
          quantity: data.quantity,
          payment_type: data.paymentType,
          payment_gateway: data.paymentGateway,
          gateway_order_id: data.gatewayOrderId || null,
          gateway_session_id: data.gatewaySessionId || null,
          status: 'pending',
          metadata: data.metadata || null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning({ id: paymentTransactionsTable.id });

      if (!transaction) {
        throw new AppError('Failed to create payment transaction', 500);
      }

      return transaction.id;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create payment transaction: ${error.message}`, 500);
    }
  }

  /**
   * Update payment transaction status
   */
  static async updatePaymentTransaction(
    gatewayOrderId: string,
    status: 'pending' | 'success' | 'failed',
    metadata?: any
  ): Promise<void> {
    try {
      await db
        .update(paymentTransactionsTable)
        .set({
          status,
          metadata: metadata || undefined,
          updated_at: new Date(),
        })
        .where(eq(paymentTransactionsTable.gateway_order_id, gatewayOrderId));
    } catch (error: any) {
      throw new AppError(`Failed to update payment transaction: ${error.message}`, 500);
    }
  }

  /**
   * Update payment transaction by session ID (for Stripe)
   */
  static async updatePaymentTransactionBySessionId(
    gatewaySessionId: string,
    status: 'pending' | 'success' | 'failed',
    metadata?: any
  ): Promise<void> {
    try {
      await db
        .update(paymentTransactionsTable)
        .set({
          status,
          metadata: metadata || undefined,
          updated_at: new Date(),
        })
        .where(eq(paymentTransactionsTable.gateway_session_id, gatewaySessionId));
    } catch (error: any) {
      throw new AppError(`Failed to update payment transaction: ${error.message}`, 500);
    }
  }

  /**
   * Get payment transaction by gateway order ID
   */
  static async getPaymentTransactionByOrderId(gatewayOrderId: string) {
    try {
      const [transaction] = await db
        .select()
        .from(paymentTransactionsTable)
        .where(eq(paymentTransactionsTable.gateway_order_id, gatewayOrderId))
        .limit(1);

      return transaction || null;
    } catch (error: any) {
      throw new AppError(`Failed to get payment transaction: ${error.message}`, 500);
    }
  }

  /**
   * Get payment transaction by session ID
   */
  static async getPaymentTransactionBySessionId(gatewaySessionId: string) {
    try {
      const [transaction] = await db
        .select()
        .from(paymentTransactionsTable)
        .where(eq(paymentTransactionsTable.gateway_session_id, gatewaySessionId))
        .limit(1);

      return transaction || null;
    } catch (error: any) {
      throw new AppError(`Failed to get payment transaction: ${error.message}`, 500);
    }
  }

  /**
   * Credit tokens to user
   */
  static async creditTokensToUser(
    userId: string,
    quantity: number,
    paymentTransactionId: string
  ): Promise<void> {
    try {
      // This will be implemented in token.service.ts
      // For now, we'll call it here
      const { TokenService } = await import('./token.service');
      await TokenService.creditTokens(
        userId,
        quantity,
        paymentTransactionId,
        `Payment transaction ${paymentTransactionId}`
      );
    } catch (error: any) {
      throw new AppError(`Failed to credit tokens: ${error.message}`, 500);
    }
  }

  /**
   * Credit coins to user
   */
  static async creditCoinsToUser(
    userId: string,
    quantity: number,
    paymentTransactionId: string
  ): Promise<void> {
    try {
      await WalletService.credit({
        wallet_id: userId,
        amount: quantity,
        description: `Payment transaction ${paymentTransactionId}`,
        reference_type: 'payment',
        reference_id: paymentTransactionId,
        created_by: userId,
        payment_transaction_id: paymentTransactionId,
      });
    } catch (error: any) {
      throw new AppError(`Failed to credit coins: ${error.message}`, 500);
    }
  }
}
