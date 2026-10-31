export default interface DescriptionInterface {
  id?: string;
  images: any[];
  name?: string;
  info?: string;
  price?: number;
  discounted_price?: number;
  discount_end_date?: string;
  description?: string;
  shop_name?: string;
  reviews?: string[];
  rating?: number;
  estimated_delivery?: string;
  discount_value?: number;
  category?: string;
  stock_status?: "In Stock" | "Out of Stock" | "Low Stock";
  shipping_fee?: number;
  import_fees?: number;
  delivery_location?: string;
  max_quantity?: number;
  return_policy?: string;
  secure_transaction?: boolean;
  seller_info?: {
    seller_id: string;
    ships_from: string;
    sold_by: string;
  };
}
