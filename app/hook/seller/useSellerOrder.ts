import { useCallback } from "react";
import {
  useGetAllOrdersQuery,
  useClaimOrderMutation,
  useFulfillOrderMutation,
  useRejectOrderMutation,
  useGetOrderDetailQuery,
} from "@/app/store/seller/api/orderApi";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { router } from "expo-router";
import { canAccessSellerApp } from "@/app/interfaces/main/Authentication";
import { useAppSelector } from "@/app/store/store";

const useSellerOrder = () => {
  const { showSnackbarWithConfig } = useSnackbar();

  // Get user from auth state to check if seller
  const { user, isAuthReady } = useAppSelector((state) => state.auth);
  const isSeller = canAccessSellerApp(user as never);

  // API hooks - skip query if user is not a seller or auth is not ready
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetAllOrdersQuery({}, { skip: !isSeller || !isAuthReady });

  const [claimOrder, { isLoading: claimingOrder }] = useClaimOrderMutation();
  const [fulfillOrder, { isLoading: fulfillingOrder }] =
    useFulfillOrderMutation();
  const [rejectOrder, { isLoading: rejectingOrder }] = useRejectOrderMutation();

  // Handle claim order with snackbar feedback
  const handleClaimOrder = async (claimId: string) => {
    try {
      const result = await claimOrder(claimId).unwrap();

      let message = result.message + " " + result.order_id;
      showSnackbarWithConfig({
        message: message,
        type: "success",
        duration: 3000,
      });

      // Refetch orders after successful claim
      await refetchOrders();

      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || "Failed to claim order. Please try again.";

      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Handle fulfill order with snackbar feedback
  const handleFulfillOrder = async (claimId: string) => {
    try {
      const result = await fulfillOrder(claimId).unwrap();

      showSnackbarWithConfig({
        message: "Order fulfilled successfully!",
        type: "success",
        duration: 3000,
      });

      // Refetch orders after successful fulfillment
      await refetchOrders();

      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || "Failed to fulfill order. Please try again.";

      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Handle notification claim action
  const handleNotificationClaim = useCallback(
    async (claimId: string) => {
      try {
        const result = await claimOrder(claimId).unwrap();

        showSnackbarWithConfig({
          message: "Order claimed from notification!",
          type: "success",
          duration: 3000,
        });

        return { success: true, data: result };
      } catch (error: any) {
        const errorMessage =
          error?.data?.error || "Failed to claim order from notification.";

        showSnackbarWithConfig({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });

        return { success: false, error: errorMessage };
      }
    },
    [claimOrder, showSnackbarWithConfig],
  );

  // Handle reject order with snackbar feedback
  const handleRejectOrder = async (claimId: string) => {
    try {
      const result = await rejectOrder(claimId).unwrap();

      showSnackbarWithConfig({
        message: "Order rejected. Finding alternative sellers...",
        type: "success",
        duration: 4000,
      });

      // Refetch orders after successful rejection
      await refetchOrders();

      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || "Failed to reject order. Please try again.";

      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Handle notification view action
  const handleNotificationView = useCallback(
    (orderId: string) => {
      try {
        router.push("/seller/main/orders/OrderScreen");

        showSnackbarWithConfig({
          message: "Navigating to orders...",
          type: "info",
          duration: 2000,
        });
      } catch (error) {
        showSnackbarWithConfig({
          message: "Failed to navigate to orders.",
          type: "error",
          duration: 3000,
        });
      }
    },
    [showSnackbarWithConfig],
  );

  // Get order details
  const getOrderDetails = (claimId: string) => {
    return useGetOrderDetailQuery(claimId);
  };

  // Handle API errors with snackbar
  const handleApiError = (error: any, context: string) => {
    const errorMessage =
      error?.data?.error || `Failed to ${context}. Please try again.`;

    showSnackbarWithConfig({
      message: errorMessage,
      type: "error",
      duration: 4000,
    });
  };

  return {
    // Data
    ordersData,
    ordersLoading,
    ordersError,

    // Actions
    handleClaimOrder,
    handleFulfillOrder,
    handleRejectOrder,
    handleNotificationClaim,
    handleNotificationView,
    handleApiError,
    refetchOrders,
    getOrderDetails,

    // Loading states
    claimingOrder,
    fulfillingOrder,
    rejectingOrder,
    isLoading:
      ordersLoading || claimingOrder || fulfillingOrder || rejectingOrder,
  };
};

export default useSellerOrder;
