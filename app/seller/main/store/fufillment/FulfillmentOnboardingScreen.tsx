/**
 * Fulfillment enrollment — warehouse + per-zone storage + pay-now (Phase 1).
 */
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import { canApplyForFulfillment } from "@/app/_utils/seller/fulfillmentAccess";
import useSellerStore, {
  formatWalletAmount,
} from "@/app/hook/seller/useSellerStore";
import { useAppSelector, RootState } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import {
  FULFILLMENT_STATUS_LABELS,
  type FulfillmentEnrollmentStatus,
} from "@/app/interfaces/seller/FulfillmentInterface";
import {
  useGet_fulfillment_warehousesQuery,
  useGet_storage_ratesQuery,
  useQuote_storageMutation,
  type StorageQuote,
} from "@/app/store/seller/api/fulfillmentApi";

const INBOUND_OPTIONS = [
  {
    id: "seller_delivery" as const,
    title: "I will deliver stock to the warehouse",
    detail: "Drop off at the hub during receiving hours.",
  },
  {
    id: "vhotis_collection" as const,
    title: "Request a Vhotis collection",
    detail: "We pick up from your location (collection fee applies).",
  },
];

const ZONE_META: { id: "ambient" | "cold" | "frozen"; label: string; hint: string }[] = [
  { id: "ambient", label: "Ambient", hint: "Room-temperature goods" },
  { id: "cold", label: "Chilled", hint: "Refrigerated zone" },
  { id: "frozen", label: "Frozen", hint: "Freezer zone" },
];

const STEP_LABELS = ["Overview", "Warehouse", "Space", "Inbound", "Review"];

type SpaceUnit = "cbm" | "pallet";

type FormState = {
  warehouseId: string;
  spaceUnit: SpaceUnit;
  ambientQty: string;
  coldQty: string;
  frozenQty: string;
  inboundMethod: "seller_delivery" | "vhotis_collection";
};

const FALLBACK_WAREHOUSES = [
  { id: "ldn-01", name: "Vhotis London Hub", region: "Greater London" },
  { id: "dub-01", name: "Vhotis Dublin Hub", region: "Leinster" },
];

const emptyForm: FormState = {
  warehouseId: FALLBACK_WAREHOUSES[0].id,
  spaceUnit: "cbm",
  ambientQty: "2",
  coldQty: "0",
  frozenQty: "0",
  inboundMethod: INBOUND_OPTIONS[0].id,
};

