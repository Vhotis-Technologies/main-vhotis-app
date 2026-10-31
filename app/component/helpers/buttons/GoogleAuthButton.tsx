import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

/**
 * Official Google Sign-In button on iOS/Android (library asset).
 * On web the native module is unavailable — show a short hint instead.
 */
export default function GoogleAuthButton({
  onPress,
  disabled,
  loading,
  style,
}: Props) {
  const textColor = useThemeColor({}, "text");
  if (Platform.OS === "web") {
    return (
      <StyledText
        variant="bodySmall"
        style={[styles.webHint, { color: textColor }]}
      >
        Google sign-in is available in the iOS or Android app.
      </StyledText>
    );
  }

  const busy = Boolean(disabled || loading);

  return (
    <View style={[styles.wrap, style]}>
      {busy ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#5F6368" />
        </View>
      ) : null}
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={onPress}
        disabled={busy}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    minHeight: 48,
    justifyContent: "center",
  },
  button: {
    width: "100%",
    height: 48,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  webHint: {
    textAlign: "center",
    opacity: 0.75,
    marginBottom: 8,
  },
});
