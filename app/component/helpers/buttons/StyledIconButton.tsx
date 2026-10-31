import {
  StyleSheet,
  Text,
  View,
  ViewProps,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";
import React, { ReactNode } from "react";
import StyledText from "../forms/StyledText";

/**
 * Props interface for the StyledIconButton component
 */
interface StyledIconButtonProps extends Omit<ViewProps, "onBlur" | "onFocus"> {
  /** Icon element to display in the button */
  icon: ReactNode;
  /** Function to call when button is pressed */
  onPress: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Visual style variant of the button */
  variant?: "icon" | "buttons";
  /** Background color of the button */
  color?: string;
  /** Text to display next to the icon */
  title?: string;
  /** Additional styles to apply to the button container */
  styles?: StyleProp<ViewStyle>;
  /** Additional styles to apply to the button text */
  textStyles?: StyleProp<TextStyle>;
}

/**
 * StyledIconButton component that combines an icon with optional text in a button.
 * Supports different visual styles and customization options.
 *
 * Features:
 * - Icon + text combination
 * - Multiple style variants
 * - Customizable colors and styles
 * - Optional disabled state
 *
 * @param {StyledIconButtonProps} props - The component props
 * @returns {JSX.Element} The rendered icon button component
 */
const StyledIconButton = ({
  icon,
  onPress,
  disabled,
  variant,
  color,
  styles,
  title,
  textStyles,
  ...props
}: StyledIconButtonProps) => {
  /**
   * Gets the button styles based on the selected variant
   * @returns {StyleProp<ViewStyle>} The computed button styles
   */
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: ViewStyle = {
      padding: 5,
      borderRadius: 5,
      alignItems: "center",
      minWidth: 50,
      marginHorizontal: 5,
    };
    switch (variant) {
      case "icon":
        return {
          ...baseStyles,
          flexDirection: "row",
          gap: 10,
          backgroundColor: color,
        };
      case "buttons":
        return {
          ...baseStyles,
          justifyContent: "space-between",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: "#e0e0e0",
          backgroundColor: "#ffffff",
        };
      default:
        return baseStyles;
    }
  };

  /**
   * Gets the text styles based on the selected variant
   * @returns {StyleProp<TextStyle>} The computed text styles
   */
  const getTextStyles = (): StyleProp<TextStyle> => {
    const baseStyles: TextStyle = {
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "BarlowRegular",
      letterSpacing: 0.3,
    };
    switch (variant) {
      case "icon":
        return {
          ...baseStyles,
          fontSize: 13,
          fontFamily: "RobotoRegular",
          letterSpacing: 0.2,
          marginHorizontal: 10,
        };
      case "buttons":
        return {
          ...baseStyles,
          fontSize: 13,
          fontFamily: "RobotoRegular",
          letterSpacing: 0.2,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      {...props}
      style={[getButtonStyles(), styles]}
    >
      {icon}
      {title && (
        <StyledText style={[getTextStyles(), textStyles]}>{title}</StyledText>
      )}
    </TouchableOpacity>
  );
};

export default StyledIconButton;
