import {
  StyleProp,
  TextStyle,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import StyledText from "../forms/StyledText";
import { ActivityIndicator } from "react-native-paper";
import { useThemeColor } from "@/hooks/useThemeColor";

interface AddToBasketButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "small" | "medium" | "large" | "tonal";
  buttonStyles?: StyleProp<ViewStyle>;
  title?: string;
  textStyles?: StyleProp<TextStyle>;
}
const AddToBasketButton = ({
  onPress,
  disabled,
  loading,
  variant = "small",
  title = "Add to Basket",
  buttonStyles,
  textStyles,
  ...props
}: AddToBasketButtonProps) => {
  const buttonColor = useThemeColor({}, "button");
  const iconColor = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        buttonStyles,
        { backgroundColor: buttonColor, borderColor },
      ]}
    >
      <StyledText>{title}</StyledText>
      {loading && <ActivityIndicator size="small" color={iconColor} />}
    </TouchableOpacity>
  );
};

export default AddToBasketButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 35,
    gap:10,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
