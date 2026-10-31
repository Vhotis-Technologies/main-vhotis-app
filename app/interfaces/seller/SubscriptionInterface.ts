export type SubscriptionStatus =
  | "active"
  | "pending"
  | "past_due"
  | "canceled"
  | "expired";

export default interface SubscriptionTier {
  id: string;
  name: string;
  tagLine?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyBillingText?: string;
  badge?: string;
  features: string[];
  maxStores?: number | null;
  maxAdmins?: number | null;
}

export interface SellerSubscription {
  currentPlan?: string;
  status: SubscriptionStatus;
  renewsOn?: string;
  billingCycle: "monthly" | "yearly";
}

export interface PendingSubscriptionUpgrade {
  subscriptionId: string;
  currentPlan: string;
  status: "pending";
  billingCycle: "monthly" | "yearly";
}

export interface SubscriptionHookResponse {
  plans: SubscriptionTier[];
  subscription: SellerSubscription;
  pendingUpgrade?: PendingSubscriptionUpgrade;
  selectedPlan?: SubscriptionTier;
  isSubscribed: boolean;
  getPlanById: (planId: string) => SubscriptionTier | undefined;
}
