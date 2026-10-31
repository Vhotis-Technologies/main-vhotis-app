export interface SellerStoreSummary {
  id: string;
  business_name: string;
  business_city?: string;
  business_country?: string;
  status?: string;
  is_active?: boolean;
  is_virtual?: boolean;
  product_count?: number;
}

export interface SellerPlanLimits {
  max_stores: number | null;
  active_stores: number;
  can_add_store: boolean;
  over_store_limit: boolean;
  max_admins: number | null;
  active_admins: number;
  can_add_admin: boolean;
  over_admin_limit: boolean;
  allows_seller_admins: boolean;
}

export interface SellerStoresResponse {
  stores: SellerStoreSummary[];
  limits?: SellerPlanLimits;
}

export interface CreateStoreRequest {
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  businessCity: string;
  businessPostcode: string;
  businessCountry: string;
  businessPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateStoreResponse {
  message: string;
  store: SellerStoreSummary;
  limits?: SellerPlanLimits;
}

export interface SellerStoreDetails {
  id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_city: string;
  business_zip_code: string;
  business_country: string;
  business_phone?: string;
  status?: string;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  weekday_open?: string | null;
  weekday_close?: string | null;
  weekend_open?: string | null;
  weekend_close?: string | null;
  slug?: string | null;
}

export interface SellerStoreDetailsResponse {
  store: SellerStoreDetails;
}
