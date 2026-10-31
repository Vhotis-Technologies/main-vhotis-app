import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";
import {
  SubmitOrderReviewPayload,
  SubmitOrderReviewResponse,
} from "@/app/interfaces/main/orders/ReviewInterfaces";

const mainOrderApi = createApi({
  reducerPath: "mainOrderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => ({
        url: "/api/v1/orders/get_all_orders/",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `/api/v1/orders/order_details/`,
        method: "GET",
        params: {
          id: id,
        },
      }),
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    trackOrder: builder.query({
      query: (id) => ({
        url: `/api/v1/orders/track_order/`,
        method: "GET",
        params: {
          id,
        },
      }),
    }),

    submitOrderReview: builder.mutation<
      SubmitOrderReviewResponse,
      SubmitOrderReviewPayload
    >({
      query: (data) => ({
        url: `/api/v1/orders/submit_order_review/`,
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Orders", id: arg.order_id },
        "Orders",
      ],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderDetailsQuery,
  useTrackOrderQuery,
  useLazyTrackOrderQuery,
  useSubmitOrderReviewMutation,
} = mainOrderApi;
export default mainOrderApi;
