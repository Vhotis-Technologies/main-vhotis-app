export interface DeliveryAddress {
  id?: string;
  delivery_name?: string;
  address?: string;
  address2?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  default?: boolean;
}

export interface DealsComponentInterface {
  id?: string;
  image: string;
  description: string;
  percentage: number;
  onPress?: (id: string) => void;
  type?: string;
}

export interface TrendingCategoryInterface {
  id?: string;
  title: string;
  image?: any;
}

export default interface HomeState {
  categories: TrendingCategoryInterface[];
  language: string;
  currency: string;
}
