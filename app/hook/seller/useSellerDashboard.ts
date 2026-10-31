import {
  useGetCategoryReachDataQuery,
  useGetBestSellingProductsQuery,
  useGetOrderInformationDataQuery,
  useGetTotalSalesDataQuery,
  useGetTotalProductsSoldDataQuery,
  useGetTotalViewsDataQuery,
  useGetConversionRateDataQuery,
  useGetTotalRevenueDataQuery,
  DashboardTimeframeParams,
} from "@/app/store/seller/api/dashboardApi";
import { useState, useMemo, useEffect } from "react";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  isStoreAdminUser,
} from "@/app/interfaces/main/Authentication";

const useSellerDashboard = () => {
  const [currentOrderInformationPeriod, setCurrentOrderInformationPeriod] =
    useState<"weekly" | "monthly">("weekly");
  const [
    currentBestSellingProductsPeriod,
    setCurrentBestSellingProductsPeriod,
  ] = useState<"weekly" | "monthly">("weekly");
  const [currentTotalSalesPeriod, setCurrentTotalSalesPeriod] = useState<
    "weekly" | "monthly"
  >("weekly");
  const [currentDashboardStatsPeriod, setCurrentDashboardStatsPeriod] =
    useState<"weekly" | "monthly">("weekly");
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const isAuthReady = useAppSelector((state) => state.auth.isAuthReady);
  const storeId = useCampaignHistoryStoreId();
  const { sellerStores, isLoadingStores } = useSellerStore({
    includeLocations: true,
  });
  const isOwner = Boolean(user?.is_seller && !isStoreAdminUser(user));

  const skipUntilStoreSelected = useMemo(() => {
    if (!isAuthReady) {
      return true;
    }
    if (!isOwner) {
      return false;
    }
    if (isLoadingStores) {
      return true;
    }
    if (sellerStores.length > 1 && !storeId) {
      return true;
    }
    return false;
  }, [isAuthReady, isOwner, isLoadingStores, sellerStores.length, storeId]);

  const getServerTimeframe = (tf: "weekly" | "monthly") => {
    return tf === "weekly" ? "this_week" : "this_month";
  };

  const withStore = (
    timeframe: string,
  ): DashboardTimeframeParams => ({
    timeframe,
    storeId,
  });

  const orderInfoParams = useMemo(
    () => withStore(getServerTimeframe(currentOrderInformationPeriod)),
    [currentOrderInformationPeriod, storeId],
  );
  const bestSellingParams = useMemo(
    () => withStore(getServerTimeframe(currentBestSellingProductsPeriod)),
    [currentBestSellingProductsPeriod, storeId],
  );
  const totalSalesParams = useMemo(
    () => withStore(getServerTimeframe(currentTotalSalesPeriod)),
    [currentTotalSalesPeriod, storeId],
  );
  const dashboardStatsParams = useMemo(
    () => withStore(getServerTimeframe(currentDashboardStatsPeriod)),
    [currentDashboardStatsPeriod, storeId],
  );
  const categoryReachParams = useMemo(
    () => ({ storeId }),
    [storeId],
  );

  const {
    data: categoryReachData,
    isLoading: isCategoryReachLoading,
    isFetching: isCategoryReachFetching,
    error: categoryReachError,
  } = useGetCategoryReachDataQuery(categoryReachParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: bestSellingProductsData,
    isLoading: isBestSellingProductsLoading,
    isFetching: isBestSellingProductsFetching,
    error: bestSellingProductsError,
  } = useGetBestSellingProductsQuery(bestSellingParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: totalSalesData,
    isLoading: isTotalSalesLoading,
    isFetching: isTotalSalesFetching,
    error: totalSalesError,
  } = useGetTotalSalesDataQuery(totalSalesParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: orderInformationData,
    isLoading: isOrderInformationLoading,
    isFetching: isOrderInformationFetching,
    error: orderInformationError,
  } = useGetOrderInformationDataQuery(orderInfoParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: totalProductsSoldData,
    isLoading: isTotalProductsSoldLoading,
    isFetching: isTotalProductsSoldFetching,
    error: totalProductsSoldError,
  } = useGetTotalProductsSoldDataQuery(dashboardStatsParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: totalViewsData,
    isLoading: isTotalViewsLoading,
    isFetching: isTotalViewsFetching,
    error: totalViewsError,
  } = useGetTotalViewsDataQuery(dashboardStatsParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: conversionRateData,
    isLoading: isConversionRateLoading,
    isFetching: isConversionRateFetching,
    error: conversionRateError,
  } = useGetConversionRateDataQuery(dashboardStatsParams, {
    skip: skipUntilStoreSelected,
  });

  const {
    data: totalRevenueData,
    isLoading: isTotalRevenueLoading,
    isFetching: isTotalRevenueFetching,
    error: totalRevenueError,
  } = useGetTotalRevenueDataQuery(dashboardStatsParams, {
    skip: skipUntilStoreSelected,
  });

  const isAnyDashboardQueryFetching =
    isCategoryReachFetching ||
    isBestSellingProductsFetching ||
    isTotalSalesFetching ||
    isOrderInformationFetching ||
    isTotalProductsSoldFetching ||
    isTotalViewsFetching ||
    isConversionRateFetching ||
    isTotalRevenueFetching;

  useEffect(() => {
    setHasCompletedInitialLoad(false);
  }, [storeId]);

  useEffect(() => {
    if (skipUntilStoreSelected) {
      setHasCompletedInitialLoad(false);
      return;
    }

    if (!isAnyDashboardQueryFetching) {
      setHasCompletedInitialLoad(true);
    }
  }, [skipUntilStoreSelected, isAnyDashboardQueryFetching]);

  const dashboardData = {
    totalSales: totalSalesData,
    totalProductsSold: totalProductsSoldData,
    totalViews: totalViewsData,
  };

  const isDashboardLoading =
    skipUntilStoreSelected || !hasCompletedInitialLoad;

  return {
    dashboardData,
    isDashboardLoading,

    categoryReachData,
    isCategoryReachLoading,
    categoryReachError,

    bestSellingProductsData,
    isBestSellingProductsLoading,
    bestSellingProductsError,

    totalSalesData,
    isTotalSalesLoading,
    totalSalesError,

    orderInformationData,
    isOrderInformationLoading,
    orderInformationError,

    totalProductsSoldData,
    isTotalProductsSoldLoading,
    totalProductsSoldError,

    totalViewsData,
    isTotalViewsLoading,
    totalViewsError,

    conversionRateData,
    isConversionRateLoading,
    conversionRateError,

    totalRevenueData,
    isTotalRevenueLoading,
    totalRevenueError,

    setCurrentOrderInformationPeriod,
    setCurrentBestSellingProductsPeriod,
    setCurrentTotalSalesPeriod,
    setCurrentDashboardStatsPeriod,
    currentOrderInformationPeriod,
    currentBestSellingProductsPeriod,
    currentTotalSalesPeriod,
    currentDashboardStatsPeriod,
  };
};

export default useSellerDashboard;
