import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import StyledText from "../../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

// Map of setting titles to their corresponding icons
const SETTING_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  "My Details": "person",
  Profile: "person-circle",
  Notifications: "notifications",
  General: "settings",
  "Privacy & Security": "shield-checkmark",
  Billing: "card",
  "Payment Methods": "wallet",
  Help: "help-circle",
  Store: "storefront",
};

interface SettingCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const SettingCardComponent: React.FC<SettingCardProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  // Get the icon name from the mapping, default to 'settings' if not found
  const iconName = SETTING_ICONS[title] || "settings";
  const iconColor = useThemeColor({}, "icons");

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <StyledText children={title} variant="labelLarge" />
      {subtitle && <StyledText children={subtitle} variant="labelMedium" />}
    </TouchableOpacity>
  );
};

export default SettingCardComponent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    width: "47%",
    aspectRatio: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
