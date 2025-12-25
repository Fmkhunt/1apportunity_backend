import Stripe from 'stripe';
import Razorpay from 'razorpay';

// Stripe configuration
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripeClient = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

export const STRIPE_WEBHOOK_SECRET = stripeWebhookSecret || '';

// Razorpay configuration
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
}

export const razorpayClient = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export const RAZORPAY_WEBHOOK_SECRET = razorpayWebhookSecret || '';

// Payment URLs for mobile redirects
export const PAYMENT_SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL || 'https://your-app.com/payment/success';
export const PAYMENT_FAILURE_URL = process.env.PAYMENT_FAILURE_URL || 'https://your-app.com/payment/failure';
