import { useCallback, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useUpdateStoreStateMutation,
  useGetSellerStoresQuery,
} from "@/app/store/seller/api/storeApi";
import { useGetStoreWalletQuery } from "@/app/store/seller/api/financeApi";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
  store,
} from "@/app/store/store";
import {
  setIsStoreOpen,
  isStoreOpenFromSellerStatus,
} from "@/app/store/seller/slice/storeSlice";
import { mergeAuthenticatedUser } from "@/app/store/main/slices/authSlice";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";
import type { SellerWallet } from "@/app/interfaces/seller/FinanceInterface";
import type {
  SellerPlanLimits,
  SellerStoreSummary,
} from "@/app/interfaces/seller/StoreInterface";
import { formatCurrency } from "@/app/_utils/main/helpers";
import * as SecureStore from "expo-secure-store";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export const STORE_TILE_GAP = 10;
export const STORE_H_PAD = 10;
export const STORE_TILE_WIDTH =
  (WINDOW_WIDTH - STORE_H_PAD * 2 - STORE_TILE_GAP) / 2;

export type StoreHubRoute =
  | string
  | { pathname: string; params?: Record<string, string> };

export type StoreHubTile = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: StoreHubRoute;
};

export type StoreWalletMetric = {
  key: keyof SellerWallet;
  label: string;
  helper: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const STORE_WALLET_METRICS: StoreWalletMetric[] = [
  {
    key: "pending_balance",
    label: "Pending",
    helper: "Clearing",
    icon: "hourglass-top",
  },
  {
    key: "total_earned",
    label: "Earned",
    helper: "Lifetime",
    icon: "trending-up",
  },
  {
    key: "total_withdrawn",
    label: "Withdrawn",
    helper: "Paid out",
    icon: "account-balance-wallet",
  },
];

export const STORE_MONETIZE_TILES: StoreHubTile[] = [
  {
    key: "subscription",
    title: "Subscription",
    subtitle: "Plan, renewals, upgrades",
    icon: "workspace-premium",
    route: "/seller/main/store/SubscriptionScreen",
  },
  {
    key: "billing-history",
    title: "Billing history",
    subtitle: "Invoices & charges",
    icon: "receipt-long",
    route: "/seller/main/store/BillingHistoryScreen",
  },
];

export const STORE_CATALOG_TILES: StoreHubTile[] = [
  {
    key: "inventory",
    title: "Add product",
    subtitle: "Create a listing",
    icon: "add-circle-outline",
    route: "/seller/main/products/InventoryScreen",
  },
  {
    key: "products",
    title: "Catalog",
    subtitle: "All products",
    icon: "view-list",
    route: "/seller/main/products/ProductsScreen",
  },
  {
    key: "promos",
    title: "Promotions",
    subtitle: "Deals & discounts",
    icon: "local-offer",
    route: "/seller/main/promotions/PromotionsScreen",
  },
  {
    key: "sponsored",
    title: "Sponsored",
    subtitle: "Featured ads",
    icon: "campaign",
    route: "/seller/main/sponsored/SponsorScreen",
  },
  {
    key: "promo-history",
    title: "Deal history",
    subtitle: "Past runs",
    icon: "history",
    route: "/seller/main/promotions/PromotionHistoryScreen",
  },
];

export const STORE_INSIGHT_TILES: StoreHubTile[] = [
  {
    key: "sales",
    title: "Sales",
    subtitle: "Performance",
    icon: "trending-up",
    route: {
      pathname: "/seller/main/store/AnalyticScreen",
      params: { tab: "sales" },
    },
  },
  {
    key: "customers",
    title: "Shoppers",
    subtitle: "Behavior",
    icon: "groups",
    route: {
      pathname: "/seller/main/store/AnalyticScreen",
      params: { tab: "customer" },
    },
  },
  {
    key: "share-links",
    title: "Share links",
    subtitle: "Web visits",
    icon: "link",
    route: {
      pathname: "/seller/main/store/AnalyticScreen",
      params: { tab: "links" },
    },
  },
];

export const STORE_RELATION_TILES: StoreHubTile[] = [
  {
    key: "messages",
    title: "Messages",
    subtitle: "Inbox",
    icon: "forum",
    route: "/seller/main/communication/MessageScreen",
  },
  {
    key: "reviews",
    title: "Reviews",
    subtitle: "Ratings",
    icon: "star",
    route: "/seller/main/communication/ReviewScreen",
  },
];

export const STORE_CONFIG_TILES: StoreHubTile[] = [
  {
    key: "store-info",
    title: "Store profile",
    subtitle: "Details & branding",
    icon: "storefront",
    route: "/seller/main/settings/StoreDisplayscreen",
  },
  {
    key: "payments",
    title: "Payouts",
    subtitle: "Payment methods",
    icon: "payments",
    route: "/seller/main/settings/PaymentFlowScreen",
  },
  {
    key: "shipping",
    title: "Shipping",
    subtitle: "Rates & zones",
    icon: "local-shipping",
    route: "../settings/shipping",
  },
  {
    key: "management",
    title: "Management",
    subtitle: "Locations, links & team",
    icon: "tune",
    route: "/seller/main/store/ManagementScreen",
  },
];

export function getStoreMonetizeTiles(user: Seller | null): StoreHubTile[] {
  if (isStoreAdminUser(user)) {
    return [];
  }
  return STORE_MONETIZE_TILES;
}

export function getStoreConfigTiles(
  user: Seller | null,
  activeStoreId?: string | null,
): StoreHubTile[] {
  let tiles: StoreHubTile[];
  if (isStoreAdminUser(user)) {
    tiles = STORE_CONFIG_TILES.filter(
      (tile) => !["management", "payments"].includes(tile.key),
    );
    const assignedStoreId = user?.assigned_store_id?.trim();
    if (assignedStoreId) {
      tiles = [
        {
          key: "store-details",
          title: "Store details",
          subtitle: "Share link",
          icon: "info-outline",
          route: {
            pathname: "/seller/main/store/StoreDetailsScreen",
            params: { storeId: assignedStoreId },
          },
        },
        ...tiles,
      ];
    }
  } else {
    tiles = STORE_CONFIG_TILES;
  }

  if (!activeStoreId) {
    return tiles;
  }

  return tiles.map((tile) => {
    if (tile.key === "store-info") {
      return {
        ...tile,
        route: {
          pathname: "/seller/main/settings/StoreDisplayscreen",
          params: { storeId: activeStoreId },
        },
      };
    }
    if (tile.key === "management" && !isStoreAdminUser(user)) {
      return {
        ...tile,
        subtitle: "Locations, links & team",
      };
    }
    return tile;
  });
}

export function parseWalletMoney(value?: string | number) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatWalletAmount(
  value?: string | number,
  country?: string,
  currencyCode?: string,
) {
  const amount = parseWalletMoney(value);
  const code = currencyCode?.trim().toUpperCase();
  if (code === "GBP" || code === "EUR") {
    return amount.toLocaleString("en-GB", {
      style: "currency",
      currency: code,
    });
  }
  return formatCurrency(amount, country);
}

export function navigateStoreHub(route: StoreHubRoute) {
  if (typeof route === "string") {
    router.push(route as never);
  } else {
    router.push({
      pathname: route.pathname as never,
      params: route.params as never,
    });
  }
}

export function getStoreDisplayName(user: Seller | null) {
  return (
    user?.business_name?.trim() || user?.email?.split("@")[0] || "Your store"
  );
}

export function getStoreAvatarLabel(displayName: string) {
  return displayName.slice(0, 2).toUpperCase();
}

export const ACTIVE_STORE_KEY = "active_store_id";

const useSellerStore = ({
  includeWallet = false,
  includeLocations = false,
} = {}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s: RootState) => s.auth.user) as Seller | null;
  const isAuthReady = useAppSelector((s: RootState) => s.auth.isAuthReady);
  const isOwner = Boolean(user?.is_seller && !isStoreAdminUser(user));
  const isStoreAdmin = isStoreAdminUser(user);
  const isStoreOpen = useAppSelector((s: RootState) => s.store.isStoreOpen);
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);
  const [updateStoreState, { isLoading: isUpdatingStore }] =
    useUpdateStoreStateMutation();
  const {
    data: sellerStoresData,
    isLoading: isLoadingStores,
    refetch: refetchStores,
  } = useGetSellerStoresQuery(undefined, {
    skip: !includeLocations || !isOwner || !isAuthReady,
  });
  const sellerStores: SellerStoreSummary[] = sellerStoresData?.stores ?? [];
  const planLimits: SellerPlanLimits | undefined = sellerStoresData?.limits;
  const activeStore =
    sellerStores.find((store) => store.id === activeStoreId) ??
    sellerStores[0] ??
    null;

  const {
    data: walletSummary,
    isFetching: isFetchingWallet,
    refetch: refetchWallet,
  } = useGetStoreWalletQuery(
    activeStoreId ? { storeId: activeStoreId } : undefined,
    { skip: !includeWallet || isStoreAdmin || !isOwner },
  );

  const { setAlertConfig, setIsVisible } = useAlertContext();

  const displayName =
    activeStore?.business_name?.trim() || getStoreDisplayName(user);
  const avatarLabel = getStoreAvatarLabel(displayName);
  const walletCurrency = walletSummary?.wallet?.currency?.trim() || "EUR";
  const formatWalletValue = (value?: string | number) =>
    formatWalletAmount(value, user?.address?.country, walletCurrency);

  const availableBalance =
    isFetchingWallet && !walletSummary?.wallet
      ? "—"
      : formatWalletValue(walletSummary?.wallet?.available_balance);

  useEffect(() => {
    if (!includeLocations || !isOwner) {
      return;
    }
    const loadActiveStore = async () => {
      try {
        const stored = await SecureStore.getItemAsync(ACTIVE_STORE_KEY);
        if (stored) {
          setActiveStoreIdState(stored);
        }
      } catch (error) {
        console.warn("Could not load active store id", error);
      }
    };
    void loadActiveStore();
  }, [includeLocations, isOwner]);

  useEffect(() => {
    if (!includeLocations || !sellerStores.length) {
      return;
    }
    setActiveStoreIdState((current) => {
      if (current && sellerStores.some((store) => store.id === current)) {
        return current;
      }
      return sellerStores[0]?.id ?? null;
    });
  }, [includeLocations, sellerStores]);

  useEffect(() => {
    if (!activeStore?.status) {
      return;
    }
    dispatch(setIsStoreOpen(isStoreOpenFromSellerStatus(activeStore.status)));
  }, [activeStore?.status, dispatch]);

  useEffect(() => {
    const storeStatus = walletSummary?.store?.status;
    if (storeStatus && !activeStore?.status) {
      dispatch(setIsStoreOpen(isStoreOpenFromSellerStatus(storeStatus)));
    }
  }, [walletSummary?.store?.status, activeStore?.status, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (includeWallet) {
        refetchWallet();
      }
    }, [includeWallet, refetchWallet]),
  );

  /* Update the seller store status to open or closed.
   * Merge the update to the secure storage ensuring that when the user is logged in, the store status is persisted.
   * @param data - The data to update the store status to
   * @returns void
   */
  const setActiveStoreId = useCallback(
    async (storeId: string) => {
      setActiveStoreIdState(storeId);
      try {
        await SecureStore.setItemAsync(ACTIVE_STORE_KEY, storeId);
      } catch (error) {
        console.warn("Could not persist active store id", error);
      }
      const selected = sellerStores.find((store) => store.id === storeId);
      if (selected?.status) {
        dispatch(setIsStoreOpen(isStoreOpenFromSellerStatus(selected.status)));
      }
    },
    [dispatch, sellerStores],
  );

  const updateStore = async (data: { store_status: string }) => {
    try {
      const response = await updateStoreState({
        store_status: data.store_status,
        storeId: activeStoreId ?? undefined,
      }).unwrap();
      if (response) {
        dispatch(
          setIsStoreOpen(isStoreOpenFromSellerStatus(data.store_status)),
        );
        dispatch(mergeAuthenticatedUser({ store_status: data.store_status }));
        try {
          const persistedUser = store.getState().auth.user;
          if (persistedUser) {
            await SecureStore.setItemAsync(
              "user",
              JSON.stringify(persistedUser),
            );
          }
        } catch (persistErr) {
          console.warn(
            "Could not persist store status to secure storage",
            persistErr,
          );
        }
        setAlertConfig({
          title: "Store Status Updated",
          message: response.message,
          type: "success",
          isVisible: true,
          onConfirm: () => {
            setIsVisible(false);
          },
        });
      }
    } catch (error: any) {
      setAlertConfig({
        title: "Error",
        message:
          error?.data?.message ?? "Could not update store. Please try again.",
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  };

  /* Toggle the store open or closed status.
   * @returns void
   */
  const toggleStoreOpen = () => {
    const nextOpen = !isStoreOpen;
    return updateStore({ store_status: nextOpen ? "open" : "closed" });
  };

  return {
    updateStore,
    toggleStoreOpen,
    isUpdatingStore,
    wallet: walletSummary?.wallet,
    isFetchingWallet,
    refetchWallet,
    displayName,
    avatarLabel,
    walletCurrency,
    availableBalance,
    formatWalletValue,
    sellerStores,
    planLimits,
    activeStoreId,
    activeStore,
    setActiveStoreId,
    isLoadingStores,
    refetchStores,
    canAddStore: planLimits?.can_add_store ?? false,
    isOwner,
    isStoreAdmin,
  };
};

export default useSellerStore;
