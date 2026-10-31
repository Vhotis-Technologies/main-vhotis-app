import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type SubscriptionBillingCycle = "monthly" | "yearly";

type SubscriptionBillingToggleProps = {
  value: SubscriptionBillingCycle;
  onChange: (cycle: SubscriptionBillingCycle) => void;
  yearlySavingsLabel?: string;
};

const SubscriptionBillingToggle = ({
  value,
  onChange,
  yearlySavingsLabel,
}: SubscriptionBillingToggleProps) => {
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
      <Pressable
        onPress={() => onChange("monthly")}
        style={[
          styles.option,
          value === "monthly" && { backgroundColor: textColor },
        ]}
      >
        <StyledText
          variant="labelMedium"
          style={{
            color: value === "monthly" ? cardColor : iconMuted,
            fontWeight: value === "monthly" ? "700" : "500",
          }}
        >
          Monthly
        </StyledText>
      </Pressable>
      <Pressable
        onPress={() => onChange("yearly")}
        style={[
          styles.option,
          styles.yearlyOption,
          value === "yearly" && { backgroundColor: textColor },
        ]}
      >
        <StyledText
          variant="labelMedium"
          style={{
            color: value === "yearly" ? cardColor : iconMuted,
            fontWeight: value === "yearly" ? "700" : "500",
          }}
        >
          Annual
        </StyledText>
        {yearlySavingsLabel ? (
          <View
            style={[
              styles.savingsPill,
              {
                backgroundColor:
                  value === "yearly" ? `${cardColor}33` : `${textColor}18`,
              },
            ]}
          >
            <StyledText
              variant="labelSmall"
              style={{
                color: value === "yearly" ? cardColor : textColor,
                fontWeight: "700",
                fontSize: 10,
              }}
            >
              {yearlySavingsLabel}
            </StyledText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

export default SubscriptionBillingToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  yearlyOption: {
    flexDirection: "row",
    gap: 6,
  },
  savingsPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
