import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Cart",
    "CartItems",
    "CartCheckout",
    "RecentlyViewedItems",
    "RecommendedProducts",
    "CoPurchaseProducts",
  ],
  endpoints: (builder) => ({
    addItemToCart: builder.mutation({
      query: (payload: string | { productId: string; quantity?: number; bundleAdd?: boolean }) => {
        const productId = typeof payload === "string" ? payload : payload.productId;
        const data: Record<string, unknown> = { product_id: productId };
        if (typeof payload === "object") {
          if (payload.quantity && payload.quantity > 1) {
            data.quantity = payload.quantity;
          }
          if (payload.bundleAdd) {
            data.bundle_add = true;
          }
        }
        return {
          url: "/api/v1/cart/add_item_to_cart/",
          method: "PATCH",
          data,
        };
      },
      invalidatesTags: ["CartItems", "CartCheckout"],
    }),

    decrementCartItem: builder.mutation({
      query: (id) => ({
        url: "/api/v1/cart/decrement_cart_item/",
        method: "PATCH",
        data: {
          product_id: id,
        },
      }),
      invalidatesTags: ["CartItems", "CartCheckout"],
    }),

    deleteCartItem: builder.mutation({
      query: (cart_item_id: string) => ({
        url: "/api/v1/cart/delete_cart_item/",
        method: "DELETE",
        data: {
          cart_item_id: cart_item_id,
        },
      }),
      invalidatesTags: ["CartItems", "CartCheckout"],
    }),

    deleteCart: builder.mutation({
      query: () => ({
        url: "/api/v1/cart/remove_cart/",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart", "CartItems", "CartCheckout"],
    }),

    /* Get all the items in the user's cart.
     * This will be the product name, quantity, subtotal, and prices alongside the product id and image*/
    getCartItems: builder.query({
      query: () => ({
        url: "/api/v1/cart/get_cart_items/",
        method: "GET",
      }),
      providesTags: ["CartItems"],
    }),

    /* Get the total value of the checkout including the delivery fee, service fee, vat and the total amount. also the delivery time would be returned */
    getCartCheckout: builder.query({
      query: () => ({
        url: "/api/v1/cart/get_cart_checkout/",
        method: "GET",
      }),
      providesTags: ["CartCheckout"],
    }),

    /* Create a checkout instance with delivery address to calculate real fees
     * ARGS: deliveryAddress (The delivery address data)
     * This will create a Checkout model instance and return calculated fees
     */
    createCheckout: builder.mutation({
      query: (payload) => {
        const body =
          payload &&
          typeof payload === "object" &&
          "delivery_address" in payload
            ? payload
            : {
                delivery_address: payload,
              };

        return {
          url: "/api/v1/cart/create_checkout/",
          method: "POST",
          data: body,
        };
      },
      invalidatesTags: ["CartCheckout"],
    }),

    /* Add the item to a wishlist model on the server using the product id.
     * This will remove the item from the cart if it exists.
     * ARGS: id (The id of the product to be added to the wishlist)
     * This will return a message if the product is already in the wishlist or if it was added successfully
     */
    addItemToWishlist: builder.mutation({
      query: (id) => ({
        url: "/api/v1/cart/add_item_to_wishlist/",
        method: "PATCH",
        data: {
          product_id: id,
        },
      }),
      invalidatesTags: ["CartItems", "CartCheckout"],
    }),

    /* Get the recently viewed items for the user */
    getRecentlyViewedItems: builder.query({
      query: () => ({
        url: "/api/v1/cart/get_recently_viewed_items/",
        method: "GET",
      }),
      providesTags: ["RecentlyViewedItems"],
    }),

    /* Get the recommended products for the user */
    getRecommendedProducts: builder.query({
      query: () => ({
        url: "/api/v1/cart/get_recommended_products/",
        method: "GET",
      }),
      providesTags: ["RecommendedProducts"],
    }),

    /* Get co-purchase products based on other users' baskets */
    getCoPurchaseProducts: builder.query({
      query: () => ({
        url: "/api/v1/cart/get_co_purchase_products/",
        method: "GET",
      }),
      providesTags: ["CoPurchaseProducts"],
    }),
  }),
});

export const {
  useAddItemToCartMutation,
  useDecrementCartItemMutation,
  useDeleteCartMutation,
  useGetCartItemsQuery,
  useGetCartCheckoutQuery,
  useCreateCheckoutMutation,
  useAddItemToWishlistMutation,
  useDeleteCartItemMutation,
  useGetRecentlyViewedItemsQuery,
  useGetRecommendedProductsQuery,
  useGetCoPurchaseProductsQuery,
} = cartApi;

export default cartApi;
