import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EmptyCartComponentProps {
  onStartShopping?: () => void;
}

const EmptyCartComponent: React.FC<EmptyCartComponentProps> = ({
  onStartShopping,
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");

  const handleStartShopping = () => {
    if (onStartShopping) {
      onStartShopping();
    } else {
      router.push("/main/mobile/(tabs)/home/MainProductScreen");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.contentContainer]}>
        {/* Empty Cart Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cart-outline" size={80} color={iconColor} />
        </View>

        {/* Empty Cart Title */}
        <StyledText
          variant="headlineMedium"
          style={[styles.title, { color: textColor }]}
        >
          Your cart is empty
        </StyledText>

        {/* Empty Cart Description */}
        <StyledText
          variant="bodyMedium"
          style={[styles.description, { color: iconColor }]}
        >
          Looks like you haven't added any items to your cart yet. Start
          shopping to discover amazing products!
        </StyledText>

        {/* Start Shopping Button */}
        <TouchableOpacity
          style={[styles.startShoppingButton, { backgroundColor: buttonColor }]}
          onPress={handleStartShopping}
          activeOpacity={0.8}
        >
          <Ionicons
            name="bag-outline"
            size={20}
            color={buttonTextColor}
            style={styles.buttonIcon}
          />
          <StyledText
            variant="labelLarge"
            style={[styles.buttonText, { color: buttonTextColor }]}
          >
            Start Shopping
          </StyledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmptyCartComponent;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    padding: 30,
    borderRadius: 16,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  startShoppingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    minWidth: 200,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: "600",
  },
});
