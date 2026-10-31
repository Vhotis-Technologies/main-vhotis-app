import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";

type QuickAmount = { key: string; label: string; fraction: number };

const QUICK_AMOUNTS: QuickAmount[] = [
  { key: "25", label: "25%", fraction: 0.25 },
  { key: "50", label: "50%", fraction: 0.5 },
  { key: "max", label: "Max", fraction: 1 },
];

type WithdrawAmountInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  availableBalance: number;
  errorMessage?: string;
};

const sanitizeAmount = (input: string) => {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
};

const WithdrawAmountInput = ({
  value,
  onChangeValue,
  availableBalance,
  errorMessage,
}: WithdrawAmountInputProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const errorColor = useThemeColor({}, "error");

  const applyQuickAmount = (fraction: number) => {
    const next = (availableBalance * fraction).toFixed(2);
    const trimmed = next.endsWith(".00") ? next.slice(0, -3) : next;
    onChangeValue(trimmed);
  };

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
        Amount to withdraw
      </StyledText>

      <View style={styles.amountRow}>
        <TextInput
          value={value}
          onChangeText={(input) => onChangeValue(sanitizeAmount(input))}
          placeholder="0.00"
          placeholderTextColor={iconMuted}
          keyboardType="decimal-pad"
          style={[styles.amountInput, { color: textColor }]}
          maxLength={12}
        />
      </View>

      <StyledText
        variant="bodySmall"
        style={[styles.balanceHint, { color: iconMuted }]}
      >
        {`Available ${formatCurrency(availableBalance)}`}
      </StyledText>

      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => applyQuickAmount(option.fraction)}
            style={({ pressed }) => [
              styles.quickPill,
              { borderColor, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <StyledText variant="labelMedium" style={{ color: textColor }}>
              {option.label}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {errorMessage ? (
        <StyledText
          variant="bodySmall"
          style={[styles.error, { color: errorColor }]}
        >
          {errorMessage}
        </StyledText>
      ) : null}
    </View>
  );
};

export default WithdrawAmountInput;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  currencyPrefix: {
    fontWeight: "700",
    marginRight: 6,
    marginBottom: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    padding: 0,
    margin: 0,
  },
  balanceHint: {
    marginTop: -4,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  quickPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  error: {
    marginTop: 4,
  },
});
