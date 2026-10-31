import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useGetCartCheckoutQuery } from "@/app/store/main/api/cartApi";
import {
  getMinimumOrderMessage,
  resolveMinimumOrderStatus,
} from "@/app/_utils/main/orderLimits";

interface CartFooterProps {
  onCheckout: () => void;
  showDeliveryTime?: boolean; // Optional: hide delivery time in cart, show in checkout
}

/* Calculate the delivery time in minutes or hours */
const calculateDeliveryTime = (delivery_time: number) => {
  if (delivery_time <= 60) {
    return `You will receive your order in ${delivery_time} minutes`;
  } else {
    const hours = Math.floor(delivery_time / 60);
    const minutes = delivery_time % 60;

    if (minutes === 0) {
      return `You will receive your order in ${hours} hours`;
    } else {
      return `You will receive your order in ${hours} hours and ${minutes} minutes`;
    }
  }
};

const CartFooterComponent = ({
  onCheckout,
  showDeliveryTime = false,
}: CartFooterProps) => {
  const cardColor = useThemeColor({}, "cards");

  // Fetch checkout data directly - will auto-refetch when cart items change
  const { data, isLoading, error } = useGetCartCheckoutQuery(undefined);
  const calc = data?.checkout_data;

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: cardColor }]}>
        <ActivityIndicator size="small" color="#0066CC" />
        <StyledText variant="labelMedium" style={styles.loadingText}>
          Calculating...
        </StyledText>
      </View>
    );
  }

  // Guard against undefined calc
  if (!calc) {
    return null;
  }

  const hasDeliveryAddress = calc?.delivery_fee > 0;
  const subtotal = calc?.sub_total ?? 0;
  const minimumStatus = resolveMinimumOrderStatus(
    subtotal,
    calc?.minimum_order_amount
  );
  const meetsMinimum =
    calc?.meets_minimum_order ?? minimumStatus.meetsMinimum;
  const minimumOrderMessage =
    getMinimumOrderMessage(subtotal, undefined, calc?.minimum_order_amount) ??
    null;

  return (
    <View style={[styles.container]}>
      {/* Price Breakdown */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <StyledText children="Subtotal" variant="labelMedium" />
          <StyledText
            children={formatCurrency(calc?.sub_total ?? 0)}
            variant="labelMedium"
          />
        </View>

        <View style={styles.priceRow}>
          <StyledText children="Service Fee" variant="labelMedium" />
          <StyledText
            children={formatCurrency(calc?.service_fee ?? 0)}
            variant="labelMedium"
          />
        </View>

        <View style={styles.priceRow}>
          <StyledText children="Delivery Fee" variant="labelMedium" />
          <StyledText
            children={
              hasDeliveryAddress
                ? formatCurrency(calc?.delivery_fee ?? 0)
                : "Calculated at checkout"
            }
            variant="labelMedium"
          />
        </View>

        {calc?.vat && calc?.vat > 0 && (
          <View style={styles.priceRow}>
            <StyledText children="VAT" variant="labelMedium" />
            <StyledText
              children={formatCurrency(calc?.vat)}
              variant="labelMedium"
            />
          </View>
        )}

        <View style={[styles.priceRow, styles.totalRow]}>
          <StyledText children="Total" variant="labelMedium" />
          <StyledText
            children={formatCurrency(calc?.total_amount ?? 0)}
            variant="labelMedium"
          />
        </View>

        {/* Display the delivery time when available */}
        {calc?.delivery_time > 0 && (
          <StyledText
            children={calculateDeliveryTime(calc.delivery_time)}
            variant="labelMedium"
            style={styles.deliveryTimeText}
          />
        )}
      </View>

      {!meetsMinimum && minimumOrderMessage && (
        <StyledText
          variant="labelMedium"
          style={styles.minimumOrderText}
          children={minimumOrderMessage}
        />
      )}

      {/* Checkout Button */}
      <StyledButton
        title="Proceed to Checkout"
        onPress={onCheckout}
        disabled={!meetsMinimum}
        variant="tonal"
        buttonStyles={styles.checkoutButton}
      />
    </View>
  );
};

export default CartFooterComponent;

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  priceContainer: {
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  checkoutButton: {
    height: 50,
  },
  loadingText: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },
  deliveryTimeText: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#666",
  },
  minimumOrderText: {
    marginBottom: 10,
    color: "#C62828",
    textAlign: "center",
  },
});
