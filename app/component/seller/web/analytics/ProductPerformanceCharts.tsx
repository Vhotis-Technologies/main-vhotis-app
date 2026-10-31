import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import TopSellingProductsChart from "../../charts/TopSellingProductsChart";
import InventoryTurnoverChart from "../../charts/InventoryTurnoverChart";
import ProductConversionFunnelChart from "../../charts/ProductConversionFunnelChart";
import ProductRatingsChart from "../../charts/ProductRatingsChart";
import { TabButtonProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const ProductPerformanceCharts = () => {
  const [activeTab, setActiveTab] = useState<
    "topSelling" | "inventory" | "funnel" | "ratings"
  >("topSelling");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  // Mock data for charts
  const topSellingData = [
    { name: "Wireless Earbuds", sales: 320 },
    { name: "Smart Watch", sales: 210 },
    { name: "Bluetooth Speaker", sales: 180 },
    { name: "Phone Case", sales: 150 },
    { name: "USB Cable", sales: 120 },
  ];
  const inventoryTurnoverData = [
    { month: "Jan", turnover: 6.2 },
    { month: "Feb", turnover: 7.1 },
    { month: "Mar", turnover: 7.8 },
    { month: "Apr", turnover: 6.9 },
    { month: "May", turnover: 8.0 },
    { month: "Jun", turnover: 7.5 },
  ];
  const funnelData = [
    { stage: "Views", count: 5000 },
    { stage: "Added to Cart", count: 1200 },
    { stage: "Checkout", count: 800 },
    { stage: "Purchased", count: 600 },
  ];
  const ratingsData = [
    { rating: 5, count: 80 },
    { rating: 4, count: 30 },
    { rating: 3, count: 7 },
    { rating: 2, count: 2 },
    { rating: 1, count: 1 },
  ];

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
      case "topSelling":
        return <TopSellingProductsChart data={topSellingData} />;
      case "inventory":
        return <InventoryTurnoverChart data={inventoryTurnoverData} />;
      case "funnel":
        return <ProductConversionFunnelChart data={funnelData} />;
      case "ratings":
        return <ProductRatingsChart data={ratingsData} />;
      default:
        return <TopSellingProductsChart data={topSellingData} />;
    }
  };

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        Product Performance Charts
      </StyledText>

      {/* Chart Type Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Top Selling"
          icon="bar-chart"
          isActive={activeTab === "topSelling"}
          onPress={() => setActiveTab("topSelling")}
        />
        <TabButton
          title="Inventory"
          icon="autorenew"
          isActive={activeTab === "inventory"}
          onPress={() => setActiveTab("inventory")}
        />
        <TabButton
          title="Funnel"
          icon="filter-alt"
          isActive={activeTab === "funnel"}
          onPress={() => setActiveTab("funnel")}
        />
        <TabButton
          title="Ratings"
          icon="star"
          isActive={activeTab === "ratings"}
          onPress={() => setActiveTab("ratings")}
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

export default ProductPerformanceCharts;

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
