import React, { useMemo } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import StyledText from "../forms/StyledText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);

export type AlertModalType = "success" | "error" | "warning";

export interface AlertModalProps {
  isVisible: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertModalType;
}

type TypeConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  softBg: string;
  softBgDark: string;
};

function getTypeConfig(
  type: AlertModalType,
  successColor: string,
  errorColor: string,
  warningColor: string
): TypeConfig {
  switch (type) {
    case "success":
      return {
        icon: "checkmark-circle",
        accent: successColor,
        softBg: `${successColor}18`,
        softBgDark: `${successColor}28`,
      };
    case "warning":
      return {
        icon: "warning",
        accent: warningColor,
        softBg: `${warningColor}22`,
        softBgDark: `${warningColor}30`,
      };
    case "error":
    default:
      return {
        icon: "alert-circle",
        accent: errorColor,
        softBg: `${errorColor}14`,
        softBgDark: `${errorColor}24`,
      };
  }
}

const AlertModal = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  type = "error",
}: AlertModalProps) => {
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === "dark";

  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const warningColor = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");
  const successColor = useThemeColor({}, "success");

  const typeConfig = useMemo(
    () => getTypeConfig(type, successColor, errorColor, warningColor),
    [type, successColor, errorColor, warningColor]
  );

  const showCancel = Boolean(onClose);
  const showConfirm = Boolean(onConfirm);
  const isDualAction = showCancel && showConfirm;
  const iconBg = isDark ? typeConfig.softBgDark : typeConfig.softBg;

  const handleBackdropPress = () => {
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
    if (showCancel) {
      onClose?.();
    }
  };

  const confirmBg =
    type === "error" && isDualAction ? typeConfig.accent : buttonColor;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={isDark ? 55 : 40}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.scrim,
            { backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.35)" },
          ]}
        />

        <Pressable
          style={styles.backdropPress}
          onPress={showCancel ? handleBackdropPress : undefined}
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor: `${borderColor}99`,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: isDark ? 0.45 : 0.18,
                  shadowRadius: 24,
                },
                android: { elevation: 12 },
              }),
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.iconRing, { backgroundColor: iconBg }]}>
            <View
              style={[styles.iconInner, { borderColor: `${typeConfig.accent}40` }]}
            >
              <Ionicons
                name={typeConfig.icon}
                size={36}
                color={typeConfig.accent}
              />
            </View>
          </View>

          <StyledText
            variant="titleMedium"
            style={[styles.title, { color: textColor }]}
          >
            {title}
          </StyledText>

          <StyledText
            variant="bodyMedium"
            style={[styles.message, { color: textColor, opacity: 0.78 }]}
          >
            {message}
          </StyledText>

          <View
            style={[
              styles.actions,
              isDualAction ? styles.actionsRow : styles.actionsStack,
            ]}
          >
            {isDualAction && (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonHalf,
                  styles.buttonOutline,
                  {
                    borderColor,
                    backgroundColor: pressed
                      ? isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)"
                      : "transparent",
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.buttonText, { color: textColor }]}
                >
                  Cancel
                </StyledText>
              </Pressable>
            )}

            {showConfirm && (
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.button,
                  isDualAction ? styles.buttonHalf : styles.buttonFull,
                  styles.buttonFilled,
                  {
                    backgroundColor: confirmBg,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={isDualAction ? "Confirm" : "OK"}
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.buttonText, styles.buttonTextFilled]}
                >
                  {isDualAction ? "Confirm" : "OK"}
                </StyledText>
              </Pressable>
            )}

            {!showConfirm && showCancel && (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonFull,
                  styles.buttonFilled,
                  {
                    backgroundColor: buttonColor,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="OK"
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.buttonText, styles.buttonTextFilled]}
                >
                  OK
                </StyledText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
    zIndex: 1,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actions: {
    width: "100%",
    gap: 10,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionsStack: {
    flexDirection: "column",
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonFull: {
    width: "100%",
  },
  buttonHalf: {
    flex: 1,
  },
  buttonOutline: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonFilled: {},
  buttonText: {
    fontWeight: "600",
  },
  buttonTextFilled: {
    color: "#FFFFFF",
  },
});

export default AlertModal;
