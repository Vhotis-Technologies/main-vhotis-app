import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";

type FormSectionProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  surfaceColor: string;
  children: React.ReactNode;
};

const FormSection = ({
  title,
  subtitle,
  icon,
  iconColor = "#6366F1",
  textColor,
  mutedColor,
  borderColor,
  surfaceColor,
  children,
}: FormSectionProps) => (
  <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
    <View style={styles.header}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
          <MaterialIcons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.headerCopy}>
        <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
          {title}
        </StyledText>
        {subtitle ? (
          <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 2 }}>
            {subtitle}
          </StyledText>
        ) : null}
      </View>
    </View>
    {children}
  </View>
);

export default FormSection;

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
  },
});
