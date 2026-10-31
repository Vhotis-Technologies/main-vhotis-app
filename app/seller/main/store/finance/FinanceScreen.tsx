import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import FinanceSpendingChart from "@/app/component/seller/main/store/finance/FinanceSpendingChart";
import FinanceCategoryGrid from "@/app/component/seller/main/store/finance/FinanceCategoryGrid";
import { FinancePeriod } from "@/app/component/seller/main/store/finance/FinancePeriodToggle";
import FinanceBalanceCard from "@/app/component/seller/main/store/finance/FinanceBalanceCard";
import { useGetStoreWalletQuery } from "@/app/store/seller/api/financeApi";
import {
  buildFinanceCategoryItems,
  useFinanceOverview,
} from "@/app/hook/seller/useFinanceOverview";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const FinanceScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  useRequireSellerOwner();

  const [period, setPeriod] = useState<FinancePeriod>("weekly");
  const { activeStoreId } = useSellerStore({ includeLocations: true });

  const { data: walletData, isFetching: isFetchingWallet } =
    useGetStoreWalletQuery(
      activeStoreId ? { storeId: activeStoreId } : undefined,
    );
  const wallet = walletData?.wallet;

  const {
    chartData,
    periodTitle,
    periodTotal,
    currencyCode,
    categories,
    isFetching: isFetchingOverview,
  } = useFinanceOverview(period, activeStoreId);

  const openCategoryAnalytics = useCallback((label: string) => {
    router.push({
      pathname: "/seller/main/store/finance/FinanceAnalyticScreen",
      params: { category: label, period },
    });
  }, [period]);

  const categoryItems = buildFinanceCategoryItems(categories, {
    onPress: openCategoryAnalytics,
  });

  const goToWithdraw = () => {
    router.push("/seller/main/store/finance/WithdrawScreen");
  };

  const goToWallet = () => {
    router.push("/seller/main/store/finance/WalletScreen");
  };

  const isLoadingChart = isFetchingOverview && chartData.length === 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <FinanceBalanceCard
        availableBalance={wallet?.available_balance ?? 0}
        pendingBalance={wallet?.pending_balance}
        currencyCode={wallet?.currency?.trim() || currencyCode}
        isLoading={isFetchingWallet && !wallet}
        onWithdraw={goToWithdraw}
        onOpenWallet={goToWallet}
      />

      <FinanceSpendingChart
        title={periodTitle}
        amount={periodTotal}
        currencyCode={currencyCode}
        data={chartData}
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isLoadingChart}
      />

      <FinanceCategoryGrid items={categoryItems} currencyCode={currencyCode} />
    </ScrollView>
  );
};

export default FinanceScreen;

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
