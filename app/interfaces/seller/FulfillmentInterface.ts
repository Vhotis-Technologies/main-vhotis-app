/**
 * Single source of truth for every fulfillment / WMS type used in the app.
 *
 * This file deliberately holds ALL fulfillment-related types:
 *   - Enrollment status (onboarding)
 *   - Live WMS domain types (inbound shipments, manifest lines, receipts)
 *   - Dashboard API row types
 *   - The local manifest-builder slice types
 *   - The dashboard UI / mock view types
 *
 * API clients, slices, hooks and screens all import from here.
 */

// ─── Enrollment ────────────────────────────────────────────────────────────

export type FulfillmentEnrollmentStatus = "none" | "pending" | "active";

export const FULFILLMENT_STORAGE_KEY = "vhotis_fulfillment_status";

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentEnrollmentStatus, string> = {
  none: "Not enrolled",
  pending: "Pending approval",
  active: "Active",
};

// ─── WMS domain ──────────────────────────────────────────────────────────────

export type InboundStatus =
  | "draft"
  | "awaiting_payment"
  | "scheduled"
  | "collection_dispatched"
  | "in_transit"
  | "arrived"
  | "receiving"
  | "received"
  | "partial_received"
  | "cancelled"
  | "rejected";

export type InboundDeliveryMethod = "seller_delivery" | "vhotis_collection";

export type ManifestUnit =
  | "units"
  | "kg"
  | "bags"
  | "cartons"
  | "boxes"
  | "pallets"
  | "litres";

export interface ManifestLine {
  id: number;
  declaredName: string;
  declaredSku: string;
  declaredSize: string;
  declaredQuantity: number;
  declaredUnit: ManifestUnit;
  declaredWeightKg: number | null;
  declaredPrice: number | null;
  declaredDescription: string;
  categoryId: number | null;
  categoryName: string | null;
  imageUrls: string[];
  isTemperatureSensitive: boolean;
  requiresFrozen: boolean;
  catalogProductId: string | null;
  catalogProductName: string | null;
  notes: string;
}

