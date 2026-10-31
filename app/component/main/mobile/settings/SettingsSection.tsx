import { StyleSheet, Text, View } from "react-native";
import React, { ReactNode } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const cardColor = useThemeColor({}, "cards");

  return (
    <View style={styles.container}>
      <StyledText children={title} style={styles.sectionTitle} />
      <View style={[styles.content]}>
        {children}
      </View>
    </View>
  );
};

export default SettingsSection;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 1,
  },
  content: {
    padding: 5,
  },
});
