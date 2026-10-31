import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: axiosBaseQuery(),

  endpoints: (builder) => ({
    createPaymentSheet: builder.mutation({
      query: ({ amount, checkout_id, delivery_address_id }) => ({
        url: "/api/v1/payment/create_payment_sheet/",
        method: "POST",
        data: { amount, checkout_id, delivery_address_id },
      }),
    }),

    getPaymentMethods: builder.query({
      query: () => ({
        url: "/api/v1/payment/get_payment_methods/",
        method: "GET",
      }),
    }),

    deletePaymentMethod: builder.query({
      query: ({ payment_method_id }) => ({
        url: "/api/v1/payment/delete_payment_method/",
        method: "DELETE",
        data: { payment_method_id },
      }),
    }),
  }),
});

export const {
  useCreatePaymentSheetMutation,
  useGetPaymentMethodsQuery,
  useDeletePaymentMethodQuery,
} = paymentApi;
export default paymentApi;
