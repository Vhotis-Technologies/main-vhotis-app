import { ProductInterface } from "./ProductInterface";

export default interface TopTrendingProductsInterface {
  id?: string;
  name?: string;
  image?: any;
  price?: number;
  sales?: number;
  earning?: number;
}

export interface TimelinePointProps {
  id?: string;
  date?: Date;
  status: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  isLast?: boolean;
}
