import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EmptyAnalyticsContainerProps {
  title: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

const EmptyAnalyticsContainer: React.FC<EmptyAnalyticsContainerProps> = ({
  title,
  message = "This data is currently unavailable at the moment. Please check back again in a few days after making a few sales.",
  icon = "analytics",
}) => {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={48} color={iconColor} />
      <StyledText
        variant="titleMedium"
        style={[styles.title, { color: textColor }]}
      >
        {title}
      </StyledText>
      <StyledText
        variant="bodyMedium"
        style={[styles.message, { color: textColor }]}
      >
        {message}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 200,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default EmptyAnalyticsContainer;
