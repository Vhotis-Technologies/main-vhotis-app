import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";
import { StoreFrontResponse } from "@/app/interfaces/main/StoreFrontInterface";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";

interface StoreProductsResponse {
  results: ProductCardInterface[];
  count: number;
  next: boolean;
  previous: boolean;
  page: number;
  page_size: number;
}

interface StoreProductsQueryArgs {
  storeId: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
}

const storeFrontApi = createApi({
  reducerPath: "storeFrontApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["StoreFront", "StoreProducts"],
  endpoints: (builder) => ({
    getStoreFront: builder.query<StoreFrontResponse, string>({
      query: (storeId) => ({
        url: "/api/v1/store_front/get_store_front/",
        method: "GET",
        params: {
          store_id: storeId,
        },
      }),
      providesTags: ["StoreFront"],
    }),
    getStoreProducts: builder.query<
      StoreProductsResponse,
      StoreProductsQueryArgs
    >({
      query: ({ storeId, page = 1, pageSize = 20, categoryId }) => ({
        url: "/api/v1/store_front/get_store_products/",
        method: "GET",
        params: {
          store_id: storeId,
          page,
          page_size: pageSize,
          ...(categoryId ? { category_id: categoryId } : {}),
        },
      }),
      providesTags: ["StoreProducts"],
    }),
  }),
});

export const { useGetStoreFrontQuery, useGetStoreProductsQuery } =
  storeFrontApi;

export default storeFrontApi;
