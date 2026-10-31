import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import TimeSeriesChart from "@/app/component/seller/charts/TimeSeriesChart";
import HeatMapChart from "@/app/component/seller/charts/HeatMapChart";
import FunnelChart from "@/app/component/seller/charts/FunnelChart";
import CustomerDemographicsChart from "@/app/component/seller/charts/CustomerDemographicsChart";
import CustomerBehaviorChart from "@/app/component/seller/charts/CustomerBehaviorChart";
import CustomerSegmentsChart from "@/app/component/seller/charts/CustomerSegmentsChart";
import {
  TimeSeriesData,
  DemographicsData,
  BehaviorData,
  SegmentsData,
  FunnelData,
} from "@/app/interfaces/seller/StoreInterfaces";
import {
  useGetTimeSeriesDataQuery,
  useGetHeatmapDataQuery,
  useGetFunnelDataQuery,
  useGetCustomerDemographicsQuery,
  useGetCustomerBehaviorQuery,
  useGetCustomerSegmentsQuery,
} from "@/app/store/seller/api/analyticsApi";
import EmptyAnalyticsContainer from "@/app/component/seller/shared/EmptyAnalyticsContainer";
import LinkVisitsPanel from "@/app/component/seller/analytics/LinkVisitsPanel";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import { formatCurrency } from "@/app/_utils/main/helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 56;

type MainTab = "sales" | "customer" | "links";
type SalesTab = "timeSeries" | "heatMap" | "funnel";
type CustomerTab = "demographics" | "behavior" | "segments";

type MainTabConfig = {
  key: MainTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  blurb: string;
};

const MAIN_TABS: MainTabConfig[] = [
  {
    key: "sales",
    label: "Sales",
    icon: "trending-up",
    blurb: "Revenue, orders, and conversion over time.",
  },
  {
    key: "customer",
    label: "Customers",
    icon: "people-alt",
    blurb: "Who buys from you and how they behave.",
  },
  {
    key: "links",
    label: "Share links",
    icon: "link",
    blurb: "Web visits from shared product and store URLs.",
  },
];

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tintColor: string;
  textColor: string;
  mutedColor: string;
  cardColor: string;
  borderColor: string;
};

function MetricCard({
  label,
  value,
  hint,
  icon,
  tintColor,
  textColor,
  mutedColor,
  cardColor,
  borderColor,
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: cardColor, borderColor }]}>
      <View style={[styles.metricIconWrap, { backgroundColor: `${tintColor}14` }]}>
        <MaterialIcons name={icon} size={18} color={tintColor} />
      </View>
      <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 8 }}>
        {label}
      </StyledText>
      <StyledText
        variant="titleMedium"
        style={{ color: textColor, fontWeight: "700", marginTop: 2 }}
      >
        {value}
      </StyledText>
      {hint ? (
        <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 2 }}>
          {hint}
        </StyledText>
      ) : null}
    </View>
  );
}

type ChipProps = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  active: boolean;
  onPress: () => void;
  tintColor: string;
  textColor: string;
  cardColor: string;
  borderColor: string;
};

function Chip({
  label,
  icon,
  active,
  onPress,
  tintColor,
  textColor,
  cardColor,
  borderColor,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? tintColor : cardColor,
          borderColor,
        },
      ]}
    >
      <MaterialIcons name={icon} size={16} color={active ? "#fff" : textColor} />
      <StyledText
        variant="labelSmall"
        style={{
          color: active ? "#fff" : textColor,
          fontWeight: "600",
          marginLeft: 6,
        }}
      >
        {label}
      </StyledText>
    </Pressable>
  );
}

function sumRevenue(data: TimeSeriesData[] | undefined): number {
  if (!data?.length) return 0;
  return data.reduce((sum, row) => sum + (row.revenue || 0), 0);
}

function sumOrders(data: TimeSeriesData[] | undefined): number {
  if (!data?.length) return 0;
  return data.reduce((sum, row) => sum + (row.orders || 0), 0);
}

function sumDemographics(data: DemographicsData[] | undefined): number {
  if (!data?.length) return 0;
  return data.reduce((sum, row) => sum + (row.count || 0), 0);
}

function topSegment(data: SegmentsData[] | undefined): string {
  if (!data?.length) return "—";
  const top = [...data].sort((a, b) => b.count - a.count)[0];
  return top?.segment ?? "—";
}

function funnelConversion(data: FunnelData[] | undefined): string {
  if (!data?.length) return "—";
  const last = data[data.length - 1];
  if (last?.conversionRate != null) {
    return `${Math.round(last.conversionRate)}%`;
  }
  return "—";
}

