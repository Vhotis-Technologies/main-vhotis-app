import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback } from "react";
import { router } from "expo-router";
import { OrderItem } from "@/app/interfaces/main/orders/Orders";
import { CartItems } from "@/app/interfaces/main/cart/CartInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import CartComponent from "@/app/component/main/mobile/cart/CartComponent";
import useMainCart from "@/app/hook/main/useMainCart";
import { MembershipBenefits } from "@/app/interfaces/main/cart/CartInterface";
import { MEMBER_ORDER_FREE_DELIVERY_THRESHOLD } from "@/app/constants/membershipBenefits";
import ToggleComponent from "@/app/component/helpers/settings/helpers/ToggleComponent";

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  shippingCost: number;
  priorityFee: number;
  total: number;
  isPriorityDelivery: boolean;
  deliveryLeftAtDoor: boolean;
  deliveryInstructions: string;
  membershipBenefits?: MembershipBenefits;
  isPriorityUpdating?: boolean;
  isDeliveryOptionsUpdating?: boolean;
  onPriorityToggle: (enabled: boolean) => Promise<void>;
  onLeaveAtDoorToggle: (enabled: boolean) => Promise<void>;
  onDeliveryInstructionsChange: (text: string) => void;
  onDeliveryInstructionsBlur: (instructions: string) => void;
  onRecalculateCosts: () => Promise<void>;
}

/**
 * Transform OrderItem back to CartItems format for CartComponent
 */
const transformOrderToCartItems = (items: OrderItem[]): CartItems[] => {
  return items.map((item) => ({
    id: item.id,
    cart_item_id: item.id, // Use the same ID for cart_item_id
    image: item.image,
    product_name: item.title,
    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
    quantity: parseInt(item.quantity),
    sub_total:
      (typeof item.price === "string" ? parseFloat(item.price) : item.price) *
      parseInt(item.quantity),
  }));
};

