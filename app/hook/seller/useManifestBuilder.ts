import { useCallback } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import {
  confirmManifestShipment,
  markLineSynced,
} from "@/app/store/seller/slice/manifestBuilderSlice";
import type {
  DraftManifestLine,
  InboundDeliveryMethod,
} from "@/app/interfaces/seller/FulfillmentInterface";
import { useInboundActions } from "./useInbound";

export function useManifestBuilderState() {
  return useAppSelector((s) => s.manifestBuilder);
}

export interface SubmitManifestResult {
  success: boolean;
  canceled: boolean;
  shipmentId: string;
  deliveryMethod: InboundDeliveryMethod;
}

/**
 * Drives the "Submit & pay" action of the manifest builder.
 */
export function useManifestBuilderSubmit() {
  const dispatch = useAppDispatch();
  const builder = useManifestBuilderState();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { create, addManifestLine, updateManifestLine, submit, isCreating, isAddingLine, isSubmitting, isUpdatingLine } =
    useInboundActions();

  const submitAndPay = useCallback(async (): Promise<SubmitManifestResult> => {
    let shipmentId = builder.shipmentId;
    let deliveryMethod = builder.deliveryMethod;

    if (!shipmentId) {
      const created = await create({
        reference_notes: builder.referenceNotes || undefined,
      });
      shipmentId = created.id;
      deliveryMethod = created.deliveryMethod;
      dispatch(confirmManifestShipment({ shipmentId, deliveryMethod }));
    }

    for (const line of builder.lines) {
      const payload = lineToPayload(line);
      if (line.serverId) {
        await updateManifestLine(shipmentId, line.serverId, payload);
      } else {
        const createdLine = await addManifestLine(shipmentId, payload);
        dispatch(markLineSynced({ clientId: line.clientId, serverId: createdLine.id }));
      }
    }

    const intent = await submit(shipmentId);

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "Vhotis",
      paymentIntentClientSecret: intent.clientSecret,
      customerId: intent.customer,
      customerEphemeralKeySecret: intent.ephemeralKey,
      returnURL: "vhotis://payment-success",
      allowsDelayedPaymentMethods: true,
    });
    if (initError) {
      throw new Error(initError.message || "Could not start payment.");
    }

    const { error: payError } = await presentPaymentSheet();
    if (payError) {
      if (payError.code === "Canceled") {
        return { success: false, canceled: true, shipmentId, deliveryMethod };
      }
      throw new Error(payError.message || "Payment failed.");
    }

    return { success: true, canceled: false, shipmentId, deliveryMethod };
  }, [
    builder,
    create,
    addManifestLine,
    updateManifestLine,
    submit,
    dispatch,
    initPaymentSheet,
    presentPaymentSheet,
  ]);

  return {
    submitAndPay,
    isSubmitting: isCreating || isAddingLine || isSubmitting || isUpdatingLine,
  };
}

function lineToPayload(line: DraftManifestLine) {
  return {
    declared_name: line.declared_name,
    declared_quantity: line.declared_quantity,
    declared_unit: line.declared_unit,
    declared_sku: line.declared_sku,
    declared_size: line.declared_size || undefined,
    declared_weight_kg: line.declared_weight_kg,
    declared_price: line.declared_price,
    declared_description: line.declared_description || undefined,
    category: line.category_id ?? undefined,
    image_urls: line.image_urls.length ? line.image_urls : undefined,
    is_temperature_sensitive: line.is_temperature_sensitive,
    requires_frozen: line.requires_frozen,
    notes: line.notes || undefined,
  };
}
