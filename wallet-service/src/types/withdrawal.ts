export type TWithdrawalStatus = 'pending' | 'approved' | 'rejected';

export type TCreateWithdrawalData = {
  user_id: string;
  coins: number;
};

export type TWithdrawal = {
  id: string;
  user_id: string;
  coins: number;
  conversion_rate: string;
  currency: string;
  currency_amount: string;
  status: TWithdrawalStatus;
  rejection_reason: string | null;
  processed_by: string | null;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TWithdrawalListResponse = {
  withdrawals: TWithdrawal[];
  totalRecords: number;
  page: number;
  limit: number;
};
