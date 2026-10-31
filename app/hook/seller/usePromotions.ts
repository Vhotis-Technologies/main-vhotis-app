import { useCallback, useEffect, useMemo } from "react";

import {
  resetProductPromotionDraft,
  resetStorePromotionDraft,
  selectProductPromotionDraft,
  selectPromotionPaymentModalVisible,
  selectStorePromotionDraft,
  selectStorePromotionValidation,
  setProductBogoBuyQuantity,
  setProductBogoGetQuantity,
  setProductBundlePrice,
  setProductBundleQuantity,
  setProductDealType,
  setProductDealValue,
  setProductFixedAmount,
  setProductPromotionDateRange,
  setProductSearchTerm,
  setProductSelectedProducts,
  setProductUsageLimit,
  setPromotionRates,
  setShowPromotionPaymentModal,
  setStorePromotionBudget,
  setStorePromotionAgeRanges,
  setStorePromotionDateRange,
  setStorePromotionGenders,
  setStorePromotionEthnicities,
  setStorePromotionInterests,
  setStorePromotionLocations,
  setStorePromotionPriority,
} from "@/app/store/seller/slice/promotionSlice";
import {
  ProductDealType,
  ProductPromotionPaymentDetails,
  ProductSummary,
  PromotionPriority,
  StorePromotionPaymentDetails,
} from "@/app/interfaces/seller/PromotionsInterface";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import type { RootState } from "@/app/store/store";
import { usePromotionRates } from "@/app/hook/seller/usePromotionRates";
import { Seller } from "@/app/interfaces/main/Authentication";
import {
  currencySymbolForCountry,
  getStoreCountry,
} from "@/app/_utils/storeCurrency";

/**
 * Coerce a form input string—potentially containing non-numeric characters—into a safe number.
 * Returns 0 for empty, invalid or non-finite values to keep downstream calculations predictable.
 */
const normalizeNumberInput = (value: string) => {
  if (!value) {
    return 0;
  }
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
};

/**
 * Convert a Date into an ISO string while gracefully handling nulls for Redux storage.
 */
const toIsoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

/**
 * Coordinate store-wide promotion business logic and expose memoised helpers for UI components.
 */
