/**
 * usePaginatedProductList — shared infinite-scroll state for product list screens.
 *
 * Used by: useCategoryProducts, useDealProducts, useTodaysDealProducts, useStoreProducts, useMainProducts
 *
 * Expects the server to return:
 *   { results: Product[], next: boolean, count, page, page_size, previous }
 *
 * - Page 1: replaces allProducts with results
 * - Page 2+: appends new results (deduped by id) when currentPage increases
 * - loadMoreProducts: bumps currentPage if data.next was true on the last response
 * - onRefresh: resets to page 1 and refetches
 */
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";

export type PaginatedProductResponse = {
  results: Array<{ id?: string }>;
  next?: boolean;
};

type PaginationQuerySlice = {
  data?: PaginatedProductResponse;
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  refetch: () => unknown;
};

export function toPaginationQuerySlice(query: {
  data?: PaginatedProductResponse;
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  refetch: () => unknown;
}): PaginationQuerySlice {
  return query;
}

export function usePaginatedProductList(
  resetKey: string | undefined | null,
  skip: boolean,
  query: PaginationQuerySlice,
  currentPage: number,
  setCurrentPage: Dispatch<SetStateAction<number>>
) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastMergedPageRef = useRef(0);

  const { data, isLoading, isFetching, error, refetch } = query;

  useEffect(() => {
    if (skip) return;
    setCurrentPage(1);
    setAllProducts([]);
    setHasNextPage(true);
    lastMergedPageRef.current = 0;
  }, [resetKey, skip, setCurrentPage]);

  useEffect(() => {
    if (!data?.results || skip) return;

    if (currentPage === 1) {
      lastMergedPageRef.current = 1;
      setAllProducts(data.results);
    } else if (currentPage > lastMergedPageRef.current) {
      lastMergedPageRef.current = currentPage;
      setAllProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = data.results.filter(
          (p) => p.id && !existingIds.has(p.id)
        );
        return [...prev, ...newItems];
      });
    } else {
      return;
    }

    setHasNextPage(data.next || false);
    setIsLoadingMore(false);
  }, [data, currentPage, skip]);

  useEffect(() => {
    if (data?.results && currentPage === 1 && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [data, currentPage, isRefreshing]);

  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasNextPage && !isLoading && !isFetching) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasNextPage, isLoading, isFetching, setCurrentPage]);

  const onRefresh = useCallback(() => {
    if (skip) return;

    setIsRefreshing(true);
    setHasNextPage(true);
    lastMergedPageRef.current = 0;
    setCurrentPage(1);

    Promise.resolve(refetch())
      .catch(() => null)
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refetch, skip, setCurrentPage]);

  const isEmpty =
    allProducts.length === 0 &&
    !isLoading &&
    !isFetching &&
    !isRefreshing &&
    !skip &&
    !(data?.results?.length);

  const isInitialLoading =
    currentPage === 1 &&
    allProducts.length === 0 &&
    !skip &&
    !error &&
    (isLoading || isFetching || (data?.results?.length ?? 0) > 0);

  return {
    allProducts,
    isLoadingProducts: isLoading,
    isFetchingProducts: isFetching,
    isLoadingMore,
    isRefreshing,
    error,
    loadMoreProducts,
    onRefresh,
    hasNextPage,
    currentPage,
    isEmpty,
    isInitialLoading,
  };
}
