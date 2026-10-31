import { useCallback, useMemo } from "react";
import usePromotions from "@/app/hook/seller/usePromotions";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { resetStorePromotionDraft } from "@/app/store/seller/slice/promotionSlice";
import {
  resetProductSponsorDraft,
  selectProductSponsorDraft,
  selectSponsorPaymentModalVisible,
  setShowSponsorPaymentModal,
  setSponsorProductAgeRanges,
  setSponsorProductDateRange,
  setSponsorProductEthnicities,
  setSponsorProductGenders,
  setSponsorProductInterests,
  setSponsorProductSearchTerm,
  setSponsorSelectedProducts,
} from "@/app/store/seller/slice/sponsorSlice";
import {
  ProductSponsorPaymentDetails,
  SponsorPaymentDetails,
} from "@/app/interfaces/seller/SponsorInterface";
import { ProductSummary } from "@/app/interfaces/seller/PromotionsInterface";

const toIsoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

const useSponsor = () => {
  const dispatch = useAppDispatch();
  const productSponsorDraft = useAppSelector(selectProductSponsorDraft);
  const isPaymentModalVisible = useAppSelector(selectSponsorPaymentModalVisible);

  const storePromotion = usePromotions();

  const productStartDate = useMemo(
    () =>
      productSponsorDraft.startDate
        ? new Date(productSponsorDraft.startDate)
        : null,
    [productSponsorDraft.startDate]
  );

  const productEndDate = useMemo(
    () =>
      productSponsorDraft.endDate
        ? new Date(productSponsorDraft.endDate)
        : null,
    [productSponsorDraft.endDate]
  );

  const handleProductSearchTermChange = useCallback(
    (value: string) => {
      dispatch(setSponsorProductSearchTerm(value));
    },
    [dispatch]
  );

  const handleSelectProduct = useCallback(
    (product: ProductSummary) => {
      if (
        productSponsorDraft.selectedProducts.some((p) => p.id === product.id)
      ) {
        return;
      }
      dispatch(
        setSponsorSelectedProducts([
          ...productSponsorDraft.selectedProducts,
          product,
        ])
      );
    },
    [dispatch, productSponsorDraft.selectedProducts]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      dispatch(
        setSponsorSelectedProducts(
          productSponsorDraft.selectedProducts.filter((p) => p.id !== productId)
        )
      );
    },
    [dispatch, productSponsorDraft.selectedProducts]
  );

  const setProductStartDate = useCallback(
    (date: Date | null) => {
      dispatch(setSponsorProductDateRange({ startDate: toIsoOrNull(date) }));
    },
    [dispatch]
  );

  const setProductEndDate = useCallback(
    (date: Date | null) => {
      dispatch(setSponsorProductDateRange({ endDate: toIsoOrNull(date) }));
    },
    [dispatch]
  );

  const handleProductAgeRangeSelection = useCallback(
    (value: string) => {
      const current = productSponsorDraft.targeting.ageRanges;
      if (value === "All") {
        if (current.length === 1 && current.includes("All")) {
          dispatch(setSponsorProductAgeRanges([]));
        } else {
          dispatch(setSponsorProductAgeRanges(["All"]));
        }
        return;
      }
      let next = current.filter((item) => item !== "All");
      if (next.includes(value)) {
        next = next.filter((item) => item !== value);
      } else {
        next = [...next, value];
      }
      dispatch(setSponsorProductAgeRanges(next));
    },
    [dispatch, productSponsorDraft.targeting.ageRanges]
  );

  const handleProductInterestSelection = useCallback(
    (value: string) => {
      const current = productSponsorDraft.targeting.interests;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setSponsorProductInterests(next));
    },
    [dispatch, productSponsorDraft.targeting.interests]
  );

  const handleProductGenderSelection = useCallback(
    (value: string) => {
      const current = productSponsorDraft.targeting.genders;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setSponsorProductGenders(next));
    },
    [dispatch, productSponsorDraft.targeting.genders]
  );

  const handleProductEthnicitySelection = useCallback(
    (value: string) => {
      const current = productSponsorDraft.targeting.ethnicities;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      dispatch(setSponsorProductEthnicities(next));
    },
    [dispatch, productSponsorDraft.targeting.ethnicities]
  );

  const productSponsorPaymentDetails: ProductSponsorPaymentDetails = useMemo(
    () => ({
      promotionType: "sponsor_product",
      selectedProducts: productSponsorDraft.selectedProducts,
      startDate: productStartDate,
      endDate: productEndDate,
      targeting: productSponsorDraft.targeting,
      durationDays: productSponsorDraft.durationDays,
      estimatedCost: productSponsorDraft.estimatedCost,
      productIds: productSponsorDraft.selectedProducts.map((p) => p.id),
      productNames: productSponsorDraft.selectedProducts.map((p) => p.name),
    }),
    [productEndDate, productSponsorDraft, productStartDate]
  );

  const storePaymentDetails = useMemo(
    (): SponsorPaymentDetails => ({
      ...storePromotion.paymentDetails,
    }),
    [storePromotion.paymentDetails]
  );

  const showPaymentModal = useCallback(() => {
    dispatch(setShowSponsorPaymentModal(true));
  }, [dispatch]);

  const hidePaymentModal = useCallback(() => {
    dispatch(setShowSponsorPaymentModal(false));
  }, [dispatch]);

  const resetStoreSponsor = useCallback(() => {
    dispatch(resetStorePromotionDraft());
  }, [dispatch]);

  const resetProductSponsor = useCallback(() => {
    dispatch(resetProductSponsorDraft());
  }, [dispatch]);

  return {
    ...storePromotion,
    isPaymentModalVisible,
    showPaymentModal,
    hidePaymentModal,
    storePaymentDetails,
    productSponsorDraft,
    productSponsorPaymentDetails,
    productStartDate,
    productEndDate,
    handleProductSearchTermChange,
    handleSelectProduct,
    handleRemoveProduct,
    setProductStartDate,
    setProductEndDate,
    handleProductAgeRangeSelection,
    handleProductInterestSelection,
    handleProductGenderSelection,
    handleProductEthnicitySelection,
    canLaunchStoreSponsor: storePromotion.canLaunchPromotion,
    canLaunchProductSponsor: productSponsorDraft.validation.isValid,
    resetStoreSponsor,
    resetProductSponsor,
  };
};

export default useSponsor;
