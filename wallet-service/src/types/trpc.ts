// Type definitions for tRPC client
export interface ClaimData {
  id: string;
  claim_type: string;
  coupen_code: string;
  levels: any;
  created_at: Date;
  updated_at: Date;
}

export interface ClaimQueryParams {
  page?: number;
  limit?: number;
  claim_type?: string;
  search?: string;
}

export interface ClaimResponse {
  claims: ClaimData[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}
