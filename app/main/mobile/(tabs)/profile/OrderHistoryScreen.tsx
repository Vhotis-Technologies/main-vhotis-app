import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { FlatList } from "react-native-gesture-handler";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetAllOrdersQuery } from "@/app/store/main/api/mainOrderApi";
import { Order } from "@/app/interfaces/main/orders/OrderInterfaces";
import { Ionicons } from "@expo/vector-icons";
import { useLazyTrackOrderQuery } from "@/app/store/main/api/mainOrderApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import OrderCard from "@/app/component/main/mobile/orders/OrderCard";
import TrackOrderMapModal from "@/app/component/main/mobile/orders/TrackOrderMapModal";

const OrderHistoryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");

  const [refreshing, setRefreshing] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const { showFullscreenModal, closeModal } = useModalService();
  const { showSnackbar } = useSnackbar();
  const [triggerTrackOrder, { isFetching: isTracking }] =
    useLazyTrackOrderQuery();

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllOrdersQuery(undefined);

  const handleOrderPress = (orderId: string) => {
    router.push(`/main/mobile/(tabs)/profile/OrderDetailsScreen?id=${orderId}`);
  };

  const handleBuyAgain = (orderId: string) => {
    // TODO: Implement buy again functionality
    console.log("Buy again for order:", orderId);
  };

  /**
   * Trigger the onrefresh to fetch new orders
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  /* This method is designed to display a modal when there is a location accurately fetched from the server.
   * If there is not location data yet (latitude, longitude) it will display a message to the user. */
  /* If there is location data, it will display a map of the riders current location relative to the delivery address. */
  /* The map is displayed using the expo-maps library. */
  const handleTrackOrder = async (order: Order) => {
    setTrackingOrderId(order.id);

    try {
      const result = await triggerTrackOrder(order.id);

      // Check if the request was successful
      if (result.error) {
        const errorMessage =
          (result.error as any)?.data?.error ||
          (result.error as any)?.data?.message ||
          "Failed to track order. Please try again.";
        showSnackbar(errorMessage, "error");
        setTrackingOrderId(null);
        return;
      }

      const response = result.data;

      // Check if the API returned success: false
      if (!response?.success) {
        const message =
          response?.message ||
          "The rider's location will be updated once the item is shipped.";
        showSnackbar(message, "info");
        setTrackingOrderId(null);
        return;
      }

      // Extract location data from the response
      const locationData = response.data;
      if (!locationData) {
        showSnackbar(
          "Location data is not available right now. Please try again later.",
          "info"
        );
        setTrackingOrderId(null);
        return;
      }

      const latitude = locationData.latitude ?? null;
      const longitude = locationData.longitude ?? null;
      const deliveryLatitude = locationData.delivery_address_latitude ?? null;
      const deliveryLongitude = locationData.delivery_address_longitude ?? null;
      const lastUpdated = locationData.last_updated ?? null;

      // Show the modal with the location data
      showFullscreenModal(
        <TrackOrderMapModal
          latitude={latitude}
          longitude={longitude}
          deliveryLatitude={deliveryLatitude}
          deliveryLongitude={deliveryLongitude}
          orderNumber={order.order_number}
          lastUpdated={lastUpdated}
          onClose={() => {
            closeModal();
            setTrackingOrderId(null);
          }}
        />,
        "Track Order"
      );
    } catch (error) {
      console.error("Error tracking order:", error);
      showSnackbar(
        "An error occurred while tracking your order. Please try again.",
        "error"
      );
      setTrackingOrderId(null);
    }
  };

  const onPressOrder = useCallback((id: string) => handleOrderPress(id), []);
  const onTrackOrderCb = useCallback(
    (o: Order) => handleTrackOrder(o),
    [handleTrackOrder]
  );
  const onBuyAgainCb = useCallback((id: string) => handleBuyAgain(id), []);

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        item={item}
        trackingOrderId={trackingOrderId}
        isTracking={isTracking}
        onPressOrder={onPressOrder}
        onTrackOrder={onTrackOrderCb}
        onBuyAgain={onBuyAgainCb}
      />
    ),
    [
      textColor,
      cardColor,
      borderColor,
      trackingOrderId,
      isTracking,
      onPressOrder,
      onTrackOrderCb,
      onBuyAgainCb,
    ]
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centerContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color="#0066CC" />
        <StyledText
          variant="bodyMedium"
          style={[styles.loadingText, { color: textColor }]}
        >
          Loading your orders...
        </StyledText>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[styles.container, styles.centerContainer, { backgroundColor }]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#DC3545" />
        <StyledText
          variant="titleMedium"
          style={[styles.errorText, { color: textColor }]}
        >
          Failed to load orders
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.errorSubtext, { color: textColor }]}
        >
          {(error as any)?.message || "Something went wrong"}
        </StyledText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <StyledText variant="bodyMedium" style={styles.retryButtonText}>
            Try Again
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {!orders || orders.length === 0 ? (
        <View style={[styles.centerContainer, { backgroundColor }]}>
          <Ionicons name="receipt-outline" size={64} color="#666" />
          <StyledText
            variant="titleMedium"
            style={[styles.noOrdersTitle, { color: textColor }]}
          >
            No orders yet
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.noOrdersText, { color: textColor }]}
          >
            When you place your first order, it will appear here.
          </StyledText>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/main/mobile/(tabs)/home/HomeScreen")}
          >
            <StyledText variant="bodyMedium" style={styles.shopButtonText}>
              Start Shopping
            </StyledText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.orderList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  orderList: {
    padding: 5,
    paddingBottom: 5,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    marginTop: 16,
    textAlign: "center",
    
  },
  errorSubtext: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  noOrdersTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  noOrdersText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  shopButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
