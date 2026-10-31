export interface Step {
  title: string;
  key: number;
}

export default interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export type SellingPath = 'self_fulfill' | 'fulfillment';

export interface MarketVertical {
  slug: string;
  name: string;
  description: string;
  max_sellers: number | null;
  current_sellers: number;
  slots_remaining: number | null;
  is_available: boolean;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  /** E.164 prefix e.g. +353 — combined with `phone` (national digits) before API calls */
  phoneCountryCode: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  postcode: string;
  latitude: string;
  longitude: string;
  ethnicity: string;
  gender: string;
  dob: string;
  password: string;
}

export interface StoreInformationFormData {
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessCity?: string;
  businessCountry?: string;
  businessPostcode?: string;
  businessReg?: string;
  useExistingAddress?: string;
  marketVerticalSlugs?: string[];
}

export interface VerificationFormData {
  idType: string;
  idFront: any;
  idBack: any;
  selfie: any;
}

export interface OnboardingState {
  seller_id: string | null;
  operatingMode: SellingPath | null;
  isError: string[] | null;
  isLoading: boolean;
  isSuccess: boolean;
  registrationFormData: RegistrationFormData | null;
  storeInformationFormData: StoreInformationFormData | null;
  verificationFormData: VerificationFormData | null;
  capConflictSlugs: string[];
}

export const MAX_MARKET_VERTICALS = 3;
