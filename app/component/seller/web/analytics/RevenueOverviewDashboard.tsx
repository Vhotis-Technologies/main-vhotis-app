import { StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import {
  RevenueData,
  MetricCardProps,
} from "@/app/interfaces/seller/StoreInterfaces";

const RevenueOverviewDashboard = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Mock data - replace with actual API data
  const revenueData: RevenueData = {
    totalRevenue: {
      daily: 1250.5,
      weekly: 8750.25,
      monthly: 35000.75,
      yearly: 420000.0,
    },
    revenueGrowth: {
      percentage: 12.5,
      period: "monthly",
      trend: "up",
    },
    averageOrderValue: 85.5,
    revenuePerCustomer: 245.75,
    currency: "$",
  };

  const formatCurrency = (amount: number) => {
    return `${revenueData.currency}${amount.toLocaleString()}`;
  };

  const getGrowthIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <MaterialIcons name="trending-up" size={16} color="#4CAF50" />;
      case "down":
        return <MaterialIcons name="trending-down" size={16} color="#F44336" />;
      default:
        return <MaterialIcons name="trending-flat" size={16} color="#FF9800" />;
    }
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
  }: MetricCardProps) => (
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
      {trend && <View style={styles.trendContainer}>{trend}</View>}
    </View>
  );

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        Revenue Overview
      </StyledText>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Daily Revenue"
          value={formatCurrency(revenueData.totalRevenue.daily)}
          icon={<MaterialIcons name="today" size={20} color={tintColor} />}
        />

        <MetricCard
          title="Weekly Revenue"
          value={formatCurrency(revenueData.totalRevenue.weekly)}
          icon={<MaterialIcons name="date-range" size={20} color={tintColor} />}
        />

        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(revenueData.totalRevenue.monthly)}
          subtitle={`${revenueData.revenueGrowth.percentage}% growth`}
          icon={
            <MaterialIcons name="calendar-month" size={20} color={tintColor} />
          }
          trend={getGrowthIcon(revenueData.revenueGrowth.trend)}
        />

        <MetricCard
          title="Yearly Revenue"
          value={formatCurrency(revenueData.totalRevenue.yearly)}
          icon={
            <MaterialIcons name="calendar-today" size={20} color={tintColor} />
          }
        />

        <MetricCard
          title="Average Order Value"
          value={formatCurrency(revenueData.averageOrderValue)}
          icon={
            <MaterialIcons name="shopping-cart" size={20} color={tintColor} />
          }
        />

        <MetricCard
          title="Revenue per Customer"
          value={formatCurrency(revenueData.revenuePerCustomer)}
          icon={<MaterialIcons name="person" size={20} color={tintColor} />}
        />
      </View>
    </View>
  );
};

export default RevenueOverviewDashboard;

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
    minHeight: 120,
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
  trendContainer: {
    position: "absolute",
    top: 15,
    right: 15,
  },
});
