import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/app/store/main/api/rtkBaseQuery";
import {
  OrderItemInterface,
  RevenueDataInterface,
} from "@/app/interfaces/seller/orders/OrdersInterface";

const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders", "Revenue"],
  endpoints: (builder) => ({
    /* Define the endpoints for the order API */
    getAllOrders: builder.query({
      query: () => ({
        url: "/api/v2/orders/get_all_orders/",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    getAvailableOrders: builder.query<OrderItemInterface[], void>({
      query: () => ({
        url: "/api/v2/orders/get_available_orders/",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),

    getRevenue: builder.query({
      query: () => ({
        url: "/api/v2/orders/get_revenue/",
        method: "GET",
      }),
      providesTags: ["Revenue"],
    }),

    fulfillOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: "/api/v2/orders/fulfill_order/",
        method: "PATCH",
        data: { id },
      }),
      invalidatesTags: ["Orders"],
    }),

    claimOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: "/api/v2/orders/claim_order/",
        method: "POST",
        data: { id },
      }),
      invalidatesTags: ["Orders"],
    }),

    rejectOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: "/api/v2/orders/reject_order/",
        method: "POST",
        data: { id },
      }),
      invalidatesTags: ["Orders"],
    }),

    getOrderDetail: builder.query<OrderItemInterface, string>({
      query: (id) => ({
        url: "/api/v2/orders/get_order_detail/",
        method: "GET",
        params: { id },
      }),
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetAvailableOrdersQuery,
  useGetRevenueQuery,
  useFulfillOrderMutation,
  useClaimOrderMutation,
  useRejectOrderMutation,
  useGetOrderDetailQuery,
} = orderApi;
export default orderApi;
