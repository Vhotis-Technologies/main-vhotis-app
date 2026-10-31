import { ProductReturnInterface } from "@/app/interfaces/seller/ProductInterface";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import Actions from "../../helper/Action";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface MobileProductItemsProps extends ProductReturnInterface {
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPress?: () => void;
  listingStatus?: "draft" | "live" | "paused";
  warehouseAvailable?: number;
  warehouseOnHand?: number;
  warehouseReserved?: number;
  blockerLabels?: string[];
  sellerSku?: string;
}

const SellerProductItem = ({
  id,
  image,
  images,
  description,
  name,
  price,
  quantity,
  status,
  rating,
  views,
  has_active_deals,
  active_deals_count,
  onDelete,
  onEdit,
  onPress,
  listingStatus,
  warehouseAvailable,
  warehouseOnHand,
  warehouseReserved,
  blockerLabels = [],
  sellerSku,
}: MobileProductItemsProps) => {
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const iconColor = useThemeColor({}, "icons");

  const imageUri =
    images && images.length > 0
      ? typeof images[0] === "string"
        ? images[0]
        : images[0]?.uri || images[0]?.image || images[0]
      : image;

  const statusValue = status || "inactive";
  const isActive = statusValue.toLowerCase() === "active";
  const isLowStock =
    warehouseAvailable != null
      ? warehouseAvailable <= 5
      : Number(quantity || 0) <= 5;
  const stockLabel =
    warehouseAvailable != null
      ? `${warehouseAvailable} in warehouse`
      : `${quantity || 0} in stock`;
  const listingLabel =
    listingStatus === "live"
      ? "Live"
      : listingStatus === "draft"
        ? "Draft"
        : listingStatus;

  const handleToggleActions = (event?: GestureResponderEvent) => {
    event?.stopPropagation();
    setIsActionsVisible((visible) => !visible);
  };

  const handleCardPress = () => {
    setIsActionsVisible(false);
    onPress?.();
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={handleCardPress}
        style={[
          styles.card,
          {
            backgroundColor: cardColor || backgroundColor,
            borderColor,
          },
        ]}
        activeOpacity={0.82}
      >
        <View style={styles.headerRow}>
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : { uri: "https://via.placeholder.com/80x80?text=No+Image" }
              }
              style={styles.image}
              contentFit="cover"
            />
            {has_active_deals && (
              <View style={styles.dealBadge}>
                <MaterialCommunityIcons name="tag" size={12} color="#B45309" />
                <StyledText variant="labelSmall" style={styles.dealBadgeText}>
                  {active_deals_count || 0}
                </StyledText>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <StyledText
                variant="labelLarge"
                style={styles.productName}
                numberOfLines={2}
              >
                {name || "Unnamed Product"}
              </StyledText>
              <View style={styles.actionAnchor}>
                <Pressable
                  onPress={handleToggleActions}
                  style={[styles.actionsButton, { borderColor }]}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={20}
                    color={iconColor || textColor}
                  />
                </Pressable>
                {isActionsVisible && (
                  <Actions
                    onDelete={(productId) => onDelete?.(productId)}
                    onEdit={(productId) => onEdit?.(productId)}
                    id={id ?? ""}
                    onClose={() => setIsActionsVisible(false)}
                  />
                )}
              </View>
            </View>

            <StyledText
              variant="bodySmall"
              style={styles.description}
              numberOfLines={2}
            >
              {description || "No description provided yet."}
            </StyledText>

            <View style={styles.metaRow}>
              {listingStatus ? (
                <View
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        listingStatus === "live" ? "#ECFDF3" : "#FFFBEB",
                    },
                  ]}
                >
                  <StyledText
                    variant="labelSmall"
                    style={{
                      color: listingStatus === "live" ? "#15803D" : "#92400E",
                      fontWeight: "700",
                    }}
                  >
                    {listingLabel}
                  </StyledText>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: isActive ? "#ECFDF3" : "#FFF7ED" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isActive ? "#16A34A" : "#F97316" },
                    ]}
                  />
                  <StyledText
                    variant="labelSmall"
                    style={[
                      styles.statusText,
                      { color: isActive ? "#15803D" : "#C2410C" },
                    ]}
                  >
                    {statusValue}
                  </StyledText>
                </View>
              )}

              <View style={styles.ratingPill}>
                <MaterialCommunityIcons name="star" size={13} color="#F59E0B" />
                <StyledText variant="labelSmall" style={styles.ratingText}>
                  {rating || 0}
                </StyledText>
              </View>
            </View>
            {sellerSku ? (
              <StyledText variant="labelSmall" style={{ opacity: 0.7 }}>
                SKU {sellerSku}
              </StyledText>
            ) : null}
            {blockerLabels.length > 0 ? (
              <StyledText variant="labelSmall" style={{ color: "#92400E" }}>
                {blockerLabels.join(" · ")}
              </StyledText>
            ) : null}
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <View style={styles.priceBlock}>
            <StyledText variant="labelSmall" style={styles.footerLabel}>
              Price
            </StyledText>
            <StyledText variant="labelLarge" style={styles.priceText}>
              {formatCurrency(price || 0)}
            </StyledText>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={14}
                color={iconColor || textColor}
              />
              <StyledText variant="labelSmall">{views || 0} views</StyledText>
            </View>
            <View
              style={[styles.metricPill, isLowStock && styles.lowStockPill]}
            >
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={14}
                color={isLowStock ? "#B91C1C" : iconColor || textColor}
              />
              <StyledText
                variant="labelSmall"
                style={isLowStock && styles.lowStockText}
              >
                {stockLabel}
              </StyledText>
              {warehouseAvailable != null && warehouseOnHand != null ? (
                <StyledText variant="labelSmall" style={{ opacity: 0.65 }}>
                  {warehouseOnHand} on hand · {warehouseReserved ?? 0} reserved
                </StyledText>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SellerProductItem;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageContainer: {
    width: 96,
    height: 112,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dealBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  dealBadgeText: {
    color: "#92400E",
    fontWeight: "700",
  },
  contentContainer: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  productName: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 20,
  },
  description: {
    opacity: 0.8,
    lineHeight: 18,
  },
  actionAnchor: {
    position: "relative",
    zIndex: 30,
  },
  actionsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: "700",
    textTransform: "capitalize",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFFBEB",
  },
  ratingText: {
    color: "#92400E",
    fontWeight: "700",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceBlock: {
    gap: 2,
  },
  footerLabel: {
    opacity: 0.65,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  priceText: {
    fontWeight: "800",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
  },
  lowStockPill: {
    backgroundColor: "#FEF2F2",
  },
  lowStockText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
});
