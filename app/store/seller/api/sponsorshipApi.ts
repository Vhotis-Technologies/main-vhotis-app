import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import {
  PromotionHistoryResponse,
  PromotionHistoryInterface,
} from "@/app/interfaces/seller/PromotionsInterface";
import {
  CreateProductSponsorRequest,
  CreateStoreSponsorRequest,
} from "@/app/interfaces/seller/SponsorInterface";

const sponsorshipApi = createApi({
  reducerPath: "sponsorshipApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createStoreSponsorship: builder.mutation<
      unknown,
      CreateStoreSponsorRequest
    >({
      query: (payload) => ({
        url: "/api/v2/sponsorships/create_store_sponsorship/",
        method: "POST",
        data: payload,
      }),
    }),

    createProductSponsorship: builder.mutation<
      unknown,
      CreateProductSponsorRequest
    >({
      query: (payload) => ({
        url: "/api/v2/sponsorships/create_product_sponsorship/",
        method: "POST",
        data: payload,
      }),
    }),

    getSponsorHistory: builder.query<
      PromotionHistoryInterface[],
      string | undefined
    >({
      query: (storeId) => ({
        url: "/api/v2/sponsorships/get_sponsor_history/",
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
  }),
});

export const {
  useCreateStoreSponsorshipMutation,
  useCreateProductSponsorshipMutation,
  useGetSponsorHistoryQuery,
} = sponsorshipApi;
export default sponsorshipApi;
