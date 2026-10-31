import { StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import {
  CustomerData,
  MetricCardProps,
} from "@/app/interfaces/seller/StoreInterfaces";

const CustomerOverviewDashboard = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Mock data - replace with actual API data
  const customerData: CustomerData = {
    totalCustomers: 1250,
    newCustomers: {
      daily: 12,
      weekly: 85,
      monthly: 320,
      yearly: 3800,
    },
    customerLifetimeValue: 245.75,
    repeatPurchaseRate: 68.5,
    averageOrderFrequency: 3.2,
    customerRetentionRate: 82.3,
    currency: "$",
  };

  const formatCurrency = (amount: number) => {
    return `${customerData.currency}${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
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
        Customer Overview
      </StyledText>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Customers"
          value={customerData.totalCustomers.toLocaleString()}
          icon={<MaterialIcons name="people" size={20} color={tintColor} />}
        />

        <MetricCard
          title="New Customers (Monthly)"
          value={customerData.newCustomers.monthly.toString()}
          subtitle="+15% from last month"
          icon={<MaterialIcons name="person-add" size={20} color={tintColor} />}
          trend={getGrowthIcon("up")}
        />

        <MetricCard
          title="Customer Lifetime Value"
          value={formatCurrency(customerData.customerLifetimeValue)}
          icon={
            <MaterialIcons name="monetization-on" size={20} color={tintColor} />
          }
        />

        <MetricCard
          title="Repeat Purchase Rate"
          value={formatPercentage(customerData.repeatPurchaseRate)}
          icon={<MaterialIcons name="repeat" size={20} color={tintColor} />}
        />

        <MetricCard
          title="Average Order Frequency"
          value={customerData.averageOrderFrequency.toString()}
          subtitle="orders per customer"
          icon={
            <MaterialIcons name="shopping-cart" size={20} color={tintColor} />
          }
        />

        <MetricCard
          title="Customer Retention Rate"
          value={formatPercentage(customerData.customerRetentionRate)}
          icon={<MaterialIcons name="loyalty" size={20} color={tintColor} />}
        />
      </View>
    </View>
  );
};

export default CustomerOverviewDashboard;

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
