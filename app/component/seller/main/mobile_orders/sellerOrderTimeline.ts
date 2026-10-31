import { getStatusLabel } from "@/app/component/main/mobile/orders/orderHelpers";

export interface SellerTimelineStep {
  key: string;
  label: string;
  date?: Date;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface SellerTimelineInput {
  orderStatus?: string;
  claimStatus?: string;
  createdAt?: string;
  notifiedAt?: string;
  acceptedAt?: string | null;
  updatedAt?: string;
}

const SELLER_TIMELINE_STEPS = [
  { key: "order_received", label: "Order Received", rank: 0 },
  { key: "claimed", label: "Claimed", rank: 1 },
  { key: "ready_for_pickup", label: "Ready for Pickup", rank: 2 },
  { key: "collected", label: "Collected", rank: 3 },
  { key: "in_transit", label: "In Transit", rank: 4 },
  { key: "delivered", label: "Delivered", rank: 5 },
] as const;

const ORDER_STATUS_TO_STEP_RANK: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  partially_fulfilled: 1,
  searching_rider: 2,
  rider_assigned: 2,
  rider_accepted: 2,
  rider_arrived_pickup: 2,
  picked_up: 3,
  in_transit: 4,
  rider_arrived_delivery: 4,
  shipped: 4,
  delivered: 5,
  cancelled: -1,
  returned: -1,
  refund_requested: -1,
  refunded: -1,
};

const ACTIVE_ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "partially_fulfilled",
  "searching_rider",
  "rider_assigned",
  "rider_accepted",
  "rider_arrived_pickup",
  "picked_up",
  "in_transit",
  "rider_arrived_delivery",
  "shipped",
]);

function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function resolveStepRank(input: SellerTimelineInput): number {
  const orderStatus = (input.orderStatus ?? "pending").toLowerCase();
  const claimStatus = (input.claimStatus ?? "pending").toLowerCase();

  let rank = ORDER_STATUS_TO_STEP_RANK[orderStatus] ?? 0;

  if (claimStatus === "claimed" && rank < 1) {
    rank = 1;
  }

  if (
    ["searching_rider", "rider_assigned", "rider_accepted", "rider_arrived_pickup"].includes(
      orderStatus,
    ) &&
    rank < 2
  ) {
    rank = 2;
  }

  return rank;
}

function resolveStepDate(
  stepKey: (typeof SELLER_TIMELINE_STEPS)[number]["key"],
  input: SellerTimelineInput,
  stepRank: number,
  currentRank: number,
): Date | undefined {
  switch (stepKey) {
    case "order_received":
      return parseDate(input.notifiedAt) ?? parseDate(input.createdAt);
    case "claimed":
      return parseDate(input.acceptedAt);
    case "ready_for_pickup":
    case "collected":
    case "in_transit":
    case "delivered":
      if (stepRank <= currentRank) {
        return parseDate(input.updatedAt);
      }
      return undefined;
    default:
      return undefined;
  }
}

export function buildSellerOrderTimeline(
  input: SellerTimelineInput,
): SellerTimelineStep[] {
  const currentRank = resolveStepRank(input);

  return SELLER_TIMELINE_STEPS.map((step) => {
    const isCompleted = currentRank >= 0 && step.rank <= currentRank;
    const isCurrent = currentRank >= 0 && step.rank === currentRank;

    return {
      key: step.key,
      label: step.label,
      date: resolveStepDate(step.key, input, step.rank, currentRank),
      isCompleted,
      isCurrent,
    };
  });
}

export function getSellerTimelineStatusLabel(input: SellerTimelineInput): string {
  const orderStatus = input.orderStatus?.toLowerCase();
  if (orderStatus) {
    return getStatusLabel(orderStatus);
  }

  const claimStatus = input.claimStatus?.toLowerCase();
  if (claimStatus === "claimed") return "Claimed";
  if (claimStatus === "pending") return "Awaiting Claim";
  if (claimStatus === "expired") return "Expired";
  if (claimStatus === "failed") return "Cancelled";

  return "Pending";
}

export function shouldPollSellerOrderDetail(orderStatus?: string): boolean {
  if (!orderStatus) return false;
  return ACTIVE_ORDER_STATUSES.has(orderStatus.toLowerCase());
}
