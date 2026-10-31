import { DealInfo } from "@/app/interfaces/main/deals/deals";

// Unified interface for all product types (default, search, category, deals)
// All fields are optional except id and name to support different product sources
export default interface ProductCardInterface {
  // Required fields
  id: string;
  name: string;
  store?: string;
  description?: string;
  weight?: number;
  price?: number;
  selling_price?: number;
  image?: string | null;
  rating?: number;
  total_sold?: number;

  // Optional delivery fields
  distance?: string | number; // Can be string (formatted) or number (km)
  deliveryFee?: number;
  deliveryTime?: number; // in minutes

  // Optional deal fields
  deal_type?: string;
  deal?: DealInfo;
  discount_value?: number;
  discounted_price?: number;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  bogo_bundle_size?: number;
  bogo_bundle_paid_total?: number;
  bogo_bundle_items_total?: number;
  bundle_price?: number | null;
  discount?: number; // Optional discount percentage for UI display

  // Optional sponsored field
  // - Category API often uses is_sponsored
  // - Deal endpoints (get_todays_deals, get_deals_and_promotions) use isSponsored
  is_sponsored?: boolean;
  isSponsored?: boolean;
}

// Comprehensive interface for ProductDescriptionScreen data
export interface ProductDetailsInterface {
  id: string;
  name: string;
  description: string;
  images: string[];
  /** Remote video URLs from seller uploads */
  videos?: string[];
  price: number;
  selling_price?: number; 
  discounted_price: number;
  discount_value: number;
  deal?: DealInfo | null;
  bogo_bundle_size?: number;
  bogo_bundle_paid_total?: number;
  bogo_bundle_items_total?: number;
  discount_end_date: string;
  rating: number;
  category: string;
  subscription_plan: string;
  stock_status: "In Stock" | "Low Stock" | "Out of Stock";
  is_sponsored: boolean;
  shop_name: string;
  seller_info?: {
    ships_from: string;
    sold_by: string;
    shop_id: string;
  };
  shipping_fee: number;
  delivery_time_hours: number;
  delivery_location: string;
  distance: number;
  weight: number;
  info: string;
  return_policy: string;
  secure_transaction: boolean;
  import_fees: number;
  reviews: ReviewInterface[];
}

// Interface for product reviews
export interface ReviewInterface {
  username: string;
  rating: number;
  review: string;
}
