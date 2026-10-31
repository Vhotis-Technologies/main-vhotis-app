import {
  StyleSheet,
  Text,
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  TextStyle,
  Platform,
} from "react-native";
import React from "react";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

/**
 * A customizable button component that supports different visual variants,
 * sizes, and loading states.
 */

/**
 * Props interface for the StyledButton component
 */
interface StyledButtonProps extends Omit<TouchableOpacityProps, "onPress"> {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "small" | "medium" | "large" | "tonal" | "basket";
  buttonStyles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
}

/**
 * A reusable button component with customizable styles and states.
 * Supports different visual variants, sizes, loading states, and custom styling.
 *
 * @param {StyledButtonProps} props - The component props
 * @returns {JSX.Element} The rendered button component
 */
const StyledButton = ({
  title,
  onPress,
  disabled,
  loading,
  variant = "small",
  buttonStyles,
  textStyles,
  ...props
}: StyledButtonProps) => {
  // Get theme colors
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");

  /**
   * Gets padding based on size variant
   * @returns {number} The padding value
   */
  const getPaddingForSize = (): number => {
    switch (variant) {
      case "small":
        return 5;
      case "medium":
        return 8;
      case "large":
        return 10;
      case "tonal":
        return 8;
      case "basket":
        return 10;
      default:
        return 14;
    }
  };

  /**
   * Gets font size based on size variant
   * @returns {number} The font size value
   */
  const getFontSizeForSize = (): number => {
    switch (variant) {
      case "small":
        return 13;
      case "medium":
        return 15;
      case "large":
        return 17;
      case "tonal":
        return 14;
      case "basket":
        return 16;
      default:
        return 15;
    }
  };

  /**
   * Gets the base button styles based on the selected variant and size
   * @returns {StyleProp<ViewStyle>} The computed button styles
   */
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: ViewStyle = {
      paddingVertical: getPaddingForSize(),
      paddingHorizontal: getPaddingForSize() + 8,
      borderRadius: variant === "basket" ? 50 : 25,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled ? 0.5 : 1,
      backgroundColor: variant === "tonal" ? "transparent" : buttonColor,
      borderWidth: variant === "tonal" ? 2 : 0,
      borderColor: borderColor,
    };

    return baseStyles;
  };

  /**
   * Gets the text styles based on the selected variant and size
   * @returns {StyleProp<TextStyle>} The computed text styles
   */
  const getButtonTextStyles = (): StyleProp<TextStyle> => {
    const fontSize = getFontSizeForSize();
    const baseStyles: TextStyle = {
      fontSize,
      fontWeight: "600",
      fontFamily: "RobotoMedium",
      letterSpacing: 0.3,
      textAlign: "center",
    };
    return baseStyles;
  };

  /**
   * Gets the activity indicator color based on variant
   * @returns {string} The color for the loading indicator
   */
  const getIndicatorColor = (): string => {
    return buttonTextColor;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), buttonStyles, { borderColor }]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIndicatorColor()} />
      ) : (
        <Text style={[getButtonTextStyles(), textStyles, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default StyledButton;
