import { DashboardDataDisplayInterface } from "@/app/interfaces/seller/DashboardInterfaces";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "@/app/_utils/main/helpers";
interface DashboardDataDisplayProps {
  lastPeriod: number;
  currentPeriod: number;
  title: string;
  onDateChange: () => void;
  timeframe: "weekly" | "monthly";
  isLoading?: boolean;
}

const DashboardDataDisplay = ({
  lastPeriod,
  currentPeriod,
  title,
  onDateChange,
  timeframe,
  isLoading = false,
}: DashboardDataDisplayProps) => {
  const cardColor = useThemeColor({}, "cards");
  const iconColor = useThemeColor({}, "icons");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  // Remove internal modal state - use parent's modal instead

  /* Calculate the percentage change between the current and last period */
  const percentageChange = (currentPeriod: number, lastPeriod: number) => {
    if (lastPeriod === 0) return 0;
    return ((currentPeriod - lastPeriod) / lastPeriod) * 100;
  };

  const change = percentageChange(currentPeriod, lastPeriod);
  const isPositive = change >= 0;
  const changeColor = isPositive ? "#10B981" : "#EF4444";
  const changeIcon = isPositive ? "trending-up" : "trending-down";

  // Get appropriate icon for each metric type
  const getMetricIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "conversion rate":
        return "trending-up";
      case "products sold":
        return "shopping-cart";
      case "total views":
        return "visibility";
      case "total revenue":
        return "attach-money";
      default:
        return "analytics";
    }
  };

  // Format numbers appropriately
  const formatValue = (value: number, title: string) => {
    if (title.toLowerCase().includes("revenue")) {
      return formatCurrency(value);
    }
    if (title.toLowerCase().includes("rate")) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  /* Display an activity indicator if the data is still loading */
  if (isLoading) {
    return (
      <LinearGradient
        colors={[cardColor, cardColor]}
        style={[styles.modernContainer, { backgroundColor: cardColor }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <StyledText
            variant="labelMedium"
            style={[styles.loadingText, { color: textColor }]}
          >
            Loading data...
          </StyledText>
        </View>
      </LinearGradient>
    );
  }

  if (!currentPeriod && !lastPeriod) {
    return (
      <View
        style={[styles.modernContainer]}
      >
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="analytics"
            size={32}
            color={iconColor}
            style={{ opacity: 0.5 }}
          />
          <StyledText
            variant="bodyMedium"
            style={[styles.emptyText, { color: textColor }]}
          >
            No data available
          </StyledText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.modernContainer, { backgroundColor: cardColor, borderColor }]}
    >
      {/* Header Section */}
      <View style={styles.modernHeader}>
        <StyledText
          variant="labelLarge"
          style={[styles.titleText, { color: textColor }]}
        >
          {title || ""}
        </StyledText>
        <Pressable onPress={onDateChange} style={styles.optionsButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={20}
            color={iconColor}
          />
        </Pressable>
      </View>

      {/* Main Value Display */}
      <View style={styles.valueSection}>
        <StyledText
          variant="headlineMedium"
          style={[styles.mainValue, { color: textColor }]}
        >
          {formatValue(currentPeriod, title)}
        </StyledText>

        {/* Change Indicator */}
        <View style={styles.changeContainer}>
          <MaterialIcons name={changeIcon} size={16} color={changeColor} />
          <StyledText
            variant="labelMedium"
            style={[styles.changeText, { color: changeColor }]}
          >
            {Math.abs(change).toFixed(1)}%
          </StyledText>
        </View>
      </View>

      {/* Period Comparison */}
      <View style={styles.periodSection}>
        <View style={styles.periodItem}>
          <StyledText
            variant="bodySmall"
            style={[styles.periodLabel, { color: textColor }]}
          >
            Current
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.periodValue, { color: textColor }]}
          >
            {formatValue(currentPeriod, title)}
          </StyledText>
        </View>

        <View style={styles.periodItem}>
          <StyledText
            variant="bodySmall"
            style={[styles.periodLabel, { color: textColor }]}
          >
            Previous
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.periodValue, { color: textColor }]}
          >
            {formatValue(lastPeriod, title)}
          </StyledText>
        </View>
      </View>

      {/* Timeframe Badge */}
      <View style={[styles.timeframeBadge]}>
        <StyledText variant="labelSmall" style={[styles.timeframeText]}>
          {timeframe === "weekly" ? "This week" : "This month"}
        </StyledText>
      </View>
    </View>
  );
};

export default DashboardDataDisplay;

const styles = StyleSheet.create({
  // Modern container with gradient support
  modernContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    minHeight: 140,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },

  // Header section
  modernHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleText: {
    fontWeight: "600",
    fontSize: 16,
  },
  optionsButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Value section
  valueSection: {
    marginBottom: 16,
  },
  mainValue: {
    fontWeight: "700",
    fontSize: 28,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 14,
  },

  // Period comparison
  periodSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  periodItem: {
    flex: 1,
  },
  periodLabel: {
    opacity: 0.7,
    marginBottom: 4,
    fontSize: 12,
  },
  periodValue: {
    fontWeight: "500",
    fontSize: 14,
  },

  // Timeframe badge
  timeframeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  timeframeText: {
    fontWeight: "500",
    fontSize: 12,
  },
});
