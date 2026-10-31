/**
 * Phase 4 — cancel or resume 30-day storage auto-renewal.
 */
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import useSellerStore, { formatWalletAmount } from "@/app/hook/seller/useSellerStore";
import { useAppSelector } from "@/app/store/store";
import type { StorageUsageSummary } from "@/app/interfaces/seller/FulfillmentInterface";
import {
  useCancel_storage_renewalMutation,
  useEnable_storage_renewalMutation,
} from "@/app/store/seller/api/fulfillmentApi";

type Props = {
  storage: StorageUsageSummary;
  onChanged: () => void;
};

export default function StorageRenewalSection({ storage, onChanged }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { walletCurrency } = useSellerStore({ includeWallet: true });
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const [cancelRenewal, { isLoading: cancelling }] = useCancel_storage_renewalMutation();
  const [enableRenewal, { isLoading: enabling }] = useEnable_storage_renewalMutation();
  const [message, setMessage] = useState("");

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const busy = cancelling || enabling;

  const sellerCountry =
    (user as { business_country?: string; address?: { country?: string } } | null)
      ?.business_country ??
    (user as { address?: { country?: string } } | null)?.address?.country;

  const periodLabel = storage.periodEnd
    ? new Date(storage.periodEnd).toLocaleDateString()
    : "—";
  const renewalAmount = formatWalletAmount(
    storage.periodTotal,
    sellerCountry,
    storage.currency || walletCurrency,
  );

  const handleToggle = () => {
    const turningOff = storage.renews;
    setAlertConfig({
      title: turningOff ? "Cancel auto-renewal?" : "Enable auto-renewal?",
      message: turningOff
        ? `You keep capacity until ${periodLabel}. No further charges after that.`
        : `You will be charged ${renewalAmount} at the end of the current period (${periodLabel}).`,
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: async () => {
        try {
          const result = turningOff
            ? await cancelRenewal().unwrap()
            : await enableRenewal().unwrap();
          setMessage(result.message);
          onChanged();
        } catch (e: unknown) {
          const msg =
            (e as { data?: { error?: string }; message?: string })?.data?.error ||
            (e as { message?: string })?.message;
          setAlertConfig({
            title: "Could not update",
            message: msg ?? "Please try again.",
            type: "error",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        }
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <StyledText variant="labelLarge" style={{ color: textColor }}>
        Auto-renewal {storage.renews ? "on" : "off"}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
        {storage.renews
          ? `Next charge ${renewalAmount} on ${periodLabel}`
          : `Access until ${periodLabel} · no further charges`}
        {storage.status === "past_due" ? " · payment past due" : ""}
      </StyledText>
      {message ? (
        <StyledText variant="labelSmall" style={{ color: iconMuted }}>
          {message}
        </StyledText>
      ) : null}
      <StyledButton
        title={
          busy
            ? "Updating…"
            : storage.renews
              ? "Cancel renewal"
              : "Enable renewal"
        }
        variant={storage.renews ? "tonal" : "medium"}
        onPress={handleToggle}
        disabled={busy}
        loading={busy}
        buttonStyles={{ marginTop: 4 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 8 },
});
