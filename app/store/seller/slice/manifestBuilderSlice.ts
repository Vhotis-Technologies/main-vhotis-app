/**
 * manifestBuilderSlice — local, slice-driven inbound manifest builder.
 *
 * The seller adds items to `lines` entirely on the client. Nothing is sent to
 * the server until they tap "Submit & pay", at which point the screen creates
 * the shipment, pushes every line, and opens the payment sheet.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DraftManifestLine,
  InboundDeliveryMethod,
  ManifestBuilderState,
} from "@/app/interfaces/seller/FulfillmentInterface";

export type { DraftManifestLine } from "@/app/interfaces/seller/FulfillmentInterface";

const initialState: ManifestBuilderState = {
  shipmentId: null,
  deliveryMethod: "seller_delivery",
  referenceNotes: "",
  lines: [],
};

function newClientId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const manifestBuilderSlice = createSlice({
  name: "manifestBuilder",
  initialState,
  reducers: {
    /** Wipe everything — used when the seller starts a brand-new inbound. */
    resetManifestBuilder: () => initialState,

    /** Start a fresh local manifest (no server shipment yet). */
    initManifestBuilder: (
      state,
      action: PayloadAction<{ referenceNotes?: string } | undefined>,
    ) => {
      state.shipmentId = null;
      state.deliveryMethod = "seller_delivery";
      state.referenceNotes = action.payload?.referenceNotes ?? "";
      state.lines = [];
    },

    /** Load an existing draft shipment back into the builder for editing. */
    hydrateManifestBuilder: (
      state,
      action: PayloadAction<{
        shipmentId: string;
        deliveryMethod: InboundDeliveryMethod;
        referenceNotes?: string;
        lines: Omit<DraftManifestLine, "clientId">[];
      }>,
    ) => {
      state.shipmentId = action.payload.shipmentId;
      state.deliveryMethod = action.payload.deliveryMethod;
      state.referenceNotes = action.payload.referenceNotes ?? "";
      state.lines = action.payload.lines.map((line) => ({
        ...line,
        clientId: newClientId(),
      }));
    },

    /** Record the server shipment id + resolved delivery method after create. */
    confirmManifestShipment: (
      state,
      action: PayloadAction<{ shipmentId: string; deliveryMethod: InboundDeliveryMethod }>,
    ) => {
      state.shipmentId = action.payload.shipmentId;
      state.deliveryMethod = action.payload.deliveryMethod;
    },

    addDraftLine: (
      state,
      action: PayloadAction<Omit<DraftManifestLine, "clientId" | "serverId">>,
    ) => {
      state.lines.push({ ...action.payload, clientId: newClientId() });
    },

    updateDraftLine: (
      state,
      action: PayloadAction<{ clientId: string; patch: Partial<DraftManifestLine> }>,
    ) => {
      const idx = state.lines.findIndex((l) => l.clientId === action.payload.clientId);
      if (idx === -1) return;
      state.lines[idx] = { ...state.lines[idx], ...action.payload.patch };
    },

    removeDraftLine: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((l) => l.clientId !== action.payload);
    },

    markLineSynced: (
      state,
      action: PayloadAction<{ clientId: string; serverId: number }>,
    ) => {
      const line = state.lines.find((l) => l.clientId === action.payload.clientId);
      if (line) line.serverId = action.payload.serverId;
    },
  },
});

export const {
  resetManifestBuilder,
  initManifestBuilder,
  hydrateManifestBuilder,
  confirmManifestShipment,
  addDraftLine,
  updateDraftLine,
  removeDraftLine,
  markLineSynced,
} = manifestBuilderSlice.actions;

export default manifestBuilderSlice.reducer;
