import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
  TextStyle,
  Platform,
} from "react-native";
import React from "react";
import StyledText from "../forms/StyledText";
interface IconButtonsProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  title: string;
  helper?: string;
  variant?: "side-component" | "other";
}

const IconButtons = ({
  icon,
  onPress,
  style,
  title,
  helper,
  variant,
}: IconButtonsProps) => {
  const getVariantStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 5,
    };
    switch (variant) {
      case "side-component":
        return {
          ...baseStyles,
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 10,
        };
      case "other":
        return {
          ...baseStyles,
          flexDirection: "row",
          justifyContent: "space-between",
        };
      default:
        return baseStyles;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[getVariantStyles(), style]}>
      {icon}
      <StyledText variant={Platform.OS === 'web' ? 'labelLarge' : 'labelMedium'} children={title} />
      <View>
        <StyledText variant={Platform.OS === 'web' ? 'bodyMedium' : 'bodySmall'} children={helper} />
      </View>
    </TouchableOpacity>
  );
};

export default IconButtons;