const AnalyticScreen = () => {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const { activeStoreId, activeStore } = useSellerStore({ includeLocations: true });

  const [mainTab, setMainTab] = useState<MainTab>(
    tab === "customer" ? "customer" : tab === "links" ? "links" : "sales",
  );
  const [salesTab, setSalesTab] = useState<SalesTab>("timeSeries");
  const [customerTab, setCustomerTab] = useState<CustomerTab>("demographics");
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const {
    data: timeSeriesData,
    isLoading: isTimeSeriesLoading,
    refetch: refetchTimeSeries,
  } = useGetTimeSeriesDataQuery("this_week");
  const {
    data: heatmapData,
    isLoading: isHeatmapLoading,
    refetch: refetchHeatmap,
  } = useGetHeatmapDataQuery(undefined);
  const {
    data: funnelData,
    isLoading: isFunnelLoading,
    refetch: refetchFunnel,
  } = useGetFunnelDataQuery(undefined);
  const {
    data: customerDemographicsData,
    isLoading: isCustomerDemographicsLoading,
    refetch: refetchDemographics,
  } = useGetCustomerDemographicsQuery(undefined);
  const {
    data: customerBehaviorData,
    isLoading: isCustomerBehaviorLoading,
    refetch: refetchBehavior,
  } = useGetCustomerBehaviorQuery(undefined);
  const {
    data: customerSegmentsData,
    isLoading: isCustomerSegmentsLoading,
    refetch: refetchSegments,
  } = useGetCustomerSegmentsQuery(undefined);

  const activeMain = MAIN_TABS.find((item) => item.key === mainTab) ?? MAIN_TABS[0];

  const salesMetrics = useMemo(
    () => ({
      revenue: sumRevenue(timeSeriesData as TimeSeriesData[] | undefined),
      orders: sumOrders(timeSeriesData as TimeSeriesData[] | undefined),
      conversion: funnelConversion(funnelData as FunnelData[] | undefined),
    }),
    [timeSeriesData, funnelData],
  );

  const customerMetrics = useMemo(
    () => ({
      buyers: sumDemographics(
        customerDemographicsData as DemographicsData[] | undefined,
      ),
      topSegment: topSegment(customerSegmentsData as SegmentsData[] | undefined),
      segments: (customerSegmentsData as SegmentsData[] | undefined)?.length ?? 0,
    }),
    [customerDemographicsData, customerSegmentsData],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchTimeSeries(),
      refetchHeatmap(),
      refetchFunnel(),
      refetchDemographics(),
      refetchBehavior(),
      refetchSegments(),
    ]);
    setRefreshing(false);
  }, [
    refetchTimeSeries,
    refetchHeatmap,
    refetchFunnel,
    refetchDemographics,
    refetchBehavior,
    refetchSegments,
  ]);

  const renderSalesChart = () => {
    switch (salesTab) {
      case "heatMap":
        if (isHeatmapLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading heat map"
              message="Fetching sales patterns by day and hour."
            />
          );
        }
        if (!heatmapData || heatmapData.length === 0) {
          return (
            <EmptyAnalyticsContainer
              title="Sales heat map"
              message="No sales data yet. Heat patterns appear after your first orders."
              icon="grid-on"
            />
          );
        }
        return <HeatMapChart data={heatmapData} />;
      case "funnel":
        if (isFunnelLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading funnel"
              message="Fetching view-to-order conversion."
            />
          );
        }
        if (!funnelData || funnelData.length === 0) {
          return (
            <EmptyAnalyticsContainer
              title="Conversion funnel"
              message="No funnel data yet. Product views and orders will populate this chart."
              icon="filter-list"
            />
          );
        }
        return <FunnelChart data={funnelData} />;
      case "timeSeries":
      default:
        if (isTimeSeriesLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading trends"
              message="Fetching revenue and order history."
            />
          );
        }
        if (!timeSeriesData || timeSeriesData.length === 0) {
          return (
            <EmptyAnalyticsContainer
              title="Revenue trends"
              message="No sales this week yet. Trends appear once orders come in."
              icon="show-chart"
            />
          );
        }
        return (
          <TimeSeriesChart
            data={timeSeriesData}
            width={CHART_WIDTH}
            height={260}
          />
        );
    }
  };

  const renderCustomerChart = () => {
    switch (customerTab) {
      case "behavior":
        if (isCustomerBehaviorLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading behavior"
              message="Fetching purchase frequency and retention."
            />
          );
        }
        if (!customerBehaviorData || customerBehaviorData.length === 0) {
          return (
            <EmptyAnalyticsContainer
              title="Customer behavior"
              message="Behavior patterns appear after repeat customers shop with you."
              icon="psychology"
            />
          );
        }
        return (
          <CustomerBehaviorChart
            data={customerBehaviorData as BehaviorData[]}
          />
        );
      case "segments":
        if (isCustomerSegmentsLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading segments"
              message="Grouping customers by value and activity."
            />
          );
        }
        if (!customerSegmentsData || customerSegmentsData.length === 0) {
          return (
            <EmptyAnalyticsContainer
              title="Customer segments"
              message="Segments form once you have enough order history."
              icon="category"
            />
          );
        }
        return (
          <CustomerSegmentsChart
            data={customerSegmentsData as SegmentsData[]}
          />
        );
      case "demographics":
      default:
        if (isCustomerDemographicsLoading) {
          return (
            <EmptyAnalyticsContainer
              title="Loading demographics"
              message="Fetching age and profile breakdowns."
            />
          );
        }
        if (
          !customerDemographicsData ||
          customerDemographicsData.length === 0
        ) {
          return (
            <EmptyAnalyticsContainer
              title="Customer demographics"
              message="Demographics appear after customers complete purchases."
              icon="people"
            />
          );
        }
        return (
          <CustomerDemographicsChart
            data={customerDemographicsData as DemographicsData[]}
          />
        );
    }
  };

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: cardColor, borderColor }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${tintColor}16` }]}>
            <MaterialIcons name="insights" size={26} color={tintColor} />
          </View>
          <View style={styles.heroCopy}>
            <StyledText variant="titleLarge" style={{ color: textColor, fontWeight: "700" }}>
              Analytics
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 4 }}>
              {activeStore?.business_name
                ? `${activeStore.business_name} · performance overview`
                : "Monitor sales, customers, and share link traffic"}
            </StyledText>
          </View>
        </View>

        {/* Main tabs */}
        <View style={styles.tabRow}>
          {MAIN_TABS.map((item) => {
            const active = mainTab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setMainTab(item.key)}
                style={[
                  styles.mainTab,
                  {
                    backgroundColor: active ? tintColor : cardColor,
                    borderColor,
                  },
                ]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={active ? "#fff" : tintColor}
                />
                <StyledText
                  variant="labelMedium"
                  style={{
                    color: active ? "#fff" : textColor,
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </StyledText>
              </Pressable>
            );
          })}
        </View>

        {/* Section intro */}
        <View style={[styles.introCard, { backgroundColor: cardColor, borderColor }]}>
          <MaterialIcons name={activeMain.icon} size={20} color={tintColor} />
          <StyledText
            variant="bodySmall"
            style={{ color: mutedColor, flex: 1, marginLeft: 10, lineHeight: 20 }}
          >
            {activeMain.blurb}
          </StyledText>
        </View>

        {mainTab === "sales" ? (
          <>
            <View style={styles.metricRow}>
              <MetricCard
                label="Week revenue"
                value={formatCurrency(salesMetrics.revenue)}
                hint="This week"
                icon="payments"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <MetricCard
                label="Orders"
                value={String(salesMetrics.orders)}
                hint="This week"
                icon="shopping-bag"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <MetricCard
                label="Conversion"
                value={salesMetrics.conversion}
                hint="Funnel end rate"
                icon="filter-list"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <Chip
                label="Trends"
                icon="show-chart"
                active={salesTab === "timeSeries"}
                onPress={() => setSalesTab("timeSeries")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <Chip
                label="Heat map"
                icon="grid-on"
                active={salesTab === "heatMap"}
                onPress={() => setSalesTab("heatMap")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <Chip
                label="Funnel"
                icon="filter-list"
                active={salesTab === "funnel"}
                onPress={() => setSalesTab("funnel")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
            </ScrollView>

            <View style={[styles.chartCard, { backgroundColor: cardColor, borderColor }]}>
              {renderSalesChart()}
            </View>
          </>
        ) : null}

        {mainTab === "customer" ? (
          <>
            <View style={styles.metricRow}>
              <MetricCard
                label="Customers"
                value={String(customerMetrics.buyers)}
                hint="With profile data"
                icon="people"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <MetricCard
                label="Top segment"
                value={customerMetrics.topSegment}
                hint="By count"
                icon="star"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <MetricCard
                label="Segments"
                value={String(customerMetrics.segments)}
                hint="Active groups"
                icon="category"
                tintColor={tintColor}
                textColor={textColor}
                mutedColor={mutedColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <Chip
                label="Demographics"
                icon="people"
                active={customerTab === "demographics"}
                onPress={() => setCustomerTab("demographics")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <Chip
                label="Behavior"
                icon="psychology"
                active={customerTab === "behavior"}
                onPress={() => setCustomerTab("behavior")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
              <Chip
                label="Segments"
                icon="category"
                active={customerTab === "segments"}
                onPress={() => setCustomerTab("segments")}
                tintColor={tintColor}
                textColor={textColor}
                cardColor={cardColor}
                borderColor={borderColor}
              />
            </ScrollView>

            <View style={[styles.chartCard, { backgroundColor: cardColor, borderColor }]}>
              {renderCustomerChart()}
            </View>
          </>
        ) : null}

        {mainTab === "links" ? (
          <View style={[styles.chartCard, { backgroundColor: cardColor, borderColor }]}>
            <LinkVisitsPanel storeId={activeStoreId ?? undefined} embedded />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AnalyticScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  mainTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    minWidth: 150,
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chartCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    minHeight: 320,
    overflow: "hidden",
  },
});
