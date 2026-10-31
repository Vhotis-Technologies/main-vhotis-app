import { useAlertContext } from "@/app/contexts/AlertContext";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { CartItems } from "@/app/interfaces/main/cart/CartInterface";
import {
  useAddItemToCartMutation,
  useDecrementCartItemMutation,
  useDeleteCartItemMutation,
  useDeleteCartMutation,
  useGetCartItemsQuery,
  useGetCartCheckoutQuery,
  useGetRecentlyViewedItemsQuery,
} from "@/app/store/main/api/cartApi";
import { useAddToSavedMutation } from "@/app/store/main/api/savedForLaterApi";
import {
  setCartCalculation,
  setCartItems,
  setLoadingState,
  decrementCartItem,
  addCartItem,
  deleteCartItem as deleteCartItemFromStore,
  clearCart,
} from "@/app/store/main/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import React, { useCallback } from "react";

import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";

type RecentlyViewedProduct = ProductCardInterface & {
  view_count?: number;
  viewed_at?: string | null;
};

const useMainCart = () => {
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showSnackbarWithConfig } = useSnackbar();
  const dispatch = useAppDispatch();
  const { cartItems: storeCartItems } = useAppSelector((state) => state.cart);

  /* Define a list of states  of array tyope that would be used to hold the loading state of individual items */
  const [addingToCartItems, setAddingToCartItems] = React.useState<string[]>(
    []
  );
  const [removingFromCartItems, setRemovingFromCartItems] = React.useState<
    string[]
  >([]);
  const [deletingCartItems, setDeletingCartItems] = React.useState<string[]>(
    []
  );
  const [addingToWishlistItems, setAddingToWishlistItems] = React.useState<
    string[]
  >([]);

  /* Here we will simply import the hooks from the cart api */
  const [
    addItemToCart,
    {
      isLoading: isAddingToCart,
      isError: isAddingToCartError,
      isSuccess: isAddingToCartSuccess,
    },
  ] = useAddItemToCartMutation();

  // Decrement item cart
  const [
    decrementCartItemApi,
    {
      isLoading: isRemovingFromCart,
      isError: isRemovingFromCartError,
      isSuccess: isRemovingFromCartSuccess,
    },
  ] = useDecrementCartItemMutation();

  // Delete the entire cart
  const [
    deleteCart,
    {
      isLoading: isDeletingCart,
      isError: isDeletingCartError,
      isSuccess: isDeletingCartSuccess,
    },
  ] = useDeleteCartMutation();

  // Add item to SavedForLater (from cart)
  const [
    addItemToSaved,
    {
      isLoading: isAddingToSaved,
      isError: isAddingToSavedError,
      isSuccess: isAddingToSavedSuccess,
    },
  ] = useAddToSavedMutation();

  // Get the cart items - only fetch if we have a user
  const {
    data: cartItems,
    isLoading: isGettingCartItems,
    isError: isGettingCartItemsError,
    isSuccess: isGettingCartItemsSuccess,
    refetch: refetchCartItems,
  } = useGetCartItemsQuery(
    {},
    {
      skip: false, // Keep this enabled for now, but we can make it conditional later
    }
  );

  const {
    data: checkoutCalculationData,
    isLoading: isGettingCartCheckout,
    isError: isGettingCartCheckoutError,
    isSuccess: isGettingCartCheckoutSuccess,
    refetch: refetchCartCheckout,
  } = useGetCartCheckoutQuery(
    {},
    {
      skip: false, // Keep this enabled for now, but we can make it conditional later
    }
  );

  // Delete cart item
  const [
    deleteCartItem,
    {
      isLoading: isDeletingCartItem,
      isError: isDeletingCartItemError,
      isSuccess: isDeletingCartItemSuccess,
    },
  ] = useDeleteCartItemMutation();

  // Get the recently viewed items
  const {
    data: recentlyViewedResponse,
    isLoading: isGettingRecentlyViewedItems,
    isError: isGettingRecentlyViewedItemsError,
  } = useGetRecentlyViewedItemsQuery({});

  const recentlyViewedItems: RecentlyViewedProduct[] = React.useMemo(() => {
    if (!recentlyViewedResponse) {
      return [];
    }

    const rawItems = Array.isArray(recentlyViewedResponse)
      ? recentlyViewedResponse
      : recentlyViewedResponse.recently_viewed_items ||
        recentlyViewedResponse.data ||
        [];

    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.map((item) => ({
      id: String(item.id),
      store: item.store ?? undefined,
      name: item.name ?? "",
      description: item.description ?? "",
      weight: typeof item.weight === "number" ? item.weight : 0,
      price: typeof item.price === "number" ? item.price : 0,
      selling_price:
        typeof item.selling_price === "number" ? item.selling_price : undefined,
      deal_type: item.deal_type ?? undefined,
      total_sold: typeof item.total_sold === "number" ? item.total_sold : 0,
      rating: typeof item.rating === "number" ? item.rating : 0,
      is_sponsored: Boolean(item.is_sponsored),
      image: item.image ?? null,
      distance: item.distance ?? "",
      view_count:
        typeof item.view_count === "number" ? item.view_count : undefined,
      viewed_at: item.viewed_at ?? null,
    }));
  }, [recentlyViewedResponse]);

  React.useEffect(() => {
    if (isGettingRecentlyViewedItemsError) {
      console.log("Error fetching recently viewed items");
    }
  }, [isGettingRecentlyViewedItemsError]);

  /* Load the cart items when the page mounts, and add the cart items to the redux store */
  React.useEffect(() => {
    if (isGettingCartItemsSuccess && cartItems && cartItems.cart_items) {
      dispatch(setCartItems(cartItems.cart_items));
    }
  }, [isGettingCartItemsSuccess, cartItems, dispatch]);

  /* Handle cart items fetch errors */
  React.useEffect(() => {
    if (isGettingCartItemsError) {
      // Only log error if it's not a 404 (no cart exists yet)
      console.log(
        "Error fetching cart items - this is normal if no cart exists yet"
      );
      // Set empty cart items on error
      dispatch(setCartItems([]));
    }
  }, [isGettingCartItemsError, dispatch]);

  React.useEffect(() => {
    if (
      isGettingCartCheckoutSuccess &&
      checkoutCalculationData &&
      checkoutCalculationData.checkout_data
    ) {
      dispatch(setCartCalculation(checkoutCalculationData.checkout_data));
    }
  }, [isGettingCartCheckoutSuccess, checkoutCalculationData, dispatch]);

  /* Handle checkout fetch errors */
  React.useEffect(() => {
    if (isGettingCartCheckoutError) {
      console.log(
        "Error fetching cart checkout - this is normal if no cart exists yet"
      );
    }
  }, [isGettingCartCheckoutError]);

  /* Handle the users ability to add an item to their cart 
  * @params {id:string} is the id of the product that would be added to the cart.
  @ returns void.
  * NB: This method will be used when incrementing the products in the cart, and will also work in the 
  * itemScreen which will handle the display of all products or return value {ProductInterface}. 
  * 
  * Displays an alert with the message from the user
  */
  const addProductToCart = async (
    id: string,
    options?: { quantity?: number; bundleAdd?: boolean }
  ) => {
    // Add item ID to loading state
    setAddingToCartItems((prev) => [...prev, id]);
    dispatch(setLoadingState(true));

    try {
      const payload =
        options && (options.quantity || options.bundleAdd)
          ? { productId: id, ...options }
          : id;
      const response = await addItemToCart(payload).unwrap();
      // Check if the server validated and successfully added the item
      if (response.success && response.cart_item) {
        // Only update the Redux store after server confirms success
        dispatch(addCartItem(response.cart_item));
        // Refetch server-side cart + checkout to stay in sync
        refetchCartItems();
        refetchCartCheckout();
        showSnackbarWithConfig({
          message: response.message,
          type: "success",
          duration: 1000,
        });
      } else if (response.success === false || response.error) {
        showSnackbarWithConfig({
          message:
            response.error ||
            "An error occurred while adding the product to the cart",
          type: "error",
          duration: 1000,
        });
      }
    } catch (error: any) {
      showSnackbarWithConfig({
        message:
          error?.data?.error ||
          "An error occurred while adding the product to the cart",
        type: "error",
        duration: 1000,
      });
    } finally {
      // Remove item ID from loading state
      setAddingToCartItems((prev) => prev.filter((itemId) => itemId !== id));
      dispatch(setLoadingState(false));
    }
  };

  const decrementProductFromCart = async (id: string) => {
    // Add item ID to loading state
    setRemovingFromCartItems((prev) => [...prev, id]);
    dispatch(setLoadingState(true));

    try {
      const response = await decrementCartItemApi(id).unwrap();
      console.log("Response from decrement cart item", response);

      if (response.message) {
        dispatch(decrementCartItem(id));
        // Refresh cart totals and items
        refetchCartItems();
        refetchCartCheckout();
        showSnackbarWithConfig({
          message: response.message,
          type: "success",
          duration: 1000,
        });
      } else if (response.error || isRemovingFromCartError) {
        showSnackbarWithConfig({
          message:
            response.error ||
            "An error occurred while decrementing the product from the cart",
          type: "error",
          duration: 1000,
        });
      }
    } catch (error: any) {
      showSnackbarWithConfig({
        type: "error",
        message:
          error?.data?.error ||
          "An error occurred while decrementing the product from the cart",
        duration: 1000,
      });
    } finally {
      setRemovingFromCartItems((prev) =>
        prev.filter((itemId) => itemId !== id)
      );
      dispatch(setLoadingState(false));
    }
  };

  /**
   * Designed to delete the entire cart item from the cart irrespective of the quantity of item.
   * Once deleted, the cart will reload and display the updated cart items.
   * @param cart_item_id
   */
  const handleDeleteCartItem = useCallback(
    async (cart_item_id: string) => {
      // Add item ID to loading state
      setDeletingCartItems((prev) => [...prev, cart_item_id]);
      dispatch(setLoadingState(true));

      try {
        const response = await deleteCartItem(cart_item_id).unwrap();
        if (response.message) {
          const cartItemToDelete = storeCartItems?.find(
            (item) => item.cart_item_id === cart_item_id
          );
          if (cartItemToDelete) {
            dispatch(deleteCartItemFromStore(cartItemToDelete.id));
          }
          // Refetch cart & checkout after deletion
          refetchCartItems();
          refetchCartCheckout();
          showSnackbarWithConfig({
            type: "success",
            message: response.message,
            duration: 1000,
          });
        } else if (response.error || isDeletingCartItemError) {
          showSnackbarWithConfig({
            type: "error",
            message:
              response.error ||
              "An error occurred while deleting the cart item",
            duration: 1000,
          });
        }
      } catch (error: any) {
        showSnackbarWithConfig({
          type: "error",
          message:
            error?.data?.error ||
            "An error occurred while deleting the cart item",
          duration: 1000,
        });
      } finally {
        // Remove item ID from loading state
        setDeletingCartItems((prev) =>
          prev.filter((itemId) => itemId !== cart_item_id)
        );
        dispatch(setLoadingState(false));
      }
    },
    [
      deleteCartItem,
      storeCartItems,
      dispatch,
      setAlertConfig,
      setIsVisible,
      isDeletingCartItemError,
    ]
  );

  /**
   * Save item for later (SavedForLater feature)
   * This removes the item from the cart and saves it to SavedForLater
   */
  const handleSaveForLater = useCallback(
    async (id: string) => {
      // Add item ID to loading state
      setAddingToWishlistItems((prev) => [...prev, id]);
      dispatch(setLoadingState(true));

      try {
        const response = await addItemToSaved(id).unwrap();
        if ((response as any).data && (response as any).data.message) {
          // Remove item from cart in Redux store since it's moved to SavedForLater
          dispatch(deleteCartItemFromStore(id));
          // Refetch cart & checkout, SavedForLater invalidation handled by RTK
          refetchCartItems();
          refetchCartCheckout();
          showSnackbarWithConfig({
            type: "success",
            message: (response as any).data.message,
            duration: 1000,
          });
        } else if ((response as any).error) {
          showSnackbarWithConfig({
            type: "error",
            message: (response as any).error,
            duration: 1000,
          });
        } else if (isAddingToSavedError) {
          showSnackbarWithConfig({
            type: "error",
            message: "Failed to save item for later",
            duration: 1000,
          });
        }
      } catch (error: any) {
        showSnackbarWithConfig({
          type: "error",
          message:
            error?.data?.error ||
            "An error occurred while saving the item for later",
          duration: 1000,
        });
      } finally {
        // Remove item ID from loading state
        setAddingToWishlistItems((prev) =>
          prev.filter((itemId) => itemId !== id)
        );
        dispatch(setLoadingState(false));
      }
    },
    [
      addItemToSaved,
      dispatch,
      deleteCartItemFromStore,
      setAlertConfig,
      setIsVisible,
      isAddingToSavedError,
    ]
  );

  /**
   * This method is used to delete the entire cart, or simply clear the cart of all items.
   * The alert will first confirm from the user if they want to continue with the
   * action before proceeding or cancelling the action.
   */
  const handleClearCart = useCallback(async () => {
    setDeletingCartItems((prev) => [...prev, "all"]);
    dispatch(setLoadingState(true));
    try {
      setAlertConfig({
        type: "error",
        message: `Are you sure you want to clear the cart? You have ${
          storeCartItems?.length || 0
        } items in your cart.`,
        isVisible: true,
        title: "Warning",
        onConfirm: async () => {
          setIsVisible(false);
          const response = await deleteCart({}).unwrap();
          if (response.message) {
            // Clear cart in Redux store after successful deletion from server
            dispatch(clearCart());
            // Refetch cart + checkout to ensure server totals are in sync
            refetchCartItems();
            refetchCartCheckout();
            showSnackbarWithConfig({
              type: "success",
              message: response.message,
              duration: 3000,
            });
          } else if (response.error || isDeletingCartError) {
            showSnackbarWithConfig({
              type: "error",
              message:
                response.error || "An error occurred while clearing the cart",
              duration: 2000,
            });
          }
        },
        onClose: () => {
          setIsVisible(false);
        },
      });
    } catch (error) {
      setAlertConfig({
        type: "error",
        message: "An error occurred while clearing the cart",
        isVisible: true,
        title: "Error",
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    } finally {
      setDeletingCartItems((prev) => prev.filter((itemId) => itemId !== "all"));
      dispatch(setLoadingState(false));
    }
  }, [
    deleteCart,
    storeCartItems,
    dispatch,
    setAlertConfig,
    setIsVisible,
    isDeletingCartError,
  ]);

  // Helper functions to check if specific items are loading
  const isAddingToCartItem = (itemId: string) =>
    addingToCartItems.includes(itemId);
  const isRemovingFromCartItem = (itemId: string) =>
    removingFromCartItems.includes(itemId);
  const isDeletingCartItemById = (itemId: string) =>
    deletingCartItems.includes(itemId);
  const isAddingToWishlistItem = (itemId: string) =>
    addingToWishlistItems.includes(itemId);

  return {
    checkoutCalculationData,
    // Global loading states (for backward compatibility)
    isAddingToCart,
    isRemovingFromCart,
    isDeletingCart,
    isDeletingCartItem,
    isAddingToSaved,
    isGettingCartItems,
    isGettingCartCheckout,
    isAddingToCartItem,
    isRemovingFromCartItem,
    isDeletingCartItemById,
    isAddingToWishlistItem,
    addProductToCart,
    decrementProductFromCart,
    handleDeleteCartItem,
    handleSaveForLater,
    handleClearCart,
    recentlyViewedItems,
    isGettingRecentlyViewedItems,
    // Expose refetch helpers so screens can manually refresh if needed
    refetchCartItems,
    refetchCartCheckout,
  };
};

export default useMainCart;
