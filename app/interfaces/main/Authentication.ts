export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: Address;
  is_user?: boolean;
  language?: string;
  photo?: any;
  has_active_membership?: boolean;
}

/* Extend the User interface to encapsulate the seller details properties */
export interface Seller {
  user_id: string;
  business_name?: string;
  business_city?: string;
  phone?: string;
  email?: string;
  business_description?: string;
  store_status?: string;
  is_verified?: boolean;
  address?: Address;
  is_operational?: boolean;
  is_seller?: boolean;
  is_store_admin?: boolean;
  seller_role?: "owner" | "store_admin";
  assigned_store_id?: string | null;
  rating?: number;
  language?: string;
  photo?: any;
  business_country?: string;
  subscription_plan?: string;
  has_active_subscription?: boolean;
  subscription_tier_code?: string;
  allows_bulk_import?: boolean;
  allows_seller_admins?: boolean;
  allows_promotions?: boolean;
  promotions_require_payment?: boolean;
  promotion_creation_fee?: string;
  listing_fee_amount?: string;
  max_products?: number | null;
  max_stores?: number | null;
  max_admins?: number | null;
  allows_public_storefront_url?: boolean;
  allows_product_share?: boolean;
  allows_fulfillment?: boolean;
  operating_mode?: "self_fulfill" | "fulfillment";
  is_virtual_store?: boolean;
  fulfillment_status?: string;
  has_fulfillment_profile?: boolean;
  market_verticals?: Array<{ slug: string; name: string }>;
}

export interface SigninFormData {
  email?: string;
  password?: string;
}

export interface GuestUser {
  guest_id: string;
  session_id: string;
  is_guest?: boolean;
  first_name?: string;
}

export interface Address {
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export function isStoreAdminUser(user: Seller | null | undefined): boolean {
  return Boolean(user?.is_store_admin || user?.seller_role === "store_admin");
}

/** Owner-only billing, payouts, and subscription management. */
export function canAccessSellerOwnerBilling(
  user: Seller | null | undefined,
): boolean {
  return Boolean(user?.is_seller) && !isStoreAdminUser(user);
}

export function canAccessSellerApp(user: Seller | null | undefined): boolean {
  return Boolean(user?.is_seller || user?.is_store_admin);
}

export interface AuthResponse {
  user: User | Seller;
  access: string;
  refresh: string;
}

export default interface AuthenticationState {
  user: User | Seller | GuestUser | null;
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  loginFormData: SigninFormData | null;
  isLoading: boolean;
  error: string | null;
}
