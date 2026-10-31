import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import type {
  FulfillmentDetailView,
  FulfillmentLineItem,
  FulfillmentTimelineEntry,
} from "@/app/interfaces/seller/FulfillmentDashboardInterface";
import { formatCurrency } from "@/app/_utils/main/helpers";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const iconMuted = useThemeColor({}, "icons");
  const textColor = useThemeColor({}, "text");
  if (value == null || value === "") return null;
  return (
    <View style={styles.metaRow}>
      <StyledText variant="labelSmall" style={{ color: iconMuted }}>
        {label}
      </StyledText>
      <StyledText variant="bodyMedium" style={{ color: textColor }}>
        {value}
      </StyledText>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const iconMuted = useThemeColor({}, "icons");
  return (
    <View style={styles.section}>
      <StyledText
        variant="labelMedium"
        style={{
          color: iconMuted,
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {title}
      </StyledText>
      {children}
    </View>
  );
}

function Timeline({ entries }: { entries: FulfillmentTimelineEntry[] }) {
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  return (
    <View style={styles.timeline}>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: textColor }]} />
          <View style={styles.timelineCopy}>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {entry.label}
            </StyledText>
            <StyledText
              variant="labelSmall"
              style={{ color: iconMuted, marginTop: 4 }}
            >
              {formatDateTime(entry.occurredAt)}
            </StyledText>
            {entry.note ? (
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 4 }}
              >
                {entry.note}
              </StyledText>
            ) : null}
          </View>
          <View
            style={[styles.timelineLine, { backgroundColor: borderColor }]}
          />
        </View>
      ))}
    </View>
  );
}

function LineItems({
  items,
  mode,
}: {
  items: FulfillmentLineItem[];
  mode: "inbound" | "order" | "movement";
}) {
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View style={styles.lineItems}>
      {items.map((item) => (
        <View
          key={`${item.sku}-${item.productName}`}
          style={[styles.lineItem, { borderColor, backgroundColor: bgColor }]}
        >
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            {item.productName}
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, marginTop: 2 }}
          >
            SKU {item.sku}
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: textColor, marginTop: 6 }}
          >
            {mode === "inbound"
              ? `Expected ${item.quantityExpected ?? "—"} · Received ${item.quantityReceived ?? "—"}`
              : mode === "order"
                ? `Ordered ${item.quantityOrdered ?? "—"} · Picked ${item.quantityPicked ?? "—"}`
                : item.quantityReceived != null
                  ? `+${item.quantityReceived} received`
                  : item.quantityOrdered != null
                    ? `−${item.quantityOrdered} reserved`
                    : "—"}
          </StyledText>
        </View>
      ))}
    </View>
  );
}

