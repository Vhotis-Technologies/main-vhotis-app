/**
 * Logistics API client — v4 seller-facing endpoints.
 *
 * Phase 0: types + stubs ready for Phase 2 implementation.
 * Phase 2: quote, book collection, job list/detail, public tracking.
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import type {
  BookCollectionResult,
  CollectionQuote,
  LogisticsAddress,
  LogisticsJob,
  VehicleType,
} from "@/app/interfaces/seller/LogisticsInterface";

export type {
  BookCollectionResult,
  CollectionQuote,
  LogisticsAddress,
  LogisticsJob,
  VehicleType,
} from "@/app/interfaces/seller/LogisticsInterface";

type PickupAddressPayload = Omit<LogisticsAddress, "instructions"> & {
  instructions?: string;
};

function mapPickupAddress(addr: PickupAddressPayload) {
  return {
    contact_name: addr.contactName,
    contact_phone: addr.contactPhone,
    company_name: addr.companyName ?? "",
    address_line_1: addr.addressLine1,
    address_line_2: addr.addressLine2 ?? "",
    city: addr.city,
    postal_code: addr.postalCode,
    country: addr.country,
    instructions: addr.instructions ?? "",
  };
}

function mapCollectionQuote(raw: Record<string, unknown>): CollectionQuote {
  return {
    vehicleType: raw.vehicle_type as VehicleType,
    logisticsFee: parseFloat(String(raw.logistics_fee ?? 0)),
    restockingFee: parseFloat(String(raw.restocking_fee ?? 0)),
    totalFee: parseFloat(String(raw.total_fee ?? 0)),
    currency: (raw.currency as string) ?? "GBP",
    distanceKm: parseFloat(String(raw.distance_km ?? 0)),
    isPriority: Boolean(raw.is_priority),
    expiresAt: (raw.expires_at as string) ?? "",
  };
}

function mapBookCollectionResult(raw: Record<string, unknown>): BookCollectionResult {
  return {
    jobId: raw.job_id as string,
    trackingCode: raw.tracking_code as string,
    vehicleType: raw.vehicle_type as VehicleType,
    logisticsFee: String(raw.logistics_fee ?? "0"),
    restockingFee: String(raw.restocking_fee ?? "0"),
    totalFee: String(raw.total_fee ?? "0"),
    currency: (raw.currency as string) ?? "GBP",
    inboundShipmentId: raw.inbound_shipment_id as string,
    feeChargeId: raw.fee_charge_id as number,
    clientSecret: raw.client_secret as string,
    paymentIntentId: raw.payment_intent_id as string,
    ephemeralKey: (raw.ephemeral_key as string) ?? undefined,
    customer: (raw.customer as string) ?? undefined,
  };
}

export const logisticsApi = createApi({
  reducerPath: "logisticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LogisticsJob"],
  endpoints: (builder) => ({
    quote_collection: builder.mutation<
      CollectionQuote,
      {
        inbound_shipment_id: string;
        pickup_address: PickupAddressPayload;
        is_priority?: boolean;
      }
    >({
      query: ({ pickup_address, ...rest }) => ({
        url: "/api/v4/logistics/quote/",
        method: "POST",
        data: { ...rest, pickup_address: mapPickupAddress(pickup_address) },
      }),
      transformResponse: (raw: Record<string, unknown>) => mapCollectionQuote(raw),
    }),

    book_collection: builder.mutation<
      BookCollectionResult,
      {
        inbound_shipment_id: string;
        pickup_address: PickupAddressPayload;
        is_priority?: boolean;
        special_instructions?: string;
      }
    >({
      query: ({ pickup_address, ...rest }) => ({
        url: "/api/v4/logistics/book/",
        method: "POST",
        data: { ...rest, pickup_address: mapPickupAddress(pickup_address) },
      }),
      transformResponse: (raw: Record<string, unknown>) => mapBookCollectionResult(raw),
      invalidatesTags: ["LogisticsJob"],
    }),

    list_jobs: builder.query<{ jobs: LogisticsJob[] }, void>({
      query: () => ({ url: "/api/v4/logistics/list_jobs/", method: "GET" }),
      providesTags: ["LogisticsJob"],
    }),

    get_job: builder.query<LogisticsJob, string>({
      query: (jobId) => ({
        url: `/api/v4/logistics/get_job_detail/?job_id=${encodeURIComponent(jobId)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "LogisticsJob", id }],
    }),

    track_job: builder.query<LogisticsJob, string>({
      query: (trackingCode) => ({
        url: `/api/v4/logistics/track/?tracking_code=${encodeURIComponent(trackingCode)}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useQuote_collectionMutation,
  useBook_collectionMutation,
  useList_jobsQuery,
  useGet_jobQuery,
  useTrack_jobQuery,
} = logisticsApi;
