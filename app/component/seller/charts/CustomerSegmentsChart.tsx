import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { CustomerSegmentsChartProps } from "@/app/interfaces/seller/StoreInterfaces";
import { formatCurrency } from "@/app/_utils/main/helpers";

const { width } = Dimensions.get("window");

const CustomerSegmentsChart = ({ data }: CustomerSegmentsChartProps) => {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  if (!data || data.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          No data available
        </StyledText>
      </View>
    );
  }

  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"];

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const totalCustomers = data.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleMedium"
        style={[styles.title, { color: textColor }]}
      >
        Customer Segments Distribution
      </StyledText>

      <View style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Total Customers
            </StyledText>
            <StyledText
              variant="titleLarge"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {totalCustomers.toLocaleString()}
            </StyledText>
          </View>
          <View style={styles.summaryCard}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Total Revenue
            </StyledText>
            <StyledText
              variant="titleLarge"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatCurrency(totalRevenue)}
            </StyledText>
          </View>
        </View>

        {/* Segments List */}
        <View style={styles.segmentsList}>
          <StyledText
            variant="bodyMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Segment Breakdown
          </StyledText>

          {data.map((item, index) => (
            <View key={index} style={styles.segmentItem}>
              <View style={styles.segmentHeader}>
                <View style={styles.segmentInfo}>
                  <View
                    style={[
                      styles.segmentColor,
                      { backgroundColor: colors[index % colors.length] },
                    ]}
                  />
                  <View>
                    <StyledText
                      variant="bodyMedium"
                      style={[styles.segmentName, { color: textColor }]}
                    >
                      {item.segment}
                    </StyledText>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.segmentCount, { color: textColor }]}
                    >
                      {item.count.toLocaleString()} customers
                    </StyledText>
                  </View>
                </View>
                <View style={styles.segmentMetrics}>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.segmentRevenue, { color: textColor }]}
                  >
                    {formatCurrency(item.revenue)}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.segmentPercentage, { color: textColor }]}
                  >
                    {formatPercentage(item.percentage)}
                  </StyledText>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: colors[index % colors.length],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <StyledText
            variant="bodySmall"
            style={{ color: textColor, marginBottom: 10 }}
          >
            Customer Segments:
          </StyledText>
          <View style={styles.legendItems}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: colors[index % colors.length] },
                  ]}
                />
                <StyledText
                  variant="bodySmall"
                  style={{ color: textColor, fontSize: 10 }}
                >
                  {item.segment} ({formatPercentage(item.percentage)})
                </StyledText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CustomerSegmentsChart;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  content: {
    gap: 20,
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  summaryCard: {
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    minWidth: 120,
  },
  summaryLabel: {
    marginBottom: 5,
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: "bold",
  },
  segmentsList: {
    gap: 15,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  segmentItem: {
    gap: 8,
  },
  segmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  segmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  segmentName: {
    fontWeight: "500",
    marginBottom: 2,
  },
  segmentCount: {
    opacity: 0.7,
  },
  segmentMetrics: {
    alignItems: "flex-end",
  },
  segmentRevenue: {
    fontWeight: "600",
    marginBottom: 2,
  },
  segmentPercentage: {
    opacity: 0.7,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  legend: {
    alignItems: "center",
    marginTop: 10,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
});
