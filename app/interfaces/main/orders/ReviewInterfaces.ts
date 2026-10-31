export interface OrderReviewItemPayload {
  order_item_id: number | string;
  rating: number;
  comment?: string;
}

export interface SubmitOrderReviewPayload {
  order_id: string;
  items: OrderReviewItemPayload[];
}

export interface OrderReviewSummary {
  average_rating: number;
  submitted_at: string;
}

export interface SubmitOrderReviewResponse {
  success: boolean;
  order_review: OrderReviewSummary;
  product_reviews: Array<{
    id: string;
    order_item_id: number | string;
    product_id: string;
    rating: number;
    review: string;
  }>;
}

export interface SellerProductReview {
  id: string;
  order_id: string;
  order_number: string | null;
  order_item_id: number | string;
  product_id: string;
  product_name: string | null;
  product_image: string | null;
  rating: number;
  review: string;
  buyer_name: string;
  submitted_at: string;
}

export interface ProductRatingDraft {
  orderItemId: number | string;
  productId: string;
  productName: string;
  image?: string | null;
  rating: number;
  comment: string;
}