function parseQty(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function StatusBadge({ status }: { status: FulfillmentEnrollmentStatus }) {
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const iconMuted = useThemeColor({}, "icons");
  const color =
    status === "active"
      ? successColor
      : status === "pending"
        ? warningColor
        : iconMuted;

  return (
    <View
      style={[
        styles.badge,
        { borderColor: `${color}55`, backgroundColor: `${color}14` },
      ]}
    >
      <StyledText variant="labelSmall" style={{ color }}>
        {FULFILLMENT_STATUS_LABELS[status]}
      </StyledText>
    </View>
  );
}

const FulfillmentOnboardingScreen = () => {
  useRequireSellerOwner();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((s: RootState) => s.auth.user) as Seller | null;
  const { walletCurrency } = useSellerStore({ includeWallet: true });
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { status, submitApplication, refresh } = useFulfillmentStatus();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<StorageQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const { data: warehouseData } = useGet_fulfillment_warehousesQuery();
  const { data: ratesData } = useGet_storage_ratesQuery(walletCurrency);
  const [quoteStorage] = useQuote_storageMutation();

  const warehouses = warehouseData?.warehouses?.length
    ? warehouseData.warehouses.map((w) => ({
        id: w.code,
        name: w.name,
        region: w.city,
      }))
    : FALLBACK_WAREHOUSES;

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");

  const zones = useMemo(
    () =>
      ZONE_META.map((z) => ({
        zone: z.id,
        quantity: parseQty(
          z.id === "ambient"
            ? form.ambientQty
            : z.id === "cold"
              ? form.coldQty
              : form.frozenQty,
        ),
      })).filter((z) => z.quantity > 0),
    [form.ambientQty, form.coldQty, form.frozenQty],
  );

  const totalQty = zones.reduce((sum, z) => sum + z.quantity, 0);

  useEffect(() => {
    if (warehouses.length && !warehouses.some((w) => w.id === form.warehouseId)) {
      setForm((prev) => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, form.warehouseId]);

  useEffect(() => {
    if (status === "active") {
      router.replace("/seller/main/store/fufillment/FulfillmentDashboardScreen");
    }
  }, [status]);

  useEffect(() => {
    if (step < 3) return;
    if (totalQty <= 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    void quoteStorage({
      space_unit: form.spaceUnit,
      zones,
      currency: walletCurrency,
    })
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
  }, [step, form.spaceUnit, zones, walletCurrency, totalQty, quoteStorage]);

  const rateFor = (zone: string) =>
    ratesData?.rates.find((r) => r.zone === zone && r.unit === form.spaceUnit);

  const sellerCountry = user?.business_country ?? user?.address?.country;

  const formatMoney = (amount: string | number, currency = walletCurrency) =>
    formatWalletAmount(amount, sellerCountry, currency);

  if (status === "active") {
    return null;
  }

  if (status === "none" && !canApplyForFulfillment(user)) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
      >
        <StatusBadge status="none" />
        <StyledText variant="headlineSmall" style={{ color: textColor, marginTop: 16 }}>
          Upgrade to apply
        </StyledText>
        <StyledText variant="bodyMedium" style={{ color: iconMuted, marginTop: 8 }}>
          Vhotis Fulfillment is available on Enterprise and above. Upgrade your
          subscription to rent warehouse space and let us handle storage, picking,
          and shipping.
        </StyledText>
        <StyledButton
          title="View plans"
          onPress={() => router.push("/seller/main/store/SubscriptionScreen")}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    );
  }

  const warehouse = warehouses.find((w) => w.id === form.warehouseId);
  const inbound = INBOUND_OPTIONS.find((o) => o.id === form.inboundMethod);

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

  const handleSubmit = async () => {
    if (totalQty <= 0) {
      setAlertConfig({
        title: "Storage required",
        message: "Enter quantity for at least one temperature zone.",
        type: "warning",
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
      return;
    }
    setSubmitting(true);
    try {
      const { payment } = await submitApplication({
        warehouse_code: form.warehouseId,
        space_unit: form.spaceUnit,
        inbound_method: form.inboundMethod,
        zones,
      });
      if (!payment.clientSecret) {
        throw new Error("Payment could not be started. Try again.");
      }
      const paid = await openPaymentSheet(
        payment.clientSecret,
        payment.customer,
        payment.ephemeralKey,
      );
      if (!paid) {
        setAlertConfig({
          title: "Payment cancelled",
          message:
            "Your application is saved. Complete payment to activate storage.",
          type: "warning",
          isVisible: true,
          onConfirm: () => setIsVisible(false),
        });
        await refresh();
        return;
      }
      await refresh();
      setAlertConfig({
        title: "Payment received",
        message:
          "Storage will activate once payment confirms. Our team will review your application.",
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

  const renderChoice = (
    index: number,
    selected: boolean,
    title: string,
    detail: string,
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      key={index}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: cardColor,
          borderColor: selected ? tintColor : borderColor,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <StyledText variant="titleSmall" style={{ color: textColor }}>
        {title}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
        {detail}
      </StyledText>
    </Pressable>
  );

  if (status === "pending") {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
      >
        <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
          <StatusBadge status={status} />
          <StyledText variant="titleMedium" style={{ color: textColor, marginTop: 16 }}>
            Application submitted
          </StyledText>
          <StyledText variant="bodyMedium" style={{ color: iconMuted, marginTop: 8 }}>
            Storage activates after payment confirms. Our team will then approve your
            warehouse access.
          </StyledText>
          <StyledButton
            title="Back to My Business"
            variant="tonal"
            onPress={() => router.replace("/seller/main/store/StoreScreen")}
            buttonStyles={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 24 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StyledText variant="labelMedium" style={{ color: iconMuted }}>
        Apply for Vhotis Fulfillment
      </StyledText>
      <StyledText variant="titleLarge" style={{ color: textColor, marginTop: 4 }}>
        Hands-off warehousing
      </StyledText>
      <StyledText variant="bodyMedium" style={{ color: iconMuted, marginTop: 8 }}>
        Rent space by temperature zone — pay for 30 days upfront, then renew.
      </StyledText>

      <View style={styles.stepRow}>
        {STEP_LABELS.map((label, index) => {
          const n = index + 1;
          const active = n === step;
          const done = n < step;
          return (
            <View
              key={label}
              style={[
                styles.stepPill,
                {
                  borderColor: active || done ? tintColor : borderColor,
                  backgroundColor: active ? `${tintColor}14` : cardColor,
                },
              ]}
            >
              <StyledText
                variant="labelSmall"
                style={{ color: active || done ? textColor : iconMuted }}
              >
                {n}. {label}
              </StyledText>
            </View>
          );
        })}
      </View>

      <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
        {step === 1 ? (
          <>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              What you get
            </StyledText>
            <StyledText variant="bodyMedium" style={{ color: iconMuted, marginTop: 8 }}>
              Send inventory to Vhotis and we handle storage, pick-and-pack, and rider
              handoff. Storage is billed per zone for 30 days. Amounts in {walletCurrency}.
            </StyledText>
            <View style={styles.feeGrid}>
              {[
                ["Collection", "Inbound pickup fee"],
                ["Storage", "Per zone / 30 days"],
                ["Fulfillment", "Per pick & pack"],
                ["Order fee", "Per fulfilled order"],
              ].map(([title, detail]) => (
                <View key={title} style={[styles.feeCard, { borderColor }]}>
                  <StyledText variant="labelLarge" style={{ color: textColor }}>
                    {title}
                  </StyledText>
                  <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 4 }}>
                    {detail}
                  </StyledText>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              Choose a warehouse
            </StyledText>
            <View style={styles.choiceList}>
              {warehouses.map((wh, index) =>
                renderChoice(
                  index,
                  form.warehouseId === wh.id,
                  wh.name,
                  wh.region,
                  () => setForm((prev) => ({ ...prev, warehouseId: wh.id })),
                ),
              )}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              Rent storage by zone
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
              Choose cbm or pallet, then enter how much you need in each temperature zone.
            </StyledText>

            <View style={styles.unitRow}>
              {(["cbm", "pallet"] as SpaceUnit[]).map((unit) => {
                const selected = form.spaceUnit === unit;
                return (
                  <Pressable
                    key={unit}
                    onPress={() => setForm((prev) => ({ ...prev, spaceUnit: unit }))}
                    style={[
                      styles.unitChip,
                      {
                        borderColor: selected ? tintColor : borderColor,
                        backgroundColor: selected ? `${tintColor}14` : cardColor,
                      },
                    ]}
                  >
                    <StyledText
                      variant="labelLarge"
                      style={{ color: selected ? textColor : iconMuted }}
                    >
                      {unit === "cbm" ? "Cubic metres" : "Pallets"}
                    </StyledText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.zoneList}>
              {ZONE_META.map((zone) => {
                const field =
                  zone.id === "ambient"
                    ? "ambientQty"
                    : zone.id === "cold"
                      ? "coldQty"
                      : "frozenQty";
                const rate = rateFor(zone.id);
                return (
                  <View key={zone.id} style={[styles.zoneRow, { borderColor }]}>
                    <View style={{ flex: 1 }}>
                      <StyledText variant="titleSmall" style={{ color: textColor }}>
                        {zone.label}
                      </StyledText>
                      <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 2 }}>
                        {zone.hint}
                        {rate
                          ? ` · ${formatMoney(rate.amount, rate.currency)} / ${form.spaceUnit}`
                          : ""}
                      </StyledText>
                    </View>
                    <TextInput
                      value={form[field]}
                      onChangeText={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          [field]: v.replace(/[^0-9.]/g, ""),
                        }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={iconMuted}
                      style={[
                        styles.qtyInput,
                        { color: textColor, borderColor, backgroundColor },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {quoteLoading ? (
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 12 }}>
                Calculating quote…
              </StyledText>
            ) : quote ? (
              <View style={[styles.quoteBox, { borderColor }]}>
                {quote.lines.map((line) => (
                  <View key={`${line.zone}-${line.unit}`} style={styles.quoteRow}>
                    <StyledText variant="bodySmall" style={{ color: iconMuted }}>
                      {line.zone} · {line.quantity} {line.unit}
                    </StyledText>
                    <StyledText variant="bodySmall" style={{ color: textColor }}>
                      {formatMoney(line.lineTotal, quote.currency)}
                    </StyledText>
                  </View>
                ))}
                <View style={[styles.quoteRow, styles.quoteTotal]}>
                  <StyledText variant="labelLarge" style={{ color: textColor }}>
                    Due now (30 days)
                  </StyledText>
                  <StyledText variant="labelLarge" style={{ color: textColor }}>
                    {formatMoney(quote.periodTotal, quote.currency)}
                  </StyledText>
                </View>
              </View>
            ) : totalQty <= 0 ? (
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 12 }}>
                Enter a quantity greater than zero for at least one zone.
              </StyledText>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              How will stock arrive?
            </StyledText>
            <View style={styles.choiceList}>
              {INBOUND_OPTIONS.map((opt, index) =>
                renderChoice(
                  index,
                  form.inboundMethod === opt.id,
                  opt.title,
                  opt.detail,
                  () => setForm((prev) => ({ ...prev, inboundMethod: opt.id })),
                ),
              )}
            </View>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              Review & pay
            </StyledText>
            <View style={styles.reviewBlock}>
              <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                Warehouse
              </StyledText>
              <StyledText variant="bodyLarge" style={{ color: textColor }}>
                {warehouse?.name}
              </StyledText>
              <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 12 }}>
                Storage ({form.spaceUnit})
              </StyledText>
              {zones.length ? (
                zones.map((z) => (
                  <StyledText key={z.zone} variant="bodyLarge" style={{ color: textColor }}>
                    {z.zone}: {z.quantity} {form.spaceUnit}
                  </StyledText>
                ))
              ) : (
                <StyledText variant="bodyLarge" style={{ color: textColor }}>
                  No zones selected
                </StyledText>
              )}
              {quote ? (
                <StyledText variant="titleSmall" style={{ color: textColor, marginTop: 8 }}>
                  Total due now: {formatMoney(quote.periodTotal, quote.currency)}
                </StyledText>
              ) : null}
              <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 12 }}>
                Inbound
              </StyledText>
              <StyledText variant="bodyLarge" style={{ color: textColor }}>
                {inbound?.title}
              </StyledText>
            </View>
          </>
        ) : null}

        <View style={styles.actions}>
          {step > 1 ? (
            <StyledButton
              title="Back"
              variant="tonal"
              onPress={() => setStep((s) => s - 1)}
              buttonStyles={styles.actionBtn}
            />
          ) : null}
          {step < 5 ? (
            <StyledButton
              title="Continue"
              variant="medium"
              onPress={() => {
                if (step === 3 && totalQty <= 0) {
                  setAlertConfig({
                    title: "Storage required",
                    message:
                      "Enter quantity for at least one temperature zone.",
                    type: "warning",
                    isVisible: true,
                    onConfirm: () => setIsVisible(false),
                  });
                  return;
                }
                setStep((s) => s + 1);
              }}
              buttonStyles={styles.actionBtn}
            />
          ) : (
            <StyledButton
              title={submitting ? "Processing…" : "Pay & submit"}
              variant="medium"
              onPress={() => void handleSubmit()}
              disabled={submitting || totalQty <= 0}
              loading={submitting}
              buttonStyles={styles.actionBtn}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  panel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  stepRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  stepPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  feeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  feeCard: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  choiceList: { gap: 10, marginTop: 12 },
  choice: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  unitRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  unitChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  zoneList: { gap: 10, marginTop: 16 },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  qtyInput: {
    width: 72,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 16,
  },
  quoteBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
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
  reviewBlock: { marginTop: 12 },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap",
  },
  actionBtn: { flexGrow: 1, minWidth: 120 },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default FulfillmentOnboardingScreen;