const FulfillmentDetailContent = ({
  detail,
}: {
  detail: FulfillmentDetailView;
}) => {
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");

  if (detail.kind === "inbound") {
    const d = detail.data;
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Shipment details">
          <MetaRow label="Warehouse" value={d.warehouseName} />
          <MetaRow
            label="Method"
            value={
              d.method === "vhotis_collection"
                ? "Vhotis collection"
                : "Seller delivery"
            }
          />
          <MetaRow label="Created" value={formatDateTime(d.createdAt)} />
          <MetaRow
            label="Dispatched"
            value={d.dispatchedAt ? formatDateTime(d.dispatchedAt) : undefined}
          />
          <MetaRow label="Expected arrival" value={d.expectedArrival} />
          <MetaRow
            label="Arrived"
            value={d.arrivedAt ? formatDateTime(d.arrivedAt) : undefined}
          />
          <MetaRow
            label="Received"
            value={d.receivedAt ? formatDateTime(d.receivedAt) : undefined}
          />
          <MetaRow label="Carrier" value={d.carrier} />
          <MetaRow label="Tracking" value={d.trackingNumber} />
          <MetaRow label="Pickup / drop-off" value={d.pickupAddress} />
          <MetaRow label="Contact" value={d.contactName} />
          <MetaRow label="Phone" value={d.contactPhone} />
          <MetaRow label="Units expected" value={d.unitsExpected} />
          <MetaRow label="Units received" value={d.unitsReceived} />
          {d.notes ? (
            <View
              style={[styles.note, { borderColor, backgroundColor: bgColor }]}
            >
              <StyledText variant="bodySmall">{d.notes}</StyledText>
            </View>
          ) : null}
        </Section>
        <Section title="Items in this shipment">
          <LineItems items={d.lineItems} mode="inbound" />
        </Section>
        <Section title="Timeline">
          <Timeline entries={d.timeline} />
        </Section>
      </ScrollView>
    );
  }

  if (detail.kind === "order") {
    const d = detail.data;
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Order details">
          <MetaRow label="Placed" value={formatDateTime(d.placedAt)} />
          <MetaRow label="Warehouse" value={d.warehouseName} />
          <MetaRow label="Delivery area" value={d.customerCity} />
          <MetaRow label="Delivery window" value={d.deliveryWindow} />
          <MetaRow label="SLA" value={d.slaLabel} />
          <MetaRow label="Subtotal" value={formatCurrency(d.subtotal)} />
          <MetaRow
            label="Fulfillment fee"
            value={formatCurrency(d.fulfillmentFee)}
          />
          <MetaRow label="Rider" value={d.riderName} />
          <MetaRow label="Tracking" value={d.trackingRef} />
          <MetaRow label="Fulfillment ref" value={d.id} />
        </Section>
        <Section title="Items">
          <LineItems items={d.lineItems} mode="order" />
        </Section>
        <Section title="Timeline">
          <Timeline entries={d.timeline} />
        </Section>
      </ScrollView>
    );
  }

  if (detail.kind === "restock") {
    const d = detail.data;
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Stock analysis">
          <MetaRow label="Category" value={d.category} />
          <MetaRow label="Available" value={d.warehouseAvailable} />
          <MetaRow label="Reorder point" value={d.reorderPoint} />
          <MetaRow label="Suggested send" value={`${d.suggestedUnits} units`} />
          <MetaRow label="Avg daily sales" value={`${d.avgDailySales} units`} />
          <MetaRow label="Days until stockout" value={d.daysUntilStockout} />
          <MetaRow label="Warehouse bin" value={d.warehouseBin} />
          <MetaRow label="Last inbound" value={d.lastInboundId} />
          <MetaRow
            label="Last inbound at"
            value={
              d.lastInboundAt ? formatDateTime(d.lastInboundAt) : undefined
            }
          />
          {d.notes ? (
            <View
              style={[styles.note, { borderColor, backgroundColor: bgColor }]}
            >
              <StyledText variant="bodySmall">{d.notes}</StyledText>
            </View>
          ) : null}
        </Section>
        <Section title="Timeline">
          <Timeline entries={d.timeline} />
        </Section>
      </ScrollView>
    );
  }

  if (detail.kind === "history") {
    const d = detail.data;
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Event details">
          <MetaRow label="When" value={formatDateTime(d.occurredAt)} />
          <MetaRow label="Type" value={d.type} />
          <MetaRow label="Actor" value={d.actor} />
          <MetaRow label="Related ref" value={d.relatedRef} />
          {d.metadata
            ? Object.entries(d.metadata).map(([k, v]) => (
                <MetaRow key={k} label={k} value={v} />
              ))
            : null}
          <StyledText variant="bodyMedium" style={{ marginTop: 8 }}>
            {d.detail}
          </StyledText>
        </Section>
        <Section title="Timeline">
          <Timeline entries={d.timeline} />
        </Section>
      </ScrollView>
    );
  }

  const d = detail.data;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Section title="Warehouse stock">
        <MetaRow label="Category" value={d.category} />
        <MetaRow label="Bin location" value={d.warehouseBin} />
        <MetaRow label="On hand" value={d.warehouseOnHand} />
        <MetaRow label="Reserved" value={d.warehouseReserved} />
        <MetaRow label="Available" value={d.warehouseAvailable} />
        <MetaRow label="Catalog qty" value={d.catalogQuantity} />
        <MetaRow label="Reorder point" value={d.reorderPoint} />
        <MetaRow
          label="Last counted"
          value={d.lastCountedAt ? formatDateTime(d.lastCountedAt) : undefined}
        />
        <MetaRow label="Last inbound" value={d.lastInboundId} />
        <MetaRow
          label="Last inbound at"
          value={d.lastInboundAt ? formatDateTime(d.lastInboundAt) : undefined}
        />
      </Section>
      {d.recentMovements.length ? (
        <Section title="Recent movements">
          <LineItems items={d.recentMovements} mode="movement" />
        </Section>
      ) : null}
      <Section title="Timeline">
        <Timeline entries={d.timeline} />
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  metaRow: { marginBottom: 10 },
  note: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  lineItems: { gap: 10 },
  lineItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  timeline: { gap: 4 },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
    position: "relative",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineCopy: { flex: 1 },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 16,
    bottom: 0,
    width: 2,
  },
});

export default FulfillmentDetailContent;
