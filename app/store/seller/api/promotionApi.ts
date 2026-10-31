import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import {
  CreateProductPromotionRequest,
  ProductSummary,
  PromotionHistoryResponse,
  PromotionHistoryInterface,
  PromotionRates,
} from "@/app/interfaces/seller/PromotionsInterface";

const promotionApi = createApi({
  reducerPath: "promotionApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    searchPromotionProducts: builder.query<ProductSummary[], string>({
      query: (q) => ({
        url: "/api/v2/promotions/get_product_list/",
        method: "GET",
        params: { q },
      }),
      transformResponse: (
        response: { id: string | number; name: string }[]
      ): ProductSummary[] =>
        response.map((product) => ({
          id: String(product.id),
          name: product.name,
        })),
    }),

    createProductPromotion: builder.mutation<
      unknown,
      CreateProductPromotionRequest
    >({
      query: (promotionData) => ({
        url: "/api/v2/promotions/create_product_promotion/",
        method: "POST",
        data: promotionData,
      }),
    }),

    getPromotionHistory: builder.query<
      PromotionHistoryInterface[],
      string | undefined
    >({
      query: (storeId) => ({
        url: "/api/v2/promotions/get_promotion_history/",
        method: "GET",
        params: storeId ? { store_id: storeId } : undefined,
      }),
      transformResponse: (
        response: PromotionHistoryResponse[],
      ): PromotionHistoryInterface[] => {
        return response.map((item) => ({
          ...item,
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
        }));
      },
    }),

    getPromotionRates: builder.query<PromotionRates, void>({
      query: () => ({
        url: "/api/v2/promotions/get_promotion_rates/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSearchPromotionProductsQuery,
  useLazySearchPromotionProductsQuery,
  useCreateProductPromotionMutation,
  useGetPromotionHistoryQuery,
  useGetPromotionRatesQuery,
} = promotionApi;
export default promotionApi;
