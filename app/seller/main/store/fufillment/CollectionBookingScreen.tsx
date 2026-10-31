/**
 * CollectionBookingScreen
 *
 * After restocking fee payment (vhotis_collection inbound):
 *   1. Seller enters pickup address
 *   2. Get quote → combined logistics + restocking fee
 *   3. Confirm booking → creates LogisticsJob + PaymentIntent
 *   4. Stripe payment sheet → webhook advances to collection_dispatched
 */
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useCollectionBooking } from "@/app/hook/seller/useLogistics";
import type {
  CollectionQuote,
  LogisticsAddress,
} from "@/app/interfaces/seller/LogisticsInterface";

const EMPTY_ADDRESS: LogisticsAddress = {
  contactName: "",
  contactPhone: "",
  companyName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "United Kingdom",
  instructions: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");

  return (
    <View style={{ marginBottom: 12 }}>
      <StyledText variant="labelSmall" style={{ color: iconMuted, marginBottom: 4 }}>
        {label}
        {required ? " *" : ""}
      </StyledText>
      <TextInput
        style={[
          styles.input,
          { borderColor, color: textColor, backgroundColor: bgColor },
          multiline && { minHeight: 72, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={iconMuted}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        autoCapitalize="words"
      />
    </View>
  );
}

function VehicleBadge({ type }: { type: "etrike" | "van" }) {
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const icon: keyof typeof MaterialIcons.glyphMap =
    type === "van" ? "airport-shuttle" : "electric-rickshaw";
  const label = type === "van" ? "Van required" : "E-Trike";
  const detail =
    type === "van"
      ? "Selected due to weight, volume, or temperature requirements."
      : "Standard collection vehicle for smaller batches.";

  return (
    <View style={[styles.vehicleBadge, { borderColor: `${tintColor}44`, backgroundColor: `${tintColor}0A` }]}>
      <MaterialIcons name={icon} size={22} color={tintColor} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <StyledText variant="labelMedium" style={{ color: textColor }}>
          {label}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
          {detail}
        </StyledText>
      </View>
    </View>
  );
}

function FeeRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  return (
    <View style={styles.feeRow}>
      <StyledText variant="bodyMedium" style={{ color: iconMuted, flex: 1 }}>
        {label}
      </StyledText>
      <StyledText
        variant={bold ? "titleSmall" : "bodyMedium"}
        style={{ color: textColor, fontWeight: bold ? "700" : "400" }}
      >
        {value}
      </StyledText>
    </View>
  );
}

const CollectionBookingScreen = () => {
  const insets = useSafeAreaInsets();
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const { quote, book, isQuoting, isBooking } = useCollectionBooking();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { setAlertConfig, setIsVisible } = useAlertContext();

  const [address, setAddress] = useState<LogisticsAddress>(EMPTY_ADDRESS);
  const [isPriority, setIsPriority] = useState(false);
  const [quoteResult, setQuoteResult] = useState<CollectionQuote | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const successColor = useThemeColor({}, "success");

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "warning" = "warning",
    ) => {
      setAlertConfig({
        title,
        message,
        type,
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
    },
    [setAlertConfig, setIsVisible],
  );

  const set = (key: keyof LogisticsAddress, value: string) =>
    setAddress((a) => ({ ...a, [key]: value }));

  const validate = (): boolean => {
    if (!shipmentId) {
      showAlert("Missing shipment", "No inbound shipment was provided.");
      return false;
    }
    if (!address.addressLine1.trim()) {
      showAlert("Required", "Enter the pickup address line 1.");
      return false;
    }
    if (!address.city.trim()) {
      showAlert("Required", "Enter the pickup city.");
      return false;
    }
    if (!address.postalCode.trim()) {
      showAlert("Required", "Enter the pickup postal code.");
      return false;
    }
    return true;
  };

  const handleQuote = async () => {
    if (!validate() || !shipmentId) return;
    try {
      const result = await quote({
        inbound_shipment_id: shipmentId,
        pickup_address: address,
        is_priority: isPriority,
      });
      setQuoteResult(result);
    } catch (e: unknown) {
      const msg = (e as { data?: { error?: string } })?.data?.error;
      showAlert(
        "Quote failed",
        msg ?? "Could not get a quote. Please try again.",
        "error",
      );
    }
  };

  const openPaymentSheet = async (clientSecret: string, customer?: string, ephemeralKey?: string) => {
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

  const handleBook = async () => {
    if (!quoteResult || !shipmentId) {
      showAlert("Get quote first", "Tap 'Get quote' before confirming.");
      return;
    }

    setAlertConfig({
      title: "Confirm collection",
      message: `Total charge: ${quoteResult.currency} ${quoteResult.totalFee.toFixed(2)}\n\nA ${quoteResult.vehicleType === "van" ? "van" : "e-trike"} will collect from your address. Proceed to payment?`,
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: async () => {
        setIsPaying(true);
        try {
          const result = await book({
            inbound_shipment_id: shipmentId,
            pickup_address: address,
            is_priority: isPriority,
          });

          const paid = await openPaymentSheet(
            result.clientSecret,
            result.customer,
            result.ephemeralKey,
          );
          if (!paid) return;

          router.replace({
            pathname: "/seller/main/store/fufillment/InboundDetailScreen",
            params: { shipmentId: result.inboundShipmentId },
          });
        } catch (e: unknown) {
          const msg =
            (e as { data?: { error?: string } })?.data?.error ??
            (e instanceof Error ? e.message : "Could not complete booking.");
          setAlertConfig({
            title: "Booking failed",
            message: msg,
            type: "error",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        } finally {
          setIsPaying(false);
        }
      },
    });
  };

  if (!shipmentId) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <StyledText variant="bodyMedium" style={{ color: iconMuted, textAlign: "center" }}>
          No shipment ID provided. Go back and try again.
        </StyledText>
        <StyledButton title="Go back" variant="tonal" onPress={() => router.back()} buttonStyles={{ marginTop: 16 }} />
      </View>
    );
  }

  const busy = isQuoting || isBooking || isPaying;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={iconMuted} />
          </Pressable>
          <View>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              Book collection
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
              {shipmentId}
            </StyledText>
          </View>
        </View>

        <StyledText variant="labelMedium" style={{ color: iconMuted, marginBottom: 12 }}>
          PICKUP ADDRESS
        </StyledText>

        <View style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <Field label="Contact name" value={address.contactName} onChange={(v) => set("contactName", v)} placeholder="John Smith" />
          <Field label="Contact phone" value={address.contactPhone} onChange={(v) => set("contactPhone", v)} placeholder="+44 7700 900000" keyboardType="phone-pad" />
          <Field label="Company / trading name" value={address.companyName ?? ""} onChange={(v) => set("companyName", v)} placeholder="Optional" />
          <Field label="Address line 1" value={address.addressLine1} onChange={(v) => set("addressLine1", v)} placeholder="12 High Street" required />
          <Field label="Address line 2" value={address.addressLine2} onChange={(v) => set("addressLine2", v)} placeholder="Unit / floor (optional)" />
          <Field label="City" value={address.city} onChange={(v) => set("city", v)} placeholder="London" required />
          <Field label="Postal code" value={address.postalCode} onChange={(v) => set("postalCode", v)} placeholder="E1 6AN" required />
          <Field label="Country" value={address.country} onChange={(v) => set("country", v)} placeholder="United Kingdom" />
          <Field label="Collection instructions" value={address.instructions ?? ""} onChange={(v) => set("instructions", v)} placeholder="e.g. Ring doorbell, ask for warehouse" multiline />
        </View>

        <Pressable
          onPress={() => {
            setIsPriority((p) => !p);
            setQuoteResult(null);
          }}
          style={[
            styles.priorityRow,
            {
              borderColor: isPriority ? tintColor : borderColor,
              backgroundColor: isPriority ? `${tintColor}10` : cardColor,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <StyledText variant="labelMedium" style={{ color: textColor }}>Priority collection</StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
              Faster dispatch; priority surcharge applies.
            </StyledText>
          </View>
          <MaterialIcons
            name={isPriority ? "toggle-on" : "toggle-off"}
            size={28}
            color={isPriority ? tintColor : iconMuted}
          />
        </Pressable>

        {quoteResult ? (
          <View style={[styles.quoteCard, { borderColor: `${successColor}44`, backgroundColor: `${successColor}08` }]}>
            <VehicleBadge type={quoteResult.vehicleType} />
            <View style={[styles.feeSummary, { borderColor }]}>
              <FeeRow label="Restocking fee" value={`${quoteResult.currency} ${quoteResult.restockingFee.toFixed(2)}`} />
              <FeeRow label="Collection fee" value={`${quoteResult.currency} ${quoteResult.logisticsFee.toFixed(2)}`} />
              <View style={[styles.feeTotal, { borderColor }]}>
                <FeeRow
                  label="Total due"
                  value={`${quoteResult.currency} ${quoteResult.totalFee.toFixed(2)}`}
                  bold
                />
              </View>
            </View>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 8 }}>
              Quote valid for 30 minutes. Payment is required to dispatch the rider.
            </StyledText>
          </View>
        ) : null}

        {!quoteResult ? (
          <StyledButton
            title={isQuoting ? "Getting quote…" : "Get quote"}
            onPress={handleQuote}
            disabled={busy}
            buttonStyles={{ marginTop: 20 }}
          />
        ) : (
          <>
            <StyledButton
              title={busy ? "Processing…" : "Confirm & pay"}
              onPress={handleBook}
              disabled={busy}
              buttonStyles={{ marginTop: 20 }}
            />
            <StyledButton
              title="Recalculate quote"
              variant="tonal"
              onPress={() => setQuoteResult(null)}
              disabled={busy}
              buttonStyles={{ marginTop: 10 }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  backBtn: { padding: 4 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  quoteCard: { borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 8 },
  vehicleBadge: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  feeSummary: { borderTopWidth: 1, paddingTop: 12 },
  feeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  feeTotal: { borderTopWidth: 1, marginTop: 4, paddingTop: 6 },
});

export default CollectionBookingScreen;
