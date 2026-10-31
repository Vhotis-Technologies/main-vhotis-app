export type LinkVisitsTimeframe = "7d" | "30d" | "90d";

export interface LinkVisitSummary {
  total_visits: number;
  unique_visitors: number;
  app_opens: number;
  app_open_rate: number;
}

export interface LinkVisitChannelStats {
  total_visits: number;
  unique_visitors: number;
  app_opens: number;
}

export interface LinkVisitStoreLinkStats extends LinkVisitChannelStats {
  available: boolean;
  slug: string | null;
}

export interface LinkVisitDailyPoint {
  date: string;
  product_visits: number;
  store_visits: number;
  app_opens: number;
}

export interface LinkVisitTopProduct {
  product_id: string;
  name: string;
  visits: number;
  unique_visitors: number;
  app_opens: number;
}

export interface LinkVisitBreakdownItem {
  device?: string;
  source?: string;
  count: number;
}

export interface LinkVisitsResponse {
  success: boolean;
  timeframe: LinkVisitsTimeframe;
  period: {
    start: string;
    end: string;
  };
  summary: LinkVisitSummary;
  store_link: LinkVisitStoreLinkStats;
  product_links: LinkVisitChannelStats;
  daily_series: LinkVisitDailyPoint[];
  top_products: LinkVisitTopProduct[];
  by_device: LinkVisitBreakdownItem[];
  by_source: LinkVisitBreakdownItem[];
}
