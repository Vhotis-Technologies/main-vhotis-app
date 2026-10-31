import {
  ProductSummary,
  ServerStorePromotionTargeting,
  StorePromotionPaymentDetails,
  StorePromotionTargeting,
} from "@/app/interfaces/seller/PromotionsInterface";

export type SponsorMode = "store" | "product";

export interface ProductSponsorValidation {
  isValid: boolean;
  message: string | null;
}

export interface ProductSponsorDraft {
  productSearchTerm: string;
  selectedProducts: ProductSummary[];
  startDate: string | null;
  endDate: string | null;
  targeting: StorePromotionTargeting;
  durationDays: number;
  estimatedCost: number;
  validation: ProductSponsorValidation;
}

export interface SponsorState {
  showPaymentModal: boolean;
  productSponsorDraft: ProductSponsorDraft;
}

export interface ProductSponsorPaymentDetails {
  promotionType: "sponsor_product";
  selectedProducts: ProductSummary[];
  startDate: Date | null;
  endDate: Date | null;
  targeting: StorePromotionTargeting;
  durationDays: number;
  estimatedCost: number;
  productIds: string[];
  productNames: string[];
}

export type SponsorPaymentDetails =
  | (StorePromotionPaymentDetails & { promotionType: "store" })
  | ProductSponsorPaymentDetails;

export interface CreateStoreSponsorRequest {
  paymentIntentId: string;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  priority?: string;
  estimatedReach?: number;
  durationDays?: number;
  targeting: ServerStorePromotionTargeting;
}

export interface CreateProductSponsorRequest {
  paymentIntentId: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  budget?: number;
  dailyBudget?: number;
  estimatedReach?: number;
  targeting: ServerStorePromotionTargeting;
}
