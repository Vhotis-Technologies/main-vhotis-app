import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { FunnelChartProps } from "@/app/interfaces/seller/StoreInterfaces";

const { width } = Dimensions.get("window");

const FunnelChart = ({ data }: FunnelChartProps) => {
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
  const chartWidth = width - 80;
  const maxBarWidth = chartWidth * 0.85;
  const barHeight = 50;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getBarWidth = (count: number) => {
    return (count / maxCount) * maxBarWidth;
  };

  const getBarColor = (index: number) => {
    const colors = [
      "#10B981", // Green for first stage
      "#3B82F6", // Blue
      "#F59E0B", // Amber
      "#EF4444", // Red
      "#8B5CF6", // Purple
    ];
    return colors[index % colors.length];
  };

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round((current / previous) * 100);
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor },
      ]}
    >
      {/* Header with title and summary */}
      <View style={styles.header}>
        <StyledText
          variant="titleMedium"
          style={[styles.title, { color: textColor }]}
        >
          Conversion Funnel
        </StyledText>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Total Visitors
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatNumber(data[0]?.count || 0)}
            </StyledText>
          </View>
          <View style={styles.summaryItem}>
            <StyledText
              variant="bodySmall"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Conversion Rate
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: "#10B981" }]}
            >
              {data[data.length - 1]?.conversionRate || 0}%
            </StyledText>
          </View>
        </View>
      </View>

      {/* Modern funnel visualization */}
      <View style={styles.funnelContainer}>
        {data.map((item, index) => {
          const barWidth = getBarWidth(item.count);
          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          const previousCount = index > 0 ? data[index - 1].count : item.count;
          const stageConversionRate = getConversionRate(
            item.count,
            previousCount
          );

          return (
            <View key={index} style={styles.funnelStage}>
              {/* Stage info with modern layout */}
              <View style={styles.stageInfo}>
                <View style={styles.stageLabel}>
                  <StyledText
                    variant="bodyMedium"
                    style={[styles.stageName, { color: textColor }]}
                  >
                    {item.stage}
                  </StyledText>
                  <View style={styles.stageStats}>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.stageCount, { color: textColor }]}
                    >
                      {formatNumber(item.count)}
                    </StyledText>
                    <View
                      style={[
                        styles.conversionBadge,
                        { backgroundColor: getBarColor(index) },
                      ]}
                    >
                      <StyledText
                        variant="bodySmall"
                        style={styles.conversionBadgeText}
                      >
                        {item.conversionRate}%
                      </StyledText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Modern funnel bar with gradient effect */}
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.funnelBar,
                    {
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: getBarColor(index),
                      borderTopLeftRadius: isFirst ? 12 : 6,
                      borderBottomLeftRadius: isFirst ? 12 : 6,
                      borderTopRightRadius: isLast ? 12 : 6,
                      borderBottomRightRadius: isLast ? 12 : 6,
                      shadowColor: getBarColor(index),
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4,
                    },
                  ]}
                >
                  <View style={styles.barContent}>
                    <StyledText variant="bodySmall" style={styles.barText}>
                      {formatNumber(item.count)}
                    </StyledText>
                  </View>
                </View>
              </View>

              {/* Conversion flow indicator */}
              {index < data.length - 1 && (
                <View style={styles.flowIndicator}>
                  <View
                    style={[styles.flowLine, { borderColor: borderColor }]}
                  />
                  <View
                    style={[
                      styles.flowArrow,
                      { backgroundColor: getBarColor(index + 1) },
                    ]}
                  >
                    <StyledText style={styles.flowArrowText}>↓</StyledText>
                  </View>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.flowText, { color: textColor }]}
                  >
                    {stageConversionRate}% continue
                  </StyledText>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Modern legend with improved layout */}
      <View style={styles.legend}>
        <StyledText
          variant="bodySmall"
          style={[styles.legendTitle, { color: textColor }]}
        >
          Conversion Stages
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
                {item.stage}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={[styles.legendPercentage, { color: textColor }]}
              >
                {item.conversionRate}%
              </StyledText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FunnelChart;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 24,
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
  funnelContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  funnelStage: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  stageInfo: {
    width: "100%",
    marginBottom: 8,
  },
  stageLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  stageName: {
    fontWeight: "600",
    fontSize: 16,
  },
  stageStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageCount: {
    fontWeight: "700",
    fontSize: 14,
  },
  conversionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  conversionBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10,
  },
  barContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  funnelBar: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  barContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  barText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  flowIndicator: {
    alignItems: "center",
    marginTop: 8,
  },
  flowLine: {
    width: 2,
    height: 20,
    borderLeftWidth: 1,
    opacity: 0.3,
  },
  flowArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  flowArrowText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  flowText: {
    fontSize: 10,
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
