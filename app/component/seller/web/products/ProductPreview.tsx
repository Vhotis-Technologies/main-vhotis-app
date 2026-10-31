import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons"; // You'll need to install this package
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProductInterface } from "@/app/interfaces/seller/ProductInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";

const ProductPreview = ({ product }: { product: ProductInterface | null }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // If no product data is provided, show a placeholder
  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No product data available</Text>
        </View>
      </View>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const category = product.category || "No Category";
  const subCategories: string[] = [];

  // Extract URIs from the new image structure
  const imageUris = images
    .map((imageData) => {
      return typeof imageData === "string" ? imageData : imageData.uri;
    })
    .filter(Boolean);

  const goToNextImage = () => {
    if (imageUris.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageUris.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const goToPrevImage = () => {
    if (imageUris.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageUris.length - 1 : prevIndex - 1
      );
    }
  };

  const cardColor = useThemeColor({}, "cards");

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      {/* Image container with navigation arrows */}
      <View style={styles.imageContainer}>
        {imageUris.length > 0 ? (
          <Image
            style={styles.productImage}
            contentFit="contain"
            source={
              typeof imageUris[currentImageIndex] === "string"
                ? { uri: imageUris[currentImageIndex] }
                : imageUris[currentImageIndex]
            }
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={64} color="#ccc" />
            <StyledText
              style={styles.noImageText}
              children="No images available"
            />
          </View>
        )}

        {/* Left arrow */}
        {imageUris.length > 1 && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.leftArrow]}
            onPress={goToPrevImage}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Right arrow */}
        {imageUris.length > 1 && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.rightArrow]}
            onPress={goToNextImage}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Image indicator */}
        {imageUris.length > 1 && (
          <View style={styles.imageIndicator}>
            <StyledText
              style={styles.imageIndicatorText}
              children={`${currentImageIndex + 1}/${imageUris.length}`}
            />
          </View>
        )}
      </View>

      {/* Product details container */}
      <View style={styles.detailsContainer}>
        <StyledText style={styles.categoryText} children={category} />
        {subCategories.map((subCat, index) => (
          <StyledText
            key={index}
            style={styles.subCategoryText}
            children={subCat}
          />
        ))}

        <StyledText
          style={styles.descriptionText}
          children={product.description}
        />

        <View style={styles.specsContainer}>
          {product.size && (
            <View style={styles.specRow}>
              <StyledText style={styles.specLabel} children="Size:" />
              <StyledText style={styles.specValue} children={product.size} />
            </View>
          )}
          {product.weight && (
            <View style={styles.specRow}>
              <StyledText style={styles.specLabel} children="Weight:" />
              <StyledText style={styles.specValue} children={product.weight} />
            </View>
          )}
          {product.quantity !== undefined && (
            <View style={styles.specRow}>
              <StyledText style={styles.specLabel} children="Quantity:" />
              <StyledText
                style={styles.specValue}
                children={product.quantity}
              />
            </View>
          )}
        </View>

        {/* Display video if available */}
        {product.videos && (
          <View style={styles.videoContainer}>
            <StyledText style={styles.videoLabel} children="Product Video:" />
            <View style={styles.imageContainer}>
              <Image
                style={styles.productImage}
                contentFit="contain"
                source={
                  typeof product.videos === "string"
                    ? { uri: product.videos }
                    : product.videos
                }
              />
            </View>
          </View>
        )}

        <Text style={styles.priceText}>${product.price}</Text>
      </View>
    </View>
  );
};

export default ProductPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  noImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -20 }],
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageIndicatorText: {
    color: "white",
    fontSize: 14,
  },
  detailsContainer: {
    padding: 16,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  subCategoryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 16,
    marginVertical: 12,
    color: "#444",
    lineHeight: 22,
  },
  specsContainer: {
    marginVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  specLabel: {
    fontSize: 14,
    color: "#666",
  },
  specValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  videoContainer: {
    marginVertical: 12,
  },
  videoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2a52be",
    marginTop: 8,
  },
});
