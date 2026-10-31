import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CustomSwitchComponentProps {
  isOn: boolean;
  onToggle: () => void;
  onText?: string;
  offText?: string;
  style?: any;
  textStyle?: any;
  isLoading?: boolean;
}

const CustomSwitchComponent = ({
  isOn,
  onToggle,
  onText = "ON",
  offText = "OFF",
  style,
  textStyle,
  isLoading,
}: CustomSwitchComponentProps) => {
  const borderColor = useThemeColor({}, "borders");
  const backgroundColor = useThemeColor({}, "background");

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        },
        style,
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <StyledText
        variant="labelLarge"
        style={textStyle}
        children={isLoading ? "Wait..." : isOn ? onText : offText}
      />
    </TouchableOpacity>
  );
};

export default CustomSwitchComponent;

const styles = StyleSheet.create({
  toggleButton: {
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 100,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
