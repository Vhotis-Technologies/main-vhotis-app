import React from "react";
import { StyleSheet, View } from "react-native";
import PasswordSettingComponent from "@/app/component/helpers/settings/PasswordSettingComponent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

/**
 * Seller settings: change login password (API wiring lives in PasswordSettingComponent).
 */
const AccountPasswordFlowView = () => {
  const mutedColor = useThemeColor({}, "icons");

  return (
    <View style={styles.wrap}>
      <StyledText variant="titleSmall" style={{ color: mutedColor }}>
        Account password
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={[styles.hint, { color: mutedColor }]}
      >
        Used to sign in on your devices.
      </StyledText>
      <PasswordSettingComponent />
    </View>
  );
};

export default AccountPasswordFlowView;

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingTop: 4,
  },
  hint: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
