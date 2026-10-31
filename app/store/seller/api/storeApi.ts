import { createApi } from "@reduxjs/toolkit/query/react";

import { Seller } from "@/app/interfaces/main/Authentication";

import {
  CreateStoreRequest,
  CreateStoreResponse,
  SellerStoreDetailsResponse,
  SellerStoresResponse,
} from "@/app/interfaces/seller/StoreInterface";

import { axiosBaseQuery } from "../../main/api/rtkBaseQuery";

const storeApi = createApi({
  reducerPath: "storeApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["SellerStores", "SellerStoreDetails"],

  endpoints: (builder) => ({
    getSellerStores: builder.query<SellerStoresResponse, void>({
      query: () => ({
        url: "/api/v2/store/list_stores/",

        method: "GET",
      }),

      providesTags: ["SellerStores"],
    }),

    getStoreDetails: builder.query<SellerStoreDetailsResponse, string>({
      query: (storeId) => ({
        url: "/api/v2/store/get_store_details/",

        method: "GET",

        params: { store_id: storeId },
      }),

      providesTags: (_result, _error, storeId) => [
        { type: "SellerStoreDetails", id: storeId },
      ],
    }),

    createStore: builder.mutation<CreateStoreResponse, CreateStoreRequest>({
      query: (credentials) => ({
        url: "/api/v2/store/create_store/",

        method: "POST",

        data: credentials,
      }),

      invalidatesTags: ["SellerStores"],
    }),

    deactivateStore: builder.mutation<
      { message: string; store_id?: string },
      { storeId: string }
    >({
      query: ({ storeId }) => ({
        url: "/api/v2/store/deactivate_store/",

        method: "PATCH",

        data: { store_id: storeId },
      }),

      invalidatesTags: ["SellerStores", "SellerStoreDetails"],
    }),

    updateStoreState: builder.mutation<
      { message: string; store_id?: string; store_status?: string },
      { store_status: string; storeId?: string }
    >({
      query: (credentials) => ({
        url: "/api/v2/store/update_store_state/",

        method: "PATCH",

        data: {
          store_status: credentials.store_status,

          store_id: credentials.storeId,
        },
      }),
    }),

    updateStoreDetails: builder.mutation<
      { message: string; user: Seller; store_id?: string },
      {
        businessName: string;

        businessDescription: string;

        businessAddress: string;

        businessCity: string;

        businessPostcode: string;

        businessCountry: string;

        businessPhone?: string;

        latitude?: number;

        longitude?: number;

        weekdayOpen?: string;

        weekdayClose?: string;

        weekendOpen?: string;

        weekendClose?: string;

        storeSlug?: string;

        storeId?: string;
      }
    >({
      query: (credentials) => ({
        url: "/api/v2/store/update_store_details/",

        method: "PATCH",

        data: {
          ...credentials,

          store_id: credentials.storeId,
        },
      }),

      invalidatesTags: (_result, _error, arg) =>
        arg.storeId
          ? ["SellerStores", { type: "SellerStoreDetails", id: arg.storeId }]
          : ["SellerStores"],
    }),
  }),
});

export const {
  useGetSellerStoresQuery,

  useGetStoreDetailsQuery,

  useCreateStoreMutation,

  useDeactivateStoreMutation,

  useUpdateStoreStateMutation,

  useUpdateStoreDetailsMutation,
} = storeApi;

export default storeApi;
