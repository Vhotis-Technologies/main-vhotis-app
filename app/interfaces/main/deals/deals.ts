export interface DealsInterface {
  id: string;
  description: string;
  price: number;
  image: string;
  isSponsored?: boolean;
  isPopular?: boolean;
  rating: number;
  currency?: string;
  discount?: number;
}
/* Defines the todays deals component*/
export interface TodaysDealsInterface {
  id: string;
  deal_type: string;
  description: string;
  image: string | null;
  percentage?: number;
  onPress: (id: string) => void;
  // Product fields
  name?: string;
  price?: number;
  discounted_price?: number;
  weight?: number | null;
  rating?: number | null;
  deliveryFee?: number;
  deliveryTime?: number;
  distance?: number;
  isSponsored?: boolean;
  // Deal-specific fields
  discount_value?: number;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  bundle_price?: number | null;
  bundle_quantity?: number;
  // Cart actions
  onAddToCart?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

export default interface ItemsContextProviderInterface {}

/* Deal information interface for products on promotions */
export interface DealInfo {
  deal_id: number;
  deal_name: string;
  deal_type: "percentage" | "fixed" | "bogo" | "bundle" | "flash_sale";
  start_date: string | null;
  end_date: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  bundle_price?: number | null;
}

