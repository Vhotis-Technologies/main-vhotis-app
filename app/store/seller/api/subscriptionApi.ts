import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import SubscriptionTier, {
  PendingSubscriptionUpgrade,
  SellerSubscription,
  SubscriptionStatus,
} from "@/app/interfaces/seller/SubscriptionInterface";

export interface GetPlansResponse {
  plans: SubscriptionTier[];
}

export interface GetCurrentSubscriptionResponse {
  subscription: SellerSubscription | null;
  pendingUpgrade?: PendingSubscriptionUpgrade | null;
  entitlements?: {
    subscription_plan?: string;
    has_active_subscription?: boolean;
    subscription_tier_code?: string;
    allows_bulk_import?: boolean;
    allows_seller_admins?: boolean;
    listing_fee_amount?: string;
    max_products?: number | null;
    max_stores?: number | null;
    max_admins?: number | null;
  };
}

export interface CreateSubscriptionRequest {
  tierId: string;
  billingCycle: "monthly" | "yearly";
}

export interface CreateSubscriptionResponse {
  message: string;
  subscription: {
    id?: string;
    currentPlan?: string;
    status: SubscriptionStatus;
    renewsOn?: string;
    billingCycle: "monthly" | "yearly";
  };
  paymentSheet?: {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  };
  billing?: {
    id: string;
    amount: number;
    status: string;
    transaction_id?: string;
    stripe_payment_intent_id?: string | null;
  };
}

export interface ConfirmSubscriptionPaymentRequest {
  subscriptionId: string;
  paymentIntentId?: string;
}

export interface ConfirmSubscriptionPaymentResponse {
  message: string;
  subscription: SellerSubscription;
  entitlements?: GetCurrentSubscriptionResponse["entitlements"];
}

export interface BillingRecord {
  id: string;
  amount: string;
  billing_date: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transaction_id: string;
  subscription: {
    id: string;
    plan: {
      id: string;
      name: string;
      tier: {
        id: string;
        name: string;
      };
      billing_cycle: "monthly" | "annually";
    };
  };
  created_at: string;
  updated_at: string;
}

export interface GetBillingHistoryResponse {
  billing_history: BillingRecord[];
}

const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Subscription", "Plans"],
  endpoints: (builder) => ({
    /* Get all active subscription plans */
    getPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: "/api/v2/subscription/get_plans/",
        method: "GET",
      }),
      providesTags: ["Plans"],
    }),

    /* Get current subscription for the authenticated seller's store */
    getCurrentSubscription: builder.query<GetCurrentSubscriptionResponse, void>(
      {
        query: () => ({
          url: "/api/v2/subscription/get_current_subscription/",
          method: "GET",
        }),
        providesTags: ["Subscription"],
      },
    ),

    /* Create a new subscription for the authenticated seller's store */
    createSubscription: builder.mutation<
      CreateSubscriptionResponse,
      CreateSubscriptionRequest
    >({
      query: ({ tierId, billingCycle }) => ({
        url: "/api/v2/subscription/create_subscription/",
        method: "POST",
        data: { tierId, billingCycle },
      }),
      invalidatesTags: ["Subscription", "Plans"],
    }),

    confirmSubscriptionPayment: builder.mutation<
      ConfirmSubscriptionPaymentResponse,
      ConfirmSubscriptionPaymentRequest
    >({
      query: ({ subscriptionId, paymentIntentId }) => ({
        url: "/api/v2/subscription/confirm_subscription_payment/",
        method: "POST",
        data: { subscriptionId, paymentIntentId },
      }),
      invalidatesTags: ["Subscription", "Plans"],
    }),

    /* Get billing history for the authenticated seller's store */
    getBillingHistory: builder.query<GetBillingHistoryResponse, void>({
      query: () => ({
        url: "/api/v2/subscription/get_subscription_billing_history/",
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionMutation,
  useConfirmSubscriptionPaymentMutation,
  useGetBillingHistoryQuery,
} = subscriptionApi;

export default subscriptionApi;
