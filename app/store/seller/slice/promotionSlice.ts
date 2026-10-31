import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../store";
import {
  ProductDealType,
  ProductPromotionDraft,
  PromotionPriority,
  PromotionRates,
  PromotionState,
  StorePromotionDateRange,
  StorePromotionDraft,
  StorePromotionTargeting,
} from "@/app/interfaces/seller/PromotionsInterface";

// Fallback rate used when server rates haven't been fetched yet
// This is replaced by server-fetched rates stored in Redux state
const DAILY_STORE_PROMOTION_RATE = 4; // €4 per day
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const createDefaultTargeting = (): StorePromotionTargeting => ({
  ageRanges: [],
  interests: [],
  genders: [],
  ethnicities: [],
  locations: [],
});

const createInitialProductDraft = (): ProductPromotionDraft => ({
  dealType: "percentage",
  productSearchTerm: "",
  selectedProducts: [],
  dealValue: "",
  fixedAmount: "",
  bogoBuyQuantity: "",
  bogoGetQuantity: "",
  bundlePrice: "",
  bundleQuantity: "",
  usageLimit: "",
  startDate: null,
  endDate: null,
  validation: {
    isValid: false,
    message: "Select at least one product and complete the promotion details.",
  },
});

const createInitialStoreDraft = (
  dailyRate: number = DAILY_STORE_PROMOTION_RATE
): StorePromotionDraft => ({
  budget: 0,
  dailyBudget: dailyRate,
  estimatedReach: 0,
  priority: "medium",
  targeting: createDefaultTargeting(),
  dateRange: {
    startDate: null,
    endDate: null,
    durationDays: 0,
  },
  validation: {
    requiredBudget: 0,
    message: null,
    isBudgetValid: false,
  },
});

const initialState: PromotionState = {
  storeDraft: createInitialStoreDraft(),
  showPaymentModal: false,
  productDraft: createInitialProductDraft(),
  promotionRates: null,
};

const calculateDurationInDays = (
  startDate: string | null,
  endDate: string | null
): number => {
  if (!startDate || !endDate) {
    return 0;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const normalizedStart = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const normalizedEnd = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );
  const diff = normalizedEnd.getTime() - normalizedStart.getTime();

  if (diff < 0) {
    return 0;
  }

  return Math.floor(diff / MS_IN_DAY) + 1;
};

const recalculateStoreDerivedFields = (
  draft: StorePromotionDraft,
  dailyRate: number = DAILY_STORE_PROMOTION_RATE
) => {
  const durationDays = calculateDurationInDays(
    draft.dateRange.startDate,
    draft.dateRange.endDate
  );
  draft.dateRange.durationDays = durationDays;

  const budgetValue = Math.max(
    0,
    Number.isFinite(draft.budget) ? draft.budget : 0
  );
  const requiredBudget = durationDays > 0 ? durationDays * dailyRate : 0;
  const hasValidDates = durationDays > 0;
  const hasEnoughBudget = hasValidDates && budgetValue >= requiredBudget;

  draft.validation = {
    requiredBudget,
    isBudgetValid: hasEnoughBudget,
    message: !hasValidDates
      ? "Select a start and end date."
      : budgetValue < requiredBudget
      ? `Need at least €${requiredBudget.toFixed(
          2
        )} for ${durationDays} day(s) at €${dailyRate.toFixed(2)} per day.`
      : null,
  };

  draft.dailyBudget =
    durationDays > 0
      ? parseFloat((budgetValue / durationDays).toFixed(2))
      : dailyRate;
  const targetingFactor =
    1 +
    draft.targeting.ageRanges.length * 0.05 +
    draft.targeting.interests.length * 0.03 +
    draft.targeting.genders.length * 0.02;
  draft.estimatedReach = Math.round(
    budgetValue * 100 * Math.max(1, targetingFactor)
  );
};

