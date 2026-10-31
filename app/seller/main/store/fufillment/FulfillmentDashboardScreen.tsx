import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import { useInboundList } from "@/app/hook/seller/useInbound";
import {
  useDashboardHistory,
  useDashboardInventory,
  useDashboardOrders,
  useDashboardOverview,
  useDashboardRestocks,
} from "@/app/hook/seller/useDashboard";
import {
  useGet_billing_accruingQuery,
  useGet_billing_statementsQuery,
} from "@/app/store/seller/api/wmsApi";
import { useAppDispatch } from "@/app/store/store";
import { resetManifestBuilder } from "@/app/store/seller/slice/manifestBuilderSlice";
import type {
  FeeBreakdown,
  FulfillmentDashboardTab,
  InboundShipment as LiveInbound,
  PendingListingRow,
} from "@/app/interfaces/seller/FulfillmentInterface";
import StorageDecreaseSection from "./StorageDecreaseSection";
import StorageIncreaseSection from "./StorageIncreaseSection";
import StoragePastDueBanner from "./StoragePastDueBanner";
import StorageRenewalSection from "./StorageRenewalSection";

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: { id: FulfillmentDashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "inbound", label: "Inbound" },
  { id: "orders", label: "Orders" },
  { id: "billing", label: "Billing" },
  { id: "restocks", label: "Restocks" },
  { id: "history", label: "History" },
  { id: "inventory", label: "Stock" },
];

const INBOUND_STATUS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  collection_dispatched: "Dispatched",
  in_transit: "In transit",
  arrived: "Arrived",
  receiving: "Receiving",
  received: "Received",
  partial_received: "Partial",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const ORDER_STATUS: Record<string, string> = {
  pending: "Pending",
  reserved: "Reserved",
  picking: "Picking",
  packed: "Packed",
  ready_for_dispatch: "Ready",
  dispatched: "Dispatched",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatMoney(amount: string | number, currency = "EUR"): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function formatMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "neutral" | "danger" | "warning";
}) {
  const success = useThemeColor({}, "success");
  const iconMuted = useThemeColor({}, "icons");
  const color =
    tone === "success"
      ? success
      : tone === "danger"
        ? "#991B1B"
        : tone === "warning"
          ? "#92400E"
          : iconMuted;
  const bg =
    tone === "success"
      ? `${success}14`
      : tone === "danger"
        ? "#FEF2F2"
        : tone === "warning"
          ? "#FFFBEB"
          : `${iconMuted}14`;
  return (
    <View style={[styles.pill, { borderColor: `${color}44`, backgroundColor: bg }]}>
      <StyledText variant="labelSmall" style={{ color }}>
        {label}
      </StyledText>
    </View>
  );
}

function ListingStatusPill({ status }: { status: string }) {
  const label =
    status === "live" ? "Live" : status === "draft" ? "Draft" : status;
  const tone =
    status === "live" ? "success" : status === "draft" ? "warning" : "neutral";
  return <StatusPill label={label} tone={tone} />;
}

