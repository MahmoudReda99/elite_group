export type UserRole = 'ADMIN' | 'OPERATOR';
export type FreightStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TrackingStatus =
  | 'BOOKING_RECEIVED'
  | 'VESSEL_SCHEDULED'
  | 'DEPARTED'
  | 'TRANSSHIPMENT'
  | 'ARRIVED'
  | 'CUSTOMS_CLEARANCE'
  | 'DELIVERED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface FreightService {
  id: string;
  title: string;
  originCountry: string;
  originPort: string;
  destinationCountry: string;
  destinationPort: string;
  tradeLane: string;
  cargoType: string;
  containerType: string;
  vesselName: string;
  voyageNumber: string;
  etd: string;
  eta: string;
  scheduleMonth: string;
  validFrom: string;
  validTo: string;
  oceanFreight: string | number;
  thc: string | number;
  currency: string;
  freeTimeNotes?: string;
  remarks?: string;
  status: FreightStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContainerType {
  id: string;
  name: string;
  description: string;
  capacityInfo: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  active?: boolean;
}

export interface TrackingEvent {
  id: string;
  status: TrackingStatus;
  location: string;
  eventDate: string;
  notes?: string;
}

export interface TrackingRecord {
  id: string;
  trackingNumber: string;
  customerName: string;
  originPort: string;
  destinationPort: string;
  vesselName?: string;
  voyageNumber?: string;
  currentStatus: TrackingStatus;
  published: boolean;
  events: TrackingEvent[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  originPort: string;
  destinationPort: string;
  cargoType: string;
  containerType: string;
  readyDate?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export type DatabaseFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'json';

export interface DatabaseField {
  key: string;
  label: string;
  type: DatabaseFieldType;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  enumValues?: string[];
}

export interface DatabaseTable {
  key: string;
  label: string;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  fields: DatabaseField[];
}

export type DatabaseRow = Record<string, unknown> & { id: string };
