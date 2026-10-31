import { DailyViewsInterface } from "@/app/interfaces/seller/DashboardInterfaces";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import StyledText from "../../helpers/forms/StyledText";

interface CategoryRowComponentProps {
  category: string;
  reach: DailyViewsInterface;
  width: number;
}

const DAYS: (keyof DailyViewsInterface)[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const CategoryRowComponent = ({
  category,
  reach,
  width,
}: CategoryRowComponentProps) => {
  const getHeatmapColor = (count: number): string => {
    if (count === 0) return "#EEF1F6";
    if (count < 5000) return "#CBD3E5"; // 0-5k: light gray
    if (count < 10000) return "#8494C4"; // 5k-10k: medium blue
    if (count < 50000) return "#4154A3"; // 10k-50k: dark blue
    return "#2A3A7A"; // 50k+: darkest blue
  };

  // Calculate dimensions based on container width
  const categoryWidth = width * 0.2; // 20% of container width
  const heatmapWidth = width - categoryWidth - 10; // Remaining space minus category margin
  const cellWidth = (heatmapWidth - 48) / 7; // Divide remaining space by 7 days, accounting for 6 gaps of 8px (48px total)

  return (
    <View style={[styles.container, { width }]}>
      <View style={[styles.categoryContainer, { width: categoryWidth }]}>
        <StyledText variant={"bodySmall"}>{category}</StyledText>
      </View>
      <View style={styles.heatmapContainer}>
        {DAYS.map((day, i) => (
          <View
            key={i}
            style={[
              styles.heatmapCell,
              {
                backgroundColor: getHeatmapColor(reach[day]),
                width: cellWidth,
                height: cellWidth,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 2,
  },
  categoryContainer: {
    marginRight: 10,
  },
  categoryText: {
    color: "#000",
  },
  heatmapContainer: {
    flexDirection: "row",
    gap: 8,
  },
  heatmapCell: {
    borderRadius: 6,
  },
});

export default CategoryRowComponent;
