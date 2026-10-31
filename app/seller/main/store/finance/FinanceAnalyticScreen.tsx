import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import FinanceSpendingChart from "@/app/component/seller/main/store/finance/FinanceSpendingChart";
import FinanceHistoryList from "@/app/component/seller/main/store/finance/FinanceHistoryList";
import { FinanceHistoryEntry } from "@/app/component/seller/main/store/finance/FinanceHistoryItem";
import { FinancePeriod } from "@/app/component/seller/main/store/finance/FinancePeriodToggle";
import { useGetPayoutHistoryQuery } from "@/app/store/seller/api/financeApi";
import {
  getFinancePeriodTitle,
  useFinanceOverview,
} from "@/app/hook/seller/useFinanceOverview";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const CATEGORY_AMOUNT_KEY: Record<
  string,
  keyof NonNullable<ReturnType<typeof useFinanceOverview>["categories"]>
> = {
  Sales: "sales",
  Withdrawal: "withdrawals",
  Refunds: "refunds",
  Pending: "pending",
};

const FinanceAnalyticScreen = () => {
  /* This hook is used to redirect store admins away from owner-only screens (finance, billing, payouts). */
  useRequireSellerOwner();

  const backgroundColor = useThemeColor({}, "background");
  const { activeStoreId } = useSellerStore({ includeLocations: true });
  const params = useLocalSearchParams<{ category?: string; period?: string }>();
  const headerTitle = params.category || "Analytics";
  const initialPeriod: FinancePeriod =
    params.period === "monthly" ? "monthly" : "weekly";

  const [period, setPeriod] = useState<FinancePeriod>(initialPeriod);

  const { chartData, periodTotal, currencyCode, categories, isFetching } =
    useFinanceOverview(period, activeStoreId);

  const { data: payoutData, isFetching: isPayoutsLoading } =
    useGetPayoutHistoryQuery();

  const categoryAmount = useMemo(() => {
    if (headerTitle === "Sales") {
      return periodTotal;
    }
    const key = CATEGORY_AMOUNT_KEY[headerTitle];
    if (!key || !categories) {
      return periodTotal;
    }
    return categories[key] ?? 0;
  }, [categories, headerTitle, periodTotal]);

  const historyEntries: FinanceHistoryEntry[] = useMemo(() => {
    if (headerTitle !== "Withdrawal") {
      return [];
    }
    const results = payoutData?.results ?? [];
    return results.map((entry) => ({
      key: entry.id,
      title: entry.title,
      cardLast4: entry.card_last4,
      amount: Number(entry.amount) || 0,
      date: entry.date,
      type: entry.type,
    }));
  }, [headerTitle, payoutData?.results]);

  const historyTitle =
    headerTitle === "Withdrawal" ? "Payout history" : "Activity";

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: headerTitle }} />

      <FinanceSpendingChart
        title={`${headerTitle} · ${getFinancePeriodTitle(period)}`}
        amount={categoryAmount}
        currencyCode={currencyCode}
        data={chartData}
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isFetching && chartData.length === 0}
      />

      {headerTitle === "Withdrawal" && (
        <FinanceHistoryList
          title={historyTitle}
          entries={isPayoutsLoading ? [] : historyEntries}
          onSeeAll={() => {}}
        />
      )}
    </ScrollView>
  );
};

export default FinanceAnalyticScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },
});
