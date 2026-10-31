export default interface Orders {}
export interface OrderItem {
  id: string;
  title: string;
  image: string;
  price: string | number;
  selling_price?: string | number; // Price with commission (what buyers see)
  quantity: string;
  date: string;
  status?: string;
}
