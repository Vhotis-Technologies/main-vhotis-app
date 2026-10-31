import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { HeatMapChartProps } from "@/app/interfaces/seller/StoreInterfaces";
import { formatCurrency } from "@/app/_utils/main/helpers";

const { width } = Dimensions.get("window");

const HeatMapChart = ({ data }: HeatMapChartProps) => {
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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxSales = Math.max(...data.map((d) => d.sales));
  const cellSize = Math.min((width - 120) / 8, 30); // 8 columns (7 days + hour labels)

  const getCellColor = (sales: number) => {
    const intensity = sales / maxSales;
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(76, 175, 80, ${alpha})`; // Green with varying opacity
  };

  const getCellData = (day: number, hour: number) => {
    return data.find((d) => d.dayOfWeek === day && d.hour === hour)?.sales || 0;
  };

  return (
    <View style={styles.container}>
      <StyledText
        variant="titleMedium"
        style={[styles.title, { color: textColor }]}
      >
        Sales Heat Map (Day vs Hour)
      </StyledText>

      <View style={styles.heatMapContainer}>
        {/* Hour labels */}
        <View style={styles.hourLabels}>
          <View style={styles.cornerCell} />
          {daysOfWeek.map((day, index) => (
            <View key={index} style={[styles.labelCell, { width: cellSize }]}>
              <StyledText
                variant="bodySmall"
                style={[styles.labelText, { color: textColor }]}
              >
                {day}
              </StyledText>
            </View>
          ))}
        </View>

        {/* Heat map grid */}
        {hours.map((hour) => (
          <View key={hour} style={styles.row}>
            <View style={[styles.labelCell, { width: 50 }]}>
              <StyledText
                variant="bodySmall"
                style={[styles.labelText, { color: textColor }]}
              >
                {hour}:00
              </StyledText>
            </View>
            {daysOfWeek.map((_, dayIndex) => {
              const sales = getCellData(dayIndex, hour);
              return (
                <View
                  key={dayIndex}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getCellColor(sales),
                    },
                  ]}
                >
                  {sales > 0 && (
                    <StyledText variant="bodySmall" style={styles.cellText}>
                      {formatCurrency(sales)}
                    </StyledText>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <StyledText
          variant="bodySmall"
          style={{ color: textColor, marginBottom: 5 }}
        >
          Sales Intensity:
        </StyledText>
        <View style={styles.legendGradient}>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <View
              key={index}
              style={[
                styles.legendCell,
                {
                  backgroundColor: getCellColor(maxSales * intensity),
                  width: 20,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.legendLabels}>
          <StyledText
            variant="bodySmall"
            style={{ color: textColor, fontSize: 10 }}
          >
            Low
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: textColor, fontSize: 10 }}
          >
            High
          </StyledText>
        </View>
      </View>
    </View>
  );
};

export default HeatMapChart;

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
  heatMapContainer: {
    marginBottom: 20,
  },
  hourLabels: {
    flexDirection: "row",
    marginBottom: 5,
  },
  cornerCell: {
    width: 50,
  },
  labelCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 10,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
    gap:5
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 8,
    color: "#000",
    fontWeight: "500",
  },
  legend: {
    alignItems: "center",
    marginTop: 10,
  },
  legendGradient: {
    flexDirection: "row",
    marginBottom: 5,
  },
  legendCell: {
    height: 15,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
  },
});
