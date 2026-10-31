import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";

export type DashboardStoreParams = {
  storeId?: string;
};

export type DashboardTimeframeParams = DashboardStoreParams & {
  timeframe: string;
};

const timeframeParams = ({ timeframe, storeId }: DashboardTimeframeParams) => ({
  timeframe,
  ...(storeId ? { store_id: storeId } : {}),
});

const storeParams = (params?: DashboardStoreParams) =>
  params?.storeId ? { store_id: params.storeId } : undefined;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /* Get the total  */
    /*
     * Data is used to populate the category reach component.
     * The data contains the name of the category, and a data for views product listed under it gets daily*/
    getCategoryReachData: builder.query({
      query: (params: DashboardStoreParams | void = {}) => ({
        url: "/api/v2/dashboard/product_reach/",
        method: "GET",
        params: storeParams(params),
      }),
    }),

    /* Get the top trending products data.
     * Returns the best performing data like { name, image, price, sales, earning for the product over a period of time} */
    getBestSellingProducts: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/best_selling_products/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /* Get the order information data. */
    getOrderInformationData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/order_information/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),
    /**
     * Get the total sales data.
     * This data will include the total sales, the sales from the last month, the sales from the previous month, and the percentage change in sales.
     *
     * The credential param is the timeframe of the data to be returned. Note that the default will be the last 7 days. (weekly)
     */
    getTotalSalesData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/total_sales/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /**
     * Get the total products sold data.
     * Returns the total products sold for current and previous periods based on timeframe.
     */
    getTotalProductsSoldData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/total_products_sold/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /**
     * Get the total views data.
     * Returns the total views for current and previous periods based on timeframe.
     */
    getTotalViewsData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/total_views/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /* Get product reach data by category ID */
    getProductReachByCategory: builder.query({
      query: ({
        categoryId,
        storeId,
      }: {
        categoryId: string;
        storeId?: string;
      }) => ({
        url: "/api/v2/dashboard/product_reach_by_category/",
        method: "GET",
        params: {
          category_id: categoryId,
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),
    }),

    /**
     * Get conversion rate data.
     * Returns the conversion rate (views to orders) for current and previous periods based on timeframe.
     */
    getConversionRateData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/conversion_rate/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /**
     * Get total revenue data.
     * Returns the total revenue from claimed orders for current and previous periods based on timeframe.
     */
    getTotalRevenueData: builder.query({
      query: (params: DashboardTimeframeParams) => ({
        url: "/api/v2/dashboard/total_revenue/",
        method: "GET",
        params: timeframeParams(params),
      }),
    }),

    /**
     * Get top product statistics.
     * Returns detailed all-time statistics for a specific product including revenue, views, sales, orders, images, and videos.
     */
    getTopProductStatistics: builder.query({
      query: ({
        productId,
        storeId,
      }: {
        productId: string;
        storeId?: string;
      }) => ({
        url: "/api/v2/dashboard/top_product_statistics/",
        method: "GET",
        params: {
          product_id: productId,
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),
    }),
  }),
});

export const {
  useGetCategoryReachDataQuery,
  useGetBestSellingProductsQuery,
  useGetOrderInformationDataQuery,
  useGetTotalSalesDataQuery,
  useGetTotalProductsSoldDataQuery,
  useGetTotalViewsDataQuery,
  useGetProductReachByCategoryQuery,
  useGetConversionRateDataQuery,
  useGetTotalRevenueDataQuery,
  useGetTopProductStatisticsQuery,
} = dashboardApi;

export default dashboardApi;
