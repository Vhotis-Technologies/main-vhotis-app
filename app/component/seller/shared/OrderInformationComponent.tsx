import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "../../helpers/forms/StyledText";
import CircularProgress from "./CircularProgress";
import { OrderInformationData } from "@/app/interfaces/seller/DashboardInterfaces";

interface OrderInformationComponentProps {
  orderData: OrderInformationData;
  width: number;
  timeframe?: "weekly" | "monthly";
}

const OrderInformationComponent = ({
  orderData,
  width,
  timeframe = "weekly",
}: OrderInformationComponentProps) => {
  const circleSize = useMemo(() => {
    const size = Math.min(width * 0.4, 300);
    return Math.max(size, 150);
  }, [width]);

  const strokeWidth = useMemo(() => {
    return circleSize * 0.08;
  }, [circleSize]);

  const StatusItem = ({
    color,
    label,
    value,
  }: {
    color: string;
    label: string;
    value: number;
  }) => (
    <View style={styles.statusItem}>
      <View style={styles.labelContainer}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <StyledText variant="labelLarge" children={label} />
      </View>
      <StyledText variant="labelLarge" children={value.toLocaleString()} />
    </View>
  );

  return (
    <View style={[styles.mainContainer]}>
      {/* Chart Section */}
      <View style={styles.chartSection}>
        <CircularProgress
          size={circleSize}
          strokeWidth={strokeWidth}
          data={orderData}
        />
        <View style={styles.centerText}>
          <StyledText variant="titleMedium" children={orderData?.total || 0} />
          <StyledText variant="titleMedium" children="Total order" />
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.statusSection}>
        <StatusItem
          color="#FFD700"
          label="Shipped"
          value={orderData?.shipped || 0}
        />
        <StatusItem
          color="#4169E1"
          label="Delivered"
          value={orderData?.delivered || 0}
        />
        <StatusItem
          color="#FF4500"
          label="Returned"
          value={orderData?.returned || 0}
        />
      </View>
    </View>
  );
};

export default OrderInformationComponent;

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  chartSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 10,
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
  },
  totalNumber: {
    fontSize: 28,
    fontWeight: "600",
  },
  statusSection: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
