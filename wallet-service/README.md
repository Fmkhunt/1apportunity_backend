# Wallet Service

Wallet service for managing user wallets, tokens, and payment transactions.

## Features

- Wallet management (coins/credits)
- Token wallet management
- Payment gateway integration (Stripe & Razorpay)
- Payment transaction tracking
- Webhook handling for payment events
- Coin withdrawal system with admin approval

## Payment Gateway Integration

### Supported Gateways

- **Stripe**: For international payments
- **Razorpay**: For Indian market payments

Payment gateway selection is automatically determined based on user's service location configuration.

### Payment Types

- **Tokens**: Purchase tokens using payment gateway
- **Credits**: Purchase coins/credits using payment gateway

### API Endpoints

#### Create Payment Session

**POST** `/api/payment/create-session`

Create a payment session for purchasing tokens or credits.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "count": 100,  // Number of tokens or credits to purchase
  "payment_type": "tokens"  // or "credits"
}
```

**Response:**
```json
{
  "data": {
    "payment_url": "https://checkout.stripe.com/...",
    "session_id": "cs_test_...",
    "order_id": "order_...",
    "gateway": "stripe",
    "amount": 1000,  // Calculated amount in smallest currency unit (cents/paise)
    "currency": "USD",
    "payment_type": "tokens",
    "quantity": 100,  // Same as count
    "payment_transaction_id": "uuid"
  },
  "message": "Payment session created successfully",
  "success": true
}
```

**Note:** The `amount` is automatically calculated by the backend based on the `count` and the service location's rate (token_rate or coin_rate). The frontend only needs to send the desired quantity.

**Note:** For Razorpay, the `payment_url` will be a custom scheme (`razorpay://order/...`) that your Flutter app should handle to open the Razorpay checkout.

#### Stripe Webhook

**POST** `/api/payment/webhook/stripe`

Handle Stripe webhook events. This endpoint is public (no authentication required) but uses signature verification.

**Headers:**
```
stripe-signature: <signature>
Content-Type: application/json
```

**Webhook Events Handled:**
- `checkout.session.completed`: Payment successful
- `checkout.session.async_payment_succeeded`: Async payment succeeded
- `checkout.session.async_payment_failed`: Payment failed

#### Razorpay Webhook

**POST** `/api/payment/webhook/razorpay`

Handle Razorpay webhook events. This endpoint is public (no authentication required) but uses signature verification.

**Headers:**
```
x-razorpay-signature: <signature>
Content-Type: application/json
```

**Webhook Events Handled:**
- `payment.captured`: Payment successful
- `payment.failed`: Payment failed

## Environment Variables

### Payment Configuration

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Payment Redirect URLs (for mobile app)
PAYMENT_SUCCESS_URL=https://your-app.com/payment/success
PAYMENT_FAILURE_URL=https://your-app.com/payment/failure

# User Service URL (for TRPC)
USER_SERVICE_URL=http://localhost:3000
```

## Webhook Setup

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api.com/api/payment/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
4. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

### Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add endpoint: `https://your-api.com/api/payment/webhook/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
4. Copy the webhook secret and add it to `RAZORPAY_WEBHOOK_SECRET`

## Database Schema

### payment_transactions

Tracks all payment transactions.

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `amount`: Integer (Amount in smallest currency unit)
- `currency`: String
- `quantity`: Integer (Calculated tokens or credits)
- `payment_type`: Enum ('tokens' | 'credits')
- `payment_gateway`: String ('stripe' | 'razorpay')
- `gateway_order_id`: String (Razorpay order ID)
- `gateway_session_id`: String (Stripe session ID)
- `status`: Enum ('pending' | 'success' | 'failed')
- `metadata`: JSONB (Additional payment data)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### token_wallet

Tracks token transactions.

- `id`: UUID (Primary Key)
- `user_id`: UUID
- `token`: Integer
- `transaction_type`: Enum ('credit' | 'debit')
- `clue_id`: UUID (Nullable)
- `payment_transaction_id`: UUID (Nullable, Foreign Key to payment_transactions)
- `description`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### wallet

Tracks coin/credit transactions.

- `id`: UUID (Primary Key)
- `user_id`: UUID
- `coins`: Integer
- `transaction_type`: Enum ('credit' | 'debit')
- `type`: Enum ('task' | 'referral' | 'withdrawal' | 'payment')
- `payment_transaction_id`: UUID (Nullable, Foreign Key to payment_transactions)
- `description`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### withdrawals

Tracks coin withdrawal requests.

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users, indexed)
- `coins`: Integer (Amount of coins to withdraw)
- `conversion_rate`: Decimal (Rate used for conversion)
- `currency`: String (Target currency)
- `currency_amount`: Decimal (Calculated amount in currency)
- `status`: Enum ('pending' | 'approved' | 'rejected', default: 'pending', indexed)
- `rejection_reason`: Text (Nullable, reason if rejected)
- `processed_by`: UUID (Nullable, admin who processed)
- `processed_at`: Timestamp (Nullable)
- `created_at`: Timestamp (indexed)
- `updated_at`: Timestamp

