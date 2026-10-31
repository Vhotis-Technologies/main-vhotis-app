import { StyleSheet, View, TouchableOpacity, Image, Pressable } from "react-native";
import React, { useMemo } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/app/_utils/main/helpers";
import { LinearGradient } from "expo-linear-gradient";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { Order } from "@/app/interfaces/main/orders/OrderInterfaces";
import {
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  isTrackableOrderStatus,
} from "./orderHelpers";
import { useThemeColor } from "@/hooks/useThemeColor";

export type OrderCardProps = {
  item: Order;
  trackingOrderId: string | null;
  isTracking: boolean;
  onPressOrder: (id: string) => void;
  onTrackOrder: (o: Order) => void;
  onBuyAgain: (id: string) => void;
};

// Memoized row component for FlatList
const OrderCard = React.memo(
  ({
    item,
    trackingOrderId,
    isTracking,
    onPressOrder,
    onTrackOrder,
    onBuyAgain,
  }: OrderCardProps) => {
    const backgroundColor = useThemeColor({}, "background");
    const cardColor = useThemeColor({}, "cards");
    const borderColor = useThemeColor({}, "borders");
    const textColor = useThemeColor({}, "text");

    const itemsSubtotal = useMemo(
      () => item.order_items.reduce((sum, oi) => sum + oi.sub_total, 0),
      [item.order_items],
    );

    return (
      <Pressable  
        style={[styles.orderCard, { backgroundColor: cardColor, borderColor }]}
        onPress={() => onPressOrder(item.id)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <StyledText
              variant="labelMedium"
              style={[styles.orderNumber, { color: textColor }]}
            >
              {item.order_number}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.orderDate, { color: textColor }]}
            >
              {formatDate(item.created_at)}
            </StyledText>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(item.status) as any}
              size={16}
              color={getStatusColor(item.status)}
            />
            <StyledText
              variant="labelSmall"
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </StyledText>
          </View>
        </View>

        <View style={styles.orderItemsSection}>
          <StyledText
            variant="bodyMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Order Items ({item.order_items.length})
          </StyledText>
          {item.order_items.map((orderItem) => (
            <LinearGradient
              colors={[backgroundColor, cardColor]}
              start={{ x: 1, y: 1 }}
              end={{ x: 2, y: 1 }}
              key={orderItem.id}
              style={[styles.orderItemRow, { borderColor }]}
            >
              <View style={styles.orderItemInfo}>
                {orderItem.image && (
                  <Image
                    source={{ uri: orderItem.image }}
                    style={styles.orderItemThumbnail}
                  />
                )}
                <View style={styles.orderItemDetails}>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.orderItemName]}
                  >
                    {orderItem.product}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.orderItemQuantity, { color: "#666666" }]}
                  >
                    Qty: {orderItem.quantity}
                  </StyledText>
                </View>
              </View>
              <View style={styles.orderItemRight}>
                <StyledText
                  variant="bodySmall"
                  style={[styles.orderItemSubtotal]}
                >
                  {formatCurrency(orderItem.sub_total)}
                </StyledText>
                <Pressable
                  style={[styles.buyAgainButton, { borderColor }]}
                  onPress={() => onBuyAgain(orderItem.product_id)}
                >
                  <MaterialIcons name="replay" size={14} color="#666" />
                  <StyledText
                    variant="bodySmall"
                    style={[styles.buyAgainText, { color: "#666" }]}
                  >
                    Buy Again
                  </StyledText>
                </Pressable>
              </View>
            </LinearGradient>
          ))}
        </View>

        <View style={styles.costBreakdown}>
          <StyledText
            variant="bodyMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Cost Breakdown
          </StyledText>
          <View style={styles.costRow}>
            <StyledText
              variant="bodySmall"
              style={[styles.costLabel, { color: textColor }]}
            >
              Items Subtotal
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.costValue, { color: textColor }]}
            >
              {formatCurrency(itemsSubtotal)}
            </StyledText>
          </View>
          <View style={styles.costRow}>
            <StyledText
              variant="bodySmall"
              style={[styles.costLabel, { color: textColor }]}
            >
              Service Fee
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.costValue, { color: textColor }]}
            >
              {formatCurrency(2.0)}
            </StyledText>
          </View>
          <View style={styles.costRow}>
            <StyledText
              variant="bodySmall"
              style={[styles.costLabel, { color: textColor }]}
            >
              Delivery Fee
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.costValue, { color: textColor }]}
            >
              {formatCurrency(item.shipping_cost)}
            </StyledText>
          </View>
          <View style={styles.costRow}>
            <StyledText
              variant="bodySmall"
              style={[styles.costLabel, { color: textColor }]}
            >
              VAT
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.costValue, { color: textColor }]}
            >
              {formatCurrency(item.tax_amount)}
            </StyledText>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <StyledText
              variant="bodyMedium"
              style={[styles.totalLabel, { color: textColor }]}
            >
              Total
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.totalValue, { color: textColor }]}
            >
              {formatCurrency(item.total_amount)}
            </StyledText>
          </View>
        </View>

        {item.delivery_address && (
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <StyledText
                variant="bodySmall"
                style={[styles.deliveryText, { color: textColor }]}
              >
                {item.delivery_address.full_address}
              </StyledText>
            </View>
            {item.delivery_left_at_door ? (
              <View style={styles.deliveryRow}>
                <Ionicons name="home-outline" size={14} color="#666" />
                <StyledText
                  variant="bodySmall"
                  style={[styles.deliveryText, { color: textColor }]}
                >
                  Leave at door — photo proof required
                </StyledText>
              </View>
            ) : (
              item.delivery_code && (
                <View style={styles.deliveryRow}>
                  <Ionicons name="key-outline" size={14} color="#666" />
                  <StyledText
                    variant="bodySmall"
                    style={[styles.deliveryText, { color: textColor }]}
                  >
                    Delivery Code: {item.delivery_code}
                  </StyledText>
                </View>
              )
            )}
          </View>
        )}

        <View style={styles.orderActions}>
          {isTrackableOrderStatus(item.status) && (
            <StyledButton
              title="Track Order"
              variant="tonal"
              onPress={() => onTrackOrder(item)}
              loading={trackingOrderId === item.id && isTracking}
              disabled={isTracking && trackingOrderId !== item.id}
            />
          )}
          <StyledButton
            title="View Details"
            variant="tonal"
            onPress={() => onPressOrder(item.id)}
          />
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.trackingOrderId === next.trackingOrderId &&
    prev.isTracking === next.isTracking,
);

export default OrderCard;

const styles = StyleSheet.create({
  orderCard: {
    borderRadius: 5,
    marginBottom: 16,
    padding: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "600",
    marginBottom: 4,
  },
  orderDate: {
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontWeight: "500",
  },
  orderItemsSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  orderItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderItemThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontWeight: "500",
    marginBottom: 2,
  },
  orderItemQuantity: {
    opacity: 0.7,
    fontSize: 12,
  },
  orderItemSubtotal: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  orderItemRight: {
    alignItems: "flex-end",
  },
  buyAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  buyAgainText: {
    fontSize: 12,
    fontWeight: "500",
  },
  costBreakdown: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  costLabel: {
    opacity: 0.8,
  },
  costValue: {
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: "600",
  },
  totalValue: {
    fontWeight: "600",
    fontSize: 16,
  },
  deliveryInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  deliveryText: {
    opacity: 0.8,
  },
  orderActions: {
    gap: 2,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});
