import React from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import type { PayoutMethod } from "@/app/interfaces/seller/FinanceInterface";

type WithdrawReviewCardProps = {
  amount: number;
  fee: number;
  netAmount: number;
  feeRateLabel?: string;
  etaDays: number;
  method?: PayoutMethod | null;
};

const ReviewRow = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) => {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View style={styles.row}>
      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
        {label}
      </StyledText>
      <StyledText
        variant={emphasis ? "titleMedium" : "bodyMedium"}
        style={{
          color: textColor,
          fontWeight: emphasis ? "800" : "600",
        }}
      >
        {value}
      </StyledText>
    </View>
  );
};

const WithdrawReviewCard = ({
  amount,
  fee,
  netAmount,
  feeRateLabel,
  etaDays,
  method,
}: WithdrawReviewCardProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  const etaLabel =
    etaDays <= 0
      ? "Instant"
      : etaDays === 1
      ? "1 business day"
      : `${etaDays} business days`;

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <ReviewRow label="Amount" value={formatCurrency(amount)} />
      <ReviewRow
        label={feeRateLabel ? `Fee (${feeRateLabel})` : "Fee"}
        value={formatCurrency(fee)}
      />
      <View style={[styles.divider, { backgroundColor: borderColor }]} />
      <ReviewRow
        label="You'll receive"
        value={formatCurrency(netAmount)}
        emphasis
      />
      <ReviewRow
        label="Payout to"
        value={method ? `${method.label} **** ${method.last4}` : "—"}
      />
      <ReviewRow label="Estimated arrival" value={etaLabel} />
    </View>
  );
};

export default WithdrawReviewCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    opacity: 0.6,
  },
});
