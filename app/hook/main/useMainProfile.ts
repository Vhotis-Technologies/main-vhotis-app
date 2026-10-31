import { useMemo } from "react";
import {
  useGetProfileStatsQuery,
  useGetWishlistQuery,
  useGetRecentActivityQuery,
  useGetProfileOverviewQuery,
  useRemoveWishlistItemMutation,
  useAddToWishlistMutation,
  WishlistItem,
  RecentActivity,
} from "@/app/store/main/api/profileApi";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

/**
 * Custom hook for managing user profile data and operations
 * Provides easy access to profile stats, wishlist, and recent activity
 *
 * @param useOverview - If true, fetches all data in one call (more efficient)
 * @returns Profile data and helper functions
 */
const useMainProfile = (useOverview: boolean = false) => {
  const { showSnackbarWithConfig } = useSnackbar();
  const { setAlertConfig } = useAlertContext();

  // Helper function to show alert
  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error"
  ) => {
    setAlertConfig({
      isVisible: true,
      title,
      message,
      type,
    });
  };

  // Fetch data based on preference
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetProfileOverviewQuery(undefined, {
    skip: !useOverview,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetProfileStatsQuery(undefined, {
    skip: useOverview,
  });

  const {
    data: wishlistData,
    isLoading: wishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useGetWishlistQuery(undefined, {
    skip: useOverview,
  });

  const {
    data: activityData,
    isLoading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useGetRecentActivityQuery(undefined, {
    skip: useOverview,
  });

  const [removeWishlistItem, { isLoading: removingWishlistItem }] =
    useRemoveWishlistItemMutation();

  const [addToWishlist, { isLoading: addingToWishlist }] =
    useAddToWishlistMutation();

  /**
   * Extract data from overview or individual queries
   */
  const profileStats = useMemo(() => {
    if (useOverview && overviewData) {
      return overviewData.stats;
    }
    return statsData;
  }, [useOverview, overviewData, statsData]);

  const wishlist = useMemo(() => {
    if (useOverview && overviewData) {
      return overviewData.wishlist;
    }
    return wishlistData;
  }, [useOverview, overviewData, wishlistData]);

  const recentActivity = useMemo(() => {
    if (useOverview && overviewData) {
      return overviewData.recent_activity;
    }
    return activityData;
  }, [useOverview, overviewData, activityData]);

  /**
   * Check if any data is loading
   */
  const isLoading = useMemo(() => {
    if (useOverview) {
      return overviewLoading;
    }
    return statsLoading || wishlistLoading || activityLoading;
  }, [
    useOverview,
    overviewLoading,
    statsLoading,
    wishlistLoading,
    activityLoading,
  ]);

  /**
   * Check if there are any errors
   */
  const hasError = useMemo(() => {
    if (useOverview) {
      return !!overviewError;
    }
    return !!statsError || !!wishlistError || !!activityError;
  }, [useOverview, overviewError, statsError, wishlistError, activityError]);

  /**
   * Get error message
   */
  const errorMessage = useMemo(() => {
    if (useOverview && overviewError) {
      return "Failed to load profile data";
    }
    if (statsError) return "Failed to load profile statistics";
    if (wishlistError) return "Failed to load wishlist";
    if (activityError) return "Failed to load recent activity";
    return null;
  }, [useOverview, overviewError, statsError, wishlistError, activityError]);

  /**
   * Refresh all profile data
   */
  const refreshProfile = async () => {
    try {
      if (useOverview) {
        await refetchOverview();
      } else {
        await Promise.all([
          refetchStats(),
          refetchWishlist(),
          refetchActivity(),
        ]);
      }
    } catch (error) {
      showAlert("Error", "Failed to refresh profile data", "error");
    }
  };

  /**
   * Remove item from wishlist with confirmation
   * @param productId - ID of the product to remove
   * @param productName - Name of the product (for confirmation message)
   */
  const handleRemoveWishlistItem = async (
    productId: string,
    productName: string
  ) => {
    try {
      const result = await removeWishlistItem({
        product_id: productId,
      }).unwrap();

      showAlert("Success", `${productName} removed from wishlist`, "success");

      // Refetch wishlist data
      if (useOverview) {
        refetchOverview();
      } else {
        refetchWishlist();
      }

      return true;
    } catch (error: any) {
      showAlert(
        "Error",
        error?.data?.error || "Failed to remove item from wishlist",
        "error"
      );
      return false;
    }
  };

  /**
   * Add product to wishlist (heart icon action)
   * Does NOT remove from cart
   * @param productId - ID of the product to add
   * @param productName - Name of the product (for success message)
   */
  const handleAddToWishlist = async (
    productId: string,
    productName: string
  ) => {
    try {
      const result = await addToWishlist({ product_id: productId }).unwrap();

      showSnackbarWithConfig({
        message: result.message || `${productName} added to wishlist`,
        type: "success",
        duration: 3000,
      });

      if (useOverview) {
        refetchOverview();
      } else {
        refetchWishlist();
      }
      return true;
    } catch (error: any) {
      showSnackbarWithConfig({
        message: error?.message || "Failed to add to wishlist",
        type: "error",
        duration: 3000,
      });
      return false;
    }
  };

  /**
   * Check if product is in wishlist
   * @param productId - ID of the product to check
   */
  const isInWishlist = (productId: string): boolean => {
    if (!wishlist?.items) return false;
    return wishlist.items.some((item) => item.product_id === productId);
  };

  /**
   * Get wishlist item by product ID
   * @param productId - ID of the product
   */
  const getWishlistItem = (productId: string): WishlistItem | undefined => {
    if (!wishlist?.items) return undefined;
    return wishlist.items.find((item) => item.product_id === productId);
  };

  /**
   * Format order status for display
   * @param status - Order status string
   */
  const formatOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    };
    return statusMap[status] || status;
  };

  /**
   * Get status color
   * @param status - Order status string
   */
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: "#F59E0B",
      confirmed: "#3B82F6",
      shipped: "#8B5CF6",
      delivered: "#10B981",
      cancelled: "#EF4444",
      returned: "#EF4444",
    };
    return colorMap[status] || "#6B7280";
  };

  return {
    // Data
    profileStats,
    wishlist,
    recentActivity,

    // Loading states
    isLoading,
    removingWishlistItem,
    addingToWishlist,

    // Error states
    hasError,
    errorMessage,

    // Actions
    refreshProfile,
    handleRemoveWishlistItem,
    handleAddToWishlist,

    // Helper functions
    isInWishlist,
    getWishlistItem,
    formatOrderStatus,
    getStatusColor,

    // Refetch functions (for manual control)
    refetchStats: useOverview ? refetchOverview : refetchStats,
    refetchWishlist: useOverview ? refetchOverview : refetchWishlist,
    refetchActivity: useOverview ? refetchOverview : refetchActivity,
  };
};

export default useMainProfile;
