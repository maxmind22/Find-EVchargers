export type ConnectorType = 
  | 'CCS_2' 
  | 'TYPE_2' 
  | 'GB_T'
  | 'CHADEMO' 
  | 'NACS' 
  | 'TYPE_1';

export type CurrentType = 'AC' | 'DC';

export type ConnectorStatus = 'AVAILABLE' | 'OCCUPIED' | 'FAULTED' | 'UNKNOWN';

export type StationStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | 'PLANNED';

export type AccessType = 'PUBLIC' | 'CUSTOMERS_ONLY' | 'RESIDENTIAL' | 'HOTEL';

export type Amenity = 
  | 'RESTROOM' 
  | 'COFFEE' 
  | 'SHOPPING' 
  | 'RESTAURANT' 
  | 'WIFI' 
  | 'ACCESSIBLE' 
  | 'TWENTY_FOUR_SEVEN' 
  | 'HOTEL';

export interface Connector {
  id: string;
  station_id: string;
  connector_type: ConnectorType;
  power_kw: number;
  quantity: number;
  status: ConnectorStatus;
  current_type: CurrentType;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  operator_name: string;
  status: StationStatus;
  pricing_info: string;
  is_free: boolean;
  access_type: AccessType;
  amenities: Amenity[];
  connectors: Connector[];
  notes?: string;
  user_id?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export interface StationReport {
  id: string;
  station_id: string;
  report_type: 'BROKEN_CONNECTOR' | 'OCCUPIED_BY_ICE' | 'ACCESS_BLOCKED' | 'PRICING_INCORRECT' | 'OTHER';
  comment?: string;
  created_at: string;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface StationFilter {
  connectorTypes?: ConnectorType[];
  minPowerKw?: number;
  status?: StationStatus[];
  isFree?: boolean;
  query?: string;
  userEmail?: string;
  userId?: string;
}
