import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import React from "react";
import WishlistInterface from "@/app/interfaces/main/profile/Wishlists";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";

const WishlistComponent = ({
  wishlist,
  onPress,
}: {
  wishlist?: WishlistInterface;
  onPress: () => void;
}) => {
  if (!wishlist) {
    return (
      <View style={styles.emptyContainer}>
        <StyledText variant="labelSmall" children="Your wishlist is empty" />
        <TouchableOpacity style={styles.navigateToHomeButton} onPress={onPress}>
          <StyledText variant="labelSmall" children="Add items to wishlist" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={
          typeof wishlist.image === "string"
            ? { uri: wishlist.image }
            : wishlist.image
        }
        style={styles.wishlistImage}
        contentFit="cover"
      />
      <View style={styles.wishlistDetails}>
        <StyledText variant="labelSmall" children={wishlist.name} style={styles.wishlistName} />
        <StyledText variant="labelSmall" children={wishlist.category} style={styles.wishlistCategory} />
      </View>
    </TouchableOpacity>
  );
};

export default WishlistComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },

  wishlistImage: {
    maxWidth: 300,
    maxHeight: 250,
    borderRadius: 1,
    padding: 10,
  },

  wishlistDetails: {
    padding: 10,
    alignItems: "center",
  },

  wishlistName: {
    fontSize: 16,
    fontFamily: "BarlowRegular",
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.5,
    padding: 1,
    marginVertical: 3,
  },

  wishlistCategory: {
    fontSize: 14,
    fontFamily: "BarlowRegular",
    fontWeight: "500",
  },

  wishlistQuantity: {
    fontSize: 14,
    fontFamily: "BarlowRegular",
    fontWeight: "500",
  },

  imageContainer: {
    padding: 5,
    maxWidth: 300,
  },
  emptyContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ddd",
    borderRadius: 5,
    margin: 10,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "BarlowRegular",
  },

  navigateToHomeButton: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    marginHorizontal: 5,
    borderColor: "gray",
    borderWidth: 1,
    minWidth: 250,
    backgroundColor: "rgba(215, 222, 225, 0.5)",
  },

  navigateToHomeButtonText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "600",
    fontFamily: "BarlowRegular",
    textAlign: "center",
  },
});
