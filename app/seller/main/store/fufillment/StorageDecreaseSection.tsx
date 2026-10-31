/**
 * Phase 5 — reduce zone capacity immediately (no refund).
 */
import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import useSellerStore, { formatWalletAmount } from "@/app/hook/seller/useSellerStore";
import { useAppSelector } from "@/app/store/store";
import type { StorageUsageSummary } from "@/app/interfaces/seller/FulfillmentInterface";
import { useRequest_storage_decreaseMutation } from "@/app/store/seller/api/fulfillmentApi";

const ZONE_META: { id: "ambient" | "cold" | "frozen"; label: string }[] = [
  { id: "ambient", label: "Ambient" },
  { id: "cold", label: "Chilled" },
  { id: "frozen", label: "Frozen" },
];

function parseQty(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

type Props = {
  storage: StorageUsageSummary;
  onChanged: () => void;
};

export default function StorageDecreaseSection({ storage, onChanged }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { walletCurrency } = useSellerStore({ includeWallet: true });
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const [requestDecrease] = useRequest_storage_decreaseMutation();
  const [open, setOpen] = useState(false);
  const [ambientQty, setAmbientQty] = useState("");
  const [coldQty, setColdQty] = useState("");
  const [frozenQty, setFrozenQty] = useState("");
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

  const zoneInfo = useMemo(() => {
    const map: Record<string, { allocated: string; usedCbm: number; unit: string }> = {};
    for (const z of storage.zones) {
      map[z.zone] = {
        allocated: z.allocated,
        usedCbm: z.usedCbm,
        unit: z.unit,
      };
    }
    return map;
  }, [storage.zones]);

  const rentedZones = storage.zones.filter((z) => Number(z.allocated) > 0);

  const zonesPayload = useMemo(() => {
    const rows: { zone: "ambient" | "cold" | "frozen"; quantity: number }[] = [];
    const entries: Array<["ambient" | "cold" | "frozen", string]> = [
      ["ambient", ambientQty],
      ["cold", coldQty],
      ["frozen", frozenQty],
    ];
    for (const [zone, raw] of entries) {
      const qty = parseQty(raw);
      if (qty === null) continue;
      const current = Number(zoneInfo[zone]?.allocated ?? 0);
      if (qty < current) rows.push({ zone, quantity: qty });
    }
    return rows;
  }, [ambientQty, coldQty, frozenQty, zoneInfo]);

  if (rentedZones.length === 0) return null;

  const openPanel = () => {
    setAmbientQty(zoneInfo.ambient?.allocated ?? "");
    setColdQty(zoneInfo.cold?.allocated ?? "");
    setFrozenQty(zoneInfo.frozen?.allocated ?? "");
    setOpen(true);
  };

  const reset = () => {
    setOpen(false);
    setAmbientQty("");
    setColdQty("");
    setFrozenQty("");
  };

  const handleSubmit = () => {
    if (zonesPayload.length === 0) {
      setAlertConfig({
        title: "Reduce capacity",
        message: "Enter a lower quantity for at least one rented zone.",
        type: "warning",
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
      return;
    }
    setAlertConfig({
      title: "Confirm reduction",
      message:
        "No refund for the current period. Your next renewal will use the lower total.",
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const result = await requestDecrease({ zones: zonesPayload }).unwrap();
          reset();
          onChanged();
          setAlertConfig({
            title: "Capacity reduced",
            message: `${result.message}\n\nNext renewal: ${formatMoney(result.periodTotal, result.currency)}`,
            type: "success",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        } catch (e: unknown) {
          const msg =
            (e as { data?: { error?: string }; message?: string })?.data?.error ||
            (e as { message?: string })?.message;
          setAlertConfig({
            title: "Could not reduce",
            message: msg ?? "Please try again.",
            type: "error",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  if (!open) {
    return (
      <StyledButton
        title="Reduce capacity"
        variant="tonal"
        onPress={openPanel}
        buttonStyles={{ marginTop: 4 }}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <StyledText variant="titleMedium" style={{ color: textColor }}>
        Reduce storage capacity
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
        Set a new total per zone. Cannot go below stock in use. No refund this period.
      </StyledText>

      {ZONE_META.map((zone) => {
        const info = zoneInfo[zone.id];
        if (!info || Number(info.allocated) <= 0) return null;
        const field =
          zone.id === "ambient"
            ? { value: ambientQty, set: setAmbientQty }
            : zone.id === "cold"
              ? { value: coldQty, set: setColdQty }
              : { value: frozenQty, set: setFrozenQty };
        return (
          <View key={zone.id} style={[styles.row, { borderColor }]}>
            <View style={{ flex: 1 }}>
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                {zone.label}
              </StyledText>
              <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                Rented {info.allocated} {info.unit} · used {info.usedCbm.toFixed(2)} cbm
              </StyledText>
            </View>
            <TextInput
              value={field.value}
              onChangeText={(v) => field.set(v.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="New"
              placeholderTextColor={iconMuted}
              style={[styles.input, { color: textColor, borderColor, backgroundColor: bgColor }]}
            />
          </View>
        );
      })}

      <View style={styles.actions}>
        <StyledButton title="Cancel" variant="tonal" onPress={reset} buttonStyles={styles.btn} />
        <StyledButton
          title={submitting ? "Saving…" : "Confirm reduction"}
          variant="medium"
          onPress={handleSubmit}
          disabled={submitting || zonesPayload.length === 0}
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
  actions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: { flexGrow: 1, minWidth: 120 },
});