## Withdrawal System

### Overview

Users can request coin withdrawals which are subject to admin approval. Once approved, coins are deducted from both the wallet table and users table balance.

### API Endpoints

#### Create Withdrawal Request

**POST** `/api/withdrawal/request`

Create a withdrawal request for coins.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "coins": 1000  // Number of coins to withdraw (must be positive integer)
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "coins": 1000,
    "conversion_rate": "0.01",
    "currency": "USD",
    "currency_amount": "10.00",
    "status": "pending",
    "rejection_reason": null,
    "processed_by": null,
    "processed_at": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Withdrawal request created successfully",
  "success": true
}
```

#### Get User Withdrawals

**GET** `/api/withdrawal?page=1&limit=10`

Get user's withdrawal history (paginated).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "data": {
    "withdrawals": [...],
    "totalRecords": 50,
    "page": 1,
    "limit": 10
  },
  "message": "Withdrawals retrieved successfully",
  "success": true
}
```

#### Get Withdrawal by ID

**GET** `/api/withdrawal/:id`

Get specific withdrawal details.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

#### Admin: Get Pending Withdrawals

**GET** `/api/admin/withdrawal/pending?page=1&limit=10`

Get all pending withdrawal requests (admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Admin: Approve Withdrawal

**POST** `/api/admin/withdrawal/:id/approve`

Approve a withdrawal request (admin only). This will:
- Update withdrawal status to 'approved'
- Debit coins from wallet table
- Deduct balance from users table via TRPC

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "processed_by": "admin-uuid",
    "processed_at": "2024-01-01T00:00:00Z",
    ...
  },
  "message": "Withdrawal approved successfully",
  "success": true
}
```

#### Admin: Reject Withdrawal

**POST** `/api/admin/withdrawal/:id/reject`

Reject a withdrawal request (admin only).

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation"  // Optional
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejection_reason": "Insufficient documentation",
    "processed_by": "admin-uuid",
    "processed_at": "2024-01-01T00:00:00Z",
    ...
  },
  "message": "Withdrawal rejected successfully",
  "success": true
}
```

## Payment Flow

1. User requests payment session with count (quantity) and payment type (tokens/credits)
2. System fetches user's service location to determine payment gateway and rates
3. System calculates amount based on count and rate (token_rate or coin_rate)
4. Payment session/order is created with the selected gateway and calculated amount
5. Payment transaction is saved to database with 'pending' status
6. User completes payment in mobile WebView
7. Gateway sends webhook to our server
8. Webhook handler verifies signature and updates transaction status
9. Tokens or credits are credited to user's wallet (based on the count requested)
10. Transaction status is updated to 'success' or 'failed'

## Withdrawal Flow

1. User requests withdrawal with coin amount
2. System validates user has sufficient balance
3. System fetches user's service location to get conversion rate and currency
4. System calculates currency_amount = coins * coin_rate
5. Withdrawal record is created with status 'pending'
6. Admin views pending withdrawals
7. Admin approves or rejects withdrawal
8. If approved:
   - Withdrawal status updated to 'approved'
   - Coins debited from wallet table (transaction_type='debit', type='withdrawal')
   - Balance deducted from users table via TRPC
9. User can view withdrawal status (pending/approved/rejected)

## Mobile App Integration

### Flutter Integration

For Stripe:
```dart
// Open Stripe checkout URL in WebView
final url = paymentResponse['payment_url'];
// Use webview_flutter or url_launcher to open the URL
```

For Razorpay:
```dart
// Use Razorpay Flutter SDK
import 'package:razorpay_flutter/razorpay_flutter.dart';

final razorpay = Razorpay();
razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, handlePaymentSuccess);
razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, handlePaymentError);

razorpay.open({
  'key': 'YOUR_RAZORPAY_KEY',
  'amount': amount,
  'name': 'Your App Name',
  'order_id': orderId,
  'prefill': {
    'contact': userPhone,
    'email': userEmail,
  },
});
```

## Error Handling

All payment errors are handled with appropriate HTTP status codes:

- `400`: Bad Request (invalid input, missing fields)
- `401`: Unauthorized (missing or invalid JWT token)
- `404`: Not Found (user or service location not found)
- `500`: Internal Server Error (gateway API errors, database errors)

## Security

- JWT authentication required for creating payment sessions
- Webhook signature verification for both Stripe and Razorpay
- Idempotency checks to prevent duplicate token/credit credits
- Payment transaction tracking for audit purposes

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Notes

- Payment gateway selection is based on user's service location configuration
- Amount is automatically calculated based on count (quantity) and service location rates
- Frontend sends the desired count of tokens/credits, backend calculates the payment amount
- All payment transactions are tracked with full audit trail
- Payment transaction IDs are referenced in token_wallet and wallet tables for traceability
