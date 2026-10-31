import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";
import useHelpers, {
  formatCurrency,
  formatTotalSold,
  formatWeight,
  formatDealBadge,
} from "@/app/_utils/main/helpers";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { RootState, useAppSelector } from "@/app/store/store";
import { useThemeColor } from "@/hooks/useThemeColor";
import AddToBasketButton from "@/app/component/helpers/buttons/AddToBasketButton";
import { ProductPriceBlock } from "@/app/component/main/shared/ProductPriceBlock";

interface ProductCardProps {
  item: ProductCardInterface;
  onAddToCart: (id: string) => void;
  onViewDetails: (id: string) => void;
  isLoading?: boolean;
  layout?: "grid" | "list";
  width?: number; // Optional explicit width for grid layout
}

const ProductCard = ({
  item,
  onAddToCart,
  onViewDetails,
  isLoading = false,
  layout = "grid",
  width,
}: ProductCardProps) => {
  const userCountry = useAppSelector((state: RootState) => {
    const user = state.auth.user;
    return user && "address" in user ? user.address?.country : undefined;
  });
  const { limitDescription, currencySymbol } = useHelpers();
  const backgroundColor = useThemeColor({}, "background");
  const buttonColor = useThemeColor({}, "button");
  const shadowColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Normalize distance to string format
  const formatDistance = (distance?: string | number): string | undefined => {
    if (distance === undefined || distance === null) return undefined;
    if (typeof distance === "number") {
      return `${distance}km away`;
    }
    return distance;
  };

  const displayRating =
    typeof item.rating === "number" && !Number.isNaN(item.rating)
      ? item.rating
      : 0;

  // Format deal badge using formatDealBadge helper
  const getDealBadge = () => {
    // Check item.deal first (this is what the backend provides)
    if (item.deal && item.deal.deal_type) {
      return formatDealBadge(item.deal.deal_type, {
        discount_percentage: item.deal.discount_percentage,
        discount_amount: item.deal.discount_amount,
        bogo_buy_quantity: item.deal.bogo_buy_quantity,
        bogo_get_quantity: item.deal.bogo_get_quantity,
        bundle_price: item.deal.bundle_price,
        discount_value: item.discount_value,
      });
    }

    // Fallback: If there's a deal_type at the top level, use formatDealBadge
    if (item.deal_type) {
      return formatDealBadge(item.deal_type, {
        discount_value: item.discount_value,
        discount_percentage: item.discount_percentage,
        discount_amount: item.discount_amount,
        bogo_buy_quantity: item.bogo_buy_quantity,
        bogo_get_quantity: item.bogo_get_quantity,
        bundle_price: item.bundle_price,
      });
    }

    // If no deal_type but has discount field, show as percentage
    if (
      item.discount !== undefined &&
      item.discount !== null &&
      item.discount > 0
    ) {
      return `${Math.round(item.discount)}% off`;
    }

    // If no deal_type but has discount_value or discount_percentage, show as percentage
    const discountPercent = item.discount_percentage ?? item.discount_value;
    if (
      discountPercent !== undefined &&
      discountPercent !== null &&
      discountPercent > 0
    ) {
      return `${Math.round(discountPercent)}% off`;
    }

    return null;
  };

  const dealBadge = getDealBadge();

  const formattedDistance = formatDistance(item.distance);
  // Deal/category APIs use different casing; support both
  const isSponsored = item.is_sponsored ?? item.isSponsored ?? false;

  // List layout (horizontal like CategoryItemComponent)
  if (layout === "list") {
    return (
      <TouchableOpacity
        style={[styles.listContainer, { backgroundColor, borderColor }]}
        onPress={() => onViewDetails(item.id)}
      >
        <View style={styles.listImageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.listImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          {isSponsored && (
            <View style={styles.listSponsoredContainer}>
              <StyledText variant="bodySmall" style={styles.sponsoredText}>
                Sponsored
              </StyledText>
            </View>
          )}
          {item.discount && (
            <View style={styles.listDiscountContainer}>
              <StyledText variant="bodySmall" style={styles.discountText}>
                {item.discount}% off
              </StyledText>
            </View>
          )}
        </View>

        <View style={styles.listDetailsContainer}>
          <View style={styles.titleContainer}>
            <StyledText variant="labelSmall" style={styles.listTitleText}>
              {item.name}
            </StyledText>
            <StyledText variant="labelSmall" style={styles.listTitleText}>
              {item.description ? limitDescription(item.description) : ""}
            </StyledText>
          </View>

          <View style={styles.listPriceContainer}>
            <ProductPriceBlock item={item} priceStyle={styles.listPriceText} />
          </View>

          <View style={styles.listInfoContainer}>
            {item.weight !== undefined && item.weight > 0 && (
              <StyledText variant="bodySmall" style={styles.listWeightText}>
                weight: {formatWeight(item.weight)}
              </StyledText>
            )}
            {item.deliveryTime !== undefined && (
              <StyledText
                variant="bodySmall"
                style={[styles.listDeliveryText, { marginVertical: 5 }]}
              >
                this item will be delivered in: {item.deliveryTime} minutes
              </StyledText>
            )}
            {item.deliveryFee !== undefined && (
              <StyledText variant="bodySmall" style={styles.listDeliveryText}>
                The delivery fee is{" "}
                {formatCurrency(item.deliveryFee, userCountry)}
              </StyledText>
            )}
            {formattedDistance && (
              <StyledText variant="bodySmall" style={styles.listDeliveryText}>
                Product is {formattedDistance}
              </StyledText>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.listAddToCartButton,
              { backgroundColor: buttonColor },
            ]}
            onPress={() => onAddToCart(item.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <StyledText variant="labelSmall" style={styles.addToCartText}>
                Add to Cart
              </StyledText>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid layout (default, 2-column)
  const containerStyle: any[] = [
    styles.mainContainer,
    { backgroundColor, shadowColor, borderColor },
  ];
  if (width) {
    containerStyle.push({ width, maxWidth: width });
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onViewDetails(item.id)}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}

        {isSponsored && (
          <View style={styles.sponsoredContainer}>
            <StyledText variant="bodySmall" style={styles.sponsoredText}>
              Sponsored
            </StyledText>
          </View>
        )}
        {dealBadge && (
          <View style={styles.dealBadgeContainer}>
            <StyledText variant="bodySmall" style={styles.dealBadgeText}>
              {dealBadge}
            </StyledText>
          </View>
        )}
        {displayRating > 0 && (
          <View style={styles.ratingContainer}>
            <StyledText variant="bodySmall" style={styles.ratingText}>
              ⭐ {displayRating.toFixed(1)}
            </StyledText>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <AddToBasketButton
          onPress={() => onAddToCart(item.id)}
          disabled={isLoading}
          loading={isLoading}
        />

        <View style={styles.titleContainer}>
          <StyledText variant="labelMedium" style={styles.titleText}>
            {item.name}
          </StyledText>
          <StyledText variant="bodySmall" style={styles.descriptionText}>
            {item.description ? limitDescription(item.description) : ""}
          </StyledText>
        </View>

        <View>
          {item.weight !== undefined && item.weight > 0 && (
            <StyledText variant="bodySmall" style={styles.infoText}>
              {`Weight: ${formatWeight(item.weight)}`}
            </StyledText>
          )}
          {formattedDistance && (
            <StyledText variant="bodySmall" style={styles.distanceText}>
              {formattedDistance}
            </StyledText>
          )}
          {item.deliveryTime !== undefined && (
            <StyledText variant="bodySmall" style={styles.infoText}>
              Delivery: {item.deliveryTime} min
            </StyledText>
          )}
          {item.deliveryFee !== undefined && (
            <StyledText variant="bodySmall" style={styles.infoText}>
              Fee: {formatCurrency(item.deliveryFee)}
            </StyledText>
          )}
        </View>

        <View style={styles.priceContainer}>
          <ProductPriceBlock
            item={item}
            priceStyle={styles.priceText}
            subtextStyle={styles.bogoSubtext}
            strikethroughStyle={styles.originalPrice}
          />
          {item.total_sold !== undefined && item.total_sold > 0 && (
            <StyledText variant="bodySmall" style={styles.totalSoldText}>
              {`Sold (${formatTotalSold(item.total_sold)})`}
            </StyledText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(ProductCard);

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    marginHorizontal: 1,
    flex: 1,
    minWidth: 160,
  },

  imageContainer: {
    width: "100%",
    height: 160,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },

  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  sponsoredContainer: {
    position: "absolute",
    top: 0,
    right: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },

  sponsoredText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    textTransform: "lowercase",
    color: "black",
  },

  dealBadgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
  },

  dealBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "white",
    textTransform: "uppercase",
  },

  ratingContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },

  ratingText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "white",
  },

  detailsContainer: {
    padding: 10,
    flex: 1,
  },

  titleContainer: {
    marginBottom: 3,
  },

  addToCartButton: {
    borderRadius: 15,
    marginBottom: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },

  addToCartText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "#fff",
  },

  titleText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    marginBottom: 4,
  },

  descriptionText: {
    fontSize: 11,
    fontWeight: "400",
    fontFamily: "BarlowLight",
  },
  infoText: {
    fontSize: 10,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    color: "#666",
    marginBottom: 2,
  },

  distanceText: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: "BarlowMedium",
    color: "#007AFF",
  },

  priceContainer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowMedium",
  },
  totalSoldText: {
    fontSize: 9,
    fontWeight: "400",
    fontFamily: "BarlowLight",
  },
  priceColumn: {
    flexDirection: "column",
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    color: "#999",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  bogoSubtext: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "#0E7490",
    marginTop: 2,
  },
  // List layout styles
  listContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 5,
    gap: 2,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  listImageContainer: {
    width: 120,
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listDetailsContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  listTitleText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.2,
  },
  listPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  listPriceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.5,
  },
  listInfoContainer: {
    marginBottom: 8,
  },
  listWeightText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "BarlowLight",
    marginBottom: 4,
  },
  listDeliveryText: {
    fontSize: 11,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    lineHeight: 14,
    marginBottom: 2,
  },
  listAddToCartButton: {
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listSponsoredContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#007AFF",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 2,
    zIndex: 1,
    alignItems: "center",
  },
  listDiscountContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    textTransform: "uppercase",
    color: "white",
  },
});
