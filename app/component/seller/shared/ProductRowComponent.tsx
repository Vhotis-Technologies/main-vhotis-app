import { DailyViewsInterface } from "@/app/interfaces/seller/DashboardInterfaces";
import React from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import StyledText from "../../helpers/forms/StyledText";

interface ProductRowComponentProps {
  productName: string;
  reach: DailyViewsInterface;
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

const ProductRowComponent = ({
  productName,
  reach,
}: ProductRowComponentProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile =
    Platform.OS === "ios" || Platform.OS === "android" || windowWidth < 768;

  const getHeatmapColor = (count: number): string => {
    if (count === 0) return "#FFE5E5";
    if (count > 0 && count <= 5000) return "#FFE5E5";
    if (count > 5000 && count <= 10000) return "#FFCCCC";
    if (count > 10000 && count <= 50000) return "#FF9999";
    return "#FF6666";
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.nameContainer, isMobile && styles.nameContainerMobile]}
      >
        <StyledText
          variant="bodyMedium"
          style={styles.productText}
          numberOfLines={1}
        >
          {productName}
        </StyledText>
      </View>
      <View
        style={[
          styles.heatmapContainer,
          isMobile && styles.heatmapContainerMobile,
        ]}
      >
        {DAYS.map((day) => (
          <View
            key={day}
            style={[
              styles.heatmapCell,
              isMobile && styles.heatmapCellMobile,
              {
                backgroundColor: getHeatmapColor(reach[day]),
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
    paddingVertical: Platform.OS === "web" ? 8 : 4,
    paddingHorizontal: Platform.OS === "web" ? 16 : 8,
    width: "100%",
    minHeight: Platform.OS === "web" ? 96 : 48,
  },
  nameContainer: {
    width: Platform.OS === "web" ? 100 : 60,
    justifyContent: "center",
    paddingRight: 8,
  },
  nameContainerMobile: {
    width: 60,
  },
  productText: {
    fontSize: 12,
  },
  heatmapContainer: {
    flexDirection: "row",
    gap: 2,
    flex: 1,
    justifyContent: "space-between",
  },
  heatmapContainerMobile: {
    gap: 2,
  },
  heatmapCell: {
    flex: 1,
    height: Platform.OS === "web" ? 50 : 30,
    borderRadius: Platform.OS === "web" ? 8 : 6,
  },
  heatmapCellMobile: {
    height: 30,
    borderRadius: 6,
  },
});

export default ProductRowComponent;
