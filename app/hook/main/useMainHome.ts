import { useEffect, useState } from "react";
import {
  useGetAllCategoriesQuery,
  useGetSponsoredStoresQuery,
} from "@/app/store/main/api/homeApi";
import { router } from "expo-router";
import useDeliveryAddress from "@/app/hook/main/useDeliveryAddress";

const useMainHome = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
  } = useGetAllCategoriesQuery({});

  const {
    data: sponsoredStores = [],
    isLoading: isLoadingSponsored,
    isFetching: isFetchingSponsored,
  } = useGetSponsoredStoresQuery();

  const {
    addresses,
    defaultAddress,
    deliveryLabel,
    isLoading: isLoadingAddresses,
    isFetching: isFetchingAddresses,
    isSettingDefault,
    selectDeliveryAddress,
    refetch: refetchAddresses,
  } = useDeliveryAddress();

  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  const isAnyHomeQueryFetching =
    isFetchingCategories || isFetchingAddresses || isFetchingSponsored;

  useEffect(() => {
    if (!isAnyHomeQueryFetching) {
      setHasCompletedInitialLoad(true);
    }
  }, [isAnyHomeQueryFetching]);

  const isHomeLoading = !hasCompletedInitialLoad;

  const fetchProductsByCategory = (categoryId: string, page: number = 1) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/MainProductScreen",
      params: { categoryId: categoryId, page: page.toString() },
    });
  };

  const navigateToDealsProducts = (dealType: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/MainProductScreen",
      params: { dealType },
    });
  };

  const navigateToSponsoredStore = (storeId: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/StoreFrontScreen",
      params: { storeId },
    });
  };

  return {
    addresses,
    defaultAddress,
    deliveryLabel,
    isLoadingAddresses,
    isFetchingAddresses,
    isSettingDefault,
    selectDeliveryAddress,
    refetchAddresses,
    categories,
    sponsoredStores: Array.isArray(sponsoredStores) ? sponsoredStores : [],
    isLoadingSponsored,
    isLoadingCategories,
    isHomeLoading,
    fetchProductsByCategory,
    navigateToDealsProducts,
    navigateToSponsoredStore,
  };
};

export default useMainHome;
