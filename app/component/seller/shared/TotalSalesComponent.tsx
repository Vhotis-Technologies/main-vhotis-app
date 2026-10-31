import {
  SalesDataPoint,
  TotalSalesData,
} from "@/app/interfaces/seller/DashboardInterfaces";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import BarChartDisplay from "./BarChartDisplay";
import StyledText from "../../helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
interface TotalSalesComponentProps {
  width: number;
  onPeriodChange?: (periodType: "weekly" | "monthly") => void;
  salesData?: TotalSalesData;
  isLoading?: boolean;
  timeframe?: "weekly" | "monthly";
}

const TotalSalesComponent = ({
  width: containerWidth,
  salesData,
  isLoading,
  timeframe = "weekly",
}: TotalSalesComponentProps) => {
  const screenWidth = Dimensions.get("window").width;

  // Calculate responsive width
  const chartWidth = Math.min(containerWidth - 40, screenWidth - 40); // Account for padding

  // Calculate percentage change
  const calculatePercentageChange = () => {
    if (
      !salesData ||
      salesData.previousPeriodTotal === 0 ||
      salesData.currentPeriodTotal === 0
    )
      return 0;
    return Math.round(
      ((salesData.currentPeriodTotal - salesData.previousPeriodTotal) /
        salesData.previousPeriodTotal) *
        100
    );
  };

  const percentageChange = calculatePercentageChange();

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerWidth,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <StyledText variant="bodyMedium" style={{ marginTop: 10 }}>
          Loading sales data...
        </StyledText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <View style={[styles.statItem]}>
        <StyledText
          variant="titleMedium"
          children={formatCurrency((salesData?.currentPeriodTotal || 0))}
        />
        <View style={[styles.percentageContainer,]}>
          <MaterialIcons
            name={percentageChange >= 0 ? "arrow-upward" : "arrow-downward"}
            size={16}
            color={percentageChange >= 0 ? "#4CAF50" : "#F44336"}
          />
          <StyledText
            style={[styles.percentageText]}
          >
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange}%
          </StyledText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <BarChartDisplay data={salesData?.data || []} width={chartWidth} />
      </View>
    </View>
  );
};

export default TotalSalesComponent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  periodSelectorContainer: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  periodOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedPeriodOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  periodOptionText: {
    fontSize: 14,
  },
  selectedPeriodText: {
    color: "#4B7BF5",
    fontWeight: "600",
  },
  statItem: {
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeframeBadge: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  percentageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 14,
    marginLeft: 4,
  },
  chartContainer: {
    flex: 1,
    minHeight: 300,
    maxHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});
