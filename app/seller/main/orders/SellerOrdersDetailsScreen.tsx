import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import MobileOrderDeliveryAddress from "@/app/component/seller/main/mobile_orders/MobileOrderDeliveryAddress";
import StyledText from "@/app/component/helpers/forms/StyledText";
import SellerOrderItems from "@/app/component/seller/main/mobile_orders/SellerOrderItems";
import MobileOrderTimeline from "@/app/component/seller/main/mobile_orders/MobileOrderTimeline";
import {
  OrderItemInterface,
  OrderStatus,
  OrderAction,
  DetailedOrderItemInterface,
} from "@/app/interfaces/seller/orders/OrdersInterface";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UpdateOrderStatusModal from "@/app/component/seller/shared/UpdateOrderStatusModal";
import { useThemeColor } from "@/hooks/useThemeColor";
import useSellerOrder from "@/app/hook/seller/useSellerOrder";
import { useGetOrderDetailQuery } from "@/app/store/seller/api/orderApi";
import { shouldPollSellerOrderDetail } from "@/app/component/seller/main/mobile_orders/sellerOrderTimeline";
import { Button } from "react-native-paper";
import { useAlertContext } from "@/app/contexts/AlertContext";
// Dummy service function for order status updates
const updateOrderStatusService = async (
  orderId: string,
  status: OrderStatus,
) => {
  console.log(`Updating order ${orderId} to status: ${status}`);
  return true;
};

const markOrderAsPacked = async (orderId: string): Promise<boolean> => {
  return updateOrderStatusService(orderId, "packed");
};

const cancelOrder = async (orderId: string): Promise<boolean> => {
  return updateOrderStatusService(orderId, "cancelled");
};

