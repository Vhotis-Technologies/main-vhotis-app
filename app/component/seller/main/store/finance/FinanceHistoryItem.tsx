import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";

export type FinanceHistoryEntry = {
  key: string;
  title: string;
  cardLast4: string;
  amount: number;
  date: string;
  type?: "debit" | "credit";
};

type FinanceHistoryItemProps = {
  entry: FinanceHistoryEntry;
  onPress?: (entry: FinanceHistoryEntry) => void;
};

const formatAmount = (amount: number, type: "debit" | "credit") => {
  const sign = type === "debit" ? "-" : "+";
  return `${sign} ${formatCurrency(amount)}`;
};

const FinanceHistoryItem = ({ entry, onPress }: FinanceHistoryItemProps) => {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const type = entry.type ?? "debit";

  return (
    <Pressable
      onPress={onPress ? () => onPress(entry) : undefined}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.leftCol}>
        <StyledText
          variant="titleSmall"
          numberOfLines={1}
          style={[styles.title, { color: textColor }]}
        >
          {entry.title}
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.cardMask, { color: iconMuted }]}
        >
          {`**** ${entry.cardLast4}`}
        </StyledText>
      </View>

      <View style={styles.rightCol}>
        <StyledText
          variant="titleSmall"
          numberOfLines={1}
          style={[styles.amount, { color: textColor }]}
        >
          {formatAmount(entry.amount, type)}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          {entry.date}
        </StyledText>
      </View>
    </Pressable>
  );
};

export default FinanceHistoryItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 12,
  },
  leftCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: "700",
  },
  cardMask: {
    letterSpacing: 1,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontWeight: "700",
  },
});
