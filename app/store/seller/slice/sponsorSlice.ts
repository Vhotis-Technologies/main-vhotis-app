import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  ProductSponsorDraft,
  SponsorState,
} from "@/app/interfaces/seller/SponsorInterface";
import {
  ProductSummary,
  StorePromotionTargeting,
} from "@/app/interfaces/seller/PromotionsInterface";
import { calculateDurationInDays } from "./promotionSlice";

const PRODUCT_DAILY_SPONSOR_RATE = 1.5;

const createDefaultTargeting = (): StorePromotionTargeting => ({
  ageRanges: [],
  interests: [],
  genders: [],
  ethnicities: [],
  locations: [],
});

const createInitialProductSponsorDraft = (): ProductSponsorDraft => ({
  productSearchTerm: "",
  selectedProducts: [],
  startDate: null,
  endDate: null,
  targeting: createDefaultTargeting(),
  durationDays: 0,
  estimatedCost: 0,
  validation: {
    isValid: false,
    message: "Select at least one product and set a campaign schedule.",
  },
});

const recalculateProductSponsor = (draft: ProductSponsorDraft) => {
  const durationDays = calculateDurationInDays(
    draft.startDate,
    draft.endDate
  );
  draft.durationDays = durationDays;
  const productCount = Math.max(1, draft.selectedProducts.length);
  draft.estimatedCost =
    Math.round(
      PRODUCT_DAILY_SPONSOR_RATE * productCount * Math.max(durationDays, 0) * 100
    ) / 100;

  if (draft.selectedProducts.length === 0) {
    draft.validation = {
      isValid: false,
      message: "Select at least one product to sponsor.",
    };
    return;
  }
  if (!draft.startDate || !draft.endDate) {
    draft.validation = {
      isValid: false,
      message: "Choose a start and end date for the campaign.",
    };
    return;
  }
  if (durationDays <= 0) {
    draft.validation = {
      isValid: false,
      message: "End date must be after the start date.",
    };
    return;
  }

  draft.validation = { isValid: true, message: null };
};

const initialState: SponsorState = {
  showPaymentModal: false,
  productSponsorDraft: createInitialProductSponsorDraft(),
};

const sponsorSlice = createSlice({
  name: "sponsor",
  initialState,
  reducers: {
    setSponsorProductSearchTerm: (state, action: PayloadAction<string>) => {
      state.productSponsorDraft.productSearchTerm = action.payload;
    },
    setSponsorSelectedProducts: (
      state,
      action: PayloadAction<ProductSummary[]>
    ) => {
      state.productSponsorDraft.selectedProducts = action.payload;
      recalculateProductSponsor(state.productSponsorDraft);
    },
    setSponsorProductDateRange: (
      state,
      action: PayloadAction<{
        startDate?: string | null;
        endDate?: string | null;
      }>
    ) => {
      if (action.payload.startDate !== undefined) {
        state.productSponsorDraft.startDate = action.payload.startDate;
      }
      if (action.payload.endDate !== undefined) {
        state.productSponsorDraft.endDate = action.payload.endDate;
      }
      recalculateProductSponsor(state.productSponsorDraft);
    },
    setSponsorProductAgeRanges: (state, action: PayloadAction<string[]>) => {
      state.productSponsorDraft.targeting.ageRanges = action.payload;
    },
    setSponsorProductInterests: (state, action: PayloadAction<string[]>) => {
      state.productSponsorDraft.targeting.interests = action.payload;
    },
    setSponsorProductGenders: (state, action: PayloadAction<string[]>) => {
      state.productSponsorDraft.targeting.genders = action.payload;
    },
    setSponsorProductEthnicities: (state, action: PayloadAction<string[]>) => {
      state.productSponsorDraft.targeting.ethnicities = action.payload;
    },
    resetProductSponsorDraft: (state) => {
      state.productSponsorDraft = createInitialProductSponsorDraft();
    },
    setShowSponsorPaymentModal: (state, action: PayloadAction<boolean>) => {
      state.showPaymentModal = action.payload;
    },
  },
});

export const {
  setSponsorProductSearchTerm,
  setSponsorSelectedProducts,
  setSponsorProductDateRange,
  setSponsorProductAgeRanges,
  setSponsorProductInterests,
  setSponsorProductGenders,
  setSponsorProductEthnicities,
  resetProductSponsorDraft,
  setShowSponsorPaymentModal,
} = sponsorSlice.actions;

export const selectProductSponsorDraft = (state: RootState) =>
  state.sponsor.productSponsorDraft;
export const selectSponsorPaymentModalVisible = (state: RootState) =>
  state.sponsor.showPaymentModal;

export default sponsorSlice.reducer;
