import { ReactNode } from "react";
import { ImageSourcePropType, ViewProps } from "react-native";
import { ProductInterface } from "./ProductInterface";

export interface StoreItem extends ViewProps {
  id?: string;
  title?: string;
  icon?: ReactNode;
  onDelete?: () => void;
  onPress?: (id: string) => void;
  description?: string;
  website?: string;
}

export interface StoreLogo {
  onClose?: () => void;
  image?: ImageSourcePropType;
  business_name?: string;
  business_city?: string;
  is_online?: boolean;
}

export interface TopTrendingProduct {
  id?: string;
  name?: string;
  image?: string;
  price?: number;
  rating?: number;
  currency?: string;
  onPress?: (id: string | undefined) => void;
}

export default interface StoreStateInterface extends ViewProps {
  isStoreOpen: boolean;
  newProduct: ProductInterface;
}

export interface StoreItemContainerInterface extends ViewProps {
  id?: string;
  title?: string;
  icon?: ReactNode;
  onDelete?: () => void;
  onPress?: (id: string) => void;
  description?: string;
  website?: string;
}

// Analytics Dashboard Interfaces
export interface CustomerData {
  totalCustomers: number;
  newCustomers: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  customerLifetimeValue: number;
  repeatPurchaseRate: number;
  averageOrderFrequency: number;
  customerRetentionRate: number;
  currency: string;
}

export interface RevenueData {
  totalRevenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  revenueGrowth: {
    percentage: number;
    period: string;
    trend: "up" | "down" | "stable";
  };
  averageOrderValue: number;
  revenuePerCustomer: number;
  currency: string;
}

export interface ProductOverviewData {
  totalProducts: number;
  outOfStock: number;
  topSellingProduct: string;
  averageRating: number;
  inventoryTurnover: number;
}

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: React.ReactNode;
}

// Customer Analytics Interfaces
export interface CustomerChartData {
  demographicsData: DemographicsData[];
  acquisitionData: AcquisitionData[];
  behaviorData: BehaviorData[];
  segmentsData: SegmentsData[];
}

export interface DemographicsData {
  ageGroup: string;
  count: number;
  percentage: number;
}

export interface CustomerDemographicsChartProps {
  data: DemographicsData[];
}

export interface AcquisitionData {
  source: string;
  customers: number;
  cost: number;
}

export interface BehaviorData {
  segment: string;
  avgOrderValue: number;
  frequency: number;
  retention: number;
}

export interface CustomerBehaviorChartProps {
  data: BehaviorData[];
}

export interface SegmentsData {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CustomerSegmentsChartProps {
  data: SegmentsData[];
}

// Sales Analytics Interfaces
export interface ChartData {
  timeSeriesData: TimeSeriesData[];
  heatMapData: HeatMapData[];
  funnelData: FunnelData[];
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  width: number;
  height: number;
}

export interface BarChartData {
  period: string;
  revenue: number;
  orders: number;
}

export interface HeatMapData {
  dayOfWeek: number;
  hour: number;
  sales: number;
}

export interface HeatMapChartProps {
  data: HeatMapData[];
}

export interface FunnelData {
  stage: string;
  count: number;
  conversionRate: number;
}

export interface FunnelChartProps {
  data: FunnelData[];
}

// Product Analytics Interfaces
export interface TopSellingProduct {
  name: string;
  sales: number;
}

export interface TopSellingProductsChartProps {
  data: TopSellingProduct[];
}

export interface InventoryTurnoverData {
  month: string;
  turnover: number;
}

export interface InventoryTurnoverChartProps {
  data: InventoryTurnoverData[];
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface ProductConversionFunnelChartProps {
  data: FunnelStage[];
}

export interface ProductRatingData {
  rating: number;
  count: number;
}

export interface ProductRatingsChartProps {
  data: ProductRatingData[];
}

// Tab Button Interface
export interface TabButtonProps {
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

// Side Component Interfaces
export interface LogoAndDetailsInterface {
  onClose?: () => void;
  image?: any;
  business_name?: string;
  business_city?: string;
  on_line?: string;
}

export interface WebSidecomponentProps {
  user: any; // Replace with proper Seller type
  logout: () => void;
}
