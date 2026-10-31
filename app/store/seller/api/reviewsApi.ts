import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/app/store/main/api/rtkBaseQuery";
import { SellerProductReview } from "@/app/interfaces/main/orders/ReviewInterfaces";

const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SellerReviews"],
  endpoints: (builder) => ({
    getSellerReviews: builder.query<
      SellerProductReview[],
      { product_id?: string; order_id?: string } | void
    >({
      query: (params) => ({
        url: "/api/v2/reviews/get_seller_reviews/",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["SellerReviews"],
    }),
  }),
});

export const { useGetSellerReviewsQuery } = reviewsApi;
export default reviewsApi;
