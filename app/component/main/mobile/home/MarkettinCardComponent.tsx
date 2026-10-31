import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import StyledText from "@/app/component/helpers/forms/StyledText";
import Svg, { Polygon } from "react-native-svg";

interface MarkettinCardComponentProps {
  title: string;
  description: string;
  image: string;
  onPress: () => void;
}

const MarkettinCardComponent = ({
  title,
  description,
  image,
  onPress,
}: MarkettinCardComponentProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      {/* Red curtain gradient background */}
      <LinearGradient
        colors={["#8B0000", "#A52A2A", "#8B0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Main image overlay */}
        {image && (
          <View style={styles.imageContainer}>
            <Image
              source={typeof image === "string" ? { uri: image } : image}
              style={styles.backgroundImage}
              contentFit="cover"
            />
          </View>
        )}

        {/* Text content - positioned in upper left */}
        <View style={styles.textContainer}>
          <StyledText
            variant="headlineMedium"
            style={styles.title}
            color="#FFFFFF"
          >
            {title}
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={styles.description}
            color="#FFFFFF"
          >
            {description}
          </StyledText>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default MarkettinCardComponent;

const styles = StyleSheet.create({
  container: {
    minWidth: 240,
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  background: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  curtainOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  curtainFold: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  platformsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    bottom: 0,
  },
  pinkPlatform: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: "40%",
    height: 60,
    backgroundColor: "#FFB6C1",
    borderRadius: 12,
    opacity: 0.6,
    transform: [{ rotate: "-2deg" }],
  },
  greenPlatform: {
    position: "absolute",
    bottom: 30,
    right: 0,
    width: "45%",
    height: 70,
    backgroundColor: "#2F4F2F",
    borderRadius: 12,
    opacity: 0.7,
    transform: [{ rotate: "2deg" }],
  },
  textContainer: {
    position: "absolute",
    top: 24,
    left: 20,
    zIndex: 10,
    maxWidth: "60%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  decorativeElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  ornament: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: "#228B22",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ornament1: {
    width: 24,
    height: 24,
    top: 80,
    right: 60,
    backgroundColor: "#FFD700",
  },
  ornament2: {
    width: 20,
    height: 20,
    top: 110,
    right: 90,
    backgroundColor: "#32CD32",
  },
  ornament3: {
    width: 18,
    height: 18,
    bottom: 100,
    left: 50,
    backgroundColor: "#FF6347",
  },
  tree1: {
    position: "absolute",
    bottom: 50,
    left: 30,
  },
  tree2: {
    position: "absolute",
    bottom: 60,
    right: 40,
  },
});
