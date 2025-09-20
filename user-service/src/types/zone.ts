export type TZone = {
  id: string;
  name: string;
  description?: string;
  area?: string;
  service_location_id: string;
  coordinates_arr?: {
    type: string;
    coordinates: number[][][];
  };
  created_at: Date;
  updated_at: Date;
}

export type TZoneCreate = {
  name: string;
  description?: string;
  area?: string;
  service_location_id: string;
  coordinates?: { latitude: number; longitude: number }[];
}

export type TZoneUpdate = {
  name?: string;
  description?: string;
  area?: string;
  service_location_id?: string;
  coordinates?: { latitude: number; longitude: number }[];
}