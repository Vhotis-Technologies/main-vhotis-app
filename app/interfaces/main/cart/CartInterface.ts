export interface CartItems {
  id: string;
  cart_item_id: string;
  image: string;
  product_name: string;
  price: number;
  selling_price?: number;
  discounted_price?: number;
  quantity: number;
  quantity_paid?: number;
  quantity_free?: number;
  sub_total: number;
  promotion_applied?: {
    deal_id?: number | string;
    deal_name?: string;
    deal_type?: string;
    bogo_buy_quantity?: number;
    bogo_get_quantity?: number;
  } | null;
}

export interface MembershipBenefits {
  is_member: boolean;
  free_delivery_available: boolean;
  free_delivery_used: boolean;
  delivery_benefit_applied: "free" | "free_over_threshold" | "none";
  priority_included: boolean;
  cart_subtotal: number;
  order_free_delivery_threshold: number;
}

export interface CartCalculation {
  sub_total: number;
  total?: number;            // legacy field (kept for backward compatibility)
  total_amount?: number;     // canonical field used by API responses
  vat: number;
  service_fee: number;
  delivery_fee: number;
  delivery_time: number;
  priority_fee?: number;
  is_priority?: boolean;
  membership_benefits?: MembershipBenefits;
  minimum_order_amount?: number;
  meets_minimum_order?: boolean;
  minimum_order_shortfall?: number;
}

export interface CheckoutApiResponse {
  checkout_data: {
    vat: number;
    service_fee: number;
    delivery_fee: number;
    priority_fee?: number;
    is_priority?: boolean;
    sub_total: number;
    total_amount: number;
  };
}

export interface CartMessageResponse {
  message: string;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  cart_item?: CartItems;
  error?: string;
}

export default interface CartInitialState {
  cartItems: CartItems[];
  cartCalculation: CartCalculation;
  isLoading: boolean;
  error: string | null;
}
