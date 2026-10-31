/**
 * Defines the new order display component interface.
 * This component will be displayed on the main screen of the seller even if they are on mobile or web.
 * The Interface will defined data gotten from the server
 */
export interface NewOrderDisplayInterface {
  order_id: string;
  product_name: string;
  product_image: any;
  product_price: any;
  product_quantity: any;
  customer_name: string;
  status: "paid" | "unpaid" | "cancelled";
  actions?: {
    onPress?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
  };
}

export default interface OrderListenerInterface {
    
}
