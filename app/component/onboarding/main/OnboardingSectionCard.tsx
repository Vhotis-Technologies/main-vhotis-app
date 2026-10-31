import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface OnboardingSectionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const OnboardingSectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: OnboardingSectionCardProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconWrap, { backgroundColor: `${buttonColor}15` }]}
        >
          <MaterialIcons name={icon} size={18} color={buttonColor} />
        </View>
        <View style={styles.headerText}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {title}
          </StyledText>
          {subtitle ? (
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, marginTop: 2 }}
            >
              {subtitle}
            </StyledText>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

export default OnboardingSectionCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
});