const SellerOrdersDetailsScreen = () => {
  const { setAlertConfig, setIsVisible } = useAlertContext();

  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pollTimeline, setPollTimeline] = useState(true);

  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");

  const {
    handleClaimOrder,
    handleFulfillOrder,
    handleRejectOrder,
  } = useSellerOrder();

  const {
    data: orderDetailData,
    isLoading: orderDetailLoading,
    error: orderDetailError,
    refetch: refetchOrderDetail,
  } = useGetOrderDetailQuery(orderId || "", {
    skip: !orderId,
    pollingInterval: pollTimeline ? 10000 : 0,
  });

  useEffect(() => {
    if (orderDetailData?.order_status) {
      setPollTimeline(shouldPollSellerOrderDetail(orderDetailData.order_status));
    }
  }, [orderDetailData?.order_status]);

  // Transform API data to match component interfaces
  const orderData: DetailedOrderItemInterface | null = useMemo(() => {
    if (!orderDetailData) return null;

    return {
      id: orderDetailData.id ?? String(orderDetailData.claim_id),
      order_id: orderDetailData.order_id,
      claim_id: orderDetailData.claim_id,
      date: orderDetailData.created_at,
      status:
        orderDetailData.claim_status === "failed"
          ? "cancelled"
          : orderDetailData.claim_status,
      claim_status: orderDetailData.claim_status,
      order_status: orderDetailData.order_status,
      payment_status: orderDetailData.payment_status,
      price: orderDetailData.seller_total,
      seller_total: orderDetailData.seller_total,
      total_amount: orderDetailData.total_amount,
      quantity: orderDetailData.item_count,
      item_count: orderDetailData.item_count,
      currency: "USD",
      customer_name: orderDetailData.customer_name,
      created_at: orderDetailData.created_at,
      notified_at: orderDetailData.notified_at,
      accepted_at: orderDetailData.accepted_at,
      expires_at: orderDetailData.expires_at,
      updated_at: orderDetailData.updated_at,
      delivery_address: orderDetailData.delivery_address,
      user_contact: orderDetailData.user_contact,
      items: orderDetailData.items,
    };
  }, [orderDetailData]);

  const timelineInput = useMemo(
    () =>
      orderData
        ? {
            orderStatus: orderData.order_status,
            claimStatus: orderData.claim_status,
            createdAt: orderData.created_at,
            notifiedAt: orderData.notified_at,
            acceptedAt: orderData.accepted_at,
            updatedAt: orderData.updated_at,
          }
        : null,
    [orderData],
  );

  /**
   * Refetch order details used for when the order is pulled down to refresh
   * @returns void
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchOrderDetail();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle status selection used for when the order is updated
   * @param action - The action to perform
   * @returns void
   */
  const handleStatusSelection = async (action: OrderAction) => {
    if (!orderData) return;

    // Show confirmation for destructive actions
    if (action === "rejected") {
      setAlertConfig({
        isVisible: true,
        title: "Reject Order",
        message:
          "Are you sure you want to reject this order? Alternative sellers will be notified.",
        type: "error",
        onConfirm: async () => {
          setIsUpdating(true);
          try {
            const result = await handleRejectOrder(orderData.id);
            if (result.success) {
              await refetchOrderDetail();
              setIsUpdateStatusModalVisible(false);
            }
          } finally {
            setIsUpdating(false);
          }
        },
        onClose: () => {
          setIsUpdateStatusModalVisible(false);
        },
      });
      return;
    }

    // Handle other actions
    setIsUpdating(true);
    try {
      let result;
      if (action === "claimed") {
        result = await handleClaimOrder(orderData.id);
      } else if (action === "packed") {
        result = await handleFulfillOrder(orderData.id);
      } else if (action === "shipped") {
        // For now, treat shipped as packed (fulfill)
        result = await handleFulfillOrder(orderData.id);
      }

      if (result?.success) {
        await refetchOrderDetail();
        setIsUpdateStatusModalVisible(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (orderDetailLoading) {
    return (
      <View
        style={[
          styles.mainContainer,
          { backgroundColor, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#801330" />
        <StyledText style={{ marginTop: 16 }}>
          Loading order details...
        </StyledText>
      </View>
    );
  }

  // Error state
  if (orderDetailError || !orderData) {
    return (
      <View
        style={[
          styles.mainContainer,
          { backgroundColor, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <StyledText
          style={{ color: "red", textAlign: "center", marginBottom: 16 }}
        >
          {orderDetailError ? "Error loading order details" : "Order not found"}
        </StyledText>
        <Button mode="contained" onPress={onRefresh}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.mainContainer, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerSection}>
        <Pressable
          onPress={() =>
            setIsUpdateStatusModalVisible(!isUpdateStatusModalVisible)
          }
          style={styles.statusPopButton}
        >
          <StyledText
            variant="titleSmall"
            children={"Update Status"}
          />
        </Pressable>
      </View>

      <View style={styles.section}>
        <SellerOrderItems item={orderData} expandable />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <StyledText variant="titleMedium" children="Delivery Information" />
        </View>
        <View style={styles.sectionContent}>
          <MobileOrderDeliveryAddress address={orderData.delivery_address} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionContent}>
          {timelineInput && <MobileOrderTimeline order={timelineInput} />}
        </View>
      </View>

      <View style={[styles.supportSection, { borderColor: borderColor }]}>
        <StyledText variant="bodySmall" style={{ marginBottom: 8 }}>
          Need help with this order? Contact support and chat with our team.
        </StyledText>
        <Button
          mode="outlined"
          onPress={() =>
            router.push({
              pathname: "/seller/main/tickets/CreateTicketScreen",
              params: {
                orderId: String(orderId ?? orderData.id),
                prefillReason: "pickup_issue",
              },
            })
          }
        >
          Contact support
        </Button>
      </View>

      {isUpdateStatusModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <UpdateOrderStatusModal
              onSelectStatus={handleStatusSelection}
              onClose={() => setIsUpdateStatusModalVisible(false)}
              currentStatus={orderData?.claim_status}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SellerOrdersDetailsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  section: {
    marginTop: 5,
  },
  sectionHeader: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionContent: {
    padding: 10,
  },
  supportSection: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  statusPopButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    width: "100%",
    maxWidth: 350,
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
