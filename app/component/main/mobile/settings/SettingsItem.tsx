import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { ReactNode } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface SettingsItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: ReactNode;
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
}: SettingsItemProps) => {
  /* Check if the text is a logout text and make it red */
  const isLogoutText = title.includes("Logout") || title.includes("Sign Out");

  const iconColor = useThemeColor({}, "text");
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <MaterialIcons name={icon} size={24} style={[styles.icon]} color={isLogoutText ? "red" : iconColor} />
        <View style={styles.textContainer}>
          <StyledText variant="labelLarge" children={title} style={isLogoutText ? styles.logoutText : undefined} />
          {subtitle && <StyledText variant="labelSmall" children={subtitle} style={styles.subtitle} />}
        </View>
      </View>
      <View style={styles.rightContent}>
        {rightElement || (
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SettingsItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "BarlowRegular",
    color: "#333",
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "BarlowLight",
    color: "#666",
    marginTop: 2,
  },
  rightContent: {
    marginLeft: 8,
  },
  logoutText: {
    color: "red",
  },
});
