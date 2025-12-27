export type TCreateWalletData = {
  user_id: string;
  balance: number;
  created_by: string;
};

export type TCreditWalletData = {
  wallet_id: string;
  amount: number;
  description: string;
  reference_type: string;
  reference_id: string;
  created_by: string;
  payment_transaction_id?: string;
};

export type TDebitWalletData = {
  wallet_id: string;
  amount: number;
  description: string;
  reference_type: string;
  reference_id: string;
  created_by: string;
};