function PendingListingCard({ row }: { row: PendingListingRow }) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");

  return (
    <View style={[styles.listItem, { borderColor, backgroundColor: bgColor }]}>
      <View style={styles.listHead}>
        <View style={{ flex: 1 }}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {row.name}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
            {row.sellerSku ? `SKU ${row.sellerSku} · ` : ""}
            {row.warehouseAvailable} in warehouse
          </StyledText>
        </View>
        <ListingStatusPill status={row.listingStatus} />
      </View>
      {row.blockerLabels.length > 0 && (
        <View style={styles.blockerWrap}>
          {row.blockerLabels.map((label) => (
            <View key={label} style={styles.blockerChip}>
              <StyledText variant="labelSmall" style={{ color: "#92400E" }}>
                {label}
              </StyledText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function SectionLoader() {
  const tintColor = useThemeColor({}, "tint");
  return (
    <View style={styles.loaderWrap}>
      <ActivityIndicator color={tintColor} />
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  const iconMuted = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");
  return (
    <View style={[styles.emptyBox, { borderColor, backgroundColor: bgColor }]}>
      <StyledText variant="bodySmall" style={{ color: iconMuted, textAlign: "center" }}>
        {message}
      </StyledText>
    </View>
  );
}

function OrderFeeCard({
  customerOrderId,
  status,
  itemCount,
  placedAt,
  feeTotal,
  feeCurrency,
  feeBreakdown,
  borderColor,
  bgColor,
  textColor,
  iconMuted,
}: {
  customerOrderId: string;
  status: string;
  itemCount: number;
  placedAt: string | null;
  feeTotal: string;
  feeCurrency: string;
  feeBreakdown: FeeBreakdown | null;
  borderColor: string;
  bgColor: string;
  textColor: string;
  iconMuted: string;
}) {
  const [open, setOpen] = useState(false);
  const hasBreakdown = Boolean(feeBreakdown?.lines?.length);

  return (
    <Pressable
      onPress={() => hasBreakdown && setOpen((v) => !v)}
      style={[styles.listItem, { borderColor, backgroundColor: bgColor }]}
    >
      <View style={styles.listHead}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {customerOrderId}
        </StyledText>
        <StatusPill label={status} />
      </View>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
        {itemCount} item{itemCount !== 1 ? "s" : ""}
        {placedAt ? ` · ${formatDate(placedAt)}` : ""}
        {Number(feeTotal) > 0
          ? ` · Fee ${formatMoney(feeTotal, feeCurrency)}`
          : ""}
      </StyledText>
      {open && feeBreakdown && (
        <View
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: borderColor,
          }}
        >
          {feeBreakdown.lines.map((line) => (
            <View
              key={line.code}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, flex: 1, paddingRight: 8 }}
              >
                {line.label}
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: textColor }}>
                {formatMoney(line.amount, feeBreakdown.currency)}
              </StyledText>
            </View>
          ))}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              Total
            </StyledText>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {formatMoney(feeBreakdown.total, feeBreakdown.currency)}
            </StyledText>
          </View>
          {feeBreakdown.billingNote ? (
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 8 }}>
              {feeBreakdown.billingNote}
            </StyledText>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

const FulfillmentDashboardScreen = () => {
  useRequireSellerOwner();
  const { status, loading: statusLoading } = useFulfillmentStatus();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<FulfillmentDashboardTab>("overview");

  // Book inbound → straight to the manifest builder. No method screen: the
  // server resolves the seller's preferred delivery method on submit.
  const handleBookInbound = useCallback(() => {
    dispatch(resetManifestBuilder());
    router.push("/seller/main/store/fufillment/ManifestBuilderScreen");
  }, [dispatch]);

  // ── Live data hooks ───────────────────────────────────────────────────────
  const { data: overviewData, isFetching: overviewFetching, refetch: refetchOverview } =
    useDashboardOverview();
  const { shipments: liveInbound, isFetching: inboundFetching, refetch: refetchInbound } =
    useInboundList();
  const { orders, isLoading: ordersLoading, isFetching: ordersFetching } =
    useDashboardOrders();
  const { inventory, isLoading: inventoryLoading, isFetching: inventoryFetching } =
    useDashboardInventory();
  const { restocks, isLoading: restocksLoading, isFetching: restocksFetching } =
    useDashboardRestocks();
  const { history, isLoading: historyLoading, isFetching: historyFetching } =
    useDashboardHistory();
  const {
    data: accruing,
    isLoading: accruingLoading,
    isFetching: accruingFetching,
    refetch: refetchAccruing,
  } = useGet_billing_accruingQuery(undefined, { skip: tab !== "billing" });
  const {
    data: statements = [],
    isLoading: statementsLoading,
    isFetching: statementsFetching,
    refetch: refetchStatements,
  } = useGet_billing_statementsQuery(undefined, { skip: tab !== "billing" });

  // Combined refresh (refreshes all sections at once)
  const isRefreshing =
    overviewFetching ||
    inboundFetching ||
    ordersFetching ||
    inventoryFetching ||
    restocksFetching ||
    historyFetching ||
    accruingFetching ||
    statementsFetching;

  const handleRefresh = useCallback(() => {
    void refetchOverview();
    void refetchInbound();
    if (tab === "billing") {
      void refetchAccruing();
      void refetchStatements();
    }
  }, [refetchOverview, refetchInbound, refetchAccruing, refetchStatements, tab]);

  useEffect(() => {
    if (statusLoading) return;
    if (status !== "active") {
      router.replace("/seller/main/store/fufillment/FulfillmentOnboardingScreen");
    }
  }, [status, statusLoading]);

  if (statusLoading || status !== "active") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ── Theme ─────────────────────────────────────────────────────────────────
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const tintColor = useThemeColor({}, "tint");
  const bgColor = useThemeColor({}, "background");

  // ── Derived values ────────────────────────────────────────────────────────
  const warehouse = overviewData?.warehouse;
  const overview = overviewData?.overview;
  const storage = overviewData?.storageUsage;
  const usedCbm = storage?.usedCbm ?? warehouse?.usedCbm ?? 0;
  const allocatedCbm = storage?.allocatedCbm ?? warehouse?.allocatedCbm ?? 0;
  const usagePct =
    storage?.utilizationPct ??
    (allocatedCbm > 0 ? Math.round((usedCbm / allocatedCbm) * 100) : 0);

  const renderStat = (value: number | undefined, label: string) => (
    <View key={label} style={[styles.stat, { borderColor, backgroundColor: bgColor }]}>
      <StyledText variant="headlineSmall" style={{ color: textColor, fontWeight: "700" }}>
        {value ?? "–"}
      </StyledText>
      <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 4 }}>
        {label}
      </StyledText>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={tintColor}
        />
      }
    >
      <View style={styles.root}>

        {/* Hero warehouse card */}
        <View style={[styles.hero, { borderColor, backgroundColor: `${successColor}10` }]}>
          <View style={{ flex: 1 }}>
            <StatusPill label={warehouse ? "Active" : "Loading…"} tone="success" />
            <StyledText variant="titleLarge" style={{ color: textColor, marginTop: 12 }}>
              {warehouse?.name ?? "Vhotis Warehouse"}
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
              {warehouse?.city ?? ""}
              {allocatedCbm > 0
                ? ` · ${usedCbm.toFixed(1)} / ${allocatedCbm.toFixed(1)} cbm across zones (${usagePct}%)`
                : ""}
            </StyledText>
          </View>
          <StyledButton
            title="My Business"
            variant="tonal"
            onPress={() => router.replace("/seller/main/store/StoreScreen")}
            buttonStyles={styles.heroBtn}
          />
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[
                  styles.tab,
                  {
                    borderColor: active ? tintColor : borderColor,
                    backgroundColor: active ? `${tintColor}14` : cardColor,
                  },
                ]}
              >
                <StyledText
                  variant="labelMedium"
                  style={{ color: active ? textColor : iconMuted }}
                >
                  {t.label}
                </StyledText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Panel */}
        <View style={[styles.panel, { borderColor, backgroundColor: cardColor }]}>

          {/* ── Overview ─────────────────────────────────────────────────── */}
          {tab === "overview" && (
            <>
              <View style={styles.statGrid}>
                {renderStat(overview?.ordersInProgress, "Orders in progress")}
                {renderStat(overview?.ordersShippedToday, "Shipped today")}
                {renderStat(overview?.pendingListings, "Pending listings")}
                {renderStat(overview?.liveListings, "Live listings")}
                {renderStat(overview?.inboundInTransit, "Inbound active")}
                {renderStat(overview?.lowStockSkus, "Low stock SKUs")}
              </View>

              {storage && storage.zones.length > 0 ? (
                <View style={styles.storageBlock}>
                  <StoragePastDueBanner storage={storage} />
                  <StyledText variant="titleMedium" style={{ color: textColor }}>
                    Storage by zone
                  </StyledText>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 4 }}>
                    {storage.periodEnd
                      ? `Period ends ${new Date(storage.periodEnd).toLocaleDateString()}`
                      : "Rented capacity vs stock on hand"}
                  </StyledText>
                  {storage.zones.map((zone) => {
                    const barPct = Math.min(zone.utilizationPct, 100);
                    const over =
                      zone.utilizationPct > 100 ||
                      (zone.allocatedCbm <= 0 && zone.usedCbm > 0);
                    return (
                      <View key={zone.zone} style={styles.zoneRow}>
                        <View style={styles.zoneHead}>
                          <StyledText variant="labelLarge" style={{ color: textColor }}>
                            {zone.label}
                          </StyledText>
                          <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                            {zone.usedCbm.toFixed(2)} / {zone.allocatedCbm.toFixed(2)} cbm
                          </StyledText>
                        </View>
                        <View style={[styles.zoneTrack, { backgroundColor: borderColor }]}>
                          <View
                            style={[
                              styles.zoneFill,
                              {
                                width: `${barPct}%`,
                                backgroundColor: over ? warningColor : successColor,
                              },
                            ]}
                          />
                        </View>
                        <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                          {zone.utilizationPct}% used
                          {Number(zone.allocated) > 0
                            ? ` · rented ${zone.allocated} ${zone.unit}`
                            : " · not rented"}
                          {over ? " — over capacity" : ""}
                        </StyledText>
                      </View>
                    );
                  })}
                  <StorageRenewalSection
                    storage={storage}
                    onChanged={() => {
                      void refetchOverview();
                    }}
                  />
                  <StorageIncreaseSection
                    storage={storage}
                    onPaid={() => {
                      void refetchOverview();
                    }}
                  />
                  <StorageDecreaseSection
                    storage={storage}
                    onChanged={() => {
                      void refetchOverview();
                    }}
                  />
                </View>
              ) : null}

              {(overviewData?.pendingListings?.length ?? 0) > 0 && (
                <>
                  <StyledText variant="titleMedium" style={{ color: textColor, marginTop: 8 }}>
                    Pending listings
                  </StyledText>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 8 }}>
                    Complete these before buyers can purchase
                  </StyledText>
                  {overviewData!.pendingListings.map((row) => (
                    <PendingListingCard key={row.productId} row={row} />
                  ))}
                </>
              )}
              <StyledText variant="bodyMedium" style={{ color: iconMuted, lineHeight: 22, marginTop: 8 }}>
                Vhotis stores, picks, packs, and ships from your rented space. Use
                the tabs above to track inbound shipments, live orders, and restock
                suggestions.
              </StyledText>
              {!overviewData && overviewFetching && <SectionLoader />}
            </>
          )}

          {/* ── Inbound ──────────────────────────────────────────────────── */}
          {tab === "inbound" && (
            <>
              <View style={styles.tabTitleRow}>
                <StyledText variant="titleMedium" style={{ color: textColor }}>
                  Inbound to warehouse
                </StyledText>
                <Pressable
                  onPress={handleBookInbound}
                  style={[styles.bookBtn, { borderColor: tintColor, backgroundColor: `${tintColor}10` }]}
                >
                  <MaterialIcons name="add" size={16} color={tintColor} />
                  <StyledText variant="labelSmall" style={{ color: tintColor, marginLeft: 4 }}>
                    Book inbound
                  </StyledText>
                </Pressable>
              </View>

              {liveInbound.length === 0 && !inboundFetching && (
                <View style={[styles.emptyInbound, { borderColor, backgroundColor: bgColor }]}>
                  <MaterialIcons name="inventory-2" size={28} color={iconMuted} />
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: iconMuted, marginTop: 8, textAlign: "center" }}
                  >
                    No inbound shipments yet.
                  </StyledText>
                  <StyledButton
                    title="Book your first inbound"
                    variant="tonal"
                    onPress={handleBookInbound}
                    buttonStyles={{ marginTop: 12 }}
                  />
                </View>
              )}

              {liveInbound.map((row: LiveInbound) => (
                <Pressable
                  key={row.id}
                  onPress={() =>
                    router.push({
                      pathname: "/seller/main/store/fufillment/InboundDetailScreen",
                      params: { shipmentId: row.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.listItem,
                    { borderColor, backgroundColor: bgColor, opacity: pressed ? 0.88 : 1 },
                  ]}
                >
                  <View style={styles.listHead}>
                    <StyledText variant="labelLarge" style={{ color: textColor }}>
                      {row.id}
                    </StyledText>
                    <StatusPill
                      label={INBOUND_STATUS[row.status] ?? row.status}
                      tone={
                        row.status === "received"
                          ? "success"
                          : row.status === "cancelled" || row.status === "rejected"
                            ? "danger"
                            : "neutral"
                      }
                    />
                  </View>
                  {row.referenceNotes ? (
                    <StyledText variant="bodyMedium" style={{ color: textColor, marginTop: 6 }}>
                      {row.referenceNotes}
                    </StyledText>
                  ) : null}
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
                    {row.deliveryMethod === "vhotis_collection"
                      ? "Vhotis collection"
                      : "Seller delivery"}
                    {row.expectedArrivalAt
                      ? ` · Expected ${new Date(row.expectedArrivalAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                      : ""}
                  </StyledText>
                  <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 2 }}>
                    {row.manifestLineCount} items · Created {formatDate(row.createdAt)}
                  </StyledText>
                </Pressable>
              ))}
            </>
          )}

          {/* ── Orders ───────────────────────────────────────────────────── */}
          {tab === "orders" && (
            <>
              <StyledText variant="titleMedium" style={{ color: textColor, marginBottom: 4 }}>
                Orders fulfilled by Vhotis
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 12 }}>
                Labour fees accrue monthly — separate from your 2.5% payout processing fee.
              </StyledText>
              {ordersLoading && <SectionLoader />}
              {!ordersLoading && orders.length === 0 && (
                <EmptyState message="No fulfilled orders yet." />
              )}
              {orders.map((row) => (
                <OrderFeeCard
                  key={row.id}
                  customerOrderId={row.customerOrderId}
                  status={ORDER_STATUS[row.status] ?? row.status}
                  itemCount={row.itemCount}
                  placedAt={row.placedAt}
                  feeTotal={row.feeTotal}
                  feeCurrency={row.feeCurrency}
                  feeBreakdown={row.feeBreakdown}
                  borderColor={borderColor}
                  bgColor={bgColor}
                  textColor={textColor}
                  iconMuted={iconMuted}
                />
              ))}
            </>
          )}

          {/* ── Billing ──────────────────────────────────────────────────── */}
          {tab === "billing" && (
            <>
              <StyledText variant="titleMedium" style={{ color: textColor, marginBottom: 4 }}>
                Warehouse billing
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 12 }}>
                Monthly pick/pack invoice. Not deducted from order payouts.
              </StyledText>
              {(accruingLoading || statementsLoading) && <SectionLoader />}
              {accruing && !accruingLoading && (
                <View
                  style={[styles.listItem, { borderColor, backgroundColor: cardColor, marginBottom: 12 }]}
                >
                  <StyledText variant="labelLarge" style={{ color: iconMuted }}>
                    Accruing this month
                  </StyledText>
                  <StyledText variant="titleLarge" style={{ color: textColor, marginTop: 6 }}>
                    {formatMoney(accruing.pendingFulfillmentTotal, accruing.currency)}
                  </StyledText>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
                    Billed on the 1st · since {formatDate(accruing.billingPeriodStart)}
                  </StyledText>
                </View>
              )}
              {!statementsLoading && statements.length === 0 && (
                <EmptyState message="No monthly invoices yet. Fees accrue as orders are packed." />
              )}
              {statements.map((stmt) => (
                <Pressable
                  key={stmt.id}
                  onPress={() =>
                    router.push({
                      pathname: "/seller/main/store/fufillment/BillingStatementScreen",
                      params: { statementId: String(stmt.id) },
                    })
                  }
                  style={[styles.listItem, { borderColor, backgroundColor: bgColor }]}
                >
                  <View style={styles.listHead}>
                    <StyledText variant="labelLarge" style={{ color: textColor }}>
                      {formatMonth(stmt.billingMonth)}
                    </StyledText>
                    <StatusPill
                      label={stmt.status}
                      tone={
                        stmt.status === "paid"
                          ? "success"
                          : stmt.status === "failed"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </View>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
                    Fulfilment {formatMoney(stmt.fulfillmentCharges)}
                    {Number(stmt.storageCharges) > 0
                      ? ` · Storage ${formatMoney(stmt.storageCharges)}`
                      : ""}
                  </StyledText>
                  <StyledText variant="labelLarge" style={{ color: textColor, marginTop: 4 }}>
                    Total {formatMoney(stmt.totalCharged)}
                  </StyledText>
                </Pressable>
              ))}
            </>
          )}

          {/* ── Restocks ─────────────────────────────────────────────────── */}
          {tab === "restocks" && (
            <>
              <StyledText variant="titleMedium" style={{ color: textColor }}>
                Restock suggestions
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 8, marginBottom: 12 }}
              >
                Based on your warehouse stock levels and reorder points.
              </StyledText>
              {restocksLoading && <SectionLoader />}
              {!restocksLoading && restocks.length === 0 && (
                <EmptyState message="All stock is above reorder points. No restocks needed." />
              )}
              {restocks.map((row, i) => (
                <View
                  key={`${row.productId}-${i}`}
                  style={[styles.listItem, { borderColor, backgroundColor: bgColor }]}
                >
                  <View style={styles.listHead}>
                    <StyledText
                      variant="labelLarge"
                      style={{ color: textColor, flex: 1 }}
                    >
                      {row.productName}
                    </StyledText>
                    <StatusPill
                      label={`${row.urgency} priority`}
                      tone={row.urgency === "high" ? "danger" : "neutral"}
                    />
                  </View>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
                    {row.sku ? `SKU ${row.sku} · ` : ""}
                    {row.warehouseAvailable} available (reorder at {row.reorderPoint})
                  </StyledText>
                  <StyledText variant="bodyMedium" style={{ color: textColor, marginTop: 4 }}>
                    Suggested send: {row.suggestedUnits} units
                    {row.daysUntilStockout != null
                      ? ` · ~${row.daysUntilStockout} day${row.daysUntilStockout !== 1 ? "s" : ""} left`
                      : ""}
                  </StyledText>
                </View>
              ))}
            </>
          )}

          {/* ── History ──────────────────────────────────────────────────── */}
          {tab === "history" && (
            <>
              <StyledText variant="titleMedium" style={{ color: textColor, marginBottom: 12 }}>
                Activity history
              </StyledText>
              {historyLoading && <SectionLoader />}
              {!historyLoading && history.length === 0 && (
                <EmptyState message="No stock movements yet." />
              )}
              {history.map((row, index) => (
                <View
                  key={row.id}
                  style={[styles.timelineItem, { opacity: 1 }]}
                >
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: textColor }]} />
                    {index < history.length - 1 ? (
                      <View style={[styles.timelineLine, { backgroundColor: borderColor }]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineBody}>
                    <StyledText variant="labelLarge" style={{ color: textColor }}>
                      {row.title}
                    </StyledText>
                    <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
                      {row.detail}
                    </StyledText>
                    <StyledText variant="labelSmall" style={{ color: iconMuted, marginTop: 4 }}>
                      {formatDate(row.occurredAt)}
                    </StyledText>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* ── Inventory ────────────────────────────────────────────────── */}
          {tab === "inventory" && (
            <>
              <StyledText variant="titleMedium" style={{ color: textColor }}>
                Warehouse stock
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 8, marginBottom: 12 }}
              >
                Stock at the Vhotis warehouse managed by our team. Read-only view.
              </StyledText>
              {inventoryLoading && <SectionLoader />}
              {!inventoryLoading && inventory.length === 0 && (
                <EmptyState message="No stock on hand yet. Book your first inbound to get started." />
              )}
              {inventory.map((row) => (
                <View
                  key={row.id}
                  style={[styles.listItem, { borderColor, backgroundColor: bgColor }]}
                >
                  <View style={styles.listHead}>
                    <View style={{ flex: 1 }}>
                      <StyledText variant="labelLarge" style={{ color: textColor }}>
                        {row.productName}
                      </StyledText>
                      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
                        {row.category ? `${row.category} · ` : ""}
                        {row.sku ? `SKU ${row.sku}` : ""}
                      </StyledText>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      <ListingStatusPill status={row.listingStatus} />
                      <StatusPill
                        label={
                          row.status === "out_of_stock"
                            ? "Out of stock"
                            : row.status === "low_stock"
                              ? "Low stock"
                              : "OK"
                        }
                        tone={
                          row.status === "out_of_stock" || row.status === "low_stock"
                            ? "danger"
                            : "success"
                        }
                      />
                    </View>
                  </View>
                  {row.blockerLabels.length > 0 && (
                    <View style={styles.blockerWrap}>
                      {row.blockerLabels.map((label) => (
                        <View key={label} style={styles.blockerChip}>
                          <StyledText variant="labelSmall" style={{ color: "#92400E" }}>
                            {label}
                          </StyledText>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.stockRow}>
                    <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                      On hand {row.quantityOnHand}
                    </StyledText>
                    <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                      Reserved {row.quantityReserved}
                    </StyledText>
                    <StyledText
                      variant="labelSmall"
                      style={{ color: textColor, fontWeight: "600" }}
                    >
                      Available {row.quantityAvailable}
                      {row.locationCode ? ` · Bin ${row.locationCode}` : ""}
                    </StyledText>
                  </View>
                  {row.quantityDamaged > 0 && (
                    <StyledText
                      variant="labelSmall"
                      style={{ color: "#DC2626", marginTop: 4 }}
                    >
                      {row.quantityDamaged} damaged
                    </StyledText>
                  )}
                </View>
              ))}
            </>
          )}

        </View>
      </View>
    </ScrollView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  root: { gap: 12 },
  hero: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroBtn: { minWidth: 110 },
  tabRow: { gap: 8, paddingVertical: 2 },
  tab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  storageBlock: { gap: 10, marginTop: 4 },
  zoneRow: { gap: 4 },
  zoneHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  zoneTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  zoneFill: {
    height: "100%",
    borderRadius: 999,
  },
  stat: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  listHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  timelineRail: {
    width: 12,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 16,
  },
  stockRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  blockerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  blockerChip: {
    borderWidth: 1,
    borderColor: "#D9770644",
    backgroundColor: "#FFFBEB",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tabTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  emptyInbound: {
    alignItems: "center",
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: "center",
    padding: 24,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  loaderWrap: {
    alignItems: "center",
    padding: 32,
  },
});

export default FulfillmentDashboardScreen;
