export type TPaymentType = 'tokens' | 'credits';
export type TPaymentGateway = 'stripe' | 'razorpay';

export type TServiceLocation = {
  id: string;
  payment_gateway: string;
  token_rate: string;
  coin_rate: string;
  currency: string;
  currency_sign: string;
};

export type TCreatePaymentSessionData = {
  userId: string;
  amount: number; // Amount in smallest currency unit (cents/paise)
  paymentType: TPaymentType;
};

export type TPaymentTransactionData = {
  userId: string;
  amount: number;
  currency: string;
  quantity: number;
  paymentType: TPaymentType;
  paymentGateway: TPaymentGateway;
  gatewayOrderId?: string;
  gatewaySessionId?: string;
  metadata?: any;
};
