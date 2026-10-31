import { PromotionHistoryInterface } from "@/app/interfaces/seller/PromotionsInterface";

export type CampaignStatus = PromotionHistoryInterface["status"];

export type CampaignHistorySection = {
  title: string;
  data: PromotionHistoryInterface[];
};

const STATUS_ORDER: CampaignStatus[] = ["active", "scheduled", "expired"];

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Ended",
};

export function getStatusTheme(status: CampaignStatus, accent: string) {
  switch (status) {
    case "active":
      return { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" };
    case "expired":
      return { bg: "#FFEBEE", text: "#C62828", border: "#EF9A9A" };
    case "scheduled":
      return { bg: `${accent}18`, text: accent, border: `${accent}40` };
    default:
      return { bg: "#F5F5F5", text: "#424242", border: "#E0E0E0" };
  }
}

export function groupCampaignsByStatus(
  items: PromotionHistoryInterface[],
): CampaignHistorySection[] {
  const buckets = new Map<CampaignStatus, PromotionHistoryInterface[]>();
  for (const item of items) {
    const list = buckets.get(item.status) ?? [];
    list.push(item);
    buckets.set(item.status, list);
  }

  return STATUS_ORDER.flatMap((status) => {
    const data = buckets.get(status);
    if (!data?.length) return [];
    return [{ title: STATUS_LABELS[status], data }];
  });
}

export function summarizeCampaigns(items: PromotionHistoryInterface[]) {
  const active = items.filter((i) => i.status === "active").length;
  const scheduled = items.filter((i) => i.status === "scheduled").length;
  const totalSales = items.reduce((sum, i) => sum + i.performance.sales, 0);
  return { total: items.length, active, scheduled, totalSales };
}

export function formatCampaignDateRange(start: Date, end: Date) {
  const fmt = (date: Date) =>
    date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}