const OrderSummary = ({
  items,
  subtotal,
  serviceFee,
  tax,
  shippingCost,
  priorityFee,
  total,
  isPriorityDelivery,
  deliveryLeftAtDoor,
  deliveryInstructions,
  membershipBenefits,
  isPriorityUpdating = false,
  isDeliveryOptionsUpdating = false,
  onPriorityToggle,
  onLeaveAtDoorToggle,
  onDeliveryInstructionsChange,
  onDeliveryInstructionsBlur,
  onRecalculateCosts,
}: OrderSummaryProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  // Cart operations
  const {
    addProductToCart,
    decrementProductFromCart,
    handleDeleteCartItem,
    handleSaveForLater,
    isAddingToCartItem,
    isRemovingFromCartItem,
    isDeletingCartItemById,
    isAddingToWishlistItem,
  } = useMainCart();

  // Transform items to CartItems format
  const cartItems = transformOrderToCartItems(items);
  const priorityIncluded = membershipBenefits?.priority_included ?? false;

  const getDeliveryBenefitLabel = () => {
    if (!membershipBenefits?.is_member) {
      return null;
    }

    switch (membershipBenefits.delivery_benefit_applied) {
      case "free":
        return "Member benefit: free delivery this month";
      case "free_over_threshold":
        return `Member benefit: free delivery on orders over €${membershipBenefits.order_free_delivery_threshold ?? MEMBER_ORDER_FREE_DELIVERY_THRESHOLD}`;
      default:
        if (membershipBenefits.free_delivery_used) {
          return `Standard delivery fee applies on orders under €${membershipBenefits.order_free_delivery_threshold ?? MEMBER_ORDER_FREE_DELIVERY_THRESHOLD}`;
        }
        return null;
    }
  };

  const deliveryBenefitLabel = getDeliveryBenefitLabel();

  // Function to refresh checkout costs after cart operations
  const refreshCheckoutCosts = useCallback(async () => {
    try {
      await onRecalculateCosts();
    } catch (error) {
      console.error("Error refreshing checkout costs:", error);
    }
  }, [onRecalculateCosts]);

  const handlePriorityChange = useCallback(
    async (enabled: boolean) => {
      try {
        await onPriorityToggle(enabled);
      } catch (error) {
        console.error("Error toggling priority delivery:", error);
      }
    },
    [onPriorityToggle]
  );

  const handleLeaveAtDoorChange = useCallback(
    async (enabled: boolean) => {
      try {
        await onLeaveAtDoorToggle(enabled);
      } catch (error) {
        console.error("Error toggling leave at door:", error);
      }
    },
    [onLeaveAtDoorToggle]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: cardColor, borderColor }]}
    >
      {/* Order Items Section */}
      <View style={styles.itemsSection}>
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <CartComponent
              cartItems={item}
              onProductPress={(id) => {
                router.push({
                  pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
                  params: { id },
                });
              }}
              onRemove={async (id) => {
                await handleDeleteCartItem(item.cart_item_id);
                await refreshCheckoutCosts();
              }}
              onSaveForLater={async (id) => {
                await handleSaveForLater(id);
                await refreshCheckoutCosts();
              }}
              onIncrement={async (id) => {
                await addProductToCart(id);
                await refreshCheckoutCosts();
              }}
              onDecrement={async (id) => {
                await decrementProductFromCart(id);
                await refreshCheckoutCosts();
              }}
              isAddingToCart={isAddingToCartItem(item.id)}
              isRemovingFromCart={isRemovingFromCartItem(item.id)}
              isDeletingCartItem={isDeletingCartItemById(item.cart_item_id)}
              isAddingToWishlist={isAddingToWishlistItem(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Order Summary Section */}
      <View style={styles.summarySection}>
        <StyledText variant="labelLarge" style={styles.sectionTitle}>
          Order Summary
        </StyledText>

        <View style={styles.priorityContainer}>
          <View style={styles.priorityHeader}>
            <StyledText variant="labelMedium" style={styles.priorityTitle}>
              Priority Delivery
            </StyledText>
            <ToggleComponent
              label="Priority Delivery"
              value={isPriorityDelivery}
              onValueChange={handlePriorityChange}
              disabled={isPriorityUpdating || priorityIncluded}
              size="small"
              labelVariant="yesNo"
            />
          </View>
          <StyledText variant="labelSmall">
            {priorityIncluded
              ? "Included with your membership on every order."
              : "Add a 30% surcharge to jump the queue and have your order assigned to drivers first."}
          </StyledText>
          {isPriorityUpdating && (
            <View style={styles.priorityLoader}>
              <ActivityIndicator size="small" color="#007bff" />
              <StyledText variant="labelSmall" style={styles.priorityLoading}>
                Updating priority delivery...
              </StyledText>
            </View>
          )}
        </View>

        <View style={styles.deliveryOptionsContainer}>
          <StyledText variant="labelMedium" style={styles.deliveryOptionsTitle}>
            Delivery Instructions
          </StyledText>
          <StyledText variant="labelSmall" style={styles.deliveryOptionsDescription}>
            Add instructions for this order only (gate code, ring doorbell,
            leave with concierge, etc.).
          </StyledText>
          <StyledTextInput
            label="Instructions for this delivery"
            value={deliveryInstructions}
            onChangeText={onDeliveryInstructionsChange}
            onBlur={() => onDeliveryInstructionsBlur(deliveryInstructions)}
            placeholder="e.g. Gate code 4521, ring doorbell twice"
            multiline
            numberOfLines={4}
            style={styles.instructionsInput}
          />
        </View>

        <View style={styles.deliveryOptionsContainer}>
          <View style={styles.priorityHeader}>
            <StyledText variant="labelMedium" style={styles.leaveAtDoorTitle}>
              Leave at Door
            </StyledText>
            <ToggleComponent
              label="Leave at Door"
              value={deliveryLeftAtDoor}
              onValueChange={handleLeaveAtDoorChange}
              disabled={isDeliveryOptionsUpdating}
              size="small"
              labelVariant="yesNo"
            />
          </View>
          <StyledText variant="labelSmall" style={styles.deliveryOptionsDescription}>
            No delivery code needed. Your rider will leave the order at your
            door and upload a photo as proof.
          </StyledText>
          {isDeliveryOptionsUpdating && (
            <View style={styles.priorityLoader}>
              <ActivityIndicator size="small" color="#007bff" />
              <StyledText variant="labelSmall" style={styles.priorityLoading}>
                Updating delivery options...
              </StyledText>
            </View>
          )}
        </View>

        <View style={styles.summaryRow}>
          <StyledText variant="labelMedium">
            Subtotal
          </StyledText>
          <StyledText variant="labelMedium" style={styles.summaryValue}>
            {formatCurrency(subtotal)}
          </StyledText>
        </View>

        {serviceFee > 0 && (
          <View style={styles.summaryRow}>
            <StyledText variant="labelMedium">
              Service Fee
            </StyledText>
            <StyledText variant="labelMedium" style={styles.summaryValue}>
              {formatCurrency(serviceFee)}
            </StyledText>
          </View>
        )}

        {(shippingCost > 0 || deliveryBenefitLabel) && (
          <View style={styles.summaryRow}>
            <View style={styles.deliveryFeeLabelBlock}>
              <StyledText variant="labelMedium">
                Delivery Fee
              </StyledText>
              {deliveryBenefitLabel && (
                <StyledText
                  variant="labelSmall"
                  style={styles.deliveryBenefitText}
                >
                  {deliveryBenefitLabel}
                </StyledText>
              )}
            </View>
            <StyledText variant="labelMedium" style={styles.summaryValue}>
              {formatCurrency(shippingCost)}
            </StyledText>
          </View>
        )}

        {priorityFee > 0 && (
          <View style={styles.summaryRow}>
            <StyledText variant="labelMedium">
              Priority Surcharge
            </StyledText>
            <StyledText variant="labelMedium" style={styles.summaryValue}>
              {formatCurrency(priorityFee)}
            </StyledText>
          </View>
        )}

        {tax > 0 && (
          <View style={styles.summaryRow}>
            <StyledText variant="labelMedium">
              VAT
            </StyledText>
            <StyledText variant="labelMedium" style={styles.summaryValue}>
              {formatCurrency(tax)}
            </StyledText>
          </View>
        )}

        <View
          style={[
            styles.summaryRow,
            styles.totalRow,
            { borderTopColor: borderColor },
          ]}
        >
          <StyledText variant="titleMedium" style={styles.totalLabel}>
            Total
          </StyledText>
          <StyledText variant="titleMedium" style={styles.totalValue}>
            {formatCurrency(total)}
          </StyledText>
        </View>
      </View>
    </View>
  );
};

export default OrderSummary;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 8,
  },
  itemsSection: {
    padding: 5,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  summarySection: {
    padding: 16,
  },
  priorityContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priorityTitle: {
    fontWeight: "600",
  },
  priorityLoader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  priorityLoading: {
    marginLeft: 8,
    color: "#1f3c88",
  },
  deliveryOptionsContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deliveryOptionsTitle: {
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  deliveryOptionsDescription: {
    marginBottom: 8,
  },
  leaveAtDoorTitle: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  instructionsInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryFeeLabelBlock: {
    flex: 1,
    paddingRight: 12,
  },
  deliveryBenefitText: {
    color: "#1f3c88",
    marginTop: 4,
  },
  summaryValue: {
    fontWeight: "500",
    color: "#2c3e50",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontWeight: "700",
    fontFamily: "SpaceMono",
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 18,
  },
});
