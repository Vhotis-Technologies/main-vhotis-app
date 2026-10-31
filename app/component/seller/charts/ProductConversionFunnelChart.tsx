import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ProductConversionFunnelChartProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const ProductConversionFunnelChart = ({
  data,
}: ProductConversionFunnelChartProps) => {
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

  const maxCount = Math.max(...data.map((d) => d.count));
  const chartWidth = width - 60;
  const maxBarWidth = chartWidth * 0.8;
  const barHeight = 40;
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"];

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleMedium"
        style={[styles.title, { color: textColor }]}
      >
        Product Conversion Funnel
      </StyledText>
      <View style={styles.funnelContainer}>
        {data.map((item, index) => {
          const barWidth = (item.count / maxCount) * maxBarWidth;
          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          return (
            <View key={index} style={styles.funnelStage}>
              <View style={styles.stageLabel}>
                <StyledText
                  variant="bodyMedium"
                  style={[styles.stageName, { color: textColor }]}
                >
                  {item.stage}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.stageCount, { color: textColor }]}
                >
                  {item.count}
                </StyledText>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.funnelBar,
                    {
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: colors[index % colors.length],
                      borderTopLeftRadius: isFirst ? 8 : 0,
                      borderBottomLeftRadius: isFirst ? 8 : 0,
                      borderTopRightRadius: isLast ? 8 : 0,
                      borderBottomRightRadius: isLast ? 8 : 0,
                    },
                  ]}
                />
              </View>
              {index < data.length - 1 && (
                <StyledText
                  variant="bodySmall"
                  style={[styles.conversionArrow, { color: textColor }]}
                >
                  ↓
                </StyledText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ProductConversionFunnelChart;

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
  funnelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  funnelStage: {
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  stageLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  stageName: {
    fontWeight: "500",
  },
  stageCount: {
    fontWeight: "600",
  },
  barContainer: {
    width: "100%",
    alignItems: "center",
  },
  funnelBar: {
    justifyContent: "center",
    alignItems: "center",
  },
  conversionArrow: {
    fontSize: 16,
    marginTop: 2,
  },
});
