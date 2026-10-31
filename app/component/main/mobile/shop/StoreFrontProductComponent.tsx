import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { router } from "expo-router";
import { StoreFrontProduct as StoreFrontProductType } from "@/app/interfaces/main/StoreFrontInterface";
import { ProductPriceBlock } from "@/app/component/main/shared/ProductPriceBlock";
import { formatDealBadge } from "@/app/_utils/main/helpers";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { RootState, useAppSelector } from "@/app/store/store";
import { useThemeColor } from "@/hooks/useThemeColor";
import AddToBasketButton from "@/app/component/helpers/buttons/AddToBasketButton";

const CARD_WIDTH = 168;

interface StoreFrontProductComponentProps {
  product: StoreFrontProductType;
  onAddToCart: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
  width?: number;
}

function getDealBadge(product: StoreFrontProductType): string | null {
  if (product.deal?.deal_type) {
    return formatDealBadge(product.deal.deal_type, {
      discount_percentage: product.deal.discount_percentage,
      discount_amount: product.deal.discount_amount,
      bogo_buy_quantity: product.deal.bogo_buy_quantity,
      bogo_get_quantity: product.deal.bogo_get_quantity,
      bundle_price: product.deal.bundle_price,
      discount_value: product.discount_value,
    });
  }

  const discountPercent = product.discount_value;
  if (
    discountPercent !== undefined &&
    discountPercent !== null &&
    discountPercent > 0
  ) {
    return `${Math.round(discountPercent)}% off`;
  }

  return null;
}

const StoreFrontProductComponent = ({
  product,
  onAddToCart,
  onViewDetails,
  isLoading = false,
  width = CARD_WIDTH,
}: StoreFrontProductComponentProps) => {
  const userCountry = useAppSelector((state: RootState) => {
    const user = state.auth.user;
    return user && "address" in user ? user.address?.country : undefined;
  });

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const shadowColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");
  const iconMuted = useThemeColor({}, "icons");

  const dealBadge = getDealBadge(product);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(product.id);
      return;
    }
    router.push({
      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
      params: { id: product.id },
    });
  }, [onViewDetails, product.id]);

  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        {
          backgroundColor,
          shadowColor,
          borderColor,
          width,
          maxWidth: width,
        },
      ]}
      onPress={handleViewDetails}
      activeOpacity={0.92}
    >
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { borderColor }]}>
            <Ionicons name="image-outline" size={36} color={iconMuted} />
          </View>
        )}

        {dealBadge ? (
          <View style={styles.dealBadgeContainer}>
            <StyledText variant="bodySmall" style={styles.dealBadgeText}>
              {dealBadge}
            </StyledText>
          </View>
        ) : null}
      </View>

      <View style={styles.detailsContainer}>
        <AddToBasketButton
          onPress={() => onAddToCart(product.id)}
          disabled={isLoading}
          loading={isLoading}
          variant="small"
        />

        <View style={styles.titleContainer}>
          <StyledText
            variant="labelMedium"
            style={[styles.titleText, { color: textColor }]}
            numberOfLines={2}
          >
            {product.name}
          </StyledText>
        </View>

        <View style={styles.priceContainer}>
          <ProductPriceBlock
            item={product}
            country={userCountry}
            priceStyle={[styles.priceText, { color: textColor }]}
            strikethroughStyle={{ color: iconMuted }}
            subtextStyle={styles.bogoSubtext}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(StoreFrontProductComponent);

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    marginHorizontal: 4,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  detailsContainer: {
    padding: 10,
    minHeight: 118,
    justifyContent: "flex-start",
  },
  titleContainer: {
    marginTop: 6,
    marginBottom: 8,
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    lineHeight: 18,
  },
  priceContainer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowMedium",
  },
  priceColumn: {
    flexDirection: "column",
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "BarlowLight",
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
});
