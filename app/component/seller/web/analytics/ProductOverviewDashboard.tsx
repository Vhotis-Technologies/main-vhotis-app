import { StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ProductOverviewData,
  MetricCardProps,
} from "@/app/interfaces/seller/StoreInterfaces";

const ProductOverviewDashboard = () => {
  const cardBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Mock data - replace with actual API data
  const data: ProductOverviewData = {
    totalProducts: 120,
    outOfStock: 8,
    topSellingProduct: "Wireless Earbuds",
    averageRating: 4.5,
    inventoryTurnover: 7.2,
  };

  const MetricCard = ({ title, value, subtitle, icon }: MetricCardProps) => (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: cardBackground, borderColor },
      ]}
    >
      <View style={styles.metricHeader}>
        {icon}
        <StyledText
          variant="bodySmall"
          style={[styles.metricTitle, { color: textColor }]}
        >
          {title}
        </StyledText>
      </View>
      <StyledText
        variant="titleLarge"
        style={[styles.metricValue, { color: textColor }]}
      >
        {value}
      </StyledText>
      {subtitle && (
        <StyledText
          variant="bodySmall"
          style={[styles.metricSubtitle, { color: textColor }]}
        >
          {subtitle}
        </StyledText>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        Product Overview
      </StyledText>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Products"
          value={data.totalProducts.toString()}
          icon={<MaterialIcons name="inventory" size={20} color={tintColor} />}
        />
        <MetricCard
          title="Out of Stock"
          value={data.outOfStock.toString()}
          icon={
            <MaterialIcons
              name="remove-shopping-cart"
              size={20}
              color={tintColor}
            />
          }
        />
        <MetricCard
          title="Top Seller"
          value={data.topSellingProduct}
          icon={<MaterialIcons name="star" size={20} color={tintColor} />}
        />
        <MetricCard
          title="Avg. Rating"
          value={data.averageRating.toFixed(1)}
          icon={<MaterialIcons name="star-rate" size={20} color={tintColor} />}
        />
        <MetricCard
          title="Inventory Turnover"
          value={data.inventoryTurnover.toFixed(1)}
          subtitle="per year"
          icon={<MaterialIcons name="autorenew" size={20} color={tintColor} />}
        />
      </View>
    </View>
  );
};

export default ProductOverviewDashboard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  metricCard: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    marginLeft: 8,
    fontWeight: "500",
  },
  metricValue: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricSubtitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
});
