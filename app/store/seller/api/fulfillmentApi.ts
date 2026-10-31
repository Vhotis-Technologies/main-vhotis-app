import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";

export type FulfillmentEnrollmentStatus = "none" | "pending" | "active";

export type StorageZoneQty = {
  zone: "ambient" | "cold" | "frozen";
  quantity: number | string;
};

export type StoragePaymentIntent = {
  clientSecret: string;
  paymentIntentId: string;
  amount: string;
  currency: string;
  customer: string;
  ephemeralKey: string;
  subscriptionId: number;
};

export type StorageRateRow = {
  id: number | null;
  zone: string;
  unit: string;
  amount: string;
  currency: string;
  description: string;
};

export type StorageQuote = {
  currency: string;
  spaceUnit: string;
  billingPeriodDays: number;
  periodTotal: string;
  lines: Array<{
    zone: string;
    unit: string;
    quantity: string;
    unitRate: string;
    lineTotal: string;
  }>;
};

function mapBackendStatus(raw?: string | null): FulfillmentEnrollmentStatus {
  if (raw === "active") return "active";
  if (raw === "pending_approval" || raw === "pending") return "pending";
  return "none";
}

export const fulfillmentApi = createApi({
  reducerPath: "fulfillmentApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["FulfillmentStatus"],
  endpoints: (builder) => ({
    get_fulfillment_status: builder.query<{ status: string }, void>({
      query: () => ({
        url: "/api/v3/fulfillment/status/",
        method: "GET",
      }),
      transformResponse: (response: { status: string }) => response,
      providesTags: ["FulfillmentStatus"],
    }),
    get_fulfillment_warehouses: builder.query<
      { warehouses: Array<{ code: string; name: string; city: string; country: string }> },
      void
    >({
      query: () => ({
        url: "/api/v3/fulfillment/warehouses/",
        method: "GET",
      }),
    }),
    get_storage_rates: builder.query<
      { currency: string; billingPeriodDays: number; rates: StorageRateRow[] },
      string | void
    >({
      query: (currency) => ({
        url: "/api/v3/fulfillment/storage_rates/",
        method: "GET",
        params: currency ? { currency } : undefined,
      }),
      transformResponse: (raw: {
        currency: string;
        billing_period_days: number;
        rates: Record<string, unknown>[];
      }) => ({
        currency: raw.currency,
        billingPeriodDays: raw.billing_period_days,
        rates: (raw.rates ?? []).map((r) => ({
          id: (r.id as number) ?? null,
          zone: String(r.zone ?? ""),
          unit: String(r.unit ?? ""),
          amount: String(r.amount ?? "0"),
          currency: String(r.currency ?? "EUR"),
          description: String(r.description ?? ""),
        })),
      }),
    }),
    quote_storage: builder.mutation<
      StorageQuote,
      { space_unit: "cbm" | "pallet"; zones: StorageZoneQty[]; currency?: string }
    >({
      query: (data) => ({
        url: "/api/v3/fulfillment/storage_quote/",
        method: "POST",
        data,
      }),
      transformResponse: (raw: Record<string, unknown>) => {
        const lines = Array.isArray(raw.lines) ? raw.lines : [];
        return {
          currency: String(raw.currency ?? "EUR"),
          spaceUnit: String(raw.space_unit ?? "cbm"),
          billingPeriodDays: Number(raw.billing_period_days ?? 30),
          periodTotal: String(raw.period_total ?? "0"),
          lines: lines.map((line) => {
            const l = line as Record<string, unknown>;
            return {
              zone: String(l.zone ?? ""),
              unit: String(l.unit ?? ""),
              quantity: String(l.quantity ?? "0"),
              unitRate: String(l.unit_rate ?? "0"),
              lineTotal: String(l.line_total ?? "0"),
            };
          }),
        };
      },
    }),
    apply_fulfillment: builder.mutation<
      {
        status: string;
        payment: StoragePaymentIntent;
      },
      {
        warehouse_code: string;
        space_unit: "cbm" | "pallet";
        inbound_method: "seller_delivery" | "vhotis_collection";
        zones: StorageZoneQty[];
      }
    >({
      query: (data) => ({
        url: "/api/v3/fulfillment/apply/",
        method: "POST",
        data,
      }),
      transformResponse: (raw: Record<string, unknown>) => {
        const paymentRaw = (raw.payment as Record<string, unknown> | undefined) ?? raw;
        return {
          status: String(raw.status ?? "pending_approval"),
          payment: {
            clientSecret: String(paymentRaw.client_secret ?? raw.client_secret ?? ""),
            paymentIntentId: String(
              paymentRaw.payment_intent_id ?? raw.payment_intent_id ?? "",
            ),
            amount: String(paymentRaw.amount ?? raw.amount ?? "0"),
            currency: String(paymentRaw.currency ?? raw.currency ?? "EUR"),
            customer: String(paymentRaw.customer ?? raw.customer ?? ""),
            ephemeralKey: String(paymentRaw.ephemeral_key ?? raw.ephemeral_key ?? ""),
            subscriptionId: Number(paymentRaw.subscription_id ?? 0),
          },
        };
      },
      invalidatesTags: ["FulfillmentStatus"],
    }),
    quote_storage_increase: builder.mutation<
      StorageIncreaseQuote,
      { zones: StorageZoneQty[] }
    >({
      query: (data) => ({
        url: "/api/v3/fulfillment/storage_increase_quote/",
        method: "POST",
        data,
      }),
      transformResponse: (raw: Record<string, unknown>) => mapIncreaseQuote(raw),
    }),
    request_storage_increase: builder.mutation<
      {
        changeId: number;
        quote: StorageIncreaseQuote;
        payment: StoragePaymentIntent;
      },
      { zones: StorageZoneQty[] }
    >({
      query: (data) => ({
        url: "/api/v3/fulfillment/storage_increase/",
        method: "POST",
        data,
      }),
      transformResponse: (raw: Record<string, unknown>) => {
        const paymentRaw = (raw.payment as Record<string, unknown> | undefined) ?? raw;
        const quoteRaw = (raw.quote as Record<string, unknown> | undefined) ?? raw;
        return {
          changeId: Number(raw.change_id ?? 0),
          quote: mapIncreaseQuote(quoteRaw),
          payment: {
            clientSecret: String(paymentRaw.client_secret ?? raw.client_secret ?? ""),
            paymentIntentId: String(
              paymentRaw.payment_intent_id ?? raw.payment_intent_id ?? "",
            ),
            amount: String(paymentRaw.amount ?? raw.amount ?? "0"),
            currency: String(paymentRaw.currency ?? raw.currency ?? "EUR"),
            customer: String(paymentRaw.customer ?? raw.customer ?? ""),
            ephemeralKey: String(paymentRaw.ephemeral_key ?? raw.ephemeral_key ?? ""),
            subscriptionId: Number(paymentRaw.subscription_id ?? 0),
          },
        };
      },
      invalidatesTags: ["FulfillmentStatus"],
    }),
    cancel_storage_renewal: builder.mutation<
      { renews: boolean; periodEnd: string | null; status: string; message: string },
      void
    >({
      query: () => ({
        url: "/api/v3/fulfillment/storage_cancel_renewal/",
        method: "POST",
        data: {},
      }),
      transformResponse: (raw: Record<string, unknown>) => ({
        renews: Boolean(raw.renews),
        periodEnd: (raw.period_end as string | null) ?? null,
        status: String(raw.status ?? ""),
        message: String(raw.message ?? "Auto-renewal cancelled."),
      }),
      invalidatesTags: ["FulfillmentStatus"],
    }),
    enable_storage_renewal: builder.mutation<
      { renews: boolean; periodEnd: string | null; status: string; message: string },
      void
    >({
      query: () => ({
        url: "/api/v3/fulfillment/storage_enable_renewal/",
        method: "POST",
        data: {},
      }),
      transformResponse: (raw: Record<string, unknown>) => ({
        renews: Boolean(raw.renews),
        periodEnd: (raw.period_end as string | null) ?? null,
        status: String(raw.status ?? ""),
        message: String(raw.message ?? "Auto-renewal enabled."),
      }),
      invalidatesTags: ["FulfillmentStatus"],
    }),
    request_storage_decrease: builder.mutation<
      StorageDecreaseResult,
      { zones: StorageZoneQty[] }
    >({
      query: (data) => ({
        url: "/api/v3/fulfillment/storage_decrease/",
        method: "POST",
        data,
      }),
      transformResponse: (raw: Record<string, unknown>): StorageDecreaseResult => {
        const lines = Array.isArray(raw.lines) ? raw.lines : [];
        return {
          subscriptionId: Number(raw.subscription_id ?? 0),
          currency: String(raw.currency ?? "EUR"),
          previousPeriodTotal: String(raw.previous_period_total ?? "0"),
          periodTotal: String(raw.period_total ?? "0"),
          periodEnd: (raw.period_end as string | null) ?? null,
          lines: lines.map((line) => {
            const l = line as Record<string, unknown>;
            return {
              zone: String(l.zone ?? ""),
              label: String(l.label ?? l.zone ?? ""),
              unit: String(l.unit ?? "cbm"),
              previousQuantity: String(l.previous_quantity ?? "0"),
              newQuantity: String(l.new_quantity ?? "0"),
              usedCbm: String(l.used_cbm ?? "0"),
              quantityDelta: String(l.quantity_delta ?? "0"),
            };
          }),
          message: String(raw.message ?? "Capacity reduced."),
        };
      },
      invalidatesTags: ["FulfillmentStatus"],
    }),
  }),
});

