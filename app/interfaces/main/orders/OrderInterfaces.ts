export interface OrderPaymentMethod {
  type: "card";
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface OrderItem {
  id: string | number;
  product_id: string;
  product?: string;
  product_name?: string;
  product_description?: string;
  quantity: number;
  sub_total: number;
  unit_price?: number;
  selling_price?: number; // Price with commission (what buyers see)
  image?: string;
  created_at?: string;
}

export interface DeliveryAddress {
  id: string;
  delivery_name?: string;
  address: string;
  address2?: string;
  city: string;
  zip_code: string;
  country: string;
  full_address: string;
  latitude?: number;
  longitude?: number;
}

export interface UserContact {
  name: string;
  email: string;
  phone?: string;
  user_id: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_items: OrderItem[];
  total_amount: number;
  shipping_cost: number;
  tax_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "partially_fulfilled"
    | "searching_rider"
    | "rider_assigned"
    | "rider_accepted"
    | "rider_arrived_pickup"
    | "picked_up"
    | "in_transit"
    | "rider_arrived_delivery"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refund_requested"
    | "refunded"
    | "shipped";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: OrderPaymentMethod | null;
  delivery_address?: DeliveryAddress;
  user_contact: UserContact;
  delivery_code?: string;
  delivery_code_expires_at?: string;
  delivery_code_verified_at?: string;
  delivery_left_at_door: boolean;
  delivery_photo_required: boolean;
  delivery_photo_url?: string | null;
  delivery_delivered_to?: string | null;
  delivery_proof_notes?: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
  is_reviewed?: boolean;
}

export interface OrderReviewSummary {
  average_rating: number;
  submitted_at: string;
}

export interface OrderDetails extends Order {
  items_subtotal: number;
  delivery_code_generated_at?: string;
  is_reviewed?: boolean;
  order_review?: OrderReviewSummary | null;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  item_count: number;
  first_item_name?: string;
  first_item_image?: string;
}
