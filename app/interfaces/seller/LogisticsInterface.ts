// ─── Shared types ────────────────────────────────────────────────────────────

export type LogisticsJobStatus =
  | "draft"
  | "quoted"
  | "awaiting_payment"
  | "paid"
  | "dispatching"
  | "rider_assigned"
  | "en_route_pickup"
  | "at_pickup"
  | "picked_up"
  | "in_transit"
  | "at_dropoff"
  | "delivered"
  | "cancelled"
  | "failed"
  | "refunded";

export type VehicleType = "etrike" | "van";

export interface LogisticsAddress {
  contactName: string;
  contactPhone: string;
  companyName?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface LogisticsJobEvent {
  status: string;
  notes: string;
  actorType: string;
  createdAt: string;
}

export interface LogisticsJob {
  id: string;
  trackingCode: string;
  jobType: string;
  vehicleType: VehicleType;
  status: LogisticsJobStatus;
  quotedAmount: number | null;
  currency: string;
  isPriority: boolean;
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  pickupAddress: LogisticsAddress | null;
  dropoffAddress: LogisticsAddress | null;
  events: LogisticsJobEvent[];
  riderAssignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface CollectionQuote {
  vehicleType: VehicleType;
  logisticsFee: number;
  restockingFee: number;
  totalFee: number;
  currency: string;
  distanceKm: number;
  isPriority: boolean;
  expiresAt: string;
}

export interface BookCollectionResult {
  jobId: string;
  trackingCode: string;
  vehicleType: VehicleType;
  logisticsFee: string;
  restockingFee: string;
  totalFee: string;
  currency: string;
  inboundShipmentId: string;
  feeChargeId: number;
  clientSecret: string;
  paymentIntentId: string;
  ephemeralKey?: string;
  customer?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────
