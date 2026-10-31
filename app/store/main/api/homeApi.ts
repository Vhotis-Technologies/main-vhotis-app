/**
 * homeApi — RTK Query endpoints for the mobile Home stack.
 *
 * DEAL FLOWS (two separate paths):
 *
 * 1) HomeScreen deal tiles → MainProductScreen
 *    - Hook: useDealProducts(dealType)
 *    - Endpoint: getDealsAndPromotions → GET /api/v1/home/get_deals_and_promotions/?deal_type=bogo
 *    - Server: get_products_by_deal_type (one deal category)
 *
 * 2) Mobile header "Today's Deals" → TodaysDealScreen
 *    - Hook: useTodaysDealProducts()
 *    - Endpoint: getTodaysDeals → GET /api/v1/home/get_todays_deals/?page=1&page_size=20
 *    - Server: get_todays_deals (all deal categories active today)
 *
 * Both product list endpoints return PaginatedProductsResponse (same shape as category).
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";
import ProductCardInterface, {
  ProductDetailsInterface,
} from "@/app/interfaces/main/product/Iteminterface";

/** Matches Django list responses: get_products_category, get_todays_deals, get_deals_and_promotions */
type PaginatedProductsResponse = {
  results: ProductCardInterface[];
  count: number;
  next: boolean;
  previous: boolean;
  page: number;
  page_size: number;
};

type ProductsByCategoryQueryArgs = {
  categoryId: string;
  page?: number;
  pageSize?: number;
};

/** HomeScreen → MainProductScreen (single deal type: bogo, percentage, flash_sale, bundle, fixed) */
type DealsAndPromotionsQueryArgs = {
  dealType: string;
  page?: number;
  pageSize?: number;
};

/** TodaysDealScreen only — no dealType; server returns all products on deals active today */
type TodaysDealsQueryArgs = {
  page?: number;
  pageSize?: number;
};

const homeApi = createApi({
  reducerPath: "homeApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /* Get all the categories along with the category images */
    getAllCategories: builder.query({
      query: () => ({
        url: "/api/v2/products/all_categories/",
        method: "GET",
      }),
    }),

    /* Gets the top trending categories, which will include the category images, id and title. There will only be 4 of these */
    getTopTrendingCategories: builder.query({
      query: () => ({
        url: "/api/v1/home/get_top_trending_categories/",
        method: "GET",
      }),
    }),

    /* Get the product list from stores that are running deals and promotions.
     * This is the popular products and will contain the id and the first images from each product.
     */
    getMostPopularProducts: builder.query({
      query: () => ({
        url: "/api/v1/home/most_popular_products/",
        method: "GET",
      }),
    }),

    /* Gets the best selling products based on the category .
     * The server will check for the best performing products in every category */
    getBestSellingProducts: builder.query({
      query: () => ({
        url: "/api/v1/home/get_best_selling_products/",
        method: "GET",
      }),
    }),

    /* Get all active deals from the database */
    getDeals: builder.query({
      query: () => ({
        url: "/api/v1/home/get_deals/",
        method: "GET",
      }),
    }),

    /**
     * Products for ONE deal type (Home deal grid).
     * @see useDealProducts in useMainProducts.ts
     */
    getDealsAndPromotions: builder.query<
      PaginatedProductsResponse,
      DealsAndPromotionsQueryArgs
    >({
      query: ({
        dealType,
        page = 1,
        pageSize = 20,
      }: DealsAndPromotionsQueryArgs) => ({
        url: `/api/v1/home/get_deals_and_promotions/`,
        method: "GET",
        params: {
          deal_type: dealType,
          page,
          page_size: pageSize,
        },
      }),
    }),

    /**
     * All products on deals active today (Today's Deals tab).
     * Pagination: pass page + pageSize; read `next` to load more.
     * @see useTodaysDealProducts in useMainProducts.ts
     */
    getTodaysDeals: builder.query<
      PaginatedProductsResponse,
      TodaysDealsQueryArgs
    >({
      query: ({ page = 1, pageSize = 20 }: TodaysDealsQueryArgs) => ({
        url: `/api/v1/home/get_todays_deals/`,
        method: "GET",
        params: {
          page,
          page_size: pageSize,
        },
      }),
    }),

    /* Using the id of the category, get all products of type {ProductInterface} */
    getProductsByCategory: builder.query<
      PaginatedProductsResponse,
      ProductsByCategoryQueryArgs
    >({
      query: ({
        categoryId,
        page = 1,
        pageSize = 20,
      }: {
        categoryId: string;
        page?: number;
        pageSize?: number;
      }) => ({
        url: `/api/v1/home/get_products_category/`,
        method: "GET",
        params: {
          category_id: categoryId,
          page,
          page_size: pageSize,
        },
      }),
    }),

    /* Get the details of individual product using the id */
    getProductDetails: builder.query<ProductDetailsInterface, string>({
      query: (id: string) => ({
        url: `/api/v1/products/get_product_details/`,
        method: "GET",
        params: {
          id: id,
        },
      }),
    }),

    /** Store-wide sponsored businesses for buyer home. */
    getSponsoredStores: builder.query<
      {
        store_id: string;
        store_name: string;
        slug?: string | null;
        tagline?: string | null;
        city?: string | null;
        average_rating?: number | null;
        ratings_count?: number | null;
        image?: string | null;
        is_sponsored?: boolean;
        sponsorship_type?: string;
      }[],
      void
    >({
      query: () => ({
        url: `/api/v1/home/get_sponsored_stores/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetTopTrendingCategoriesQuery,
  useGetMostPopularProductsQuery,
  useGetBestSellingProductsQuery,
  useGetDealsQuery,
  useGetDealsAndPromotionsQuery,
  useGetTodaysDealsQuery,
  useGetProductsByCategoryQuery,
  useGetProductDetailsQuery,
  useGetSponsoredStoresQuery,
} = homeApi;
export default homeApi;
