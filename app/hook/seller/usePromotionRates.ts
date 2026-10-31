import { useGetPromotionRatesQuery } from "@/app/store/seller/api/promotionApi";
import { PromotionRates } from "@/app/interfaces/seller/PromotionsInterface";

/**
 * Default fallback rates in case API fails or is loading
 */
const DEFAULT_RATES: PromotionRates = {
  dailyStorePromotionRate: 4,
  productDailyRate: 1.5,
  promotionCampaignFee: 5,
  allowsPromotions: false,
  promotionsRequirePayment: false,
  promotionCreationFee: 5,
  productDealMultipliers: {
    percentage: 1.0,
    fixed: 1.0,
    bogo: 1.5,
    bundle: 1.2,
    flash_sale: 2.0,
  },
};

/**
 * Hook to fetch and provide promotion rates from the server.
 * Returns rates that can be used for client-side calculations and display.
 *
 * @returns Object containing rates and loading state
 */
export const usePromotionRates = () => {
  const { data: rates, isLoading, error } = useGetPromotionRatesQuery();

  return {
    rates: rates || DEFAULT_RATES,
    isLoading,
    error,
  };
};

export default usePromotionRates;
