import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StyledText from "./forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconSize?: number;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle = "No data available yet",
  iconName = "chart-line",
  iconSize = 48,
  style,
}) => {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");

  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={styles.icon}
      />
      <StyledText
        variant="labelLarge"
        style={[styles.title, { color: textColor }]}
      >
        {title}
      </StyledText>
      <StyledText
        variant="bodyMedium"
        style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}
      >
        {subtitle}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 20,
  },
});

export default EmptyState;
