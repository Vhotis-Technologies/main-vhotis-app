import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TimeSeriesChartProps } from "@/app/interfaces/seller/StoreInterfaces";
const { width } = Dimensions.get("window");
import { formatCurrency } from "@/app/_utils/main/helpers";

const TimeSeriesChart = ({ data }: TimeSeriesChartProps) => {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  if (!data || data.length === 0) {
    return (
      <View
        style={[styles.noDataContainer, { backgroundColor: cardBackground }]}
      >
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          No data available
        </StyledText>
      </View>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = Math.min(...data.map((d) => d.revenue));
  const chartWidth = width - 80; // Account for padding
  const chartHeight = 180;
  const barWidth = Math.max(20, chartWidth / data.length - 8);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getBarHeight = (revenue: number) => {
    const range = maxRevenue - minRevenue;
    const normalizedValue = range > 0 ? (revenue - minRevenue) / range : 0.5;
    return Math.max(8, normalizedValue * chartHeight);
  };

  const getBarColor = (revenue: number, index: number) => {
    const isHighest = revenue === maxRevenue;
    const isLowest = revenue === minRevenue;

    if (isHighest) return "#10B981"; // Green for highest
    if (isLowest) return "#EF4444"; // Red for lowest
    return tintColor; // Default tint color
  };

  return (
    <View
      style={[
        styles.container,
        {borderColor },
      ]}
    >
      {/* Header with title and summary */}
      <View style={styles.header}>
        <StyledText
          variant="titleMedium"
          style={[styles.title, { color: textColor }]}
        >
          Revenue Trends
        </StyledText>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Peak
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: "#10B981" }]}
            >
              {formatCurrency(maxRevenue)}
            </StyledText>
          </View>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Total
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatCurrency(
                data.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </StyledText>
          </View>
        </View>
      </View>

      {/* Chart container with grid lines */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>

          {/* Chart bars with modern styling */}
          <View style={styles.chartArea}>
            {data.map((item, index) => {
              const barHeight = getBarHeight(item.revenue);
              const barColor = getBarColor(item.revenue, index);
              const isHighest = item.revenue === maxRevenue;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                          width: barWidth,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        },
                      ]}
                    />
                    {isHighest && (
                      <View
                        style={[
                          styles.highlightDot,
                          { backgroundColor: barColor },
                        ]}
                      />
                    )}
                  </View>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barLabel, { color: textColor }]}
                  >
                    {formatDate(item.date)}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barValue, { color: textColor }]}
                  >
                    {formatCurrency(item.revenue)}
                  </StyledText>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Modern legend with stats */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: tintColor }]} />
          <StyledText variant="bodySmall" style={{ color: textColor }}>
            Revenue
          </StyledText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#10B981" }]} />
          <StyledText variant="bodySmall" style={{ color: textColor }}>
            Peak
          </StyledText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#EF4444" }]} />
          <StyledText variant="bodySmall" style={{ color: textColor }}>
            Low
          </StyledText>
        </View>
      </View>
    </View>
  );
};

export default TimeSeriesChart;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 5,

  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 18,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  summaryValue: {
    fontWeight: "600",
    fontSize: 14,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartWrapper: {
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    height: 200,
    position: "relative",
  },
  yAxis: {
    width: 70,
    justifyContent: "space-between",
    paddingRight: 12,
  },
  yAxisItem: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  gridLine: {
    borderTopWidth: 1,
    opacity: 0.2,
  },
  yAxisLabel: {
    textAlign: "right",
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.8,
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  barWrapper: {
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  bar: {
    borderRadius: 6,
    marginBottom: 4,
    minHeight: 4,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: -4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  barLabel: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
    fontWeight: "500",
    opacity: 0.8,
  },
  barValue: {
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.9,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
});
