import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../main/api/rtkBaseQuery";

const CONNECT = "/api/v2/connect";

export type ConnectPayoutSchedule = {
  interval: string;
  weekly_anchor: string | null;
  managed_by: "platform" | string;
};

export type ConnectStatus = {
  account_id: string | null;
  status: "not_started" | "pending" | "restricted" | "ready" | string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  is_ready: boolean;
  updated_at: string | null;
  processing_fee_percent?: number;
  payout_schedule?: ConnectPayoutSchedule;
  can_open_express_dashboard?: boolean;
  onboarding_url?: string;
  express_dashboard_url?: string;
  expires_at?: number | null;
};

type ConnectEnvelope = { connect: ConnectStatus };

const connectApi = createApi({
  reducerPath: "connectApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Connect"],
  endpoints: (builder) => ({
    getConnectStatus: builder.query<ConnectStatus, void>({
      query: () => ({
        url: `${CONNECT}/status/`,
        method: "GET",
      }),
      transformResponse: (response: ConnectEnvelope) => response.connect,
      providesTags: ["Connect"],
    }),
    startConnectOnboarding: builder.mutation<ConnectStatus, void>({
      query: () => ({
        url: `${CONNECT}/start_onboarding/`,
        method: "POST",
      }),
      transformResponse: (response: ConnectEnvelope) => response.connect,
      invalidatesTags: ["Connect"],
    }),
    refreshConnectStatus: builder.mutation<ConnectStatus, void>({
      query: () => ({
        url: `${CONNECT}/refresh_status/`,
        method: "POST",
      }),
      transformResponse: (response: ConnectEnvelope) => response.connect,
      invalidatesTags: ["Connect"],
    }),
    openExpressDashboard: builder.mutation<ConnectStatus, void>({
      query: () => ({
        url: `${CONNECT}/express_dashboard/`,
        method: "POST",
      }),
      transformResponse: (response: ConnectEnvelope) => response.connect,
    }),
  }),
});

export const {
  useGetConnectStatusQuery,
  useStartConnectOnboardingMutation,
  useRefreshConnectStatusMutation,
  useOpenExpressDashboardMutation,
} = connectApi;
export default connectApi;
