import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type FilterOptionValue =
  | "price_low_to_high"
  | "price_high_to_low"
  | "rating"
  | "distance_closest_first"
  | "distance_furthest_first"
  | "sponsored";

interface FilterProductComponentProps {
  selectedValue?: FilterOptionValue | null;
  onSelect: (value: FilterOptionValue) => void;
}

const FILTER_OPTIONS: { label: string; value: FilterOptionValue }[] = [
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Rating", value: "rating" },
  { label: "Distance: Closest First", value: "distance_closest_first" },
  { label: "Distance: Furthest First", value: "distance_furthest_first" },
  { label: "Sponsored", value: "sponsored" },
];

const FilterOption = ({
  label,
  value,
  isSelected,
  onPress,
}: {
  label: string;
  value: FilterOptionValue;
  isSelected: boolean;
  onPress: (value: FilterOptionValue) => void;
}) => {
  const activeBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  return (
    <TouchableOpacity
      style={[
        styles.filterOption,
        isSelected && {
          backgroundColor: activeBackground,
          borderColor: tintColor,
        },
      ]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <StyledText
        variant="bodySmall"
        style={
          isSelected
            ? { color: tintColor, fontWeight: "600" }
            : { color: textColor }
        }
      >
        {label}
      </StyledText>
    </TouchableOpacity>
  );
};

const FilterProductComponent = ({
  selectedValue,
  onSelect,
}: FilterProductComponentProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");

  return (
    <View style={[styles.maincontainer, { backgroundColor, borderColor }]}>
      {FILTER_OPTIONS.map((option) => (
        <FilterOption
          key={option.value}
          label={option.label}
          value={option.value}
          isSelected={selectedValue === option.value}
          onPress={onSelect}
        />
      ))}
    </View>
  );
};

export default FilterProductComponent;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
  },
  filterOption: {
    padding: 10,
    borderRadius: 8,
  },
});
