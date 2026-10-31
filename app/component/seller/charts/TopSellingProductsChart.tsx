import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TopSellingProductsChartProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const TopSellingProductsChart = ({ data }: TopSellingProductsChartProps) => {
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

  const maxSales = Math.max(...data.map((d) => d.sales));
  const chartWidth = width - 60;
  const chartHeight = 200;
  const barWidth = chartWidth / data.length - 8;
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"];

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleMedium"
        style={[styles.title, { color: textColor }]}
      >
        Top Selling Products
      </StyledText>
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <StyledText
              key={index}
              variant="bodySmall"
              style={[styles.yAxisLabel, { color: textColor }]}
            >
              {Math.round(maxSales * ratio)}
            </StyledText>
          ))}
        </View>
        {/* Chart bars */}
        <View style={styles.chartArea}>
          {data.map((item, index) => {
            const barHeight = (item.sales / maxSales) * chartHeight;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors[index % colors.length],
                      width: barWidth,
                    },
                  ]}
                />
                <StyledText
                  variant="bodySmall"
                  style={[styles.barLabel, { color: textColor }]}
                >
                  {item.name}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.barValue, { color: textColor }]}
                >
                  {item.sales}
                </StyledText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TopSellingProductsChart;

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
  chartContainer: {
    flexDirection: "row",
    height: 220,
    marginBottom: 20,
  },
  yAxis: {
    width: 50,
    justifyContent: "space-between",
    paddingRight: 10,
  },
  yAxisLabel: {
    textAlign: "right",
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    borderRadius: 4,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
    fontWeight: "500",
  },
  barValue: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 2,
  },
});
