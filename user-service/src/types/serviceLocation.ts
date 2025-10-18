export type TServiceLocation = {
  id: string;
  country: string;
  timezone: string;
  currency: string;
  currency_sign: string;
  map: string;
  payment_gateway: string;
  created_at: Date;
  updated_at: Date;
}

export type TServiceLocationCreate = {
  country: string;
  timezone: string;
  currency: string;
  currency_sign: string;
  map: string;
  payment_gateway: string;
}

export type TServiceLocationUpdate = {
  country?: string;
  timezone?: string;
  currency?: string;
  currency_sign?: string;
  map?: string;
  payment_gateway?: string;
}