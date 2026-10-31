import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import { OrderItem } from "@/app/interfaces/main/orders/Orders";
import DividerComponent from "@/app/component/helpers/others/Divider";
import { router } from "expo-router";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Button } from "react-native-paper";
import { formatCurrency } from "@/app/_utils/main/helpers";

interface OrderItemComponentProps {
  orderItem?: OrderItem;
  onPress?: (id: string) => void;
  onBuyAgain?: (id: string) => void;
}

/**
 * The method is designed to get the status color of the order item status.
 * The status lets the user know if the order is completed, cancelled, returned, refunded, pending or in progress.
 * @param status
 * @returns
 */
const getStatusColor = (status: string = "") => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "green"; // Blue
    case "cancelled":
      return "red"; // Red
    case "returned":
      return "orange"; // Orange
    case "refunded":
      return "gray"; // Gray
    case "pending":
      return "blue";
    default:
      return "gray";
  }
};

const OrderItemComponent = ({
  orderItem,
  onPress,
  onBuyAgain,
}: OrderItemComponentProps) => {
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");

  if (!orderItem) {
    return (
      <View style={[styles.emptyContainer]}>
        <StyledText variant="titleMedium" style={styles.emptyText}>
          it looks like you haven't placed any orders in the last 30 days
        </StyledText>
        <DividerComponent />
        <Pressable
          style={styles.emptyContainerButton}
          onPress={() => router.push("/main/mobile/(tabs)/home/HomeScreen")}
        >
          <StyledText
            variant="labelLarge"
            style={styles.emptyContainerButtonText}
          >
            Start shopping again
          </StyledText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <StyledText variant="labelLarge" style={styles.orderId}>
            Order #{orderItem.id}
          </StyledText>
          <StyledText variant="bodySmall">
            Placed on {orderItem.date}
          </StyledText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(orderItem.status) },
          ]}
        >
          <StyledText variant="labelMedium" children={orderItem.status} />
        </View>
      </View>

      <DividerComponent />

      <View style={styles.contentWrapper}>
        <TouchableOpacity onPress={() => onPress?.(orderItem.id)}>
          <Image
            source={
              typeof orderItem.image === "string"
                ? { uri: orderItem.image }
                : orderItem.image
            }
            style={styles.image}
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.detailsContainerWrapper}>
            <View style={styles.detailsContainer}>
              <StyledText
                variant="titleMedium"
                style={styles.title}
                numberOfLines={2}
              >
                {orderItem.title}
              </StyledText>
              <StyledText variant="titleSmall" style={styles.price}>
                {formatCurrency(
                  Number((orderItem as any).selling_price || orderItem.price)
                )}
              </StyledText>
              <StyledText variant="bodyMedium">{`Qty: ${orderItem.quantity}x`}</StyledText>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => onBuyAgain?.(orderItem.id)}
            style={{
              backgroundColor: buttonColor,
              width: "50%",
              alignSelf: "flex-end",
            }}
            textColor={buttonTextColor}
          >
            Buy again
          </Button>
        </View>
      </View>
    </View>
  );
};

export default OrderItemComponent;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  orderInfo: {
    gap: 4,
  },
  orderId: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    textTransform: "uppercase",
    fontWeight: "600",
  },
  contentWrapper: {
    flexDirection: "row",
    gap: 10,
  },
  image: {
    width: 120,
    height: 120,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  detailsContainerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsContainer: {
    gap: 4,
    flex: 1,
  },
  title: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  price: {
    color: "#2E8B57",
    fontWeight: "600",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  emptyContainerButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    minWidth: 200,
    marginHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyContainerButtonText: {
    textTransform: "capitalize",
    color: "#000",
  },
});
