/**
 * Phase 5 polish — highlight failed storage renewal.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { StorageUsageSummary } from "@/app/interfaces/seller/FulfillmentInterface";

type Props = {
  storage: StorageUsageSummary;
};

export default function StoragePastDueBanner({ storage }: Props) {
  const warningColor = useThemeColor({}, "warning");
  if (storage.status !== "past_due") return null;

  const periodLabel = storage.periodEnd
    ? new Date(storage.periodEnd).toLocaleDateString()
    : "the end of your period";

  return (
    <View
      style={[
        styles.banner,
        { borderColor: `${warningColor}55`, backgroundColor: `${warningColor}14` },
      ]}
    >
      <StyledText variant="labelLarge" style={{ color: warningColor }}>
        Storage payment past due
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: warningColor, marginTop: 4 }}>
        We could not renew your warehouse storage
        {storage.renews ? ` (due around ${periodLabel})` : ""}. Update your payment method
        or retry after fixing the card on file.
      </StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
});
