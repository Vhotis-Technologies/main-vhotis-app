export interface UserDetails {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  photoUrl?: string;
  role: string;
  address?: string;
  city?: string;
  country: string;
  timezone: string;
  bio: string;
}
export default interface PaymentMethod {
  id: string;
  payment_type: "bank transfer" | "paypal" | "stripe";
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  bank_details?: {
    account_name: string;
    bank_name: string;
    iban: string;
    account_number?: string;
    routing_number?: string;
    bic?: string;
    swift?: string;
    is_verified: boolean;
  };
  paypal_details?: {
    email: string;
    is_verified: boolean;
  };
  stripe_details?: {
    account_id: string;
    is_verified: boolean;
  };
}

export interface ThemeOption {
  id: string;
  name: string;
  value: "light" | "dark" | "system";
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  lastActive: string;
  location?: string;
  isCurrentDevice: boolean;
  deviceType?: string;
  platform?: string;
  osVersion?: string;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  showAnimations: boolean;
}

export interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  openingHours: string;
  city_country: string;
}
