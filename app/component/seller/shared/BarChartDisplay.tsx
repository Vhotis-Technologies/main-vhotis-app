import { SalesDataPoint } from "@/app/interfaces/seller/DashboardInterfaces";
import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import StyledText from "@/app/component/helpers/forms/StyledText";

interface BarChartDisplayProps {
  width: number;
  data: SalesDataPoint[];
}

const BarChartDisplay = ({ width, data }: BarChartDisplayProps) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const screenWidth = Dimensions.get("window").width;

  // Calculate available width for bars
  const yAxisWidth = -5;
  const horizontalPadding = 10;
  const availableWidth = width - yAxisWidth - horizontalPadding * 2;

  // Calculate bar width to fit all bars without scrolling
  const totalSpacing = (data.length - 1) * 8; // Reduced spacing for better alignment
  const barWidth = Math.floor((availableWidth - totalSpacing) / data.length);

  // Calculate chart dimensions
  const chartHeight = Math.min(width * 0.8, 220);

  // Calculate y-axis intervals
  const yAxisMax = Math.ceil(maxValue * 1);

  // Format data for better visualization
  const formattedData = data.map((item) => ({
    ...item,
    value: item.value,
    frontColor: item.frontColor || "#E7EEFF",
    topLabelComponent: () => (
      <StyledText variant="labelSmall" children={`${item.value}`} />
    ),
    labelComponent: () => (
      <StyledText
        variant="labelSmall"
        numberOfLines={1}
        style={{ textAlign: "center", width: "100%" }}
      >
        {item.label}
      </StyledText>
    ),
  }));

  return (
    <View style={[styles.container, { width }]}>
      <BarChart
        data={formattedData}
        width={width}
        height={chartHeight}
        barWidth={barWidth}
        spacing={10}
        barBorderRadius={4}
        frontColor="#4B7BF5"
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={styles.yAxisText}
        xAxisLabelTextStyle={styles.xAxisText}
        hideRules={true}
        rulesColor="#E5E5E5"
        maxValue={yAxisMax}
        noOfSections={5}
        yAxisLabelWidth={yAxisWidth}
        labelWidth={barWidth + 2}
        hideYAxisText={true}
        yAxisLabelSuffix=""
        yAxisLabelPrefix=""
        disableScroll={true}
        rotateLabel={false}
      />
    </View>
  );
};

export default BarChartDisplay;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignSelf: "center",
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
  },
  topLabel: {
    color: "#666",
    fontSize: 10,
    marginBottom: 4,
  },
  label: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  yAxisText: {
    color: "#666",
    fontSize: 10,
    marginRight: 4,
  },
  xAxisText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
