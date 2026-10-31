import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import EmptyAnalyticsContainer from "@/app/component/seller/shared/EmptyAnalyticsContainer";
import { useGetLinkVisitsQuery } from "@/app/store/seller/api/analyticsApi";
import {
  LinkVisitsTimeframe,
} from "@/app/interfaces/seller/LinkVisitsInterfaces";
import { buildStoreShareUrl } from "@/app/_utils/main/shareLinks";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import { allowsProductShare } from "@/app/_utils/seller/productShare";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const TIMEFRAMES: { key: LinkVisitsTimeframe; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  textColor: string;
  mutedColor: string;
  cardColor: string;
  borderColor: string;
  accent?: string;
};

const StatCard = ({
  label,
  value,
  hint,
  textColor,
  mutedColor,
  cardColor,
  borderColor,
  accent,
}: StatCardProps) => (
  <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
    <StyledText variant="labelSmall" style={{ color: mutedColor }}>
      {label}
    </StyledText>
    <StyledText
      variant="titleMedium"
      style={{ color: accent ?? textColor, fontWeight: "700", marginTop: 4 }}
    >
      {value}
    </StyledText>
    {hint ? (
      <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 4 }}>
        {hint}
      </StyledText>
    ) : null}
  </View>
);

type LinkVisitsPanelProps = {
  storeId?: string;
  /** When true, omits outer ScrollView (parent handles scrolling). */
  embedded?: boolean;
};

