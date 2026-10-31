import {
  ViewProps,
  TouchableOpacity,
  TextStyle,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";
import React, { ReactNode } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";

interface CategoryAndSubProps extends ViewProps {
  title: string;
  icon?: ReactNode;
  variant: "category" | "subcategory";
  onPress: (category: string) => void;
  isSelected?: boolean;
}

const CategoryAndSub = ({
  title,
  icon,
  variant,
  onPress,
  isSelected = false,
}: CategoryAndSubProps) => {
  const getTextStylles = (): StyleProp<TextStyle> => {
    const baseStyles: TextStyle = {
      fontSize: 16,
      fontWeight: "500",
      fontFamily: "BarlowMedium",
      marginHorizontal: 10,
    };
    switch (variant) {
      case "category":
        return {
          ...baseStyles,
          color: "black",
        };
      case "subcategory":
        return {
          ...baseStyles,
          color: "gray",
        };
    }
  };

  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    };
    switch (variant) {
      case "category":
        return {
          ...baseStyles,
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderRadius: 5,
        };
      case "subcategory":
        return {
          ...baseStyles,
          padding: 5,
          marginVertical: 5,
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          boxShadow: "1px 1px 1px 1px rgba(235, 223, 223, 0.25)",
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(title)}
      style={[getButtonStyles(), isSelected && styles.selectedCategory]}
    >
      <StyledText style={getTextStylles()}>{title}</StyledText>
      {variant === "category" && icon}
    </TouchableOpacity>
  );
};

export default CategoryAndSub;

const styles = StyleSheet.create({
  selectedCategory: {
    borderColor: "green",
    borderWidth: 3,
  },
});
