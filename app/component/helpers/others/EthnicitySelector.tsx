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

const ethnicityOptions = [
  "Asian",
  "Black/African",
  "Hispanic/Latino",
  "Middle Eastern",
  "Mixed/Multiple ethnic groups",
  "Native American",
  "Pacific Islander",
  "White/Caucasian",
  "Other",
];

const EthnicitySelector = ({
  selectedEthnicity,
  onSelect,
}: {
  selectedEthnicity?: string;
  onSelect: (ethnicity: string) => void;
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  return ethnicityOptions.map((item) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.option,
        selectedEthnicity === item && styles.selectedOption,
        {borderColor},
      ]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.optionText, {color: textColor}]}>{item}</Text>
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

export default EthnicitySelector;
