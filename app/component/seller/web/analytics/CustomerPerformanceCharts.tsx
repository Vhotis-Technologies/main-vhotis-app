import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import CustomerDemographicsChart from "../../charts/CustomerDemographicsChart";
import CustomerBehaviorChart from "../../charts/CustomerBehaviorChart";
import CustomerSegmentsChart from "../../charts/CustomerSegmentsChart";
import {
  CustomerChartData,
  TabButtonProps,
} from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const CustomerPerformanceCharts = () => {
  const [activeTab, setActiveTab] = useState<
    "demographics" | "acquisition" | "behavior" | "segments"
  >("demographics");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  // Mock data - replace with actual API data
  const chartData: CustomerChartData = {
    demographicsData: [
      { ageGroup: "18-24", count: 150, percentage: 12 },
      { ageGroup: "25-34", count: 350, percentage: 28 },
      { ageGroup: "35-44", count: 400, percentage: 32 },
      { ageGroup: "45-54", count: 250, percentage: 20 },
      { ageGroup: "55+", count: 100, percentage: 8 },
    ],
    acquisitionData: [
      { source: "Organic Search", customers: 450, cost: 0 },
      { source: "Social Media", customers: 300, cost: 1200 },
      { source: "Email Marketing", customers: 200, cost: 800 },
      { source: "Referrals", customers: 150, cost: 300 },
      { source: "Paid Ads", customers: 150, cost: 2500 },
    ],
    behaviorData: [
      {
        segment: "High Value",
        avgOrderValue: 150,
        frequency: 5.2,
        retention: 95,
      },
      {
        segment: "Medium Value",
        avgOrderValue: 75,
        frequency: 3.1,
        retention: 78,
      },
      {
        segment: "Low Value",
        avgOrderValue: 35,
        frequency: 1.8,
        retention: 45,
      },
    ],
    segmentsData: [
      {
        segment: "New Customers",
        count: 320,
        revenue: 25000,
        percentage: 25.6,
      },
      { segment: "Returning", count: 580, revenue: 45000, percentage: 46.4 },
      { segment: "Loyal", count: 250, revenue: 35000, percentage: 20 },
      { segment: "VIP", count: 100, revenue: 15000, percentage: 8 },
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

  const renderChart = () => {
    switch (activeTab) {
      case "demographics":
        return <CustomerDemographicsChart data={chartData.demographicsData} />;
      case "behavior":
        return <CustomerBehaviorChart data={chartData.behaviorData} />;
      case "segments":
        return <CustomerSegmentsChart data={chartData.segmentsData} />;
      default:
        return <CustomerDemographicsChart data={chartData.demographicsData} />;
    }
  };

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        Customer Performance Charts
      </StyledText>

      {/* Chart Type Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Demographics"
          icon="people"
          isActive={activeTab === "demographics"}
          onPress={() => setActiveTab("demographics")}
        />
        <TabButton
          title="Behavior"
          icon="psychology"
          isActive={activeTab === "behavior"}
          onPress={() => setActiveTab("behavior")}
        />
        <TabButton
          title="Segments"
          icon="category"
          isActive={activeTab === "segments"}
          onPress={() => setActiveTab("segments")}
        />
      </View>

      {/* Chart Container */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: cardBackground, borderColor },
        ]}
      >
        {renderChart()}
      </View>
    </View>
  );
};

export default CustomerPerformanceCharts;

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
