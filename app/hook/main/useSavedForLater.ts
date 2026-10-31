import { useMemo } from "react";
import {
  useGetSavedItemsQuery,
  useAddToSavedMutation,
  useRemoveFromSavedMutation,
  useMoveToCartMutation,
  SavedForLaterItem,
} from "@/app/store/main/api/savedForLaterApi";
import { useGetCartItemsQuery } from "@/app/store/main/api/cartApi";
import { useAppDispatch } from "@/app/store/store";
import { setCartItems } from "@/app/store/main/slices/cartSlice";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

/**
 * Custom hook for managing SavedForLater items
 * Items saved from cart for later purchase
 */
const useSavedForLater = () => {
  const { showSnackbarWithConfig } = useSnackbar();
  const dispatch = useAppDispatch();

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    showSnackbarWithConfig({
      message,
      type,
      duration: 3000,
    });
  };

  const {
    data: savedItems,
    isLoading,
    error,
    refetch,
  } = useGetSavedItemsQuery();

  // Add cart query refetch capability
  const { refetch: refetchCart } = useGetCartItemsQuery({});

  const [addToSaved, { isLoading: adding }] = useAddToSavedMutation();
  const [removeFromSaved, { isLoading: removing }] =
    useRemoveFromSavedMutation();
  const [moveToCart, { isLoading: moving }] = useMoveToCartMutation();

  /**
   * Save item for later (from cart)
   */
  const handleSaveForLater = async (
    productId: string,
    productName?: string
  ) => {
    try {
      const result = await addToSaved(productId).unwrap();
      showSnackbarWithConfig({
        message: result?.data?.message || "Item saved for later",
        type: "success",
        duration: 3000,
      });
      return true;
    } catch (error: any) {
      showSnackbarWithConfig({
        message: error?.data?.error || "Failed to save item",
        type: "error",
        duration: 3000,
      });
      return false;
    }
  };

  /**
   * Remove item from saved list
   */
  const handleRemoveSaved = async (productId: string) => {
    try {
      const result = await removeFromSaved({ product_id: productId }).unwrap();
      showAlert("Success", result.message, "success");
      return true;
    } catch (error: any) {
      showSnackbarWithConfig({
        message: error?.data?.error || "Failed to remove item",
        type: "error",
        duration: 3000,
      });
      return false;
    }
  };

  /**
   * Move saved item back to cart
   */
  const handleMoveToCart = async (productId: string, productName?: string) => {
    try {
      const result = await moveToCart({ product_id: productId }).unwrap();
      showAlert("Success", result.message, "success");

      // Manually refetch cart to update UI
      const cartData = await refetchCart().unwrap();
      if (cartData && cartData.cart_items) {
        dispatch(setCartItems(cartData.cart_items));
      }

      return true;
    } catch (error: any) {
      showSnackbarWithConfig({
        message: error?.data?.error || "Failed to move to cart",
        type: "error",
        duration: 3000,
      });
      return false;
    }
  };

  /**
   * Check if item is saved
   */
  const isSaved = (productId: string): boolean => {
    if (!savedItems?.items) return false;
    return savedItems.items.some((item) => item.product_id === productId);
  };

  return {
    savedItems: savedItems?.items || [],
    count: savedItems?.count || 0,
    isLoading,
    adding,
    removing,
    moving,
    error,
    handleSaveForLater,
    handleRemoveSaved,
    handleMoveToCart,
    isSaved,
    refetch,
  };
};

export default useSavedForLater;
