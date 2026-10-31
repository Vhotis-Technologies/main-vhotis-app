import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

const mainProductApi = createApi({
  reducerPath: "mainProductApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getProductDetails: builder.query({
      query: (id: string) => ({
        url: `/api/v1/products/get_product_details/`,
        params: { id: id },
        method: "GET",
      }),
    }),

    searchProducts: builder.query({
      query: ({
        searchQuery,
        page = 1,
        pageSize = 20,
      }: {
        searchQuery: string;
        page?: number;
        pageSize?: number;
      }) => ({
        url: `/api/v1/products/search_products/`,
        params: { q: searchQuery, page, page_size: pageSize },
        method: "GET",
      }),
    }),
  }),
});

export const { useGetProductDetailsQuery, useSearchProductsQuery } =
  mainProductApi;
export default mainProductApi;
