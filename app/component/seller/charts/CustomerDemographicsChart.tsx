import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { CustomerDemographicsChartProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const CustomerDemographicsChart = ({
  data,
}: CustomerDemographicsChartProps) => {
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

  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));
  const chartWidth = width - 80;
  const chartHeight = 180;
  const barWidth = Math.max(20, chartWidth / data.length - 8);

  const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  const getBarHeight = (count: number) => {
    const normalizedValue = count / maxCount;
    return Math.max(8, normalizedValue * 100); // Fixed max height to prevent overflow
  };

  const getBarColor = (count: number, index: number) => {
    const isHighest = count === maxCount;
    const isLowest = count === minCount;

    if (isHighest) return "#10B981"; // Green for highest
    if (isLowest) return "#EF4444"; // Red for lowest
    return colors[index % colors.length];
  };

  const totalCustomers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header with title and summary */}
      <View style={styles.header}>
        <StyledText
          variant="titleMedium"
          style={[styles.title, { color: textColor }]}
        >
          Customer Demographics
        </StyledText>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Total Customers
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {totalCustomers.toLocaleString()}
            </StyledText>
          </View>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Largest Group
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: "#10B981" }]}
            >
              {data.find((d) => d.count === maxCount)?.ageGroup} (
              {Math.round((maxCount / totalCustomers) * 100)}%)
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
              const barHeight = getBarHeight(item.count);
              const barColor = getBarColor(item.count, index);
              const isHighest = item.count === maxCount;

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
                    {item.ageGroup}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barValue, { color: textColor }]}
                  >
                    {item.count}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barPercentage, { color: textColor }]}
                  >
                    {item.percentage}%
                  </StyledText>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Modern legend with stats */}
      <View style={styles.legend}>
        <StyledText
          variant="bodySmall"
          style={[styles.legendTitle, { color: textColor }]}
        >
          Age Distribution
        </StyledText>
        <View style={styles.legendItems}>
          {data.map((item, index) => {
            const barColor = getBarColor(item.count, index);
            return (
              <View
                key={index}
                style={[
                  styles.legendItem,
                  { backgroundColor: "rgba(0,0,0,0.05)" },
                ]}
              >
                <View
                  style={[styles.legendColor, { backgroundColor: barColor }]}
                />
                <StyledText
                  variant="bodySmall"
                  style={[styles.legendText, { color: textColor }]}
                >
                  {item.ageGroup}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.legendPercentage, { color: textColor }]}
                >
                  {item.percentage}%
                </StyledText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default CustomerDemographicsChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 5,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
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
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: "row",
    height: 140,
    marginTop: 10,
  },
  yAxis: {
    width: 50,
    justifyContent: "space-between",
    paddingRight: 12,
  },
  yAxisItem: {
    justifyContent: "center",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
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
    justifyContent: "space-between",
    paddingBottom: 5,
    paddingTop: 5,
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
    marginBottom: 2,
    opacity: 0.9,
  },
  barPercentage: {
    fontSize: 8,
    textAlign: "center",
    opacity: 0.7,
    fontWeight: "500",
  },
  legend: {
    alignItems: "center",
  },
  legendTitle: {
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
  legendPercentage: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.8,
  },
});
