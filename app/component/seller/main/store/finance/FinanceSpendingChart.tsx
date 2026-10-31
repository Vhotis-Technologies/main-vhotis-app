import React, { useMemo } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatWalletAmount } from "@/app/hook/seller/useSellerStore";
import FinancePeriodToggle, {
  FinancePeriod,
} from "./FinancePeriodToggle";

export type FinanceChartPoint = {
  label: string;
  value: number;
  displayLabel?: string;
  highlighted?: boolean;
};

type FinanceSpendingChartProps = {
  title: string;
  amount: number;
  currencyCode?: string;
  data: FinanceChartPoint[];
  period: FinancePeriod;
  onPeriodChange: (period: FinancePeriod) => void;
  isLoading?: boolean;
};

const formatBarTopLabel = (value: number) => {
  if (value >= 1000) {
    const rounded = value / 1000;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}K`;
  }
  return `${Math.round(value)}`;
};

const EMPTY_CHART: FinanceChartPoint[] = [
  { label: "—", value: 0 },
];

const FinanceSpendingChart = ({
  title,
  amount,
  currencyCode = "EUR",
  data,
  period,
  onPeriodChange,
  isLoading,
}: FinanceSpendingChartProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 32;
  const cardPadding = 40;
  const chartWidth = screenWidth - horizontalPadding - cardPadding;

  const chartPoints = data.length > 0 ? data : EMPTY_CHART;

  const maxValue = useMemo(
    () => Math.max(...chartPoints.map((point) => point.value), 1),
    [chartPoints]
  );

  const barWidth = useMemo(() => {
    const totalSpacing = (chartPoints.length - 1) * 8;
    return Math.max(
      14,
      Math.floor((chartWidth - totalSpacing - 24) / chartPoints.length)
    );
  }, [chartWidth, chartPoints.length]);

  const barData = useMemo(
    () =>
      chartPoints.map((point) => ({
        value: point.value,
        label: point.displayLabel ?? point.label,
        frontColor: point.highlighted ? `${textColor}55` : textColor,
        topLabelComponent: () => (
          <StyledText
            variant="labelSmall"
            style={[styles.topLabel, { color: iconMuted }]}
          >
            {formatBarTopLabel(point.value)}
          </StyledText>
        ),
      })),
    [chartPoints, iconMuted, textColor]
  );

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.headerRow}>
        <StyledText
          variant="bodySmall"
          numberOfLines={2}
          style={[styles.title, { color: iconMuted }]}
        >
          {title}
        </StyledText>
        <View style={styles.toggleWrap}>
          <FinancePeriodToggle value={period} onChange={onPeriodChange} />
        </View>
      </View>

      <View style={styles.amountRow}>
        {isLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <StyledText
            variant="titleLarge"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={[styles.amount, { color: textColor }]}
          >
            {formatWalletAmount(amount, undefined, currencyCode)}
          </StyledText>
        )}
      </View>

      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={chartWidth}
          height={180}
          barWidth={barWidth}
          spacing={8}
          barBorderTopLeftRadius={8}
          barBorderTopRightRadius={8}
          barBorderBottomLeftRadius={8}
          barBorderBottomRightRadius={8}
          frontColor={textColor}
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          hideYAxisText
          yAxisLabelWidth={0}
          maxValue={Math.ceil(maxValue * 1.2)}
          noOfSections={4}
          disableScroll
          xAxisLabelTextStyle={[styles.xAxisText, { color: iconMuted }]}
          labelWidth={barWidth + 4}
          initialSpacing={4}
          endSpacing={4}
        />
      </View>
    </View>
  );
};

export default FinanceSpendingChart;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 4,
  },
  toggleWrap: {
    flexShrink: 0,
  },
  amountRow: {
    width: "100%",
  },
  amount: {
    fontWeight: "800",
    letterSpacing: -1,
    width: "100%",
  },
  chartWrapper: {
    alignItems: "flex-start",
  },
  topLabel: {
    marginBottom: 4,
    fontSize: 10,
  },
  xAxisText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
});
