import React, { useState } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import DescriptionInterface from "@/app/interfaces/main/orders/DescriptionInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { shadow } from "react-native-paper";

interface ProductSideDetailsProps {
  description: DescriptionInterface;
  onAddToCart: (id: string, quantity: number) => void;
  onBuyNow: (id: string, quantity: number) => void;
  isMobile?: boolean;
}

const ProductSideDetails = ({
  description,
  onAddToCart,
  onBuyNow,
  isMobile = false,
}: ProductSideDetailsProps) => {
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");
  const borderColor = useThemeColor({}, 'borders');
  const iconColor = useThemeColor({}, 'icons');

  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => {
    if (description.max_quantity && quantity >= description.max_quantity)
      return;
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <View
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
        { backgroundColor: cardColor },
      ]}
    >
      {/* Price Section */}
      <View style={styles.priceSection}>
        {description.discounted_price && (
          <StyledText variant="headlineMedium" style={styles.price}>
            ${description.discounted_price}
          </StyledText>
        )}
        <StyledText
          variant="titleLarge"
          style={[
            styles.originalPrice,
            description.discounted_price ? styles.strikethrough : null,
          ]}
        >
          ${description.price}
        </StyledText>
      </View>

      {/* Delivery Info */}
      <View style={[styles.deliverySection, { backgroundColor: cardColor, borderColor}]}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={20} color="#565959" />
          <StyledText variant="bodyMedium" style={styles.locationText}>
            Deliver to {description.delivery_location || "Select location"}
          </StyledText>
        </View>

        <StyledText variant="bodyLarge" style={styles.stockStatus}>
          {description.stock_status || "In Stock"}
        </StyledText>
      </View>

      {/* Quantity Selector */}
      <View style={styles.quantitySection}>
        <StyledText variant="bodyMedium">Quantity:</StyledText>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={decrementQuantity}
            style={styles.quantityButton}
          >
            <AntDesign name="minus" size={16} color={iconColor} />
          </TouchableOpacity>
          <StyledText variant="bodyLarge" style={styles.quantityText}>
            {quantity}
          </StyledText>
          <TouchableOpacity
            onPress={incrementQuantity}
            style={styles.quantityButton}
          >
            <AntDesign name="plus" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.addToCartButton,
            { backgroundColor: buttonColor },
          ]}
          onPress={() => onAddToCart(description.id || "", quantity)}
        >
          <MaterialIcons name="add-shopping-cart" size={20} color="#0F1111" />
          <StyledText variant="titleMedium" style={styles.buttonText}>
            Add to Cart
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buyNowButton,
            { backgroundColor: secondaryButtonColor },
          ]}
          onPress={() => onBuyNow(description.id || "", quantity)}
        >
          <StyledText variant="titleMedium" style={styles.buyNowText}>
            Buy Now
          </StyledText>
        </TouchableOpacity>
      </View>

      {/* Shipping & Returns */}
      <View style={styles.infoSection}>
        {(description.shipping_fee || description.import_fees) && (
          <View style={styles.feeRow}>
            <StyledText variant="bodyMedium">
              {`Shipping: $${description.shipping_fee || 0}`}
            </StyledText>
            {description.import_fees && (
              <StyledText variant="bodyMedium">
                {`Import Fees: $${description.import_fees}`}
              </StyledText>
            )}
          </View>
        )}

        {description.seller_info && (
          <View style={styles.sellerInfo}>
            <StyledText variant="bodyMedium" style={styles.infoText}>
              Ships from: {description.seller_info.ships_from}
            </StyledText>
            <StyledText variant="bodyMedium" style={styles.infoText}>
              Sold by: {description.seller_info.sold_by}
            </StyledText>
          </View>
        )}

        {description.return_policy && (
          <StyledText variant="bodyMedium" style={styles.returnPolicy}>
            {description.return_policy}
          </StyledText>
        )}

        {description.secure_transaction && (
          <View style={styles.secureTransaction}>
            <MaterialIcons name="verified-user" size={16} color="#007600" />
            <StyledText variant="bodySmall" style={styles.secureText}>
              Secure transaction
            </StyledText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    ...Platform.select({
      web: {
        width: 300,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      },
      default: {
        width: "100%",
        elevation: 2,
      },
    }),
  },
  mobileContainer: {
    width: "100%",
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: "#e7e7e7",
  },
  priceSection: {
    marginBottom: 16,
  },
  price: {
    color: "#B12704",
  },
  originalPrice: {
    color: "#565959",
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  deliverySection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 3,
    ...Platform.select({
      web: {
        boxShadow: "2px 2px 3px 3px rgba(219, 150, 150, 0.1)",
      },
      default: {
        shadowColor: "rgb(219, 150, 150)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
      },
    }),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    color: "#565959",
  },
  stockStatus: {
    color: "#007600",
    fontWeight: "500",
  },
  quantitySection: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5D9D9",
    borderRadius: 4,
    ...Platform.select({
      web: {
        boxShadow: "2px 2px 3px 3px rgba(157, 153, 153, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
      },
    }),
  },
  quantityButton: {
    padding: 8,
    borderWidth: 0,
  },
  quantityText: {
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#D5D9D9",
  },
  actionButtons: {
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addToCartButton: {
    backgroundColor: "#FFD814",
  },
  buyNowButton: {
    backgroundColor: "#FFA41C",
  },
  buttonText: {
    color: "#0F1111",
  },
  buyNowText: {
    color: "#0F1111",
  },
  infoSection: {
    gap: 12,
  },
  feeRow: {
    gap: 4,
  },
  sellerInfo: {
    gap: 4,
  },
  infoText: {
    color: "#565959",
  },
  returnPolicy: {
    color: "#565959",
  },
  secureTransaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  secureText: {
    color: "#007600",
  },
});

export default ProductSideDetails;
