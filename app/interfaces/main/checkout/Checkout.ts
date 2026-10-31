import { OrderItem } from "../orders/Orders";
import { DeliveryAddress } from "../home/HomeInterfaces";
import { MembershipBenefits } from "../cart/CartInterface";

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "paypal";
  lastFourDigits?: string;
  cardHolderName?: string;
  expiryDate?: string;
}

export interface CheckoutState {
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  shippingCost: number;
  priorityFee: number;
  total: number;
  isPriorityDelivery: boolean;
  deliveryLeftAtDoor: boolean;
  deliveryInstructions: string;
  shippingAddress: DeliveryAddress | null;
  paymentMethod: PaymentMethod | null;
  orderStatus: "pending" | "processing" | "completed" | "failed";
  checkoutId?: string;
  membershipBenefits?: MembershipBenefits;
}

export interface CheckoutProps {
  checkoutState: CheckoutState;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateShippingAddress: (address: DeliveryAddress) => void;
  onUpdatePaymentMethod: (payment: PaymentMethod) => void;
  onPlaceOrder: () => Promise<void>;
}