const recalculateProductValidation = (draft: ProductPromotionDraft) => {
  const hasProduct = draft.selectedProducts.length > 0;
  const hasDates = draft.startDate && draft.endDate;

  let message: string | null = null;
  let isValid = hasProduct && Boolean(hasDates);

  const parsePositiveNumber = (value: string) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  switch (draft.dealType) {
    case "percentage": {
      const percent = parsePositiveNumber(draft.dealValue);
      if (!percent) {
        message = "Enter a percentage discount.";
        isValid = false;
      } else if (percent > 100) {
        message = "Percentage cannot exceed 100%.";
        isValid = false;
      }
      break;
    }
    case "fixed": {
      const amount = parsePositiveNumber(draft.fixedAmount);
      if (!amount) {
        message = "Enter a discount amount.";
        isValid = false;
      }
      break;
    }
    case "bogo": {
      const buyQty = parsePositiveNumber(draft.bogoBuyQuantity);
      const getQty = parsePositiveNumber(draft.bogoGetQuantity);
      if (!buyQty || !getQty) {
        message = "Enter buy and get quantities for the BOGO deal.";
        isValid = false;
      }
      break;
    }
    case "bundle": {
      const price = parsePositiveNumber(draft.bundlePrice);
      const qty = parsePositiveNumber(draft.bundleQuantity);
      if (!qty) {
        message = "Enter how many items are included in the bundle.";
        isValid = false;
      } else if (!price) {
        message = "Enter the bundle price.";
        isValid = false;
      }
      break;
    }
    default:
      break;
  }

  if (!hasProduct) {
    message = "Select at least one product.";
    isValid = false;
  } else if (!hasDates) {
    message = "Choose a start and end date.";
    isValid = false;
  }

  draft.validation = {
    isValid,
    message,
  };
};

