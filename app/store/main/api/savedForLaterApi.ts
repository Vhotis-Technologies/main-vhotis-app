import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

export interface SavedForLaterItem {
  id: string;
  product_id: string;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
  category: string | null;
  is_available: boolean;
  store_name: string | null;
  saved_at: string;
}

export interface SavedForLaterResponse {
  count: number;
  items: SavedForLaterItem[];
}

const savedForLaterApi = createApi({
  reducerPath: "savedForLaterApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SavedForLater", "CartItems", "CartCheckout"],
  endpoints: (builder) => ({
    /**
     * Get all items in SavedForLater
     */
    getSavedItems: builder.query<SavedForLaterResponse, void>({
      query: () => ({
        url: "/api/v1/saved/get_saved_items/",
        method: "GET",
      }),
      providesTags: ["SavedForLater"],
    }),

    /**
     * Add item from cart to SavedForLater
     * Removes from cart and preserves quantity
     */
    addToSaved: builder.mutation<
      { data: { message: string } } | { error: string },
      string
    >({
      query: (id) => ({
        url: "/api/v1/saved/add_to_saved/",
        method: "PATCH",
        data: {
          product_id: id,
        },
      }),
      invalidatesTags: ["SavedForLater", "CartItems", "CartCheckout"],
    }),

    /**
     * Remove item from SavedForLater
     */
    removeFromSaved: builder.mutation<
      { message: string },
      { product_id: string }
    >({
      query: (data) => ({
        url: "/api/v1/saved/remove_from_saved/",
        method: "DELETE",
        data,
      }),
      invalidatesTags: ["SavedForLater"],
    }),

    /**
     * Move item from SavedForLater back to cart
     */
    moveToCart: builder.mutation<{ message: string }, { product_id: string }>({
      query: (data) => ({
        url: "/api/v1/saved/move_to_cart/",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["SavedForLater", "CartItems", "CartCheckout"],
    }),
  }),
});

export const {
  useGetSavedItemsQuery,
  useAddToSavedMutation,
  useRemoveFromSavedMutation,
  useMoveToCartMutation,
} = savedForLaterApi;

export default savedForLaterApi;
