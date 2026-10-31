import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface FeatureItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  iconSize?: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  iconName,
  title,
  iconSize = 28,
}) => {
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  return (
    <View
      style={[styles.featureItem, { backgroundColor: cardColor, borderColor }]}
    >
      <View
        style={[styles.featureIcon, { backgroundColor: buttonColor + "20" }]}
      >
        <Ionicons name={iconName} size={iconSize} color={buttonColor} />
      </View>
      <StyledText
        style={[styles.featureText, { color: textColor }]}
        variant="labelMedium"
      >
        {title}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  featureItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureText: {
    textAlign: "center",
    fontWeight: "500",
  },
});

export default FeatureItem;
