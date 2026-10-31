import StyledIconButton from "@/app/component/helpers/buttons/StyledIconButton";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledText from "@/app/component/helpers/forms/StyledText";
import SearchInputItem from "@/app/component/helpers/others/SearchInputItem";
import SellerOrderItems from "@/app/component/seller/main/mobile_orders/SellerOrderItems";
import { OrderItemInterface } from "@/app/interfaces/seller/orders/OrdersInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import useSellerOrder from "@/app/hook/seller/useSellerOrder";

const buttons: string[] = ["All", "Pending", "Claimed", "Expired"];

const OrderScreen = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedButton, setSelectedButton] = useState(buttons[0]);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  // Centralized order management
  const {
    ordersData,
    ordersLoading,
    ordersError,
    handleClaimOrder,
    handleFulfillOrder,
    refetchOrders,
    isLoading,
  } = useSellerOrder();

  const orderItems: OrderItemInterface[] = useMemo(() => {
    if (!ordersData) return [];

    return ordersData.map((order: OrderItemInterface) => ({
      id: order.id,
      order_id: order.order_id,
      claim_id: order.claim_id,
      date: order.created_at,
      status:
        order.claim_status === "failed" ? "cancelled" : order.claim_status,
      claim_status: order.claim_status,
      order_status: order.order_status,
      payment_status: order.payment_status,
      price: order.seller_total,
      seller_total: order.seller_total,
      total_amount: order.total_amount,
      quantity: order.item_count,
      item_count: order.item_count,
      currency: "USD",
      customer_name: order.customer_name,
      created_at: order.created_at,
      notified_at: order.notified_at,
      accepted_at: order.accepted_at,
      items: order.items,
    }));
  }, [ordersData]);

  // Filter orders based on selected button
  const filteredOrders = useMemo(() => {
    if (!orderItems) return [];

    switch (selectedButton) {
      case "Pending":
        return orderItems.filter((order) => order.status === "pending");
      case "Claimed":
        return orderItems.filter((order) => order.status === "claimed");
      case "Expired":
        return orderItems.filter((order) => order.status === "expired");
      default:
        return orderItems;
    }
  }, [orderItems, selectedButton]);

  // Filter by search value
  const searchFilteredOrders = useMemo(() => {
    if (!searchValue) return filteredOrders;

    return filteredOrders.filter(
      (order) =>
        order.customer_name
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        order.id.includes(searchValue) ||
        order.order_id?.toString().includes(searchValue)
    );
  }, [filteredOrders, searchValue]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  /* Handle navigation to order details screen */
  const handleOrderPress = (claimId: string) => {
    router.push({
      pathname: "/seller/main/orders/SellerOrdersDetailsScreen",
      params: { orderId: claimId }, // Pass claim ID as orderId parameter
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.maincontainer,
          { backgroundColor, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#801330" />
        <StyledText style={{ marginTop: 16 }}>Loading orders...</StyledText>
      </View>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <View
        style={[
          styles.maincontainer,
          { backgroundColor, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <StyledText style={{ color: "red", textAlign: "center" }}>
          Error loading data. Please try again.
        </StyledText>
        <Button mode="contained" onPress={onRefresh} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.maincontainer, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <StyledTextInput
          placeholder="Search by Order ID, Customer Name"
          value={searchValue}
          onChangeText={setSearchValue}
          info="Enter order id or customer name"
        />
      </View>
      {/* Filter Buttons */}
      <View style={styles.filterButtonsContainer}>
        {buttons.map((button, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedButton(button)}
            style={[styles.filterButton]}
          >
            <StyledText
              variant="labelLarge"
              children={button}
              style={{
                color: selectedButton === button ? "#801330" : textColor,
                fontWeight: selectedButton === button ? "600" : "400",
              }}
            />
          </Pressable>
        ))}
      </View>

      {/* Orders List */}
      <View style={styles.ordersListContainer}>
        {searchFilteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <StyledText style={{ textAlign: "center", color: textColor }}>
              {searchValue
                ? "No orders found matching your search."
                : "No orders available."}
            </StyledText>
          </View>
        ) : (
          searchFilteredOrders.map((item) => (
            <View
              key={item.id}
              style={[styles.orderItemContainer, { borderColor }]}
            >
              <SellerOrderItems
                item={item}
                onPress={handleOrderPress}
                onClaim={() => handleClaimOrder(item.id)}
                onFulfill={() => handleFulfillOrder(item.id)}
                isLoading={isLoading}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 5,
    paddingBottom: 5,
  },
  searchContainer: {
    marginBottom: 5,
  },
  exportButtonWrapper: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  exportButtonContainer: {
    borderWidth: 1,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ordersListContainer: {
    flex: 1,
  },
  orderItemContainer: {
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
