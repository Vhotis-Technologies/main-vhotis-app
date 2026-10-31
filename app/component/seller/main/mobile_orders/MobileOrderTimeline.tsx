import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import TimelinePoint from "./TimelinePoint";
import StyledText from "@/app/component/helpers/forms/StyledText";
import {
  buildSellerOrderTimeline,
  getSellerTimelineStatusLabel,
  SellerTimelineInput,
} from "./sellerOrderTimeline";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  order: SellerTimelineInput;
  orderLabel?: string;
}

const MobileOrderTimeline = ({ order, orderLabel }: Props) => {
  const mutedText = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  const steps = useMemo(() => buildSellerOrderTimeline(order), [order]);
  const statusLabel = useMemo(
    () => orderLabel ?? getSellerTimelineStatusLabel(order),
    [order, orderLabel],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerSection, { borderBottomColor: borderColor }]}>
        <StyledText variant="titleMedium">Order Timeline</StyledText>
        <View style={styles.headerMeta}>
          <StyledText variant="labelMedium" style={{ color: mutedText }}>
            {statusLabel}
          </StyledText>
        </View>
      </View>

      <View style={styles.timelineList}>
        {steps.map((step, index) => (
          <TimelinePoint
            key={step.key}
            date={step.date}
            status={step.label}
            isCompleted={step.isCompleted}
            isCurrent={step.isCurrent}
            isLast={index === steps.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

export default MobileOrderTimeline;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: "55%",
  },
  timelineList: {
    paddingTop: 4,
  },
});
