import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { OrderItem } from "@/app/interfaces/main/orders/Orders";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";

const BRAND_ACCENT = "#801330";

export interface OrderConfirmationComponentProps {
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  shippingCost: number;
  priorityFee: number;
  total: number;
  isPriorityDelivery: boolean;
  shippingAddress: DeliveryAddress | null;
  paidAt: string;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

function parseUnitPrice(price: string | number): number {
  return typeof price === "string" ? parseFloat(price) || 0 : price;
}

function formatPaidAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatAddress(address: DeliveryAddress): string {
  const lines = [
    address.delivery_name,
    address.address,
    address.address2,
    [address.city, address.zip_code].filter(Boolean).join(", "),
    address.country,
  ].filter((line) => line && String(line).trim());

  return lines.join("\n");
}

const OrderConfirmationComponent = ({
  items,
  subtotal,
  serviceFee,
  tax,
  shippingCost,
  priorityFee,
  total,
  isPriorityDelivery,
  shippingAddress,
  paidAt,
  onViewOrders,
  onContinueShopping,
}: OrderConfirmationComponentProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const iconMuted = "#9CA3AF";

  const itemCount = useMemo(
    () =>
      items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0),
    [items]
  );

  const renderSummaryRow = (label: string, value: number) => {
    if (value <= 0) return null;
    return (
      <View style={styles.summaryRow}>
        <StyledText variant="labelMedium" style={{ color: iconMuted }}>
          {label}
        </StyledText>
        <StyledText variant="labelMedium" style={{ color: textColor }}>
          {formatCurrency(value)}
        </StyledText>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View
          style={[
            styles.successIconWrap,
            { backgroundColor: `${successColor}22` },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={56}
            color={successColor}
          />
        </View>
        <StyledText variant="headlineSmall" style={[styles.heroTitle, { color: textColor }]}>
          Payment successful
        </StyledText>
        <StyledText variant="bodyMedium" style={{ color: iconMuted, textAlign: "center" }}>
          Your order has been placed. We will notify you when it is on the way.
        </StyledText>
        <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 8 }}>
          Paid {formatPaidAt(paidAt)}
        </StyledText>
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: `${successColor}22` }]}>
          <StyledText variant="labelSmall" style={{ color: successColor, fontWeight: "600" }}>
            Paid
          </StyledText>
        </View>
        <View style={[styles.chip, { backgroundColor: "rgba(245, 158, 11, 0.18)" }]}>
          <StyledText variant="labelSmall" style={{ color: "#FBBF24", fontWeight: "600" }}>
            Order pending
          </StyledText>
        </View>
        {isPriorityDelivery ? (
          <View style={[styles.chip, { backgroundColor: "rgba(128, 19, 48, 0.15)" }]}>
            <StyledText variant="labelSmall" style={{ color: BRAND_ACCENT, fontWeight: "600" }}>
              Priority delivery
            </StyledText>
          </View>
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
        <StyledText variant="titleSmall" style={[styles.sectionTitle, { color: textColor }]}>
          Items ordered ({itemCount})
        </StyledText>
        {items.map((item) => {
          const qty = parseInt(item.quantity, 10) || 0;
          const unitPrice = parseUnitPrice(item.price);
          const lineTotal = unitPrice * qty;

          return (
            <View
              key={item.id}
              style={[styles.lineItem, { borderTopColor: borderColor }]}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImagePlaceholder, { borderColor }]}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={24}
                    color={iconMuted}
                  />
                </View>
              )}
              <View style={styles.lineItemBody}>
                <StyledText
                  variant="bodyMedium"
                  numberOfLines={2}
                  style={{ color: textColor, fontWeight: "600" }}
                >
                  {item.title}
                </StyledText>
                <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                  {qty} × {formatCurrency(unitPrice)}
                </StyledText>
              </View>
              <StyledText variant="bodyMedium" style={{ color: textColor, fontWeight: "700" }}>
                {formatCurrency(lineTotal)}
              </StyledText>
            </View>
          );
        })}
      </View>

      <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
        <StyledText variant="titleSmall" style={[styles.sectionTitle, { color: textColor }]}>
          Payment summary
        </StyledText>
        {renderSummaryRow("Subtotal", subtotal)}
        {renderSummaryRow("Service fee", serviceFee)}
        {renderSummaryRow("Delivery fee", shippingCost)}
        {renderSummaryRow("Priority surcharge", priorityFee)}
        {renderSummaryRow("VAT", tax)}
        <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
          <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
            Total paid
          </StyledText>
          <StyledText
            variant="titleMedium"
            style={{ color: BRAND_ACCENT, fontWeight: "700" }}
          >
            {formatCurrency(total)}
          </StyledText>
        </View>
      </View>

      {shippingAddress ? (
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={20}
              color={iconMuted}
            />
            <StyledText
              variant="titleSmall"
              style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}
            >
              Delivery address
            </StyledText>
          </View>
          <StyledText
            variant="bodySmall"
            style={[styles.addressText, { color: textColor }]}
          >
            {formatAddress(shippingAddress)}
          </StyledText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <StyledButton
          title="View my orders"
          onPress={onViewOrders}
          variant="large"
        />
        <StyledButton
          title="Continue shopping"
          onPress={onContinueShopping}
          variant="tonal"
          buttonStyles={styles.secondaryButton}
        />
      </View>
    </ScrollView>
  );
};

export default OrderConfirmationComponent;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  hero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  section: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  itemImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  lineItemBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addressText: {
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
