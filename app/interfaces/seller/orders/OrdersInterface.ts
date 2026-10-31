export default interface OrdersContextInterface {}

export interface OrdersDataInterface {
  title?: string;
  amount?: number;
  fufilment_rate?: any;
  onPress?: () => void;
  onIconPress?: () => void;
}

export interface RevenueDataInterface {
  total_revenue: number;
  total_orders: number;
  fulfillment_rate: number;
  currency: string;
}

export default interface MobileOrderProviderInterface {}

export interface OrderDeliveryAddressInterface {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderTimelineInterface {
  id?: string;
  orderConfirmed?: {
    date: Date;
    status: "confirmed";
  };
  packed?: {
    date: Date;
    status: "packed";
  };
  collected?: {
    date: Date;
    status: "collected";
  };
  enroute?: {
    date: Date;
    status: "enroute";
  };
  delivered?: {
    date: Date;
    status: "delivered";
  };
  confirmed?: {
    date: Date;
    status: "confirmed";
  };
}

export interface OrderSummaryItemInterface {
  title: string;
  value: string | number;
  variant?: "total" | "pending" | "completed" | "cancelled";
}

export interface OrderItemInterface {
  id: string;
  order_id: number;
  claim_id: number;
  date: string | Date;
  status?: "pending" | "claimed" | "packed" | "cancelled" | "expired";
  claim_status?: "pending" | "claimed" | "failed" | "expired";
  order_status?:
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
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refund_requested"
    | "refunded";
  payment_status?: "paid" | "unpaid" | "refunded";
  price: number;
  seller_total: number;
  total_amount: number;
  quantity: number;
  item_count: number;
  currency: string;
  customer_name?: string;
  created_at: string;
  notified_at: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  updated_at?: string;
  delivery_address?: DetailedOrderDeliveryAddressInterface;
  user_contact?: UserContactInterface;
  items: OrderItemDetailInterface[];
}

export interface OrderItemDetailInterface {
  id: number;
  product_id: number;
  product_name: string;
  product_description: string;
  quantity: number;
  subtotal: number;
  unit_price: number;
  store_name: string;
}

export interface OrderDeliveryAddressInterface {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderDetailsScreenProps {
  item: OrderItemInterface;
  timeline: OrderTimelineInterface;
  address: OrderDeliveryAddressInterface;
}

export type OrderStatus = NonNullable<OrderItemInterface["status"]>;

export type OrderAction = "claimed" | "rejected" | "packed" | "shipped";

export interface DetailedOrderDeliveryAddressInterface {
  id: number;
  delivery_name: string;
  address: string;
  address2?: string;
  city: string;
  zip_code: string;
  country: string;
  full_address: string;
}

export interface UserContactInterface {
  name: string;
  email: string;
  phone?: string;
  user_id: number;
}

export interface DetailedOrderItemInterface extends OrderItemInterface {
  expires_at?: string | null;
  delivery_address?: DetailedOrderDeliveryAddressInterface;
  user_contact?: UserContactInterface;
}
