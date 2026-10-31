import { useEffect } from "react";
import { router } from "expo-router";
import { useAppSelector } from "@/app/store/store";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";

/**
 * Redirect store admins away from owner-only screens (finance, billing, payouts).
 */
export function useRequireSellerOwner(
  redirectTo: string = "/seller/main/store/StoreScreen",
  enabled: boolean = true,
) {
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const isBlocked = isStoreAdminUser(user);

  useEffect(() => {
    if (enabled && isBlocked) {
      router.replace(redirectTo as never);
    }
  }, [isBlocked, redirectTo, enabled]);

  return { isBlocked, isOwner: !isBlocked };
}

export default useRequireSellerOwner;
