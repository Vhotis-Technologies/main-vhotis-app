import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

export interface MembershipTier {
  id: string;
  name: string;
  tagLine?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyBillingText?: string;
  badge?: string;
  features: string[];
}

export type MembershipStatus = "active" | "canceled" | "expired" | "past_due";

export interface UserMembership {
  currentPlan?: string;
  status: MembershipStatus | "pending";
  renewsOn?: string;
  billingCycle: "monthly";
  freeDeliveryUsed?: boolean;
  freeDeliveryAvailable?: boolean;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  cancelsOn?: string;
}

export interface CancelMembershipResponse {
  message: string;
  membership: UserMembership;
}

export interface GetPlansResponse {
  plans: MembershipTier[];
}

export interface GetCurrentMembershipResponse {
  membership: UserMembership | null;
}

export interface CreateMembershipRequest {
  tierId: string;
  billingCycle: "monthly" | "yearly";
}

export interface CreateMembershipResponse {
  message: string;
  membership: {
    id?: string;
    currentPlan?: string;
    status: MembershipStatus | "pending";
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
  };
}

export interface BillingRecord {
  id: string;
  amount: string;
  billing_date: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transaction_id: string;
  payment_method?: {
    id: number;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
  membership: {
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

const membershipApi = createApi({
  reducerPath: "membershipApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Membership", "Plans"],
  endpoints: (builder) => ({
    /* Get all active membership plans */
    getPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: "/api/v1/membership/get_plans/",
        method: "GET",
      }),
      providesTags: ["Plans"],
    }),

    /* Get current membership for the authenticated user */
    getCurrentMembership: builder.query<GetCurrentMembershipResponse, void>({
      query: () => ({
        url: "/api/v1/membership/get_current_membership/",
        method: "GET",
      }),
      providesTags: ["Membership"],
    }),

    /* Create a new membership for the authenticated user */
    createMembership: builder.mutation<
      CreateMembershipResponse,
      CreateMembershipRequest
    >({
      query: ({ tierId, billingCycle }) => ({
        url: "/api/v1/membership/create_membership/",
        method: "POST",
        data: { tierId, billingCycle },
      }),
      invalidatesTags: ["Membership", "Plans"],
    }),

    /* Get billing history for the authenticated user */
    getBillingHistory: builder.query<GetBillingHistoryResponse, void>({
      query: () => ({
        url: "/api/v1/membership/get_membership_billing_history/",
        method: "GET",
      }),
      providesTags: ["Membership"],
    }),

    cancelMembership: builder.mutation<CancelMembershipResponse, void>({
      query: () => ({
        url: "/api/v1/membership/cancel_membership/",
        method: "POST",
      }),
      invalidatesTags: ["Membership", "Plans"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentMembershipQuery,
  useCreateMembershipMutation,
  useGetBillingHistoryQuery,
  useCancelMembershipMutation,
} = membershipApi;

export default membershipApi;
