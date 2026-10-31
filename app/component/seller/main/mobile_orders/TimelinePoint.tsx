import { StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { TimelinePointProps } from "@/app/interfaces/seller/SharedInterfaces";
import { useThemeColor } from "@/hooks/useThemeColor";

const COMPLETED_COLOR = "#22C55E";
const CURRENT_COLOR = "#801330";
const PENDING_DOT = "#D1D5DB";
const PENDING_LINE = "#E5E7EB";

const TimelinePoint = ({
  date,
  status,
  isCompleted,
  isCurrent = false,
  isLast,
}: TimelinePointProps) => {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");

  const dotColor = isCurrent
    ? CURRENT_COLOR
    : isCompleted
      ? COMPLETED_COLOR
      : PENDING_DOT;

  const lineColor = isCompleted ? COMPLETED_COLOR : PENDING_LINE;
  const labelColor = isCurrent
    ? CURRENT_COLOR
    : isCompleted
      ? textColor
      : mutedColor;

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        {date ? (
          <>
            <StyledText
              variant="labelMedium"
              style={{ color: labelColor, fontWeight: isCurrent ? "600" : "400" }}
            >
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </StyledText>
            <StyledText
              variant="labelMedium"
              style={{ color: labelColor, fontSize: 10 }}
            >
              {date.toLocaleDateString()}
            </StyledText>
          </>
        ) : (
          <StyledText variant="labelMedium" style={{ color: mutedColor, fontSize: 10 }}>
            —
          </StyledText>
        )}
      </View>

      <View style={styles.pointContainer}>
        <View
          style={[
            styles.point,
            { backgroundColor: dotColor, borderColor: dotColor },
            isCurrent && styles.currentPoint,
          ]}
        />
        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>

      <View style={styles.statusContainer}>
        <StyledText
          variant="labelMedium"
          style={[
            styles.statusLabel,
            {
              color: labelColor,
              fontWeight: isCurrent ? "700" : isCompleted ? "500" : "400",
            },
          ]}
        >
          {status}
        </StyledText>
        {isCurrent && (
          <StyledText variant="labelMedium" style={styles.currentBadge}>
            Current
          </StyledText>
        )}
      </View>
    </View>
  );
};

export default TimelinePoint;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 56,
  },
  timeContainer: {
    width: 72,
    alignItems: "flex-end",
    marginRight: 12,
    paddingTop: 2,
  },
  pointContainer: {
    alignItems: "center",
    width: 16,
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  currentPoint: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 36,
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 12,
    flex: 1,
    paddingTop: 0,
  },
  statusLabel: {
    lineHeight: 18,
  },
  currentBadge: {
    marginTop: 2,
    color: CURRENT_COLOR,
    fontSize: 10,
    fontWeight: "600",
  },
});
