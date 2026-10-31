import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const GenderSelector = ({
  selectedGender,
  onSelect,
}: {
  selectedGender?: string;
  onSelect: (gender: string) => void;
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  return genderOptions.map((item) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.option,
        selectedGender === item && styles.selectedOption,
        { borderColor },
      ]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.optionText, { color: textColor }]}>{item}</Text>
    </TouchableOpacity>
  ));
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 5,
  },
  option: {
    padding: 5,
    marginVertical: 2,
  },
  selectedOption: {
    padding: 5,
    paddingHorizontal: 15,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
  },
});

export default GenderSelector;
