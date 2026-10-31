import { ImageSourcePropType, ViewProps } from "react-native";
export default interface ProductProviderInterface {}

export interface ProductImageAndDescriptionInterface extends ViewProps {
  id?: string;
  name?: string;
  description?: string;
  image?: ImageSourcePropType | any;
}

export interface Product {
  id?: string;
  name?: string;
  image?: any[];
}

export interface DealInterface {
  id: number;
  name: string;
  deal_type: "percentage" | "fixed" | "bogo" | "bundle" | "flash_sale";
  discount_percentage?: number | null;
  discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  minimum_purchase_amount?: number | null;
  maximum_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_count?: number;
  is_featured?: boolean;
}

export interface ProductReturnInterface extends ProductInterface {
  rating?: number;
  views?: number;
  status?: string;
  is_sponsored?: boolean;
  image?: string | null; // Single image for list view
  deals?: DealInterface[];
  has_active_deals?: boolean;
  active_deals_count?: number;
  created_at?: string;
  updated_at?: string;
  store_id?: string | null;
  store_name?: string | null;
  listing_status?: "draft" | "live" | "paused";
  seller_sku?: string;
  warehouse_on_hand?: number;
  warehouse_reserved?: number;
  warehouse_available?: number;
  listing_blockers?: string[];
  blocker_labels?: string[];
}

export interface ProductInterface {
  id?: string;
  name: string;
  description: string;
  price: number;
  selling_price?: number; 
  commission_rate?: number;
  category?: string;
  category_id?: number;
  size?: any;
  weight?: any;
  quantity?: number;
  images?: any[];
  videos?: any;
  information?: string;
}
