import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import React from "react";
import { limitDescription, formatDealBadge, formatWeight } from "@/app/_utils/main/helpers";
import { ProductPriceBlock } from "@/app/component/main/shared/ProductPriceBlock";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { TodaysDealsInterface } from "@/app/interfaces/main/deals/deals";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

const TodaysDealsComponent = ({
  image,
  description,
  percentage,
  onPress,
  id,
  deal_type,
  name,
  price,
  discounted_price,
  weight,
  rating,
  deliveryFee,
  deliveryTime,
  distance,
  isSponsored,
  discount_value,
  discount_percentage,
  discount_amount,
  bogo_buy_quantity,
  bogo_get_quantity,
  bundle_price,
  bundle_quantity,
  onAddToCart,
  onViewDetails,
  isLoading = false,
}: TodaysDealsInterface) => {
  const limitedDescription = limitDescription(description ?? "");
  const isMobile = Platform.OS !== "web";

  const backgroundColor = useThemeColor({}, "background");
  const buttonColor = useThemeColor({}, "button");
  const shadowColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Format deal badge based on deal type
  const dealBadge = formatDealBadge(deal_type, {
    discount_percentage: discount_percentage ?? discount_value,
    discount_amount,
    bogo_buy_quantity,
    bogo_get_quantity,
    bundle_price,
    bundle_quantity,
    discount_value,
  });

  // Check if this is a percentage or fixed deal (should show both prices)
  const dealItem = {
    price,
    discounted_price,
    deal_type,
    discount_value,
    discount_percentage,
    discount_amount,
    bogo_buy_quantity,
    bogo_get_quantity,
    bundle_price,
    bundle_quantity,
  };

  // Display rating
  const displayRating =
    typeof rating === "number" && !Number.isNaN(rating) ? rating : 0;

  const handlePress = () => {
    if (onViewDetails) {
      onViewDetails(id ?? "");
    } else if (onPress) {
      onPress(id ?? "");
    }
  };

  const handleAddToCart = (e: any) => {
    e?.stopPropagation();
    if (onAddToCart && id) {
      onAddToCart(id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        { backgroundColor, shadowColor, borderColor },
        isMobile && styles.mobileMainContainer,
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={
              typeof image === "string"
                ? { uri: image }
                : image
            }
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}

        {/* Deal badge */}
        {dealBadge && (
          <View style={styles.dealBadgeContainer}>
            <StyledText variant="bodySmall" style={styles.dealBadgeText}>
              {dealBadge}
            </StyledText>
          </View>
        )}

        {/* Sponsored badge */}
        {isSponsored && (
          <View style={styles.sponsoredContainer}>
            <StyledText variant="bodySmall" style={styles.sponsoredText}>
              Sponsored
            </StyledText>
          </View>
        )}

        {/* Rating badge */}
        {displayRating > 0 && (
          <View style={styles.ratingContainer}>
            <StyledText variant="bodySmall" style={styles.ratingText}>
              ⭐ {displayRating.toFixed(1)}
            </StyledText>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        {/* Add to Cart button */}
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: buttonColor }]}
            onPress={handleAddToCart}
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
        )}

        {/* Product name and description */}
        <View style={styles.titleContainer}>
          {name && (
            <StyledText variant="labelMedium" style={styles.titleText}>
              {name}
            </StyledText>
          )}
          {description && (
            <StyledText variant="bodySmall" style={styles.descriptionText}>
              {limitedDescription}
            </StyledText>
          )}
        </View>

        {/* Weight and distance info */}
        <View style={styles.infoContainer}>
          {weight !== undefined && weight !== null && (
            <StyledText variant="bodySmall" style={styles.infoText}>
              Weight: {formatWeight(weight)}
            </StyledText>
          )}
          {distance !== undefined && (
            <StyledText variant="bodySmall" style={styles.distanceText}>
              {distance}km away
            </StyledText>
          )}
        </View>

        {/* Price container */}
        <View style={styles.priceContainer}>
          <ProductPriceBlock
            item={dealItem}
            priceStyle={styles.priceText}
            strikethroughStyle={styles.originalPrice}
            subtextStyle={styles.bogoSubtext}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TodaysDealsComponent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  mobileMainContainer: {
    marginBottom: 8,
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
  dealBadgeContainer: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "white",
    textTransform: "uppercase",
  },
  sponsoredContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  sponsoredText: {
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
  infoContainer: {
    marginBottom: 4,
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
  },
  priceRow: {
    flexDirection: "column",
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
  discountedPrice: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowMedium",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowMedium",
  },
  bogoSubtext: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    color: "#0E7490",
    marginTop: 2,
  },
});