const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {
    setStorePromotionBudget: (state, action: PayloadAction<number>) => {
      state.storeDraft.budget = Number.isFinite(action.payload)
        ? action.payload
        : 0;
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },

    setStorePromotionDateRange: (
      state,
      action: PayloadAction<
        Partial<Pick<StorePromotionDateRange, "startDate" | "endDate">>
      >
    ) => {
      state.storeDraft.dateRange = {
        ...state.storeDraft.dateRange,
        startDate:
          action.payload.startDate ?? state.storeDraft.dateRange.startDate,
        endDate: action.payload.endDate ?? state.storeDraft.dateRange.endDate,
        durationDays: state.storeDraft.dateRange.durationDays,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },

    setStorePromotionPriority: (
      state,
      action: PayloadAction<PromotionPriority>
    ) => {
      state.storeDraft.priority = action.payload;
    },
    setStorePromotionLocations: (state, action: PayloadAction<string[]>) => {
      state.storeDraft.targeting = {
        ...state.storeDraft.targeting,
        locations: action.payload,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },
    setStorePromotionAgeRanges: (state, action: PayloadAction<string[]>) => {
      state.storeDraft.targeting = {
        ...state.storeDraft.targeting,
        ageRanges: action.payload,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },
    setStorePromotionInterests: (state, action: PayloadAction<string[]>) => {
      state.storeDraft.targeting = {
        ...state.storeDraft.targeting,
        interests: action.payload,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },
    setStorePromotionGenders: (state, action: PayloadAction<string[]>) => {
      state.storeDraft.targeting = {
        ...state.storeDraft.targeting,
        genders: action.payload,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },
    setStorePromotionEthnicities: (state, action: PayloadAction<string[]>) => {
      state.storeDraft.targeting = {
        ...state.storeDraft.targeting,
        ethnicities: action.payload,
      };
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      recalculateStoreDerivedFields(state.storeDraft, dailyRate);
    },

    setProductDealType: (state, action: PayloadAction<ProductDealType>) => {
      state.productDraft.dealType = action.payload;
      if (action.payload === "percentage") {
        state.productDraft.fixedAmount = "";
        state.productDraft.bogoBuyQuantity = "";
        state.productDraft.bogoGetQuantity = "";
        state.productDraft.bundlePrice = "";
        state.productDraft.bundleQuantity = "";
      } else if (action.payload === "fixed") {
        state.productDraft.dealValue = "";
        state.productDraft.bogoBuyQuantity = "";
        state.productDraft.bogoGetQuantity = "";
        state.productDraft.bundlePrice = "";
        state.productDraft.bundleQuantity = "";
      } else if (action.payload === "bogo") {
        state.productDraft.dealValue = "";
        state.productDraft.fixedAmount = "";
        state.productDraft.bundlePrice = "";
        state.productDraft.bundleQuantity = "";
      } else if (action.payload === "bundle") {
        state.productDraft.dealValue = "";
        state.productDraft.fixedAmount = "";
        state.productDraft.bogoBuyQuantity = "";
        state.productDraft.bogoGetQuantity = "";
      }
      recalculateProductValidation(state.productDraft);
    },
    setProductSearchTerm: (state, action: PayloadAction<string>) => {
      state.productDraft.productSearchTerm = action.payload;
    },
    setProductSelectedProducts: (
      state,
      action: PayloadAction<ProductPromotionDraft["selectedProducts"]>
    ) => {
      state.productDraft.selectedProducts = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductDealValue: (state, action: PayloadAction<string>) => {
      state.productDraft.dealValue = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductFixedAmount: (state, action: PayloadAction<string>) => {
      state.productDraft.fixedAmount = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductBogoBuyQuantity: (state, action: PayloadAction<string>) => {
      state.productDraft.bogoBuyQuantity = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductBogoGetQuantity: (state, action: PayloadAction<string>) => {
      state.productDraft.bogoGetQuantity = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductBundlePrice: (state, action: PayloadAction<string>) => {
      state.productDraft.bundlePrice = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductBundleQuantity: (state, action: PayloadAction<string>) => {
      state.productDraft.bundleQuantity = action.payload;
      recalculateProductValidation(state.productDraft);
    },
    setProductUsageLimit: (state, action: PayloadAction<string>) => {
      state.productDraft.usageLimit = action.payload;
    },
    setProductPromotionDateRange: (
      state,
      action: PayloadAction<{
        startDate?: string | null;
        endDate?: string | null;
      }>
    ) => {
      state.productDraft.startDate =
        action.payload.startDate ?? state.productDraft.startDate;
      state.productDraft.endDate =
        action.payload.endDate ?? state.productDraft.endDate;
      recalculateProductValidation(state.productDraft);
    },

    resetStorePromotionDraft: (state) => {
      const dailyRate =
        state.promotionRates?.dailyStorePromotionRate ??
        DAILY_STORE_PROMOTION_RATE;
      state.storeDraft = createInitialStoreDraft(dailyRate);
      state.showPaymentModal = false;
    },
    resetProductPromotionDraft: (state) => {
      state.productDraft = createInitialProductDraft();
    },
    setShowPromotionPaymentModal: (state, action: PayloadAction<boolean>) => {
      state.showPaymentModal = action.payload;
    },
    setPromotionRates: (
      state,
      action: PayloadAction<PromotionRates | null>
    ) => {
      state.promotionRates = action.payload;
      // Recalculate store draft fields with new rates if rates are available
      if (action.payload) {
        recalculateStoreDerivedFields(
          state.storeDraft,
          action.payload.dailyStorePromotionRate
        );
      }
    },
  },
});

export const {
  setStorePromotionBudget,
  setStorePromotionDateRange,
  setStorePromotionPriority,
  setStorePromotionLocations,
  setStorePromotionAgeRanges,
  setStorePromotionInterests,
  setStorePromotionGenders,
  setStorePromotionEthnicities,
  setProductDealType,
  setProductSearchTerm,
  setProductSelectedProducts,
  setProductDealValue,
  setProductFixedAmount,
  setProductBogoBuyQuantity,
  setProductBogoGetQuantity,
  setProductBundlePrice,
  setProductBundleQuantity,
  setProductUsageLimit,
  setProductPromotionDateRange,
  resetStorePromotionDraft,
  resetProductPromotionDraft,
  setShowPromotionPaymentModal,
  setPromotionRates,
} = promotionSlice.actions;

export { DAILY_STORE_PROMOTION_RATE, calculateDurationInDays };

export const selectStorePromotionDraft = (state: RootState) =>
  state.promotion.storeDraft;
export const selectStorePromotionValidation = (state: RootState) =>
  state.promotion.storeDraft.validation;
export const selectPromotionPaymentModalVisible = (state: RootState) =>
  state.promotion.showPaymentModal;
export const selectProductPromotionDraft = (state: RootState) =>
  state.promotion.productDraft;

export default promotionSlice.reducer;
