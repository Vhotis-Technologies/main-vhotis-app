export interface Demographics {
  ageRanges: string[];
  genders: string[];
  ethnicities: string[];
  locations: string[];
  interests: string[];
}

// Server-side targeting (without locations field which is not supported by the model)
export type ServerStorePromotionTargeting = Omit<Demographics, "locations">;

export type PromotionPriority = "high" | "medium" | "low";

export interface StorePromotionDateRange {
  startDate: string | null;
  endDate: string | null;
  durationDays: number;
}

export type StorePromotionTargeting = Demographics;

export interface StorePromotionValidation {
  requiredBudget: number;
  isBudgetValid: boolean;
  message: string | null;
}

export interface StorePromotionDraft {
  budget: number;
  dailyBudget: number;
  estimatedReach: number;
  priority: PromotionPriority;
  targeting: StorePromotionTargeting;
  dateRange: StorePromotionDateRange;
  validation: StorePromotionValidation;
}

export type ProductDealType = "percentage" | "fixed" | "bogo" | "bundle";

export interface ProductSummary {
  id: string;
  name: string;
}

export interface ProductPromotionValidation {
  isValid: boolean;
  message: string | null;
}

export interface ProductPromotionDraft {
  dealType: ProductDealType;
  productSearchTerm: string;
  selectedProducts: ProductSummary[];
  dealValue: string;
  fixedAmount: string;
  bogoBuyQuantity: string;
  bogoGetQuantity: string;
  bundlePrice: string;
  bundleQuantity: string;
  usageLimit: string;
  startDate: string | null;
  endDate: string | null;
  validation: ProductPromotionValidation;
}

export interface PromotionState {
  storeDraft: StorePromotionDraft;
  showPaymentModal: boolean;
  productDraft: ProductPromotionDraft;
  promotionRates: PromotionRates | null;
}

export interface StoreWidePromotionData {
  budget: number;
  dailyBudget: number;
  targetDemographics: Demographics;
  estimatedReach: number;
  promotionDuration: {
    startDate: Date;
    endDate: Date;
  };
  targetAreas: string[];
  priority: "high" | "medium" | "low";
}

export interface StorePromotionPaymentDetails {
  promotionType: "store";
  budget: number;
  dailyBudget: number;
  startDate: Date | null;
  endDate: Date | null;
  priority: PromotionPriority;
  targeting: StorePromotionTargeting;
  estimatedReach: number;
  durationDays: number;
  isBudgetValid: boolean;
  requiredBudget: number;
  message: string | null;
  suggestedDurationDays?: number;
  warning?: string | null;
  surplus?: number;
  deficit?: number;
}

export interface ProductPromotionPaymentDetails {
  promotionType: "product";
  dealType: ProductDealType;
  selectedProducts: ProductSummary[];
  dealValue: string;
  fixedAmount: string;
  bogoBuyQuantity: string;
  bogoGetQuantity: string;
  bundlePrice: string;
  bundleQuantity: string;
  usageLimit: string;
  startDate: Date | null;
  endDate: Date | null;
  message: string | null;
  isValid: boolean;
}

export interface DealType {
  label: string;
  value: "percentage" | "fixed" | "bogo" | "bundle";
}

export interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export interface PromotionHistoryInterface {
  id: string;
  storeId?: string;
  name: string;
  type: "store" | "product";
  status: "active" | "expired" | "scheduled";
  startDate: Date;
  endDate: Date;
  performance: {
    reach: number;
    engagement: number;
    sales: number;
  };
}

export interface CreateStorePromotionRequest {
  paymentIntentId: string;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  priority?: PromotionPriority;
  estimatedReach?: number;
  durationDays?: number;
  targeting: ServerStorePromotionTargeting;
}

export interface CreateProductPromotionRequest {
  paymentIntentId: string;
  dealType: ProductDealType;
  storeId?: string;
  discountValue?: string;
  minimumPurchase?: string;
  maxDiscount?: string;
  usageLimit?: string;
  productIds: string[];
  bogoBuyQuantity?: string;
  bogoGetQuantity?: string;
  bundlePrice?: string;
  bundleQuantity?: string;
  startDate: string;
  endDate: string;
}

export interface PromotionHistoryResponse {
  id: string;
  storeId?: string;
  name: string;
  type: "store" | "product";
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
  performance: {
    reach: number;
    engagement: number;
    sales: number;
  };
}

export interface PromotionRates {
  dailyStorePromotionRate: number;
  productDailyRate: number;
  promotionCampaignFee?: number;
  allowsPromotions?: boolean;
  promotionsRequirePayment?: boolean;
  promotionCreationFee?: number;
  productDealMultipliers: {
    percentage: number;
    fixed: number;
    bogo: number;
    bundle: number;
    flash_sale: number;
  };
}
