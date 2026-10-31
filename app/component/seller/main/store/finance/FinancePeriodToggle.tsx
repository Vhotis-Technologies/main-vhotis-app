import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type FinancePeriod = "weekly" | "monthly";

type FinancePeriodToggleProps = {
  value: FinancePeriod;
  onChange: (period: FinancePeriod) => void;
};

const PERIOD_OPTIONS: { key: FinancePeriod; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const FinancePeriodToggle = ({ value, onChange }: FinancePeriodToggleProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cardColor, borderColor },
      ]}
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.option,
              isActive && {
                backgroundColor: textColor,
              },
            ]}
          >
            <StyledText
              variant="labelMedium"
              style={{
                color: isActive ? cardColor : iconMuted,
                fontWeight: isActive ? "700" : "500",
              }}
            >
              {option.label}
            </StyledText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default FinancePeriodToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    alignSelf: "flex-start",
    gap: 4,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
});
