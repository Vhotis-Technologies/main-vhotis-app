/**
 * Helper functions for order status display
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "partially_fulfilled"
  | "searching_rider"
  | "rider_assigned"
  | "rider_accepted"
  | "rider_arrived_pickup"
  | "picked_up"
  | "in_transit"
  | "rider_arrived_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refund_requested"
  | "refunded"
  | "shipped";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  partially_fulfilled: "Partially Fulfilled",
  searching_rider: "Finding Rider",
  rider_assigned: "Rider Assigned",
  rider_accepted: "Rider On The Way",
  rider_arrived_pickup: "Rider At Pickup",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  rider_arrived_delivery: "Rider Arrived",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
  shipped: "Shipped",
};

const TRACKABLE_STATUSES = new Set([
  "searching_rider",
  "rider_assigned",
  "rider_accepted",
  "rider_arrived_pickup",
  "picked_up",
  "in_transit",
  "rider_arrived_delivery",
  "shipped",
  "pending",
]);

export const getStatusLabel = (status: string): string => {
  const key = status.toLowerCase();
  return STATUS_LABELS[key] ?? status.replace(/_/g, " ");
};

export const isTrackableOrderStatus = (status: string): boolean =>
  TRACKABLE_STATUSES.has(status.toLowerCase());

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "#28A745";
    case "in_transit":
    case "picked_up":
    case "rider_arrived_delivery":
    case "shipped":
      return "#17A2B8";
    case "searching_rider":
    case "rider_assigned":
    case "rider_accepted":
    case "rider_arrived_pickup":
      return "#0D6EFD";
    case "confirmed":
    case "partially_fulfilled":
      return "#FFC107";
    case "pending":
      return "#6C757D";
    case "cancelled":
      return "#DC3545";
    case "returned":
    case "refund_requested":
    case "refunded":
      return "#6F42C1";
    default:
      return "#6C757D";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "checkmark-circle";
    case "in_transit":
    case "picked_up":
    case "shipped":
      return "car";
    case "searching_rider":
      return "search";
    case "rider_assigned":
    case "rider_accepted":
      return "bicycle";
    case "rider_arrived_pickup":
    case "rider_arrived_delivery":
      return "location";
    case "confirmed":
    case "partially_fulfilled":
      return "checkmark";
    case "pending":
      return "time";
    case "cancelled":
      return "close-circle";
    case "returned":
    case "refund_requested":
    case "refunded":
      return "return-up-back";
    default:
      return "help-circle";
  }
};

const DELIVERED_TO_LABELS: Record<string, string> = {
  left_at_door: "Left at door",
  neighbor: "Neighbor",
  reception: "Reception / Concierge",
  other: "Other",
  customer: "Handed to customer",
};

export const getDeliveredToLabel = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  return DELIVERED_TO_LABELS[value] ?? value.replace(/_/g, " ");
};

const CARD_BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
};

export const formatCardBrand = (brand?: string | null): string => {
  if (!brand) {
    return "Card";
  }

  const normalized = brand.toLowerCase();
  return (
    CARD_BRAND_LABELS[normalized] ??
    brand.charAt(0).toUpperCase() + brand.slice(1)
  );
};

export const formatOrderPaymentMethod = (
  paymentMethod?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null
): string => {
  if (!paymentMethod?.last4) {
    return "Card payment";
  }

  const month = String(paymentMethod.exp_month).padStart(2, "0");
  const year =
    paymentMethod.exp_year > 99
      ? String(paymentMethod.exp_year)
      : String(paymentMethod.exp_year).padStart(2, "0");

  return `${formatCardBrand(paymentMethod.brand)} •••• ${paymentMethod.last4} · ${month}/${year}`;
};
