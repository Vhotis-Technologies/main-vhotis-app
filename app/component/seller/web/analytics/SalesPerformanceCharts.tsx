import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import TimeSeriesChart from "../../charts/TimeSeriesChart";
import HeatMapChart from "../../charts/HeatMapChart";
import FunnelChart from "../../charts/FunnelChart";
import {
  ChartData,
  TabButtonProps,
} from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const SalesPerformanceCharts = () => {
  const [activeTab, setActiveTab] = useState<
    "timeSeries" | "bar" | "heatMap" | "funnel"
  >("timeSeries");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);

  // Mock data - replace with actual API data
  const chartData: ChartData = {
    timeSeriesData: [
      { date: "2024-01-01", revenue: 1200, orders: 15 },
      { date: "2024-01-02", revenue: 1350, orders: 18 },
      { date: "2024-01-03", revenue: 1100, orders: 14 },
      { date: "2024-01-04", revenue: 1600, orders: 22 },
      { date: "2024-01-05", revenue: 1400, orders: 19 },
      { date: "2024-01-06", revenue: 1800, orders: 25 },
      { date: "2024-01-07", revenue: 1700, orders: 23 },
    ],
    heatMapData: [
      { dayOfWeek: 0, hour: 9, sales: 150 },
      { dayOfWeek: 0, hour: 10, sales: 200 },
      { dayOfWeek: 0, hour: 11, sales: 250 },
      { dayOfWeek: 1, hour: 9, sales: 180 },
      { dayOfWeek: 1, hour: 10, sales: 220 },
      { dayOfWeek: 1, hour: 11, sales: 280 },
      // Add more data points as needed
    ],
    funnelData: [
      { stage: "Page Views", count: 10000, conversionRate: 100 },
      { stage: "Product Views", count: 3500, conversionRate: 35 },
      { stage: "Add to Cart", count: 1200, conversionRate: 12 },
      { stage: "Checkout Started", count: 800, conversionRate: 8 },
      { stage: "Purchase Completed", count: 600, conversionRate: 6 },
    ],
  };

  const TabButton = ({ title, icon, isActive, onPress }: TabButtonProps) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? tintColor : "transparent",
          borderColor: borderColor,
        },
      ]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon as any}
        size={20}
        color={isActive ? "#fff" : textColor}
      />
      <StyledText
        variant="bodySmall"
        style={[styles.tabText, { color: isActive ? "#fff" : textColor }]}
      >
        {title}
      </StyledText>
    </TouchableOpacity>
  );

  const renderChart = (width: number, height: number) => {
    switch (activeTab) {
      case "timeSeries":
        return <TimeSeriesChart data={chartData.timeSeriesData} width={width} height={height} />;
      case "heatMap":
        return <HeatMapChart data={chartData.heatMapData} />;
      case "funnel":
        return <FunnelChart data={chartData.funnelData} />;
      default:
        return <TimeSeriesChart data={chartData.timeSeriesData} width={width} height={height} />;
    }
  };

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        Sales Performance Charts
      </StyledText>

      {/* Chart Type Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Trends"
          icon="trending-up"
          isActive={activeTab === "timeSeries"}
          onPress={() => setActiveTab("timeSeries")}
        />
        <TabButton
          title="Heat Map"
          icon="grid-on"
          isActive={activeTab === "heatMap"}
          onPress={() => setActiveTab("heatMap")}
        />
        <TabButton
          title="Funnel"
          icon="funnel-chart"
          isActive={activeTab === "funnel"}
          onPress={() => setActiveTab("funnel")}
        />
      </View>

      {/* Chart Container */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: cardBackground, borderColor },
        ]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setChartWidth(width);
          setChartHeight(height);
        }}
      >
        {renderChart(chartWidth, chartHeight)}
      </View>
    </View>
  );
};

export default SalesPerformanceCharts;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontWeight: "500",
  },
  chartContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
});
