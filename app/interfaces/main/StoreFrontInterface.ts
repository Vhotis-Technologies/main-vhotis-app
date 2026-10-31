import { DealInfo } from "@/app/interfaces/main/deals/deals";

export interface StoreFrontProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  discounted_price?: number;
  discount_value?: number;
  deal?: DealInfo;
}

export interface StoreFrontDealSummary {
  deal_id: number;
  name: string;
  deal_type: string;
  end_date?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  bundle_price?: number | null;
}

export interface StoreFrontCategory {
  id: string;
  name: string;
  image: string | null;
  product_count: number;
}

export interface StoreFrontDelivery {
  distance_km: number | null;
  distance_label: string | null;
  delivery_fee: number | null;
  delivery_time_minutes: number | null;
}

export interface StoreOpeningHours {
  weekday_open: string | null;
  weekday_close: string | null;
  weekend_open: string | null;
  weekend_close: string | null;
}

export interface StoreFrontData {
  store_id: string;
  store_name: string;
  tagline: string;
  status: "open" | "closed" | "suspended";
  is_operational: boolean;
  average_rating: number;
  ratings_count: number;
  total_products: number;
  total_orders: number;
  business_website?: string | null;
  opening_hours: StoreOpeningHours;
  delivery?: StoreFrontDelivery;
  active_deals: StoreFrontDealSummary[];
  categories: StoreFrontCategory[];
  featured_products: StoreFrontProduct[];
  popular_products: StoreFrontProduct[];
  new_arrivals: StoreFrontProduct[];
  contact_info?: {
    phone?: string;
    address?: string;
    city?: string;
    zip_code?: string;
    country?: string;
  };
  public_slug?: string | null;
}

export interface StoreFrontResponse {
  success: boolean;
  data: StoreFrontData;
  message?: string;
}