export interface ReceiptLine {
  id: number;
  manifestLine: number | null;
  product: string | null;
  productName: string | null;
  receivedQuantity: number;
  damagedQuantity: number;
  acceptedQuantity: number;
  status: "pending" | "accepted" | "partial" | "rejected";
  location: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InboundShipment {
  id: string;
  status: InboundStatus;
  deliveryMethod: InboundDeliveryMethod;
  warehouseCode: string;
  warehouseName: string;
  referenceNotes: string;
  expectedArrivalAt: string | null;
  restockingFeeAmount: string;
  restockingFeeCharged: boolean;
  logisticsJobId: string | null;
  /** Present in list responses (count only) */
  manifestLineCount: number;
  /** Present in detail responses (full array) */
  manifestLines?: ManifestLine[];
  /** Present in detail responses (ops receipt records) */
  receiptLines?: ReceiptLine[];
  totalDeclaredWeightKg: number | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestockingFeeQuote {
  restockingFeeAmount: number;
  currency: string;
  totalManifestLines: number;
  totalDeclaredWeightKg: number | null;
}

export interface SubmitPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: string;
  currency: string;
  shipmentId: string;
  feeChargeId: number;
  /** Optional — present so the native payment sheet can show saved cards. */
  ephemeralKey?: string;
  customer?: string;
}

// ─── Dashboard API row types ─────────────────────────────────────────────────

export interface DashboardWarehouse {
  code: string;
  name: string;
  city: string;
  allocatedCbm: number;
  usedCbm: number;
  palletSlots: number;
  palletsUsed: number;
}

/** Per-zone rented capacity vs measured on-hand CBM (Phase 2). */
export interface StorageZoneUsage {
  zone: string;
  label: string;
  unit: string;
  allocated: string;
  allocatedCbm: number;
  usedCbm: number;
  utilizationPct: number;
}

export interface StorageUsageSummary {
  subscriptionId: number;
  status: string;
  renews: boolean;
  spaceUnit: string;
  currency: string;
  periodTotal: string;
  periodStart: string | null;
  periodEnd: string | null;
  cancelledAt: string | null;
  allocatedCbm: number;
  usedCbm: number;
  utilizationPct: number;
  zones: StorageZoneUsage[];
}

export interface DashboardOverviewStats {
  ordersInProgress: number;
  ordersShippedToday: number;
  inboundInTransit: number;
  lowStockSkus: number;
  pendingRestocks: number;
  pendingListings: number;
  liveListings: number;
}

export interface PendingListingRow {
  productId: string;
  name: string;
  sellerSku: string;
  listingStatus: "draft" | "live" | "paused";
  warehouseAvailable: number;
  blockers: string[];
  blockerLabels: string[];
}

export interface MergedCatalogItem {
  id: string | number;
  name: string;
  sellerSku: string;
  price: number;
  description?: string;
  listingStatus: "draft" | "live" | "paused";
  category?: string | null;
  categoryId?: number | null;
  warehouseOnHand: number;
  warehouseReserved: number;
  warehouseAvailable: number;
  listingBlockers: string[];
  blockerLabels: string[];
  hasImages: boolean;
  imageCount: number;
  image?: string | null;
  views?: number;
  status?: string;
}

export interface MergedCatalogResponse {
  results: MergedCatalogItem[];
  count: number;
  next: boolean;
  previous: boolean;
  page: number;
  page_size: number;
}

export interface DashboardOverview {
  warehouse: DashboardWarehouse;
  storageUsage: StorageUsageSummary | null;
  overview: DashboardOverviewStats;
  pendingListings: PendingListingRow[];
}

/** One summary line in a pick/pack fee breakdown (base, pick, weight, cold). */
export interface FeeBreakdownLine {
  code: string;
  label: string;
  quantity: number;
  unitAmount: string | null;
  amount: string;
}

/**
 * Flat warehouse labour fee breakdown for one fulfillment request.
 * Accrued on pack; billed monthly — not the Connect 2.5% processing fee.
 */
export interface FeeBreakdown {
  currency: string;
  baseFee: string;
  pickFeeUnit: string;
  pickUnits: number;
  pickFeeTotal: string;
  weightSurchargeTotal: string;
  coldChainTotal: string;
  orderFeeAmount: string;
  fulfillmentFeeAmount: string;
  total: string;
  lines: FeeBreakdownLine[];
  status?: string;
  billingNote?: string;
}

export interface DashboardOrder {
  id: string;
  customerOrderId: string;
  status: string;
  itemCount: number;
  placedAt: string | null;
  dispatchedAt: string | null;
  packedAt: string | null;
  customerCity: string;
  slaLabel: string;
  /** Pick/weight/cold subtotal (excludes order base). */
  fulfillmentFee: string;
  /** Per-order base warehouse fee. */
  orderFee: string;
  /** orderFee + fulfillmentFee. */
  feeTotal: string;
  feeCurrency: string;
  feesCharged: boolean;
  feeBreakdown: FeeBreakdown | null;
}

/** Calendar-month warehouse invoice for a fulfillment seller. */
export interface BillingStatement {
  id: number;
  billingMonth: string;
  storageCharges: string;
  fulfillmentCharges: string;
  receivingCharges: string;
  logisticsCharges: string;
  totalCharged: string;
  status: string;
  stripeInvoiceId: string;
  finalisedAt: string | null;
}

/** Single ledger line on a monthly warehouse statement. */
export interface BillingCharge {
  id: number;
  feeType: string;
  amount: string;
  currency: string;
  quantity: string;
  status: string;
  description: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

/** Open-month pending labour total shown on the Billing tab. */
export interface BillingAccruing {
  billingPeriodStart: string;
  pendingFulfillmentTotal: string;
  currency: string;
}

export interface DashboardInventoryRow {
  id: number;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityDamaged: number;
  lowStockThreshold: number | null;
  locationCode: string | null;
  status: "ok" | "low_stock" | "out_of_stock";
  listingStatus: "draft" | "live" | "paused";
  listingBlockers: string[];
  blockerLabels: string[];
  lastMovementAt: string | null;
}

export interface DashboardRestockRow {
  productId: string;
  productName: string;
  sku: string;
  warehouseAvailable: number;
  reorderPoint: number;
  urgency: "high" | "medium" | "low";
  suggestedUnits: number;
  daysUntilStockout: number | null;
}

export interface DashboardHistoryRow {
  id: number;
  movementType: string;
  title: string;
  detail: string;
  productId: string;
  productName: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  occurredAt: string;
}

// ─── Manifest builder slice ──────────────────────────────────────────────────

/**
 * A single item the seller is building locally, before anything is sent to the
 * server. `clientId` is the local key; `serverId` is set once the line has been
 * persisted to the API on submit.
 */
export interface DraftManifestLine {
  clientId: string;
  serverId?: number;
  declared_name: string;
  declared_sku: string;
  declared_size: string;
  declared_quantity: number;
  declared_unit: ManifestUnit;
  declared_weight_kg?: number;
  declared_price: number;
  declared_description: string;
  category_id: number | null;
  category_name?: string;
  image_urls: string[];
  is_temperature_sensitive: boolean;
  requires_frozen: boolean;
  notes: string;
}

export interface ManifestBuilderState {
  /** Set only after the shipment is created on submit. */
  shipmentId: string | null;
  /** Resolved from the seller's profile when the shipment is created. */
  deliveryMethod: InboundDeliveryMethod;
  referenceNotes: string;
  lines: DraftManifestLine[];
}

// ─── Dashboard UI / mock view types ──────────────────────────────────────────

export type FulfillmentDashboardTab =
  | "overview"
  | "inbound"
  | "orders"
  | "billing"
  | "restocks"
  | "history"
  | "inventory";

export interface FulfillmentTimelineEntry {
  id: string;
  label: string;
  occurredAt: string;
  note?: string;
}

export interface FulfillmentLineItem {
  sku: string;
  productName: string;
  quantityExpected?: number;
  quantityReceived?: number;
  quantityOrdered?: number;
  quantityPicked?: number;
}

export interface FulfillmentWarehouseSummary {
  code: string;
  name: string;
  city: string;
  allocatedCbm: number;
  usedCbm: number;
  palletSlots: number;
  palletsUsed: number;
}

export interface FulfillmentOverviewStats {
  ordersInProgress: number;
  ordersShippedToday: number;
  inboundInTransit: number;
  lowStockSkus: number;
  pendingRestocks: number;
}

export interface FulfillmentInboundShipment {
  id: string;
  status: "draft" | "scheduled" | "in_transit" | "receiving" | "received";
  method: "seller_delivery" | "vhotis_collection";
  expectedArrival: string;
  unitsExpected: number;
  unitsReceived?: number;
  reference: string;
  createdAt: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  receivedAt?: string;
  warehouseName: string;
  carrier?: string;
  trackingNumber?: string;
  pickupAddress?: string;
  contactName?: string;
  contactPhone?: string;
  lineItems: FulfillmentLineItem[];
  timeline: FulfillmentTimelineEntry[];
  notes?: string;
}

export interface FulfillmentWarehouseOrder {
  id: string;
  customerOrderId: string;
  status: "reserved" | "picking" | "packed" | "dispatched" | "delivered";
  itemCount: number;
  placedAt: string;
  slaLabel: string;
  customerCity: string;
  deliveryWindow?: string;
  warehouseName: string;
  lineItems: FulfillmentLineItem[];
  timeline: FulfillmentTimelineEntry[];
  subtotal: number;
  fulfillmentFee: number;
  riderName?: string;
  trackingRef?: string;
}

export interface FulfillmentRestockSuggestion {
  id: string;
  productName: string;
  sku: string;
  warehouseAvailable: number;
  reorderPoint: number;
  suggestedUnits: number;
  urgency: "low" | "medium" | "high";
  category: string;
  avgDailySales: number;
  daysUntilStockout: number;
  lastInboundId?: string;
  lastInboundAt?: string;
  warehouseBin?: string;
  timeline: FulfillmentTimelineEntry[];
  notes?: string;
}

export interface FulfillmentHistoryEvent {
  id: string;
  type: "inbound" | "order" | "restock" | "adjustment";
  title: string;
  detail: string;
  occurredAt: string;
  relatedRef?: string;
  relatedKind?: "inbound" | "order" | "restock" | "inventory";
  actor?: string;
  timeline: FulfillmentTimelineEntry[];
  metadata?: Record<string, string>;
}

export interface FulfillmentWarehouseProduct {
  id: string;
  name: string;
  sku: string;
  image?: string;
  category: string;
  catalogQuantity: number;
  warehouseOnHand: number;
  warehouseReserved: number;
  warehouseAvailable: number;
  status: "active" | "draft" | "low_stock";
  warehouseBin?: string;
  lastCountedAt?: string;
  lastInboundAt?: string;
  lastInboundId?: string;
  reorderPoint?: number;
  timeline: FulfillmentTimelineEntry[];
  recentMovements: FulfillmentLineItem[];
}

export interface FulfillmentDashboardData {
  warehouse: FulfillmentWarehouseSummary;
  overview: FulfillmentOverviewStats;
  inbound: FulfillmentInboundShipment[];
  orders: FulfillmentWarehouseOrder[];
  restocks: FulfillmentRestockSuggestion[];
  history: FulfillmentHistoryEvent[];
  inventory: FulfillmentWarehouseProduct[];
}

export type FulfillmentDetailView =
  | { kind: "inbound"; data: FulfillmentInboundShipment }
  | { kind: "order"; data: FulfillmentWarehouseOrder }
  | { kind: "restock"; data: FulfillmentRestockSuggestion }
  | { kind: "history"; data: FulfillmentHistoryEvent }
  | { kind: "inventory"; data: FulfillmentWarehouseProduct };
