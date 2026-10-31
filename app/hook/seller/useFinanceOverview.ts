import { useMemo } from "react";
import type { FinanceChartPoint } from "@/app/component/seller/main/store/finance/FinanceSpendingChart";
import type { FinanceCategoryItem } from "@/app/component/seller/main/store/finance/FinanceCategoryCard";
import type { FinancePeriod } from "@/app/component/seller/main/store/finance/FinancePeriodToggle";
import { useGetFinanceOverviewQuery } from "@/app/store/seller/api/financeApi";

/* Gets the finance period title based on the period */
export function getFinancePeriodTitle(period: FinancePeriod): string {
  const month = new Date().toLocaleString("en-GB", { month: "long" });
  return period === "weekly" ? `This week · ${month}` : `${month} earnings`;
}

/* Maps the overview chart to points */
export function mapOverviewChartToPoints(
  chart: { label: string; value: number; highlighted?: boolean }[] | undefined,
): FinanceChartPoint[] {
  if (!chart?.length) {
    return [];
  }
  return chart.map((point) => ({
    label: point.label,
    value: point.value,
    highlighted: point.highlighted,
  }));
}

/* Builds the finance category items */
type BuildCategoryOptions = {
  onPress: (label: string) => void;
};

/* Builds the finance category items */
export function buildFinanceCategoryItems(
  categories:
    | {
        sales: number;
        withdrawals: number;
        refunds: number;
        pending: number;
      }
    | undefined,
  { onPress }: BuildCategoryOptions,
): FinanceCategoryItem[] {
  const sales = categories?.sales ?? 0;
  const withdrawals = categories?.withdrawals ?? 0;
  const refunds = categories?.refunds ?? 0;
  const pending = categories?.pending ?? 0;

  return [
    {
      key: "withdrawals",
      label: "Withdrawal",
      amount: withdrawals,
      tone: "neutral",
      icon: "north-east",
      onPress: () => onPress("Withdrawal"),
    },
    {
      key: "sales",
      label: "Sales",
      amount: sales,
      tone: "accent",
      icon: "north-east",
      onPress: () => onPress("Sales"),
    },
    {
      key: "refunds",
      label: "Refunds",
      amount: refunds,
      tone: "warm",
      icon: "north-east",
      onPress: () => onPress("Refunds"),
    },
    {
      key: "pending",
      label: "Pending",
      amount: pending,
      tone: "neutral",
      icon: "hourglass-top",
      onPress: () => onPress("Pending"),
    },
  ];
}

/* Gets the finance overview */
export function useFinanceOverview(
  period: FinancePeriod,
  storeId?: string | null,
) {
  const { data, isFetching, isError, refetch } = useGetFinanceOverviewQuery({
    period,
    ...(storeId ? { storeId } : {}),
  });

  const chartData = useMemo(
    () => mapOverviewChartToPoints(data?.chart),
    [data?.chart],
  );

  const periodTitle = useMemo(() => getFinancePeriodTitle(period), [period]);

  return {
    overview: data,
    chartData,
    periodTitle,
    periodTotal: data?.period_total ?? 0,
    currencyCode: data?.currency?.trim() || "EUR",
    categories: data?.categories,
    isFetching,
    isError,
    refetch,
  };
}
