import { useGetSellerReviewsQuery } from "@/app/store/seller/api/reviewsApi";

export const useSellerReviews = (filters?: {
  product_id?: string;
  order_id?: string;
}) => {
  const {
    data: reviews = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSellerReviewsQuery(filters);

  return {
    reviews,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
