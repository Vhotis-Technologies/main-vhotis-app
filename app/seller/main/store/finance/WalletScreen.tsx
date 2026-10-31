import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import FinanceHistoryList from "@/app/component/seller/main/store/finance/FinanceHistoryList";
import { FinanceHistoryEntry } from "@/app/component/seller/main/store/finance/FinanceHistoryItem";
import {
  useGetPayoutHistoryQuery,
  useGetStoreWalletQuery,
} from "@/app/store/seller/api/financeApi";
import { useAppSelector, RootState } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import useSellerStore, {
  formatWalletAmount,
} from "@/app/hook/seller/useSellerStore";

type MetricKey =
  | "available_balance"
  | "pending_balance"
  | "total_earned"
  | "total_withdrawn";

const METRICS: {
  key: MetricKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    key: "available_balance",
    label: "Available",
    icon: "account-balance-wallet",
  },
  { key: "pending_balance", label: "Pending", icon: "hourglass-top" },
  { key: "total_earned", label: "Earned", icon: "trending-up" },
  { key: "total_withdrawn", label: "Withdrawn", icon: "payments" },
];

const toNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const WalletScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  const user = useAppSelector((s: RootState) => s.auth.user) as Seller | null;
  const { activeStoreId } = useSellerStore({ includeLocations: true });
  const { data, isFetching, refetch } = useGetStoreWalletQuery(
    activeStoreId ? { storeId: activeStoreId } : undefined,
  );
  const { data: payoutData, isFetching: isPayoutsLoading } =
    useGetPayoutHistoryQuery();
  const wallet = data?.wallet;
  const walletCurrency = wallet?.currency?.trim() || "EUR";
  const availableBalance = toNumber(wallet?.available_balance);

  const metrics = useMemo(
    () =>
      METRICS.map((metric) => ({
        ...metric,
        value: formatWalletAmount(
          wallet?.[metric.key],
          user?.address?.country,
          walletCurrency,
        ),
      })),
    [wallet, user?.address?.country, walletCurrency],
  );

  const payoutEntries: FinanceHistoryEntry[] = useMemo(() => {
    const results = payoutData?.results ?? [];
    return results.map((entry) => ({
      key: entry.id,
      title: entry.title,
      cardLast4: entry.card_last4,
      amount: toNumber(entry.amount),
      date: entry.date,
      type: entry.type,
    }));
  }, [payoutData]);

  const goToWithdraw = () => {
    router.push("/seller/main/store/finance/WithdrawScreen");
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: cardColor, borderColor }]}>
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          Available balance
        </StyledText>
        <StyledText
          variant="displaySmall"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={[styles.heroAmount, { color: textColor }]}
        >
          {isFetching && !wallet
            ? "—"
            : formatWalletAmount(
                availableBalance,
                user?.address?.country,
                walletCurrency,
              )}
        </StyledText>

        <StyledButton
          title="Withdraw"
          onPress={goToWithdraw}
          variant="tonal"
          buttonStyles={styles.heroAction}
        />
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View
            key={metric.key}
            style={[
              styles.metricCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <MaterialIcons name={metric.icon} size={20} color={textColor} />
            <StyledText
              variant="labelSmall"
              style={[styles.metricLabel, { color: iconMuted }]}
            >
              {metric.label}
            </StyledText>
            <StyledText
              variant="titleMedium"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ color: textColor, fontWeight: "700" }}
            >
              {metric.value}
            </StyledText>
          </View>
        ))}
      </View>

      <FinanceHistoryList
        title="Payout history"
        entries={isPayoutsLoading ? [] : payoutEntries}
        onSeeAll={() => refetch()}
      />
    </ScrollView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  heroAmount: {
    fontWeight: "800",
    letterSpacing: -1,
  },
  heroAction: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "47.5%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  metricLabel: {
    marginTop: 4,
  },
});