export type StorageDecreaseLine = {
  zone: string;
  label: string;
  unit: string;
  previousQuantity: string;
  newQuantity: string;
  usedCbm: string;
  quantityDelta: string;
};

export type StorageDecreaseResult = {
  subscriptionId: number;
  currency: string;
  previousPeriodTotal: string;
  periodTotal: string;
  periodEnd: string | null;
  lines: StorageDecreaseLine[];
  message: string;
};

export type StorageIncreaseQuoteLine = {
  zone: string;
  unit: string;
  quantityDelta: string;
  currentQuantity: string;
  newQuantity: string;
  unitRate: string;
  fullPeriodLineTotal: string;
  proratedLineTotal: string;
};

export type StorageIncreaseQuote = {
  subscriptionId: number;
  currency: string;
  spaceUnit: string;
  billingPeriodDays: number;
  daysRemaining: number;
  prorationFactor: string;
  periodEnd: string | null;
  amountDue: string;
  currentPeriodTotal: string;
  newPeriodTotal: string;
  lines: StorageIncreaseQuoteLine[];
};

function mapIncreaseQuote(raw: Record<string, unknown>): StorageIncreaseQuote {
  const lines = Array.isArray(raw.lines) ? raw.lines : [];
  return {
    subscriptionId: Number(raw.subscription_id ?? 0),
    currency: String(raw.currency ?? "EUR"),
    spaceUnit: String(raw.space_unit ?? "cbm"),
    billingPeriodDays: Number(raw.billing_period_days ?? 30),
    daysRemaining: Number(raw.days_remaining ?? 30),
    prorationFactor: String(raw.proration_factor ?? "1"),
    periodEnd: (raw.period_end as string | null) ?? null,
    amountDue: String(raw.amount_due ?? "0"),
    currentPeriodTotal: String(raw.current_period_total ?? "0"),
    newPeriodTotal: String(raw.new_period_total ?? "0"),
    lines: lines.map((line) => {
      const l = line as Record<string, unknown>;
      return {
        zone: String(l.zone ?? ""),
        unit: String(l.unit ?? ""),
        quantityDelta: String(l.quantity_delta ?? "0"),
        currentQuantity: String(l.current_quantity ?? "0"),
        newQuantity: String(l.new_quantity ?? "0"),
        unitRate: String(l.unit_rate ?? "0"),
        fullPeriodLineTotal: String(l.full_period_line_total ?? "0"),
        proratedLineTotal: String(l.prorated_line_total ?? "0"),
      };
    }),
  };
}

export const {
  useGet_fulfillment_statusQuery,
  useGet_fulfillment_warehousesQuery,
  useGet_storage_ratesQuery,
  useQuote_storageMutation,
  useApply_fulfillmentMutation,
  useQuote_storage_increaseMutation,
  useRequest_storage_increaseMutation,
  useCancel_storage_renewalMutation,
  useEnable_storage_renewalMutation,
  useRequest_storage_decreaseMutation,
} = fulfillmentApi;

export { mapBackendStatus };
