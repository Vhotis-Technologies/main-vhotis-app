import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import { OrderItemInterface } from "@/app/interfaces/seller/orders/OrdersInterface";
import { formatCurrency, formatDate } from "@/app/_utils/main/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
interface SellerOrderItemsProps {
  item: OrderItemInterface;
  onPress?: (id: string) => void;
  onClaim?: (id: string) => void;
  onFulfill?: (id: string) => void;
  isLoading?: boolean;
  expandable?: boolean;
}

const BRAND_ACCENT = "#801330";

type ChipTone = "neutral" | "amber" | "green" | "red";

function toneForOrderStatus(status?: string): ChipTone {
  if (!status) return "neutral";
  switch (status.toLowerCase()) {
    case "pending":
      return "amber";
    case "completed":
    case "processing":
    case "claimed":
      return "green";
    case "cancelled":
    case "expired":
      return "red";
    default:
      return "neutral";
  }
}

function toneForPaymentStatus(payment?: string): ChipTone {
  if (!payment) return "neutral";
  switch (payment.toLowerCase()) {
    case "paid":
      return "green";
    case "unpaid":
      return "amber";
    case "refunded":
      return "red";
    default:
      return "neutral";
  }
}

function chipColors(
  tone: ChipTone,
  isDark: boolean
): { bg: string; fg: string } {
  if (isDark) {
    switch (tone) {
      case "amber":
        return { bg: "rgba(245, 158, 11, 0.18)", fg: "#FBBF24" };
      case "green":
        return { bg: "rgba(34, 197, 94, 0.18)", fg: "#4ADE80" };
      case "red":
        return { bg: "rgba(239, 68, 68, 0.18)", fg: "#F87171" };
      default:
        return { bg: "rgba(255,255,255,0.08)", fg: "#E5E7EB" };
    }
  }
  switch (tone) {
    case "amber":
      return { bg: "#FEF3C7", fg: "#B45309" };
    case "green":
      return { bg: "#D1FAE5", fg: "#047857" };
    case "red":
      return { bg: "#FEE2E2", fg: "#B91C1C" };
    default:
      return { bg: "#F3F4F6", fg: "#374151" };
  }
}

