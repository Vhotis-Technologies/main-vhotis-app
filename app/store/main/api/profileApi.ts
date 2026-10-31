import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";

/**
 * Profile API for fetching user profile data, statistics, and activity
 */

export interface ProfileStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  wishlist_count: number;
  member_since: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: string;
  image: string | null;
  category: string | null;
  is_available: boolean;
  store_name: string | null;
  added_at: string;
}

export interface WishlistResponse {
  count: number;
  items: WishlistItem[];
}

export interface RecentActivity {
  type: string;
  id: number;
  status: string;
  payment_status: string;
  total_amount: string;
  items_count: number;
  preview_image: string | null;
  created_at: string;
  formatted_date: string;
}

export interface RecentActivityResponse {
  count: number;
  activities: RecentActivity[];
}

export interface ProfileOverview {
  stats: ProfileStats;
  wishlist: WishlistResponse;
  recent_activity: RecentActivityResponse;
}

const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ProfileStats", "Wishlist", "RecentActivity", "DeliveryAddresses"],
  endpoints: (builder) => ({
    /**
     * Get user profile statistics
     * Returns: total orders, wishlist count, user rating, etc.
     */
    getProfileStats: builder.query<ProfileStats, void>({
      query: () => ({
        url: "/api/v1/profile/get_profile_stats/",
        method: "GET",
      }),
      providesTags: ["ProfileStats"],
    }),

    /**
     * Get user's wishlist items
     * Returns: list of products in wishlist with details
     */
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => ({
        url: "/api/v1/profile/get_wishlist/",
        method: "GET",
      }),
      providesTags: ["Wishlist"],
    }),

    /**
     * Get user's recent activity (orders, etc.)
     * Returns: recent orders and activities
     */
    getRecentActivity: builder.query<RecentActivityResponse, void>({
      query: () => ({
        url: "/api/v1/profile/get_recent_activity/",
        method: "GET",
      }),
      providesTags: ["RecentActivity"],
    }),

    /**
     * Get complete profile overview
     * Returns: stats, wishlist, and recent activity in one call
     */
    getProfileOverview: builder.query<ProfileOverview, void>({
      query: () => ({
        url: "/api/v1/profile/get_profile_overview/",
        method: "GET",
      }),
      providesTags: ["ProfileStats", "Wishlist", "RecentActivity"],
    }),

    /**
     * Remove item from wishlist
     * Args: product_id - ID of the product to remove
     */
    removeWishlistItem: builder.mutation<
      { message: string },
      { product_id: string }
    >({
      query: (data) => ({
        url: "/api/v1/profile/remove_wishlist_item/",
        method: "DELETE",
        data,
      }),
      invalidatesTags: ["Wishlist", "ProfileStats"],
    }),

    /**
     * Add item to wishlist (from heart icon)
     * Does NOT remove from cart
     * Args: product_id - ID of the product to add
     */
    addToWishlist: builder.mutation<
      { message: string },
      { product_id: string }
    >({
      query: (data) => ({
        url: "/api/v1/profile/add_to_wishlist/",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Wishlist", "ProfileStats"],
    }),

    /**
     * Get all delivery addresses associated to a user
     */
    getAllAddresses: builder.query<DeliveryAddress[], void>({
      query: () => ({
        url: "/api/v1/profile/get_all_addresses/",
        method: "GET",
      }),
      providesTags: ["DeliveryAddresses"],
    }),

    getDefaultDeliveryAddress: builder.query<DeliveryAddress, void>({
      query: () => ({
        url: "/api/v1/profile/get_default_delivery_address/",
        method: "GET",
      }),
      providesTags: ["DeliveryAddresses"],
    }),

    setDefaultDeliveryAddress: builder.mutation<
      { success: boolean; delivery_address: DeliveryAddress },
      { address_id: string }
    >({
      query: (data) => ({
        url: "/api/v1/profile/set_default_delivery_address/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["DeliveryAddresses"],
    }),

    /**
     * Add a delivery address to a user
     * Args: delivery_name - Name of the delivery address
     * Args: address - Address of the delivery address
     * Args: address2 - Address 2 of the delivery address
     * Args: city - City of the delivery address
     * Args: zip_code - Zip code of the delivery address
     * Args: country - Country of the delivery address
     */
    addDeliveryAddress: builder.mutation<
      { success: boolean; delivery_address: DeliveryAddress },
      DeliveryAddress
    >({
      query: (delivery_address) => ({
        url: "/api/v1/profile/add_delivery_address/",
        method: "POST",
        data: delivery_address,
      }),
      invalidatesTags: ["DeliveryAddresses", "ProfileStats"],
    }),
  }),
});

export const {
  useGetProfileStatsQuery,
  useGetWishlistQuery,
  useGetRecentActivityQuery,
  useGetProfileOverviewQuery,
  useRemoveWishlistItemMutation,
  useAddToWishlistMutation,
  useGetAllAddressesQuery,
  useGetDefaultDeliveryAddressQuery,
  useSetDefaultDeliveryAddressMutation,
  useAddDeliveryAddressMutation,
} = profileApi;

export default profileApi;
