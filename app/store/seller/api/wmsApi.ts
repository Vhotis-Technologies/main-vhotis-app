/**
 * WMS API client — v3 seller-facing endpoints.
 *
 * Phase 0: tag types + stubs ready for Phase 1 implementation.
 * Phase 1: inbound CRUD, manifest lines, restocking fee quote + submit.
 * Phase 4: dashboard sections (overview, inbound, orders, inventory, restocks, history).
 * Billing: monthly warehouse labour invoices (not Connect 2.5% processing fees).
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import type {
  BillingAccruing,
  BillingCharge,
  BillingStatement,
  DashboardHistoryRow,
  DashboardInventoryRow,
  DashboardOrder,
  DashboardOverview,
  DashboardRestockRow,
  FeeBreakdown,
  PendingListingRow,
  MergedCatalogItem,
  MergedCatalogResponse,
  InboundDeliveryMethod,
  InboundShipment,
  InboundStatus,
  ManifestLine,
  ManifestUnit,
  ReceiptLine,
  RestockingFeeQuote,
  SubmitPaymentIntent,
} from "@/app/interfaces/seller/FulfillmentInterface";

// All fulfillment types live in FulfillmentInterface.ts. Re-export the ones
// callers historically imported from this module so nothing breaks.
export type {
  BillingAccruing,
  BillingCharge,
  BillingStatement,
  DashboardHistoryRow,
  DashboardInventoryRow,
  DashboardOrder,
  DashboardOverview,
  DashboardRestockRow,
  FeeBreakdown,
  PendingListingRow,
  MergedCatalogItem,
  MergedCatalogResponse,
  InboundDeliveryMethod,
  InboundShipment,
  InboundStatus,
  ManifestLine,
  ManifestUnit,
  ReceiptLine,
  RestockingFeeQuote,
  SubmitPaymentIntent,
} from "@/app/interfaces/seller/FulfillmentInterface";

function mapFeeBreakdown(raw: unknown): FeeBreakdown | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const lines = Array.isArray(b.lines) ? b.lines : [];
  return {
    currency: (b.currency as string) || "EUR",
    baseFee: String(b.base_fee ?? "0"),
    pickFeeUnit: String(b.pick_fee_unit ?? "0"),
    pickUnits: Number(b.pick_units ?? 0),
    pickFeeTotal: String(b.pick_fee_total ?? "0"),
    weightSurchargeTotal: String(b.weight_surcharge_total ?? "0"),
    coldChainTotal: String(b.cold_chain_total ?? "0"),
    orderFeeAmount: String(b.order_fee_amount ?? "0"),
    fulfillmentFeeAmount: String(b.fulfillment_fee_amount ?? "0"),
    total: String(b.total ?? "0"),
    status: b.status as string | undefined,
    billingNote: b.billing_note as string | undefined,
    lines: lines.map((line) => {
      const l = line as Record<string, unknown>;
      return {
        code: String(l.code ?? ""),
        label: String(l.label ?? ""),
        quantity: Number(l.quantity ?? 0),
        unitAmount: l.unit_amount == null ? null : String(l.unit_amount),
        amount: String(l.amount ?? "0"),
      };
    }),
  };
}

function mapBillingStatement(s: Record<string, unknown>): BillingStatement {
  return {
    id: s.id as number,
    billingMonth: s.billing_month as string,
    storageCharges: String(s.storage_charges ?? "0"),
    fulfillmentCharges: String(s.fulfillment_charges ?? "0"),
    receivingCharges: String(s.receiving_charges ?? "0"),
    logisticsCharges: String(s.logistics_charges ?? "0"),
    totalCharged: String(s.total_charged ?? "0"),
    status: s.status as string,
    stripeInvoiceId: String(s.stripe_invoice_id ?? ""),
    finalisedAt: (s.finalised_at as string) ?? null,
  };
}

// ─── Response mappers (API returns snake_case) ───────────────────────────────

function mapManifestLine(raw: Record<string, unknown>): ManifestLine {
  return {
    id: raw.id as number,
    declaredName: (raw.declared_name as string) ?? "",
    declaredSku: (raw.declared_sku as string) ?? "",
    declaredSize: (raw.declared_size as string) ?? "",
    declaredQuantity: raw.declared_quantity as number,
    declaredUnit: raw.declared_unit as ManifestUnit,
    declaredWeightKg: (raw.declared_weight_kg as number | null) ?? null,
    declaredPrice: raw.declared_price != null ? Number(raw.declared_price) : null,
    declaredDescription: (raw.declared_description as string) ?? "",
    categoryId: (raw.category as number | null) ?? null,
    categoryName: (raw.category_name as string) ?? null,
    imageUrls: Array.isArray(raw.image_urls) ? (raw.image_urls as string[]) : [],
    isTemperatureSensitive: Boolean(raw.is_temperature_sensitive),
    requiresFrozen: Boolean(raw.requires_frozen),
    catalogProductId: (raw.catalog_product_id as string) ?? (raw.catalog_product as string | null) ?? null,
    catalogProductName: (raw.catalog_product_name as string) ?? null,
    notes: (raw.notes as string) ?? "",
  };
}

function mapInboundShipment(raw: Record<string, unknown>): InboundShipment {
  const manifestLines = raw.manifest_lines as Record<string, unknown>[] | undefined;
  const receiptLines = raw.receipt_lines as Record<string, unknown>[] | undefined;
  return {
    id: raw.id as string,
    status: raw.status as InboundStatus,
    deliveryMethod: raw.delivery_method as InboundDeliveryMethod,
    warehouseCode: (raw.warehouse_code as string) ?? "",
    warehouseName: (raw.warehouse_name as string) ?? "",
    referenceNotes: (raw.reference_notes as string) ?? "",
    expectedArrivalAt: (raw.expected_arrival_at as string | null) ?? null,
    restockingFeeAmount: String(raw.restocking_fee_amount ?? "0.00"),
    restockingFeeCharged: Boolean(raw.restocking_fee_charged),
    logisticsJobId: (raw.logistics_job_id as string | null) ?? null,
    manifestLineCount: (raw.manifest_line_count as number) ?? manifestLines?.length ?? 0,
    manifestLines: manifestLines?.map(mapManifestLine),
    receiptLines: receiptLines?.map((r) => ({
      id: r.id as number,
      manifestLine: (r.manifest_line as number | null) ?? null,
      product: (r.product as string | null) ?? null,
      productName: (r.product_name as string | null) ?? null,
      receivedQuantity: r.received_quantity as number,
      damagedQuantity: r.damaged_quantity as number,
      acceptedQuantity: r.accepted_quantity as number,
      status: r.status as ReceiptLine["status"],
      location: (r.location as number | null) ?? null,
      notes: (r.notes as string) ?? "",
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    })),
    totalDeclaredWeightKg: (raw.total_declared_weight_kg as number | null) ?? null,
    receivedAt: (raw.received_at as string | null) ?? null,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const wmsApi = createApi({
  reducerPath: "wmsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["InboundShipment", "WmsDashboard"],
  endpoints: (builder) => ({
    // Phase 1 ----------------------------------------------------------------
    list_inbound: builder.query<{ shipments: InboundShipment[] }, void>({
      query: () => ({ url: "/api/v3/inbound/list_shipments/", method: "GET" }),
      providesTags: ["InboundShipment"],
      transformResponse: (raw: { shipments: Record<string, unknown>[] }) => ({
        shipments: raw.shipments.map(mapInboundShipment),
      }),
    }),

    get_inbound: builder.query<InboundShipment, string>({
      query: (shipmentId) => ({
        url: `/api/v3/inbound/get_detail/?shipment_id=${encodeURIComponent(shipmentId)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "InboundShipment", id }],
      transformResponse: (raw: Record<string, unknown>) => mapInboundShipment(raw),
    }),

    create_inbound: builder.mutation<
      InboundShipment,
      {
        delivery_method?: InboundDeliveryMethod;
        reference_notes?: string;
        expected_arrival_at?: string;
      }
    >({
      query: (data) => ({ url: "/api/v3/inbound/create_shipment/", method: "POST", data }),
      invalidatesTags: ["InboundShipment"],
      transformResponse: (raw: Record<string, unknown>) => mapInboundShipment(raw),
    }),

    update_inbound: builder.mutation<
      InboundShipment,
      {
        shipmentId: string;
        reference_notes?: string;
        delivery_method?: InboundDeliveryMethod;
        expected_arrival_at?: string;
      }
    >({
      query: ({ shipmentId, ...data }) => ({
        url: "/api/v3/inbound/update_shipment/",
        method: "PATCH",
        data: { shipment_id: shipmentId, ...data },
      }),
      invalidatesTags: (_result, _err, { shipmentId }) => [
        { type: "InboundShipment", id: shipmentId },
        "InboundShipment",
      ],
    }),

    cancel_inbound: builder.mutation<void, string>({
      query: (shipmentId) => ({
        url: `/api/v3/inbound/cancel_shipment/?shipment_id=${encodeURIComponent(shipmentId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InboundShipment"],
    }),

    add_manifest_line: builder.mutation<
      ManifestLine,
      {
        shipmentId: string;
        declared_name: string;
        declared_quantity: number;
        declared_unit: ManifestUnit;
        declared_sku: string;
        declared_size?: string;
        declared_weight_kg?: number;
        declared_price?: number;
        declared_description?: string;
        category?: number;
        image_urls?: string[];
        is_temperature_sensitive?: boolean;
        requires_frozen?: boolean;
        catalog_product?: string;
        notes?: string;
      }
    >({
      query: ({ shipmentId, ...data }) => ({
        url: "/api/v3/inbound/add_manifest_line/",
        method: "POST",
        data: { shipment_id: shipmentId, ...data },
      }),
      invalidatesTags: (_result, _err, { shipmentId }) => [
        { type: "InboundShipment", id: shipmentId },
      ],
      transformResponse: (raw: Record<string, unknown>) => mapManifestLine(raw),
    }),

    update_manifest_line: builder.mutation<
      ManifestLine,
      {
        shipmentId: string;
        lineId: number;
        declared_name?: string;
        declared_quantity?: number;
        declared_unit?: ManifestUnit;
        declared_sku?: string;
        declared_size?: string;
        declared_weight_kg?: number;
        declared_price?: number;
        declared_description?: string;
        category?: number;
        image_urls?: string[];
        is_temperature_sensitive?: boolean;
        requires_frozen?: boolean;
        notes?: string;
      }
    >({
      query: ({ shipmentId, lineId, ...data }) => ({
        url: "/api/v3/inbound/update_manifest_line/",
        method: "PATCH",
        data: { shipment_id: shipmentId, line_id: lineId, ...data },
      }),
      invalidatesTags: (_result, _err, { shipmentId }) => [
        { type: "InboundShipment", id: shipmentId },
      ],
      transformResponse: (raw: Record<string, unknown>) => mapManifestLine(raw),
    }),

    remove_manifest_line: builder.mutation<
      void,
      { shipmentId: string; lineId: number }
    >({
      query: ({ shipmentId, lineId }) => ({
        url: `/api/v3/inbound/remove_manifest_line/?shipment_id=${encodeURIComponent(shipmentId)}&line_id=${lineId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { shipmentId }) => [
        { type: "InboundShipment", id: shipmentId },
      ],
    }),

    quote_inbound: builder.mutation<RestockingFeeQuote, string>({
      query: (shipmentId) => ({
        url: "/api/v3/inbound/quote/",
        method: "POST",
        data: { shipment_id: shipmentId },
      }),
      transformResponse: (raw: Record<string, unknown>): RestockingFeeQuote => ({
        restockingFeeAmount: parseFloat(String(raw.restocking_fee_amount ?? 0)),
        currency: (raw.currency as string) ?? "GBP",
        totalManifestLines: (raw.total_manifest_lines as number) ?? 0,
        totalDeclaredWeightKg: (raw.total_declared_weight_kg as number | null) ?? null,
      }),
    }),

    submit_inbound: builder.mutation<SubmitPaymentIntent, string>({
      query: (shipmentId) => ({
        url: "/api/v3/inbound/submit/",
        method: "POST",
        data: { shipment_id: shipmentId },
      }),
      invalidatesTags: ["InboundShipment"],
      transformResponse: (raw: Record<string, unknown>): SubmitPaymentIntent => ({
        clientSecret: raw.client_secret as string,
        paymentIntentId: raw.payment_intent_id as string,
        amount: String(raw.amount),
        currency: raw.currency as string,
        shipmentId: raw.shipment_id as string,
        feeChargeId: raw.fee_charge_id as number,
        ephemeralKey: (raw.ephemeral_key as string) ?? undefined,
        customer: (raw.customer as string) ?? undefined,
      }),
    }),

    // Phase 4 ----------------------------------------------------------------
    get_dashboard_overview: builder.query<DashboardOverview, void>({
      query: () => ({ url: "/api/v3/dashboard/overview/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: {
        warehouse: Record<string, unknown>;
        storage_usage?: Record<string, unknown> | null;
        overview: Record<string, unknown>;
        pending_listings?: Record<string, unknown>[];
      }): DashboardOverview => {
        const usageRaw = raw.storage_usage;
        const zones = Array.isArray(usageRaw?.zones) ? usageRaw!.zones : [];
        return {
          warehouse: {
            code: raw.warehouse.code as string,
            name: raw.warehouse.name as string,
            city: raw.warehouse.city as string,
            allocatedCbm: raw.warehouse.allocated_cbm as number,
            usedCbm: raw.warehouse.used_cbm as number,
            palletSlots: (raw.warehouse.pallet_slots as number) ?? 0,
            palletsUsed: (raw.warehouse.pallets_used as number) ?? 0,
          },
          storageUsage: usageRaw
            ? {
                subscriptionId: Number(usageRaw.subscription_id ?? 0),
                status: String(usageRaw.status ?? ""),
                renews: Boolean(usageRaw.renews ?? true),
                spaceUnit: String(usageRaw.space_unit ?? "cbm"),
                currency: String(usageRaw.currency ?? "EUR"),
                periodTotal: String(usageRaw.period_total ?? "0"),
                periodStart: (usageRaw.period_start as string | null) ?? null,
                periodEnd: (usageRaw.period_end as string | null) ?? null,
                cancelledAt: (usageRaw.cancelled_at as string | null) ?? null,
                allocatedCbm: Number(usageRaw.allocated_cbm ?? 0),
                usedCbm: Number(usageRaw.used_cbm ?? 0),
                utilizationPct: Number(usageRaw.utilization_pct ?? 0),
                zones: zones.map((row) => {
                  const z = row as Record<string, unknown>;
                  return {
                    zone: String(z.zone ?? ""),
                    label: String(z.label ?? z.zone ?? ""),
                    unit: String(z.unit ?? "cbm"),
                    allocated: String(z.allocated ?? "0"),
                    allocatedCbm: Number(z.allocated_cbm ?? 0),
                    usedCbm: Number(z.used_cbm ?? 0),
                    utilizationPct: Number(z.utilization_pct ?? 0),
                  };
                }),
              }
            : null,
          overview: {
            ordersInProgress: raw.overview.orders_in_progress as number,
            ordersShippedToday: raw.overview.orders_shipped_today as number,
            inboundInTransit: raw.overview.inbound_in_transit as number,
            lowStockSkus: raw.overview.low_stock_skus as number,
            pendingRestocks: raw.overview.pending_restocks as number,
            pendingListings: raw.overview.pending_listings as number,
            liveListings: raw.overview.live_listings as number,
          },
          pendingListings: (raw.pending_listings ?? []).map((row) => ({
            productId: row.product_id as string,
            name: row.name as string,
            sellerSku: (row.seller_sku as string) ?? "",
            listingStatus: row.listing_status as PendingListingRow["listingStatus"],
            warehouseAvailable: row.warehouse_available as number,
            blockers: Array.isArray(row.blockers) ? (row.blockers as string[]) : [],
            blockerLabels: Array.isArray(row.blocker_labels)
              ? (row.blocker_labels as string[])
              : [],
          })),
        };
      },
    }),

    get_dashboard_orders: builder.query<{ orders: DashboardOrder[]; count: number }, void>({
      query: () => ({ url: "/api/v3/dashboard/orders/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: { orders: Record<string, unknown>[]; count: number }) => ({
        count: raw.count,
        orders: raw.orders.map((o) => ({
          id: o.id as string,
          customerOrderId: o.customer_order_id as string,
          status: o.status as string,
          itemCount: o.item_count as number,
          placedAt: o.placed_at as string | null,
          dispatchedAt: o.dispatched_at as string | null,
          packedAt: o.packed_at as string | null,
          customerCity: o.customer_city as string,
          slaLabel: o.sla_label as string,
          fulfillmentFee: String(o.fulfillment_fee ?? "0"),
          orderFee: String(o.order_fee ?? "0"),
          feeTotal: String(o.fee_total ?? "0"),
          feeCurrency: String(o.fee_currency ?? "EUR"),
          feesCharged: Boolean(o.fees_charged),
          feeBreakdown: mapFeeBreakdown(o.fee_breakdown),
        })),
      }),
    }),

    get_dashboard_catalog: builder.query<
      MergedCatalogResponse,
      {
        page?: number;
        page_size?: number;
        search?: string;
        category_id?: string;
        listing_status?: string;
      }
    >({
      query: (params) => ({
        url: "/api/v3/dashboard/catalog/",
        method: "GET",
        params,
      }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: {
        results: Record<string, unknown>[];
        count: number;
        next: boolean;
        previous: boolean;
        page: number;
        page_size: number;
      }): MergedCatalogResponse => ({
        count: raw.count,
        next: raw.next,
        previous: raw.previous,
        page: raw.page,
        page_size: raw.page_size,
        results: raw.results.map((row) => ({
          id: row.id as string | number,
          name: row.name as string,
          sellerSku: (row.seller_sku as string) ?? "",
          price: Number(row.price ?? 0),
          description: (row.description as string) ?? "",
          listingStatus: row.listing_status as MergedCatalogItem["listingStatus"],
          category: (row.category as string) ?? null,
          categoryId: (row.category_id as number | null) ?? null,
          warehouseOnHand: row.warehouse_on_hand as number,
          warehouseReserved: row.warehouse_reserved as number,
          warehouseAvailable: row.warehouse_available as number,
          listingBlockers: Array.isArray(row.listing_blockers)
            ? (row.listing_blockers as string[])
            : [],
          blockerLabels: Array.isArray(row.blocker_labels)
            ? (row.blocker_labels as string[])
            : [],
          hasImages: Boolean(row.has_images),
          imageCount: (row.image_count as number) ?? 0,
          image: (row.image as string) ?? null,
          views: (row.views as number) ?? 0,
          status: (row.status as string) ?? undefined,
        })),
      }),
    }),

    get_dashboard_inventory: builder.query<{ inventory: DashboardInventoryRow[]; count: number }, void>({
      query: () => ({ url: "/api/v3/dashboard/inventory/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: { inventory: Record<string, unknown>[]; count: number }) => ({
        count: raw.count,
        inventory: raw.inventory.map((r) => ({
          id: r.id as number,
          productId: r.product_id as string,
          productName: r.product_name as string,
          sku: r.sku as string,
          category: r.category as string,
          quantityOnHand: r.quantity_on_hand as number,
          quantityReserved: r.quantity_reserved as number,
          quantityAvailable: r.quantity_available as number,
          quantityDamaged: r.quantity_damaged as number,
          lowStockThreshold: r.low_stock_threshold as number | null,
          locationCode: r.location_code as string | null,
          status: r.status as "ok" | "low_stock" | "out_of_stock",
          listingStatus: (r.listing_status as DashboardInventoryRow["listingStatus"]) ?? "live",
          listingBlockers: Array.isArray(r.listing_blockers) ? (r.listing_blockers as string[]) : [],
          blockerLabels: Array.isArray(r.blocker_labels) ? (r.blocker_labels as string[]) : [],
          lastMovementAt: r.last_movement_at as string | null,
        })),
      }),
    }),

    get_dashboard_restocks: builder.query<{ restocks: DashboardRestockRow[]; count: number }, void>({
      query: () => ({ url: "/api/v3/dashboard/restocks/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: { restocks: Record<string, unknown>[]; count: number }) => ({
        count: raw.count,
        restocks: raw.restocks.map((r) => ({
          productId: r.product_id as string,
          productName: r.product_name as string,
          sku: r.sku as string,
          warehouseAvailable: r.warehouse_available as number,
          reorderPoint: r.reorder_point as number,
          urgency: r.urgency as "high" | "medium" | "low",
          suggestedUnits: r.suggested_units as number,
          daysUntilStockout: r.days_until_stockout as number | null,
        })),
      }),
    }),

    get_dashboard_history: builder.query<{ history: DashboardHistoryRow[]; count: number }, void>({
      query: () => ({ url: "/api/v3/dashboard/history/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: { history: Record<string, unknown>[]; count: number }) => ({
        count: raw.count,
        history: raw.history.map((r) => ({
          id: r.id as number,
          movementType: r.movement_type as string,
          title: r.title as string,
          detail: r.detail as string,
          productId: r.product_id as string,
          productName: r.product_name as string,
          quantity: r.quantity as number,
          referenceType: r.reference_type as string,
          referenceId: r.reference_id as string,
          occurredAt: r.occurred_at as string,
        })),
      }),
    }),

    upload_manifest_image: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/api/v3/inbound/upload_manifest_image/",
        method: "POST",
        data: formData,
      }),
    }),

    // ── Warehouse billing (monthly labour invoice rail) ───────────────────
    get_billing_accruing: builder.query<BillingAccruing, void>({
      query: () => ({ url: "/api/v3/billing/accruing/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: Record<string, unknown>) => ({
        billingPeriodStart: String(raw.billing_period_start ?? ""),
        pendingFulfillmentTotal: String(raw.pending_fulfillment_total ?? "0"),
        currency: String(raw.currency ?? "EUR"),
      }),
    }),

    get_billing_statements: builder.query<BillingStatement[], void>({
      query: () => ({ url: "/api/v3/billing/statements/", method: "GET" }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: { statements: Record<string, unknown>[] }) =>
        (raw.statements ?? []).map(mapBillingStatement),
    }),

    get_billing_statement_detail: builder.query<
      {
        statement: BillingStatement;
        charges: BillingCharge[];
        hostedInvoiceUrl: string | null;
        invoicePdf: string | null;
      },
      number
    >({
      query: (id) => ({
        url: "/api/v3/billing/statement_detail/",
        method: "GET",
        params: { id },
      }),
      providesTags: ["WmsDashboard"],
      transformResponse: (raw: Record<string, unknown>) => ({
        statement: mapBillingStatement(raw.statement as Record<string, unknown>),
        charges: ((raw.charges as Record<string, unknown>[]) ?? []).map((c) => ({
          id: c.id as number,
          feeType: String(c.fee_type ?? ""),
          amount: String(c.amount ?? "0"),
          currency: String(c.currency ?? "EUR"),
          quantity: String(c.quantity ?? "1"),
          status: String(c.status ?? ""),
          description: String(c.description ?? ""),
          referenceType: String(c.reference_type ?? ""),
          referenceId: String(c.reference_id ?? ""),
          createdAt: String(c.created_at ?? ""),
        })),
        hostedInvoiceUrl: (raw.hosted_invoice_url as string) ?? null,
        invoicePdf: (raw.invoice_pdf as string) ?? null,
      }),
    }),

    pay_billing_statement: builder.mutation<
      { statement: BillingStatement; hostedInvoiceUrl: string | null },
      number
    >({
      query: (id) => ({
        url: "/api/v3/billing/pay_statement/",
        method: "POST",
        data: { id },
      }),
      invalidatesTags: ["WmsDashboard"],
      transformResponse: (raw: Record<string, unknown>) => ({
        statement: mapBillingStatement(raw.statement as Record<string, unknown>),
        hostedInvoiceUrl: (raw.hosted_invoice_url as string) ?? null,
      }),
    }),
  }),
});

export const {
  useList_inboundQuery,
  useGet_inboundQuery,
  useCreate_inboundMutation,
  useUpdate_inboundMutation,
  useCancel_inboundMutation,
  useAdd_manifest_lineMutation,
  useUpdate_manifest_lineMutation,
  useRemove_manifest_lineMutation,
  useQuote_inboundMutation,
  useSubmit_inboundMutation,
  useGet_dashboard_overviewQuery,
  useGet_dashboard_ordersQuery,
  useGet_dashboard_catalogQuery,
  useGet_dashboard_inventoryQuery,
  useGet_dashboard_restocksQuery,
  useGet_dashboard_historyQuery,
  useGet_billing_accruingQuery,
  useGet_billing_statementsQuery,
  useGet_billing_statement_detailQuery,
  usePay_billing_statementMutation,
  useUpload_manifest_imageMutation,
} = wmsApi;
