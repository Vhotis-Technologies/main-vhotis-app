import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";
import StyledText from "@/app/component/helpers/forms/StyledText";

const Categories = ({
  categories,
  onPress,
}: {
  categories: TrendingCategoryInterface;
  onPress: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    onPress(categories.id ?? "");
  };

  // Fallback image when category image is null or fails to load
  const fallbackImage = require("@/assets/images/user_image.jpg");

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            imageError || !categories.image
              ? fallbackImage
              : typeof categories.image === "string"
              ? { uri: categories.image }
              : categories.image
          }
          style={styles.image}
          contentFit="cover"
          onError={() => {
            setImageError(true);
          }}
          onLoad={() => {
            setImageError(false);
          }}
        />
      </View>
      <View style={styles.textOverlay}>
        <StyledText style={styles.text}>{categories.title}</StyledText>
      </View>
    </TouchableOpacity>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // Ensures square shape for image
    position: "relative",
    borderRadius: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textOverlay: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMonoBold",
    textTransform: "capitalize",
    textAlign: "center",
  },
});
