import { ReactNode } from "react";
import { ViewProps } from "react-native";
import TopTrendingProductsInterface from "./SharedInterfaces";

export interface DashboardDataDisplayInterface {
  title?: string;
  lastPeriod?: any;
  currentPeriod?: any;
  currency?: string;
}

export interface SellerDashboardState {
  defaultDashboardData: DashboardDataDisplayInterface[];
  categoryReachData: CategoryDataReach;
  trendingProducts: TopTrendingProductsInterface[];
  orderInformationData: OrderInformationData;
  isFetching: boolean;
  error: string;
}

export interface DashboardItemInterface extends ViewProps {
  icon?: React.ReactNode;
  title?: string;
  data?: any;
  variant?: "primary" | "secondary" | "tertiary";
  onPress?: () => void;
}

export interface ChartDataPoint {
  value: number;
  date: string;
  color: string;
}

export interface DashboardChartProps {
  orderData: ChartDataPoint[];
  revenueData: ChartDataPoint[];
}

export interface DashboardProviderInterface {}

// Interface declaration for the reach views which would defines the number of data contained in a row.
// Each rows are in a day format and each day contains a value
export interface DailyViewsInterface {
  Mon: any;
  Tue: any;
  Wed: any;
  Thu: any;
  Fri: any;
  Sat: any;
  Sun: any;
}
export interface ProductReachInterface {
  id: string;
  name: string;
  reach: DailyViewsInterface;
}

export interface CategoryDataReach {
  [categoryName: string]: {
    id: number;
    views: DailyViewsInterface;
  };
}
export interface OrderInformationData {
  delivered: number;
  shipped: number;
  returned: number;
  total: number;
}

export interface OrderStatusProps {
  label: string;
  value: number;
  color: string;
}
export interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  data: {
    delivered: number;
    shipped: number;
    returned: number;
    total: number;
  };
}

export interface SalesDataPoint {
  value: number;
  label: string;
  frontColor?: string;
  date: any;
}

export interface TotalSalesData {
  data: SalesDataPoint[];
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  periodType?: "weekly" | "monthly";
}

export interface TotalSalesResponse {
  salesData: TotalSalesData;
  error?: string;
}

export interface TopProductStatisticsInterface {
  id: string;
  name: string;
  description: string;
  price: number;
  selling_price: number;
  quantity: number;
  size: string;
  weight: string;
  rating: number;
  category_name: string | null;
  category_id: number | null;
  is_sponsored: boolean;
  images: string[];
  videos: string[];
  total_revenue: number;
  total_views: number;
  total_sales: number;
  total_orders: number;
  created_at: string | null;
  updated_at: string | null;
}