const usePromotions = () => {
  const dispatch = useAppDispatch();
  const { rates } = usePromotionRates();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const sellerUser = user as Seller | undefined;
  const storeCountry = getStoreCountry(sellerUser);

  /** 
   * Memoised to ensure that the user has promotion access and the campaign fee is calculated correctly
   * @returns PromotionAccess object containing the promotion access, promotion require payment, campaign fee, store country, and currency symbol
   */
  const promotionAccess = useMemo(() => {
    const feeFromLogin = sellerUser?.promotion_creation_fee;
    const parsedFee = feeFromLogin ? parseFloat(feeFromLogin) : NaN;
    const campaignFee = Number.isFinite(parsedFee)
      ? parsedFee
      : (rates.promotionCreationFee ?? rates.promotionCampaignFee ?? 5);

    return {
      allowsPromotions:
        sellerUser?.allows_promotions ?? rates.allowsPromotions ?? false,
      promotionsRequirePayment:
        sellerUser?.promotions_require_payment ??
        rates.promotionsRequirePayment ??
        false,
      campaignFee,
      storeCountry,
      currencySymbol: currencySymbolForCountry(storeCountry),
    };
  }, [rates, sellerUser, storeCountry]);

  // Snapshot the current draft and validation state from Redux.
  const storeDraft = useAppSelector(selectStorePromotionDraft);
  const validation = useAppSelector(selectStorePromotionValidation);
  const productDraft = useAppSelector(selectProductPromotionDraft);
  const isPaymentModalVisible = useAppSelector(
    selectPromotionPaymentModalVisible
  );

  // Fetch and store promotion rates in Redux
  useEffect(() => {
    if (rates) {
      dispatch(setPromotionRates(rates));
    }
  }, [rates, dispatch]);

  // Hydrate ISO strings into Date objects for date pickers.
  const startDate = useMemo(
    () =>
      storeDraft.dateRange.startDate
        ? new Date(storeDraft.dateRange.startDate)
        : null,
    [storeDraft.dateRange.startDate]
  );

  const endDate = useMemo(
    () =>
      storeDraft.dateRange.endDate
        ? new Date(storeDraft.dateRange.endDate)
        : null,
    [storeDraft.dateRange.endDate]
  );

  const budgetInputValue = useMemo(
    () => (storeDraft.budget > 0 ? storeDraft.budget.toString() : ""),
    [storeDraft.budget]
  );

  const productStartDate = useMemo(
    () => (productDraft.startDate ? new Date(productDraft.startDate) : null),
    [productDraft.startDate]
  );

  const productEndDate = useMemo(
    () => (productDraft.endDate ? new Date(productDraft.endDate) : null),
    [productDraft.endDate]
  );

  // ---------------------------------------------------------------------------
  // Dispatch helpers
  // ---------------------------------------------------------------------------

  const handleBudgetChange = useCallback(
    (value: string) => {
      dispatch(setStorePromotionBudget(normalizeNumberInput(value)));
    },
    [dispatch]
  );

  // Persist date changes in ISO form so they survive serialisation.
  const setStartDate = useCallback(
    (date: Date | null) => {
      dispatch(setStorePromotionDateRange({ startDate: toIsoOrNull(date) }));
    },
    [dispatch]
  );

  const setEndDate = useCallback(
    (date: Date | null) => {
      dispatch(setStorePromotionDateRange({ endDate: toIsoOrNull(date) }));
    },
    [dispatch]
  );

  /**
   * Handle the "All ages" mutually exclusive toggle behaviour.
   */
  const handleAgeRangeSelection = useCallback(
    (value: string) => {
      const current = storeDraft.targeting.ageRanges;
      if (value === "All") {
        if (current.length === 1 && current.includes("All")) {
          dispatch(setStorePromotionAgeRanges([]));
        } else {
          dispatch(setStorePromotionAgeRanges(["All"]));
        }
        return;
      }

      let next = current.filter((item) => item !== "All");
      if (next.includes(value)) {
        next = next.filter((item) => item !== value);
      } else {
        next = [...next, value];
      }
      dispatch(setStorePromotionAgeRanges(next));
    },
    [dispatch, storeDraft.targeting.ageRanges]
  );

  // Simple toggle shorthands for the remaining targeting filters.
  const handleInterestSelection = useCallback(
    (value: string) => {
      const current = storeDraft.targeting.interests;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setStorePromotionInterests(next));
    },
    [dispatch, storeDraft.targeting.interests]
  );

  // Handle the gender to be targetted in the store wide promotion
  const handleGenderSelection = useCallback(
    (value: string) => {
      const current = storeDraft.targeting.genders;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setStorePromotionGenders(next));
    },
    [dispatch, storeDraft.targeting.genders]
  );

  // Handle the ethnicity to be targetted in the store wide promotion
  const handleEthnicitySelection = useCallback(
    (value: string) => {
      const current = storeDraft.targeting.ethnicities;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setStorePromotionEthnicities(next));
    },
    [dispatch, storeDraft.targeting.ethnicities]
  );

  const handleProductSearchTermChange = useCallback(
    (value: string) => {
      dispatch(setProductSearchTerm(value));
    },
    [dispatch]
  );

  const handleSelectProduct = useCallback(
    (product: ProductSummary) => {
      if (
        productDraft.selectedProducts.some(
          (selected) => selected.id === product.id
        )
      ) {
        return;
      }
      dispatch(
        setProductSelectedProducts([...productDraft.selectedProducts, product])
      );
    },
    [dispatch, productDraft.selectedProducts]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      dispatch(
        setProductSelectedProducts(
          productDraft.selectedProducts.filter(
            (product) => product.id !== productId
          )
        )
      );
    },
    [dispatch, productDraft.selectedProducts]
  );

  const handleProductDealTypeChange = useCallback(
    (dealType: ProductDealType) => {
      dispatch(setProductDealType(dealType));
    },
    [dispatch]
  );

  const handleProductDealValueChange = useCallback(
    (value: string) => {
      dispatch(setProductDealValue(value));
    },
    [dispatch]
  );

  const handleProductFixedAmountChange = useCallback(
    (value: string) => {
      dispatch(setProductFixedAmount(value));
    },
    [dispatch]
  );

  const handleProductBogoBuyChange = useCallback(
    (value: string) => {
      dispatch(setProductBogoBuyQuantity(value));
    },
    [dispatch]
  );

  const handleProductBogoGetChange = useCallback(
    (value: string) => {
      dispatch(setProductBogoGetQuantity(value));
    },
    [dispatch]
  );

  const handleProductBundlePriceChange = useCallback(
    (value: string) => {
      dispatch(setProductBundlePrice(value));
    },
    [dispatch]
  );

  const handleProductBundleQuantityChange = useCallback(
    (value: string) => {
      dispatch(setProductBundleQuantity(value));
    },
    [dispatch]
  );

  const handleProductUsageLimitChange = useCallback(
    (value: string) => {
      dispatch(setProductUsageLimit(value));
    },
    [dispatch]
  );

  const setProductStartDate = useCallback(
    (date: Date | null) => {
      dispatch(
        setProductPromotionDateRange({
          startDate: toIsoOrNull(date),
        })
      );
    },
    [dispatch]
  );

  const setProductEndDate = useCallback(
    (date: Date | null) => {
      dispatch(
        setProductPromotionDateRange({
          endDate: toIsoOrNull(date),
        })
      );
    },
    [dispatch]
  );

  // Location list setter (future UI hook-in).
  const setLocations = useCallback(
    (locations: string[]) => {
      dispatch(setStorePromotionLocations(locations));
    },
    [dispatch]
  );

  const setPriority = useCallback(
    (priority: PromotionPriority) => {
      dispatch(setStorePromotionPriority(priority));
    },
    [dispatch]
  );

  // Reset the draft and hide any open payment modal.
  const resetStorePromotion = useCallback(() => {
    dispatch(resetStorePromotionDraft());
  }, [dispatch]);

  const resetProductPromotion = useCallback(() => {
    dispatch(resetProductPromotionDraft());
  }, [dispatch]);

  const showPaymentModal = useCallback(() => {
    dispatch(setShowPromotionPaymentModal(true));
  }, [dispatch]);

  const hidePaymentModal = useCallback(() => {
    dispatch(setShowPromotionPaymentModal(false));
  }, [dispatch]);

  // Compute additional context for the UI without storing it in redux.
  const budgetInsights = useMemo(() => {
    const requiredBudget = validation.requiredBudget;
    const durationDays = storeDraft.dateRange.durationDays;
    const budgetValue = Math.max(0, storeDraft.budget);
    const deficit = Math.max(0, requiredBudget - budgetValue);
    const surplus = Math.max(0, budgetValue - requiredBudget);
    const dailyRate = rates.dailyStorePromotionRate;
    const suggestedDurationDays =
      budgetValue > 0 ? Math.ceil(budgetValue / dailyRate) : 0;
    const warning =
      surplus > dailyRate &&
      suggestedDurationDays > durationDays &&
      durationDays > 0
        ? `Budget exceeds the selected ${durationDays} day(s). Consider extending to about ${suggestedDurationDays} day(s).`
        : null;

    return {
      requiredBudget,
      durationDays,
      budgetValue,
      deficit,
      surplus,
      suggestedDurationDays,
      warning,
    };
  }, [
    storeDraft.budget,
    storeDraft.dateRange.durationDays,
    validation.requiredBudget,
    rates.dailyStorePromotionRate,
  ]);

  // Assemble the payment payload for downstream consumers (e.g. payment modal).
  const paymentDetails: StorePromotionPaymentDetails = useMemo(
    () => ({
      promotionType: "store",
      budget: storeDraft.budget,
      dailyBudget: storeDraft.dailyBudget,
      startDate,
      endDate,
      priority: storeDraft.priority,
      targeting: storeDraft.targeting,
      estimatedReach: storeDraft.estimatedReach,
      durationDays: storeDraft.dateRange.durationDays,
      isBudgetValid: validation.isBudgetValid,
      requiredBudget: budgetInsights.requiredBudget,
      message: validation.message,
      suggestedDurationDays: budgetInsights.suggestedDurationDays,
      warning: budgetInsights.warning,
      surplus: budgetInsights.surplus,
      deficit: budgetInsights.deficit,
    }),
    [budgetInsights, endDate, startDate, storeDraft, validation]
  );

  const productPaymentDetails: ProductPromotionPaymentDetails = useMemo(
    () => ({
      promotionType: "product",
      dealType: productDraft.dealType,
      selectedProducts: productDraft.selectedProducts,
      dealValue: productDraft.dealValue,
      fixedAmount: productDraft.fixedAmount,
      bogoBuyQuantity: productDraft.bogoBuyQuantity,
      bogoGetQuantity: productDraft.bogoGetQuantity,
      bundlePrice: productDraft.bundlePrice,
      bundleQuantity: productDraft.bundleQuantity,
      usageLimit: productDraft.usageLimit,
      startDate: productStartDate,
      endDate: productEndDate,
      message: productDraft.validation.message,
      isValid: productDraft.validation.isValid,
    }),
    [productDraft, productEndDate, productStartDate]
  );

  // Determine whether the CTA should be enabled based on validation state.
  const canLaunchPromotion = useMemo(
    () =>
      validation.isBudgetValid &&
      storeDraft.budget > 0 &&
      storeDraft.dateRange.durationDays > 0 &&
      Boolean(storeDraft.dateRange.startDate && storeDraft.dateRange.endDate),
    [storeDraft, validation.isBudgetValid]
  );

  const canLaunchProductPromotion =
    promotionAccess.allowsPromotions && productDraft.validation.isValid;

  // Collate memoised state slices and helper callbacks for consuming components.
  return {
    budgetInputValue,
    startDate,
    endDate,
    storeDraft,
    validation,
    isPaymentModalVisible,
    handleBudgetChange,
    setStartDate,
    setEndDate,
    setLocations,
    setPriority,
    resetStorePromotion,
    resetProductPromotion,
    showPaymentModal,
    hidePaymentModal,
    paymentDetails,
    productPaymentDetails,
    canLaunchPromotion,
    totalCost: storeDraft.budget,
    minimumDailyRate: rates.dailyStorePromotionRate,
    handleAgeRangeSelection,
    handleInterestSelection,
    handleGenderSelection,
    handleEthnicitySelection,
    budgetWarning: budgetInsights.warning,
    suggestedDurationDays: budgetInsights.suggestedDurationDays,
    budgetDeficit: budgetInsights.deficit,
    budgetSurplus: budgetInsights.surplus,
    productDraft,
    productStartDate,
    productEndDate,
    handleProductSearchTermChange,
    handleSelectProduct,
    handleRemoveProduct,
    handleProductDealTypeChange,
    handleProductDealValueChange,
    handleProductFixedAmountChange,
    handleProductBogoBuyChange,
    handleProductBogoGetChange,
    handleProductBundlePriceChange,
    handleProductBundleQuantityChange,
    handleProductUsageLimitChange,
    setProductStartDate,
    setProductEndDate,
    canLaunchProductPromotion,
    promotionAccess,
  };
};

export default usePromotions;
