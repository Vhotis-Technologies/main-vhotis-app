/**
 * useDashboard — hooks for all WMS seller dashboard sections (Phase 4).
 *
 * Each hook wraps a single RTK Query endpoint for its section.
 * All hooks refetch on focus so the seller always sees fresh data when
 * they navigate back to the dashboard.
 */
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  useGet_dashboard_historyQuery,
  useGet_dashboard_inventoryQuery,
  useGet_dashboard_ordersQuery,
  useGet_dashboard_overviewQuery,
  useGet_dashboard_restocksQuery,
} from "@/app/store/seller/api/wmsApi";
import type {
  DashboardHistoryRow,
  DashboardInventoryRow,
  DashboardOrder,
  DashboardOverview,
  DashboardRestockRow,
} from "@/app/interfaces/seller/FulfillmentInterface";

// ─── Overview ────────────────────────────────────────────────────────────────

export interface UseDashboardOverview {
  data: DashboardOverview | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardOverview(): UseDashboardOverview {
  const { data, isLoading, isFetching, isError, refetch } =
    useGet_dashboard_overviewQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return { data, isLoading, isFetching, isError, refetch };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface UseDashboardOrders {
  orders: DashboardOrder[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardOrders(): UseDashboardOrders {
  const { data, isLoading, isFetching, isError, refetch } =
    useGet_dashboard_ordersQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    orders: data?.orders ?? [],
    count: data?.count ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface UseDashboardInventory {
  inventory: DashboardInventoryRow[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardInventory(): UseDashboardInventory {
  const { data, isLoading, isFetching, isError, refetch } =
    useGet_dashboard_inventoryQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    inventory: data?.inventory ?? [],
    count: data?.count ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}

// ─── Restocks ────────────────────────────────────────────────────────────────

export interface UseDashboardRestocks {
  restocks: DashboardRestockRow[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardRestocks(): UseDashboardRestocks {
  const { data, isLoading, isFetching, isError, refetch } =
    useGet_dashboard_restocksQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    restocks: data?.restocks ?? [],
    count: data?.count ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}

// ─── History ─────────────────────────────────────────────────────────────────

export interface UseDashboardHistory {
  history: DashboardHistoryRow[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboardHistory(): UseDashboardHistory {
  const { data, isLoading, isFetching, isError, refetch } =
    useGet_dashboard_historyQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    history: data?.history ?? [],
    count: data?.count ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
