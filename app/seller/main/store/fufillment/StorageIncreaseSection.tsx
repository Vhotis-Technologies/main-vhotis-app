/**
 * Phase 3 — add zone capacity mid-period and pay via Stripe PaymentSheet.
 */
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import useSellerStore, { formatWalletAmount } from "@/app/hook/seller/useSellerStore";
import { useAppSelector } from "@/app/store/store";
import type { StorageUsageSummary } from "@/app/interfaces/seller/FulfillmentInterface";
import {
  useQuote_storage_increaseMutation,
  useRequest_storage_increaseMutation,
  type StorageIncreaseQuote,
} from "@/app/store/seller/api/fulfillmentApi";

const ZONE_META: { id: "ambient" | "cold" | "frozen"; label: string }[] = [
  { id: "ambient", label: "Ambient" },
  { id: "cold", label: "Chilled" },
  { id: "frozen", label: "Frozen" },
];

function parseQty(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type Props = {
  storage: StorageUsageSummary;
  onPaid: () => void;
};

export default function StorageIncreaseSection({ storage, onPaid }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { walletCurrency } = useSellerStore({ includeWallet: true });
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [quoteIncrease] = useQuote_storage_increaseMutation();
  const [requestIncrease] = useRequest_storage_increaseMutation();

  const [open, setOpen] = useState(false);
  const [ambientAdd, setAmbientAdd] = useState("");
  const [coldAdd, setColdAdd] = useState("");
  const [frozenAdd, setFrozenAdd] = useState("");
  const [quote, setQuote] = useState<StorageIncreaseQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");

  const sellerCountry =
    (user as { business_country?: string; address?: { country?: string } } | null)
      ?.business_country ??
    (user as { address?: { country?: string } } | null)?.address?.country;

  const formatMoney = (amount: string | number, currency = walletCurrency) =>
    formatWalletAmount(amount, sellerCountry, currency);

  const zones = useMemo(
    () =>
      [
        { zone: "ambient" as const, quantity: parseQty(ambientAdd) },
        { zone: "cold" as const, quantity: parseQty(coldAdd) },
        { zone: "frozen" as const, quantity: parseQty(frozenAdd) },
      ].filter((z) => z.quantity > 0),
    [ambientAdd, coldAdd, frozenAdd],
  );

  const currentByZone = useMemo(() => {
    const map: Record<string, string> = {};
    for (const z of storage.zones) map[z.zone] = z.allocated;
    return map;
  }, [storage.zones]);

  useEffect(() => {
    if (!open || zones.length === 0) {
      if (zones.length === 0) setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    void quoteIncrease({ zones })
      .unwrap()
      .then((result) => {
        if (!cancelled) setQuote(result);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, zones, quoteIncrease]);

  const reset = () => {
    setOpen(false);
    setQuote(null);
    setAmbientAdd("");
    setColdAdd("");
    setFrozenAdd("");
  };

  const openPaymentSheet = async (
    clientSecret: string,
    customer?: string,
    ephemeralKey?: string,
  ) => {
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "Vhotis",
      paymentIntentClientSecret: clientSecret,
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      returnURL: "vhotis://payment-success",
      allowsDelayedPaymentMethods: true,
    });
    if (initError) {
      throw new Error(initError.message || "Could not start payment.");
    }
    const { error: payError } = await presentPaymentSheet();
    if (payError) {
      if (payError.code === "Canceled") return false;
      throw new Error(payError.message || "Payment failed.");
    }
    return true;
  };

  const handlePay = async () => {
    if (zones.length === 0) {
      setAlertConfig({
        title: "Add capacity",
        message: "Enter additional capacity for at least one zone.",
        type: "warning",
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestIncrease({ zones }).unwrap();
      if (!result.payment.clientSecret) {
        throw new Error("Payment could not be started.");
      }
      const paid = await openPaymentSheet(
        result.payment.clientSecret,
        result.payment.customer,
        result.payment.ephemeralKey,
      );
      if (!paid) {
        setAlertConfig({
          title: "Payment cancelled",
          message:
            "Your increase was saved as pending. Complete payment to add capacity.",
          type: "warning",
          isVisible: true,
          onConfirm: () => setIsVisible(false),
        });
        return;
      }
      reset();
      onPaid();
      setAlertConfig({
        title: "Payment received",
        message:
          "Capacity will update once payment confirms. Pull to refresh if needed.",
        type: "success",
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
    } catch (e: unknown) {
      const msg =
        (e as { data?: { error?: string }; message?: string })?.data?.error ||
        (e as { message?: string })?.message;
      setAlertConfig({
        title: "Could not complete",
        message: msg ?? "Please try again.",
        type: "error",
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <StyledButton
        title="Add capacity"
        variant="tonal"
        onPress={() => setOpen(true)}
        buttonStyles={{ marginTop: 4 }}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <StyledText variant="titleMedium" style={{ color: textColor }}>
        Add storage capacity
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 4 }}>
        Prorated for remaining days. Renewal uses the new 30-day total.
      </StyledText>

      {ZONE_META.map((zone) => {
        const field =
          zone.id === "ambient"
            ? { value: ambientAdd, set: setAmbientAdd }
            : zone.id === "cold"
              ? { value: coldAdd, set: setColdAdd }
              : { value: frozenAdd, set: setFrozenAdd };
        return (
          <View key={zone.id} style={[styles.row, { borderColor }]}>
            <View style={{ flex: 1 }}>
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                {zone.label}
              </StyledText>
              <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                Currently {currentByZone[zone.id] ?? "0"} {storage.spaceUnit}
              </StyledText>
            </View>
            <TextInput
              value={field.value}
              onChangeText={(v) => field.set(v.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="Add"
              placeholderTextColor={iconMuted}
              style={[styles.input, { color: textColor, borderColor, backgroundColor: bgColor }]}
            />
          </View>
        );
      })}

      {quoteLoading ? (
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          Calculating quote…
        </StyledText>
      ) : quote ? (
        <View style={[styles.quote, { borderColor }]}>
          {quote.lines.map((line) => (
            <View key={line.zone} style={styles.quoteRow}>
              <StyledText variant="bodySmall" style={{ color: iconMuted }}>
                {line.zone} +{line.quantityDelta} {line.unit}
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: textColor }}>
                {formatMoney(line.proratedLineTotal, quote.currency)}
              </StyledText>
            </View>
          ))}
          <View style={[styles.quoteRow, styles.quoteTotal]}>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              Due now ({quote.daysRemaining}d left)
            </StyledText>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {formatMoney(quote.amountDue, quote.currency)}
            </StyledText>
          </View>
          <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 4 }}>
            Next renewal: {formatMoney(quote.newPeriodTotal, quote.currency)} / 30 days
          </StyledText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <StyledButton title="Cancel" variant="tonal" onPress={reset} buttonStyles={styles.btn} />
        <StyledButton
          title={submitting ? "Processing…" : "Pay for increase"}
          variant="medium"
          onPress={() => void handlePay()}
          disabled={submitting || zones.length === 0}
          loading={submitting}
          buttonStyles={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  input: {
    width: 72,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 16,
  },
  quote: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteTotal: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: { flexGrow: 1, minWidth: 120 },
});
