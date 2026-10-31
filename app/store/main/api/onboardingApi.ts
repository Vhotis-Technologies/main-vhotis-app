import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /* Register a new user by sending the user details to the server */
    register_user: builder.mutation ({
      query: (credentials) => ({
        url: "/api/v1/onboarding/onboarding_user/",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Register the seller by collecting and sending all the required details to the server.
     * The data would contain the users details, store details, business information and address.
     */
    register_seller: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/onboarding/onboarding_seller/",
        method: "POST",
        data: credentials,
      }),
    }),

    fetch_market_verticals: builder.query({
      query: () => ({
        url: "/api/v1/onboarding/seller_market_verticals/",
        method: "GET",
      }),
    }),

    configure_user_store: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/onboarding/create_store/",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Send the verification code to the user's email */
    send_verification_code: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/onboarding/send_verification_code/",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Register the user business information on the server */
  }),
});

export const {
  useRegister_userMutation,
  useRegister_sellerMutation,
  useConfigure_user_storeMutation,
  useSend_verification_codeMutation,
  useFetch_market_verticalsQuery,
} = onboardingApi;
