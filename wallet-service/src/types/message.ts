export type TWalletCreditMessage = {
  userId: string;
  huntId: string;
  taskId: string;
  taskName: string;
  huntName: string;
  amount: number;
  rank: number;
  claimId?: string;
  timestamp: Date;
};

export type TWalletTokenDebitMessage = {
  userId: string;
  clueId: string;
  token: number;
  description?: string;
  timestamp: Date;
};
