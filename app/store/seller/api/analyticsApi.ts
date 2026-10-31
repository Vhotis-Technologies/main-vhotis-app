import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import {
  LinkVisitsResponse,
  LinkVisitsTimeframe,
} from "@/app/interfaces/seller/LinkVisitsInterfaces";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    // Sales Analytics
    getTimeSeriesData: builder.query({
      query: (timeframe) => ({
        url: `/api/v2/analytics/time_series_data/`,
        method: "GET",
        params: { timeframe: timeframe },
      }),
    }),

    getHeatmapData: builder.query({
      query: () => ({
        url: "/api/v2/analytics/heatmap_data/",
        method: "GET",
      }),
    }),

    getFunnelData: builder.query({
      query: () => ({
        url: "/api/v2/analytics/funnel_data/",
        method: "GET",
      }),
    }),

    // Customer Analytics
    getCustomerDemographics: builder.query({
      query: () => ({
        url: "/api/v2/analytics/customer_demographics/",
        method: "GET",
      }),
    }),

    getCustomerBehavior: builder.query({
      query: () => ({
        url: "/api/v2/analytics/customer_behavior/",
        method: "GET",
      }),
    }),

    getCustomerSegments: builder.query({
      query: () => ({
        url: "/api/v2/analytics/customer_segments/",
        method: "GET",
      }),
    }),

    getLinkVisits: builder.query<
      LinkVisitsResponse,
      { timeframe?: LinkVisitsTimeframe; storeId?: string }
    >({
      query: ({ timeframe = "30d", storeId }) => ({
        url: "/api/v2/analytics/link_visits/",
        method: "GET",
        params: {
          timeframe,
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),
    }),
  }),
});

export const {
  useGetTimeSeriesDataQuery,
  useGetHeatmapDataQuery,
  useGetFunnelDataQuery,
  useGetCustomerDemographicsQuery,
  useGetCustomerBehaviorQuery,
  useGetCustomerSegmentsQuery,
  useGetLinkVisitsQuery,
} = analyticsApi;

export default analyticsApi;
