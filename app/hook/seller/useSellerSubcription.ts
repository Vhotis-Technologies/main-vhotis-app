import { useMemo, useEffect } from "react";
import SubscriptionTier, {
  SellerSubscription,
  SubscriptionHookResponse,
} from "@/app/interfaces/seller/SubscriptionInterface";
import {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
} from "@/app/store/seller/api/subscriptionApi";
import { useAppDispatch } from "@/app/store/store";
import { mergeAuthenticatedUser } from "@/app/store/main/slices/authSlice";

/**
 * Hook that fetches subscription data from the server API.
 */
const useSellerSubcription = (): SubscriptionHookResponse => {
  const dispatch = useAppDispatch();

  // Fetch plans from API
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useGetPlansQuery();

  // Fetch current subscription from API
  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useGetCurrentSubscriptionQuery();

  useEffect(() => {
    if (subscriptionData?.entitlements) {
      dispatch(mergeAuthenticatedUser(subscriptionData.entitlements));
    }
  }, [subscriptionData?.entitlements, dispatch]);

  // Transform plans data from API response
  const plans: SubscriptionTier[] = useMemo(() => {
    if (!plansData?.plans) {
      return [];
    }
    return plansData.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tagLine: plan.tagLine,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      yearlyBillingText: plan.yearlyBillingText,
      badge: plan.badge,
      features: plan.features || [],
    }));
  }, [plansData]);

  // Transform subscription data from API response
  const subscription: SellerSubscription = useMemo(() => {
    if (!subscriptionData?.subscription) {
      // Return default subscription if none exists
      return {
        status: "expired",
        billingCycle: "monthly",
      };
    }

    const sub = subscriptionData.subscription;
    return {
      currentPlan: sub.currentPlan,
      status: sub.status,
      renewsOn: sub.renewsOn,
      billingCycle: sub.billingCycle,
    };
  }, [subscriptionData]);

  const selectedPlan = useMemo(() => {
    if (!subscription.currentPlan) {
      return undefined;
    }
    // Find plan by name match (currentPlan is the tier name)
    return plans.find((plan) => plan.name === subscription.currentPlan);
  }, [plans, subscription.currentPlan]);

  const isSubscribed = subscription.status === "active";

  const pendingUpgrade = useMemo(() => {
    const pending = subscriptionData?.pendingUpgrade;
    if (!pending?.subscriptionId || !pending.currentPlan) {
      return undefined;
    }
    return {
      subscriptionId: pending.subscriptionId,
      currentPlan: pending.currentPlan,
      status: "pending" as const,
      billingCycle: pending.billingCycle,
    };
  }, [subscriptionData?.pendingUpgrade]);

  const getPlanById = (planId: string) =>
    plans.find((plan) => plan.id === planId);

  return {
    plans,
    subscription,
    pendingUpgrade,
    selectedPlan,
    isSubscribed,
    getPlanById,
  };
};

export default useSellerSubcription;