const LinkVisitsPanel = ({ storeId, embedded = false }: LinkVisitsPanelProps) => {
  const [timeframe, setTimeframe] = useState<LinkVisitsTimeframe>("30d");
  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const canShareProducts = allowsProductShare(user);

  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  const { data, isLoading, isFetching } = useGetLinkVisitsQuery({
    timeframe,
    storeId,
  });

  const maxDailyVisits = useMemo(() => {
    if (!data?.daily_series?.length) return 1;
    return Math.max(
      1,
      ...data.daily_series.map(
        (point) => point.product_visits + point.store_visits,
      ),
    );
  }, [data?.daily_series]);

  if (isLoading) {
    return (
      <EmptyAnalyticsContainer
        title="Loading share link stats..."
        message="Please wait while we fetch your link visit data."
      />
    );
  }

  if (!data?.success) {
    return (
      <EmptyAnalyticsContainer
        title="Share link analytics"
        message="Could not load link visit data. Try again later."
      />
    );
  }

  const hasVisits = data.summary.total_visits > 0;

  const body = (
    <>
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map((item) => {
          const active = timeframe === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.timeframeChip,
                {
                  backgroundColor: active ? tintColor : cardColor,
                  borderColor,
                },
              ]}
              onPress={() => setTimeframe(item.key)}
            >
              <StyledText
                variant="labelSmall"
                style={{ color: active ? "#fff" : textColor, fontWeight: "600" }}
              >
                {item.label}
              </StyledText>
            </TouchableOpacity>
          );
        })}
        {isFetching ? (
          <ActivityIndicator size="small" color={tintColor} style={{ marginLeft: 8 }} />
        ) : null}
      </View>

      {!canShareProducts ? (
        <View style={[styles.upgradeBanner, { backgroundColor: cardColor, borderColor }]}>
          <MaterialIcons name="lock" size={20} color={tintColor} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <StyledText variant="labelMedium" style={{ color: textColor }}>
              Product links require Lite or above
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 4 }}>
              Starter plans cannot share product web links. Upgrade to track and share
              products on the web.
            </StyledText>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/seller/main/store/SubscriptionPlans")}
            style={[styles.upgradeBtn, { backgroundColor: tintColor }]}
          >
            <StyledText variant="labelSmall" style={{ color: "#fff", fontWeight: "600" }}>
              Upgrade
            </StyledText>
          </TouchableOpacity>
        </View>
      ) : null}

      {!hasVisits ? (
        <EmptyAnalyticsContainer
          title="No link visits yet"
          message={
            canShareProducts
              ? "Share product or store links to see how many people open them on the web."
              : "Upgrade your plan to share product links, or set a storefront slug on Enterprise Plus."
          }
          icon="link"
        />
      ) : (
        <>
          <View style={styles.statGrid}>
            <StatCard
              label="Total visits"
              value={String(data.summary.total_visits)}
              textColor={textColor}
              mutedColor={mutedColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
            <StatCard
              label="Unique visitors"
              value={String(data.summary.unique_visitors)}
              textColor={textColor}
              mutedColor={mutedColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
            <StatCard
              label="App opens"
              value={String(data.summary.app_opens)}
              hint={`${data.summary.app_open_rate}% tap-through`}
              textColor={textColor}
              mutedColor={mutedColor}
              cardColor={cardColor}
              borderColor={borderColor}
              accent={tintColor}
            />
          </View>

          {canShareProducts ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="inventory-2" size={18} color={tintColor} />
                <StyledText variant="labelMedium" style={{ color: textColor, marginLeft: 8 }}>
                  Product links
                </StyledText>
              </View>
              <View style={styles.inlineStats}>
                <StyledText variant="bodySmall" style={{ color: mutedColor }}>
                  {data.product_links.total_visits} visits ·{" "}
                  {data.product_links.unique_visitors} unique ·{" "}
                  {data.product_links.app_opens} app opens
                </StyledText>
              </View>
            </View>
          ) : null}

          {data.store_link.available ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="storefront" size={18} color={tintColor} />
                <StyledText variant="labelMedium" style={{ color: textColor, marginLeft: 8 }}>
                  Storefront link
                </StyledText>
              </View>
              {data.store_link.slug ? (
                <StyledText
                  variant="labelSmall"
                  style={{ color: mutedColor, marginBottom: 6 }}
                  numberOfLines={2}
                >
                  {buildStoreShareUrl(data.store_link.slug)}
                </StyledText>
              ) : null}
              <StyledText variant="bodySmall" style={{ color: mutedColor }}>
                {data.store_link.total_visits} visits ·{" "}
                {data.store_link.unique_visitors} unique ·{" "}
                {data.store_link.app_opens} app opens
              </StyledText>
            </View>
          ) : null}

          {data.daily_series.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 12 }}>
                Visits over time
              </StyledText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartRow}>
                  {data.daily_series.map((point) => {
                    const total = point.product_visits + point.store_visits;
                    const height = Math.max(6, (total / maxDailyVisits) * 120);
                    return (
                      <View key={point.date} style={styles.barWrap}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height,
                              backgroundColor: tintColor,
                            },
                          ]}
                        />
                        <StyledText variant="labelSmall" style={[styles.barLabel, { color: mutedColor }]}>
                          {new Date(point.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </StyledText>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}

          {data.top_products.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 10 }}>
                Top shared products
              </StyledText>
              {data.top_products.map((product, index) => (
                <View
                  key={product.product_id}
                  style={[
                    styles.productRow,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor },
                  ]}
                >
                  <View style={styles.productCopy}>
                    <StyledText variant="labelMedium" style={{ color: textColor }} numberOfLines={1}>
                      {product.name}
                    </StyledText>
                    <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 2 }}>
                      {product.visits} visits · {product.unique_visitors} unique ·{" "}
                      {product.app_opens} app opens
                    </StyledText>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {data.by_device.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 10 }}>
                Devices
              </StyledText>
              {data.by_device.map((item) => (
                <View key={item.device} style={styles.breakdownRow}>
                  <StyledText variant="bodySmall" style={{ color: textColor, textTransform: "capitalize" }}>
                    {item.device}
                  </StyledText>
                  <StyledText variant="labelMedium" style={{ color: tintColor }}>
                    {item.count}
                  </StyledText>
                </View>
              ))}
            </View>
          ) : null}

          {data.by_source.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}>
              <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 10 }}>
                UTM sources
              </StyledText>
              {data.by_source.map((item) => (
                <View key={item.source} style={styles.breakdownRow}>
                  <StyledText variant="bodySmall" style={{ color: textColor }}>
                    {item.source}
                  </StyledText>
                  <StyledText variant="labelMedium" style={{ color: tintColor }}>
                    {item.count}
                  </StyledText>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </>
  );

  if (embedded) {
    return <View style={styles.content}>{body}</View>;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {body}
    </ScrollView>
  );
};

export default LinkVisitsPanel;

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: 12,
  },
  timeframeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  timeframeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: (width - 50) / 2 - 5,
    minWidth: 140,
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 12,
  },
  sectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inlineStats: {
    gap: 4,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    minHeight: 150,
    paddingBottom: 4,
  },
  barWrap: {
    alignItems: "center",
    width: Math.max(28, (width - 80) / 14),
  },
  bar: {
    width: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  productRow: {
    paddingVertical: 10,
  },
  productCopy: {
    flex: 1,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  upgradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
});
