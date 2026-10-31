/**
 * InboundDetailScreen
 *
 * Read-only view of a submitted inbound shipment. Shows:
 *  - Status pill + status timeline explanation
 *  - Delivery method + logistics job link (Phase 2)
 *  - Manifest lines
 *  - Fee info
 *  - Cancel button for draft shipments (redirects back to create flow)
 *
 * Route: /seller/main/store/fufillment/InboundDetailScreen
 * Params: { shipmentId: string }
 */
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useInboundDetail, useInboundActions } from "@/app/hook/seller/useInbound";
import type { InboundStatus } from "@/app/interfaces/seller/FulfillmentInterface";

const STATUS_LABELS: Record<InboundStatus, string> = {
  draft: "Draft",
  awaiting_payment: "Awaiting payment",
  scheduled: "Scheduled",
  collection_dispatched: "Collection dispatched",
  in_transit: "In transit",
  arrived: "Arrived at warehouse",
  receiving: "Being received",
  received: "Received",
  partial_received: "Partially received",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const STATUS_TONE: Record<InboundStatus, "neutral" | "success" | "danger" | "warning"> = {
  draft: "neutral",
  awaiting_payment: "warning",
  scheduled: "warning",
  collection_dispatched: "warning",
  in_transit: "warning",
  arrived: "warning",
  receiving: "warning",
  received: "success",
  partial_received: "warning",
  cancelled: "danger",
  rejected: "danger",
};

const STATUS_STEPS: InboundStatus[] = [
  "draft",
  "scheduled",
  "collection_dispatched",
  "in_transit",
  "arrived",
  "receiving",
  "received",
];

function StatusPill({ s }: { s: InboundStatus }) {
  const tintColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const tone = STATUS_TONE[s] ?? "neutral";
  const iconMuted = useThemeColor({}, "icons");
  const color =
    tone === "success"
      ? successColor
      : tone === "danger"
        ? "#991B1B"
        : tone === "warning"
          ? tintColor
          : iconMuted;
  return (
    <View style={[styles.pill, { borderColor: `${color}44`, backgroundColor: `${color}14` }]}>
      <StyledText variant="labelSmall" style={{ color }}>
        {STATUS_LABELS[s] ?? s}
      </StyledText>
    </View>
  );
}

function ProgressStepper({ current }: { current: InboundStatus }) {
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const currentIdx = STATUS_STEPS.indexOf(current);

  if (current === "cancelled" || current === "rejected") return null;

  return (
    <View style={styles.stepper}>
      {STATUS_STEPS.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const color = done ? successColor : active ? tintColor : iconMuted;
        return (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: color }]} />
              <StyledText
                variant="labelSmall"
                style={{ color, marginTop: 4, textAlign: "center", maxWidth: 60 }}
                numberOfLines={2}
              >
                {STATUS_LABELS[s]}
              </StyledText>
            </View>
            {idx < STATUS_STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: done ? successColor : iconMuted }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const InboundDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const { shipment, isLoading, refetch } = useInboundDetail(shipmentId);
  const { cancel, isCancelling } = useInboundActions();
  const { setAlertConfig, setIsVisible } = useAlertContext();

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const successColor = useThemeColor({}, "success") as string ?? "#16A34A";

  const handleCancel = () => {
    setAlertConfig({
      title: "Cancel shipment",
      message: "Are you sure you want to cancel this inbound booking?",
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: async () => {
        try {
          await cancel(shipmentId);
          router.back();
        } catch {
          setAlertConfig({
            title: "Error",
            message: "Could not cancel this shipment.",
            type: "error",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        }
      },
    });
  };

  if (isLoading || !shipment) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <StyledText variant="bodyMedium" style={{ color: iconMuted }}>Loading…</StyledText>
      </View>
    );
  }

  const lines = shipment.manifestLines ?? ([] as import("@/app/store/seller/api/wmsApi").ManifestLine[]);
  const receiptLines = shipment.receiptLines ?? ([] as import("@/app/store/seller/api/wmsApi").ReceiptLine[]);
  const isDraft = shipment.status === "draft";
  const isCancelled = shipment.status === "cancelled" || shipment.status === "rejected";
  const isReceived = shipment.status === "received" || shipment.status === "partial_received";
  const needsCollectionBooking =
    shipment.deliveryMethod === "vhotis_collection" &&
    shipment.status === "scheduled" &&
    !shipment.logisticsJobId;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      contentContainerStyle={[styles.container, { paddingBottom: 32 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={iconMuted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Inbound {shipment.id}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
            {new Date(shipment.createdAt).toLocaleString(undefined, {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </StyledText>
        </View>
        <StatusPill s={shipment.status} />
      </View>

      {/* Progress stepper */}
      {!isCancelled && (
        <View style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <ProgressStepper current={shipment.status} />
        </View>
      )}

      {/* Details */}
      <View style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        <Row label="Method" value={shipment.deliveryMethod === "vhotis_collection" ? "Vhotis collection" : "Seller delivery"} />
        <Row label="Warehouse" value={shipment.warehouseName} />
        {shipment.expectedArrivalAt ? (
          <Row
            label="Expected arrival"
            value={new Date(shipment.expectedArrivalAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          />
        ) : null}
        {shipment.referenceNotes ? <Row label="Note" value={shipment.referenceNotes} /> : null}
        <Row
          label="Restocking fee"
          value={
            shipment.restockingFeeCharged
              ? `Charged — ${shipment.restockingFeeAmount}`
              : shipment.restockingFeeAmount && shipment.restockingFeeAmount !== "0.00"
                ? `Quoted — ${shipment.restockingFeeAmount}`
                : "Not yet quoted"
          }
        />
      </View>

      {/* Manifest lines */}
      <StyledText variant="labelMedium" style={{ color: iconMuted, marginBottom: 8 }}>
        MANIFEST ({lines.length} item{lines.length !== 1 ? "s" : ""})
      </StyledText>
      {lines.length === 0 ? (
        <View style={[styles.emptyBox, { borderColor, backgroundColor: cardColor }]}>
          <StyledText variant="bodySmall" style={{ color: iconMuted, textAlign: "center" }}>
            No manifest lines recorded.
          </StyledText>
        </View>
      ) : (
        lines.map((line) => (
          <View key={line.id} style={[styles.lineCard, { borderColor, backgroundColor: bgColor }]}>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {line.declaredName}
              {line.declaredSku ? ` (${line.declaredSku})` : ""}
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
              {line.declaredQuantity} {line.declaredUnit}
              {line.declaredWeightKg ? ` · ${line.declaredWeightKg} kg total` : ""}
              {line.isTemperatureSensitive ? " · temp-sensitive" : ""}
              {line.requiresFrozen ? " · frozen" : ""}
            </StyledText>
            {line.notes ? (
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
                {line.notes}
              </StyledText>
            ) : null}
          </View>
        ))
      )}

      {/* Received banner */}
      {isReceived && (
        <View
          style={[
            styles.receivedBanner,
            {
              borderColor:
                shipment.status === "received"
                  ? `${successColor}55`
                  : `${tintColor}44`,
              backgroundColor:
                shipment.status === "received"
                  ? `${successColor}10`
                  : `${tintColor}0C`,
            },
          ]}
        >
          <MaterialIcons
            name={shipment.status === "received" ? "check-circle" : "info"}
            size={22}
            color={shipment.status === "received" ? successColor : tintColor}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {shipment.status === "received"
                ? "All stock received"
                : "Partially received"}
            </StyledText>
            {shipment.receivedAt ? (
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
                {new Date(shipment.receivedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </StyledText>
            ) : null}
          </View>
        </View>
      )}

      {/* Receipt lines — shown when ops have logged receiving */}
      {receiptLines.length > 0 && (
        <>
          <StyledText variant="labelMedium" style={{ color: iconMuted, marginBottom: 8, marginTop: 4 }}>
            RECEIVED ({receiptLines.length} line{receiptLines.length !== 1 ? "s" : ""})
          </StyledText>
          {receiptLines.map((rl) => {
            const tone =
              rl.status === "accepted"
                ? successColor
                : rl.status === "rejected"
                  ? "#DC2626"
                  : tintColor;
            return (
              <View
                key={rl.id}
                style={[
                  styles.receiptCard,
                  { borderColor, backgroundColor: bgColor, borderLeftColor: tone, borderLeftWidth: 3 },
                ]}
              >
                <View style={styles.receiptHead}>
                  <StyledText variant="labelMedium" style={{ color: textColor, flex: 1 }}>
                    {rl.productName ?? "Unmapped product"}
                  </StyledText>
                  <StyledText
                    variant="labelSmall"
                    style={{ color: tone, textTransform: "capitalize" }}
                  >
                    {rl.status}
                  </StyledText>
                </View>
                <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
                  Received {rl.receivedQuantity}
                  {rl.damagedQuantity > 0
                    ? ` · ${rl.damagedQuantity} damaged`
                    : ""}
                  {" · "} Accepted {rl.acceptedQuantity}
                </StyledText>
                {rl.notes ? (
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
                    {rl.notes}
                  </StyledText>
                ) : null}
              </View>
            );
          })}
        </>
      )}

      {/* Continue building manifest if still draft */}
      {isDraft && (
        <StyledButton
          title="Continue building manifest"
          variant="tonal"
          onPress={() =>
            router.push({
              pathname: "/seller/main/store/fufillment/ManifestBuilderScreen",
              params: { shipmentId: shipment.id },
            })
          }
          buttonStyles={{ marginTop: 16 }}
        />
      )}

      {/* Book collection — vhotis_collection shipments that are scheduled but not yet booked */}
      {needsCollectionBooking && (
        <View style={[styles.collectionBanner, { borderColor: tintColor, backgroundColor: `${tintColor}0C` }]}>
          <StyledText variant="bodyMedium" style={{ color: textColor, marginBottom: 8 }}>
            Your shipment is scheduled. Book a Vhotis collection to send a rider to your pickup address.
          </StyledText>
          <StyledButton
            title="Book collection now"
            onPress={() =>
              router.push({
                pathname: "/seller/main/store/fufillment/CollectionBookingScreen",
                params: { shipmentId: shipment.id },
              })
            }
          />
        </View>
      )}

      {/* Logistics job reference */}
      {shipment.logisticsJobId && (
        <View style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
          <Row label="Logistics job" value={shipment.logisticsJobId} />
        </View>
      )}

      {/* Cancel */}
      {isDraft && (
        <StyledButton
          title={isCancelling ? "Cancelling…" : "Cancel booking"}
          onPress={handleCancel}
          disabled={isCancelling}
          buttonStyles={[styles.cancelBtn]}
        />
      )}
    </ScrollView>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  return (
    <View style={styles.row}>
      <StyledText variant="bodySmall" style={{ color: iconMuted, flex: 1 }}>{label}</StyledText>
      <StyledText variant="bodyMedium" style={{ color: textColor, flex: 2, textAlign: "right" }}>{value}</StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: { padding: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  emptyBox: { alignItems: "center", padding: 24, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  lineCard: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 8 },
  cancelBtn: { marginTop: 12, backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  collectionBanner: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginTop: 16 },
  receivedBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  receiptCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  receiptHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { height: 2, flex: 1, alignSelf: "flex-start", marginTop: 4 },
});

export default InboundDetailScreen;
