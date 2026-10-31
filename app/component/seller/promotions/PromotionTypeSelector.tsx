import { StyleSheet, View } from "react-native";
import React from "react";
import { RadioButton, Text } from "react-native-paper";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
interface PromotionTypeSelectorProps {
  selectedType: "store" | "product";
  onTypeChange: (type: "store" | "product") => void;
}

const PromotionTypeSelector = ({
  selectedType,
  onTypeChange,
}: PromotionTypeSelectorProps) => {

  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");

  const tintColor = useThemeColor({}, "tint");
  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <StyledText variant="labelLarge" children="Promotion Type" />
      <View style={styles.radioGroup}>
        <RadioButton.Group
          onValueChange={(value) => onTypeChange(value as "store" | "product")}
          value={selectedType}
        >
          <View style={styles.radioItem}>
            <RadioButton value="store" color={tintColor} />
            <StyledText variant="labelSmall" children="Store-wide Promotion" />
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="product" color={tintColor} />
            <StyledText variant="labelSmall" children="Product-specific Promotion" />
          </View>
        </RadioButton.Group>
      </View>
    </View>
  );
};

export default PromotionTypeSelector;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  radioGroup: {
    gap: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});
