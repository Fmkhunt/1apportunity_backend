// Type definitions for tRPC client
export type TClaimData = {
  id: string;
  claim_type: string;
  coupen_code: string;
  levels: any;
  created_at: Date;
  updated_at: Date;
};

export type TClaimQueryParams = {
  page?: number;
  limit?: number;
  claim_type?: string;
  search?: string;
};

export type TClaimResponse = {
  claims: TClaimData[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
};
