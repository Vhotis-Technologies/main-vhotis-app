import { useMemo } from "react";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  isStoreAdminUser,
} from "@/app/interfaces/main/Authentication";
import useSellerStore from "@/app/hook/seller/useSellerStore";

export function useCampaignHistoryStoreId() {
  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const { activeStoreId } = useSellerStore({ includeLocations: true });

  return useMemo(() => {
    if (isStoreAdminUser(user)) {
      return user?.assigned_store_id ?? undefined;
    }
    return activeStoreId ?? undefined;
  }, [user, activeStoreId]);
}
