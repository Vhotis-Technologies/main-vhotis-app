import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { CustomerBehaviorChartProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const CustomerBehaviorChart = ({ data }: CustomerBehaviorChartProps) => {
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

  const maxOrderValue = Math.max(...data.map((d) => d.avgOrderValue));
  const maxFrequency = Math.max(...data.map((d) => d.frequency));
  const maxRetention = Math.max(...data.map((d) => d.retention));
  const chartWidth = width - 80;
  const chartHeight = 120;

  const colors = ["#10B981", "#3B82F6", "#F59E0B"];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const getBarColor = (index: number) => {
    return colors[index % colors.length];
  };

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header with title and summary */}
      <View style={styles.header}>
        <StyledText
          variant="titleMedium"
          style={[styles.title, { color: textColor }]}
        >
          Customer Behavior Analysis
        </StyledText>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Avg Order Value
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: "#10B981" }]}
            >
              {formatCurrency(maxOrderValue)}
            </StyledText>
          </View>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Best Retention
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {maxRetention}%
            </StyledText>
          </View>
        </View>
      </View>

      <View style={styles.chartsContainer}>
        {/* Order Value Chart */}
        <View
          style={[
            styles.chartSection,
            {
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: 12,
              padding: 16,
            },
          ]}
        >
          <StyledText
            variant="bodyMedium"
            style={[styles.chartTitle, { color: textColor }]}
          >
            Average Order Value
          </StyledText>
          <View style={styles.chartRow}>
            {data.map((item, index) => {
              const barHeight =
                (item.avgOrderValue / maxOrderValue) * chartHeight;
              const barColor = getBarColor(index);
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                          width: 40,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        },
                      ]}
                    />
                    {item.avgOrderValue === maxOrderValue && (
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
                    style={[styles.barValue, { color: textColor }]}
                  >
                    {formatCurrency(item.avgOrderValue)}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barLabel, { color: textColor }]}
                  >
                    {item.segment}
                  </StyledText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Frequency Chart */}
        <View
          style={[
            styles.chartSection,
            {
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: 12,
              padding: 16,
            },
          ]}
        >
          <StyledText
            variant="bodyMedium"
            style={[styles.chartTitle, { color: textColor }]}
          >
            Order Frequency (per year)
          </StyledText>
          <View style={styles.chartRow}>
            {data.map((item, index) => {
              const barHeight = (item.frequency / maxFrequency) * chartHeight;
              const barColor = getBarColor(index);
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                          width: 40,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        },
                      ]}
                    />
                    {item.frequency === maxFrequency && (
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
                    style={[styles.barValue, { color: textColor }]}
                  >
                    {item.frequency}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.barLabel, { color: textColor }]}
                  >
                    {item.segment}
                  </StyledText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Retention Chart */}
        <View
          style={[
            styles.chartSection,
            {
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: 12,
              padding: 16,
            },
          ]}
        >
          <StyledText
            variant="bodyMedium"
            style={[styles.chartTitle, { color: textColor }]}
          >
            Customer Retention Rate
          </StyledText>
          <View style={styles.retentionContainer}>
            {data.map((item, index) => {
              const barColor = getBarColor(index);
              return (
                <View key={index} style={styles.retentionItem}>
                  <View style={styles.retentionHeader}>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.segmentName, { color: textColor }]}
                    >
                      {item.segment}
                    </StyledText>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.retentionValue, { color: textColor }]}
                    >
                      {formatPercentage(item.retention)}
                    </StyledText>
                  </View>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: "rgba(0,0,0,0.1)" },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.retention}%`,
                          backgroundColor: barColor,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                          elevation: 2,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Modern legend */}
      <View style={styles.legend}>
        <StyledText
          variant="bodySmall"
          style={[styles.legendTitle, { color: textColor }]}
        >
          Customer Segments
        </StyledText>
        <View style={styles.legendItems}>
          {data.map((item, index) => (
            <View
              key={index}
              style={[
                styles.legendItem,
                { backgroundColor: "rgba(0,0,0,0.05)" },
              ]}
            >
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: getBarColor(index) },
                ]}
              />
              <StyledText
                variant="bodySmall"
                style={[styles.legendText, { color: textColor }]}
              >
                {item.segment}
              </StyledText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CustomerBehaviorChart;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 12,
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
  chartsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  chartSection: {
    alignItems: "center",
  },
  chartTitle: {
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 12,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
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
  barValue: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  barLabel: {
    fontSize: 9,
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.8,
  },
  retentionContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  retentionItem: {
    marginBottom: 15,
  },
  retentionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  segmentName: {
    fontWeight: "600",
    fontSize: 12,
  },
  retentionValue: {
    fontWeight: "700",
    fontSize: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
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
});