const SellerOrderItems = ({
  item,
  onPress,
  expandable = false,
}: SellerOrderItemsProps) => {
  const { currentTheme } = useThemeContext();
  const cardBg = useThemeColor({}, "cards");
  const borderSubtle = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = "#9CA3AF";
  const [expanded, setExpanded] = useState(false);

  const lineItems = item.items ?? [];
  const canExpand = expandable || !onPress;
  const showItemBreakdown = canExpand && expanded;

  const total = useMemo(() => Number(item.price) || 0, [item.price]);

  const handlePress = () => {
    if (onPress) {
      onPress(item.id);
      return;
    }
    if (canExpand) {
      setExpanded((prev) => !prev);
    }
  };

  const chevronIcon =
    canExpand && expanded ? "chevron-up" : "chevron-right";

  const dateLabel =
    typeof item.date === "string"
      ? formatDate(item.date)
      : item.date.toLocaleDateString();

  const statusTone = toneForOrderStatus(item.status);
  const paymentTone = toneForPaymentStatus(item.payment_status);

  const statusChip = chipColors(statusTone, currentTheme === "dark");
  const paymentChip = chipColors(paymentTone, currentTheme === "dark");

  const metricLabelStyle = [styles.metricLabel, { color: iconMuted }];

  return (
    <TouchableOpacity
      style={[styles.touchable]}
      onPress={handlePress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`Order ${item.id}, ${item.status ?? ""}`}
      accessibilityState={{ expanded: showItemBreakdown }}
    >
      <View style={styles.cardInner}>
        <View style={styles.topRow}>
          <View style={styles.leadingBlock}>
            <StyledText
              variant="titleSmall"
              numberOfLines={1}
              style={[styles.orderTitle, { color: BRAND_ACCENT }]}
            >
              Order #{item.id}
            </StyledText>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={14}
                color={iconMuted}
              />
              <StyledText
                variant="labelSmall"
                style={[styles.dateText, { color: iconMuted }]}
              >
                {dateLabel}
              </StyledText>
            </View>
          </View>
          <MaterialCommunityIcons
            name={chevronIcon}
            size={22}
            color={iconMuted}
          />
        </View>

        <View style={styles.chipRow}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: statusChip.bg,
                borderColor: borderSubtle,
              },
            ]}
          >
            <StyledText
              variant="labelSmall"
              style={[styles.chipText, { color: statusChip.fg }]}
            >
              {(item.status ?? "—").replace(/_/g, " ")}
            </StyledText>
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: paymentChip.bg,
                borderColor: borderSubtle,
              },
            ]}
          >
            <StyledText
              variant="labelSmall"
              style={[styles.chipText, { color: paymentChip.fg }]}
            >
              {(item.payment_status ?? "—").replace(/_/g, " ")}
            </StyledText>
          </View>
        </View>

        <View style={styles.customerRow}>
          <MaterialCommunityIcons
            name="account-outline"
            size={18}
            color={iconMuted}
          />
          <StyledText
            variant="bodySmall"
            numberOfLines={1}
            style={[styles.customerName, { color: textColor }]}
          >
            {item.customer_name ?? "Customer"}
          </StyledText>
        </View>

        <View style={[styles.divider, { backgroundColor: borderSubtle }]} />

        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <StyledText variant="labelSmall" style={metricLabelStyle}>
              Price
            </StyledText>
            <StyledText variant="titleSmall" style={styles.metricValue}>
              {formatCurrency(item.price)}
            </StyledText>
          </View>
          <View style={[styles.metricBlock, styles.metricCenter]}>
            <StyledText variant="labelSmall" style={metricLabelStyle}>
              Quantity
            </StyledText>
            <StyledText variant="titleSmall" style={styles.metricValue}>
              {item.quantity}
            </StyledText>
          </View>
          <View style={[styles.metricBlock, styles.metricEnd]}>
            <StyledText variant="labelSmall" style={metricLabelStyle}>
              Total
            </StyledText>
            <StyledText
              variant="titleMedium"
              style={[styles.totalEmphasis, { color: BRAND_ACCENT }]}
            >
              {formatCurrency(total)}
            </StyledText>
          </View>
        </View>

        {showItemBreakdown && (
          <View style={styles.itemsSection}>
            <StyledText
              variant="labelSmall"
              style={[styles.itemsSectionTitle, { color: iconMuted }]}
            >
              Order items ({lineItems.length})
            </StyledText>
            {lineItems.length === 0 ? (
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 8 }}
              >
                No item details available.
              </StyledText>
            ) : (
              lineItems.map((lineItem, index) => {
                const name = lineItem.product_name?.trim() || "Product";
                const hasUnitPrice =
                  lineItem.unit_price != null &&
                  !Number.isNaN(Number(lineItem.unit_price));

                return (
                  <View
                    key={lineItem.id ?? `line-${index}`}
                    style={[
                      styles.lineItemRow,
                      { borderTopColor: borderSubtle },
                    ]}
                  >
                    <View style={styles.lineItemMain}>
                      <StyledText
                        variant="bodySmall"
                        numberOfLines={2}
                        style={[styles.lineItemName, { color: textColor }]}
                      >
                        {name}
                      </StyledText>
                      {lineItem.store_name ? (
                        <StyledText
                          variant="labelSmall"
                          numberOfLines={1}
                          style={{ color: iconMuted }}
                        >
                          {lineItem.store_name}
                        </StyledText>
                      ) : null}
                      <View style={styles.lineItemMeta}>
                        <StyledText
                          variant="labelSmall"
                          style={{ color: iconMuted }}
                        >
                          Qty: {lineItem.quantity ?? 0}
                        </StyledText>
                        {hasUnitPrice ? (
                          <StyledText
                            variant="labelSmall"
                            style={{ color: iconMuted }}
                          >
                            {formatCurrency(lineItem.unit_price)} each
                          </StyledText>
                        ) : null}
                      </View>
                    </View>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.lineItemSubtotal, { color: textColor }]}
                    >
                      {formatCurrency(lineItem.subtotal ?? 0)}
                    </StyledText>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SellerOrderItems;

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 8,
    overflow: "hidden",
  },
  cardInner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  leadingBlock: {
    flex: 1,
    minWidth: 0,
  },
  orderTitle: {
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontWeight: "500",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.15,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  customerName: {
    flex: 1,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  metricBlock: {
    flex: 1,
    minWidth: 0,
  },
  metricCenter: {
    alignItems: "center",
  },
  metricEnd: {
    alignItems: "flex-end",
  },
  metricLabel: {
    marginBottom: 4,
    fontWeight: "500",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    fontSize: 11,
  },
  metricValue: {
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  totalEmphasis: {
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  itemsSection: {
    marginTop: 4,
    paddingTop: 4,
  },
  itemsSectionTitle: {
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    fontSize: 11,
    marginBottom: 4,
  },
  lineItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lineItemMain: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  lineItemName: {
    fontWeight: "600",
  },
  lineItemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  lineItemSubtotal: {
    fontWeight: "700",
    marginTop: 2,
  },
});
