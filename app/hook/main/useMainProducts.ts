import { useState, useCallback } from "react";
import { router } from "expo-router";
import { useSearchProductsQuery } from "@/app/store/main/api/mainProductApi";
import {
  useGetProductsByCategoryQuery,
  useGetDealsAndPromotionsQuery,
  useGetTodaysDealsQuery,
} from "@/app/store/main/api/homeApi";
import { useGetStoreProductsQuery } from "@/app/store/main/api/storeFrontApi";
import useMainCart from "@/app/hook/main/useMainCart";
import { usePaginatedProductList, toPaginationQuerySlice } from "@/app/hook/main/usePaginatedProductList";

/** Items per page — must match server default page_size (20) for consistent pagination */
const PAGE_SIZE = 20;

/**
 * Custom hook for managing product search data, pagination, and user interactions
 */
export const useMainProducts = (
  searchQuery?: string,
  skip: boolean = false
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { addProductToCart, isAddingToCartItem } = useMainCart();

  const query = useSearchProductsQuery(
    { searchQuery: searchQuery || "", page: currentPage, pageSize: PAGE_SIZE },
    { skip: !searchQuery || skip }
  );

  const pagination = usePaginatedProductList(
    searchQuery,
    !searchQuery || skip,
    toPaginationQuerySlice(query),
    currentPage,
    setCurrentPage
  );

  const handleAddToCart = useCallback(
    (productId: string) => {
      addProductToCart(productId);
    },
    [addProductToCart]
  );

  const handleViewProductDetails = useCallback((productId: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
      params: { id: productId },
    });
  }, []);

  const getProductLoadingState = useCallback(
    (productId: string) => isAddingToCartItem(productId),
    [isAddingToCartItem]
  );

  return {
    ...pagination,
    currentData: query.data,
    handleAddToCart,
    handleViewProductDetails,
    getProductLoadingState,
  };
};

/**
 * Paginated products for a category on MainProductScreen
 */
export const useCategoryProducts = (
  categoryId?: string,
  skip: boolean = false
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const query = useGetProductsByCategoryQuery(
    {
      categoryId: categoryId || "",
      page: currentPage,
      pageSize: PAGE_SIZE,
    },
    { skip: !categoryId || skip }
  );

  return usePaginatedProductList(
    categoryId,
    !categoryId || skip,
    toPaginationQuerySlice(query),
    currentPage,
    setCurrentPage
  );
};

/**
 * Paginated products for a SINGLE deal type on MainProductScreen.
 *
 * Flow: HomeScreen tile → navigateToDealsProducts("bogo") → MainProductScreen params.dealType
 * API: getDealsAndPromotions → /api/v1/home/get_deals_and_promotions/?deal_type=...
 */
export const useDealProducts = (dealType?: string, skip: boolean = false) => {
  const [currentPage, setCurrentPage] = useState(1);

  const query = useGetDealsAndPromotionsQuery(
    {
      dealType: dealType || "",
      page: currentPage,
      pageSize: PAGE_SIZE,
    },
    { skip: !dealType || skip }
  );

  return usePaginatedProductList(
    dealType,
    !dealType || skip,
    toPaginationQuerySlice(query),
    currentPage,
    setCurrentPage
  );
};

/**
 * Paginated products for the Today's Deals tab (all deal types active today).
 *
 * Flow: mobile _layout "Todays Deals" → TodaysDealScreen
 * API: getTodaysDeals → /api/v1/home/get_todays_deals/ (NOT get_deals_and_promotions)
 *
 * Returns the same pagination API as useCategoryProducts / useStoreProducts:
 *   allProducts, loadMoreProducts, onRefresh, isInitialLoading, isLoadingMore, isEmpty, error, ...
 *
 * How load more works:
 *   1. RTK refetches when currentPage increments
 *   2. usePaginatedProductList merges data.results into allProducts when data.next is true
 *   3. FlatList onEndReached calls loadMoreProducts
 */
export const useTodaysDealProducts = (skip: boolean = false) => {
  const [currentPage, setCurrentPage] = useState(1);

  const query = useGetTodaysDealsQuery(
    {
      page: currentPage,
      pageSize: PAGE_SIZE,
    },
    { skip }
  );

  return usePaginatedProductList(
    "todays-deals",
    skip,
    toPaginationQuerySlice(query),
    currentPage,
    setCurrentPage
  );
};

/**
 * Paginated products for a store on StoreFrontProductScreen
 */
export const useStoreProducts = (
  storeId?: string,
  skip: boolean = false,
  categoryId?: string
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const query = useGetStoreProductsQuery(
    {
      storeId: storeId || "",
      page: currentPage,
      pageSize: PAGE_SIZE,
      categoryId,
    },
    { skip: !storeId || skip }
  );

  return usePaginatedProductList(
    `${storeId ?? ""}-${categoryId ?? "all"}`,
    !storeId || skip,
    toPaginationQuerySlice(query),
    currentPage,
    setCurrentPage
  );
};
