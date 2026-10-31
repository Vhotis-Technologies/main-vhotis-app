import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
interface StoreDropDownButtonProps {
  icon?: React.ReactNode;
  title: string;
  onPress: () => void;
  isOpen?: boolean;
  content?: React.ReactNode;
  isNavigation?: boolean; // New prop to distinguish navigation buttons
}

const StoreDropDownButton = ({
  icon,
  title,
  onPress,
  isOpen = false,
  content,
  isNavigation = false, // Default to dropdown
}: StoreDropDownButtonProps) => {
  const textColor = useThemeColor({}, "text");
  return (
    <View style={styles.container}>
      <Pressable style={styles.maincontainer} onPress={onPress}>
        <View style={styles.rowSection}>
          {icon}
          <StyledText variant="labelMedium" children={title} />
        </View>
        {isNavigation ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={textColor}
          />
        ) : (
          <MaterialCommunityIcons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color={textColor}
          />
        )}
      </Pressable>
      {isOpen && content && (
        <View style={styles.contentContainer}>{content}</View>
      )}
    </View>
  );
};

export default StoreDropDownButton;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  maincontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rowSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contentContainer: {
    marginTop: 4,
    marginLeft: 16,
  },
});
