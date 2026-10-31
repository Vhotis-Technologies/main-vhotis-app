import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { InboundDeliveryMethod, ManifestUnit } from "@/app/interfaces/seller/FulfillmentInterface";
import {
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
} from "@/app/store/seller/api/wmsApi";

export function useInboundList() {
  const { data, isLoading, isFetching, refetch, error } = useList_inboundQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    shipments: data?.shipments ?? [],
    isLoading,
    isFetching,
    refetch,
    error,
  };
}

export function useInboundDetail(shipmentId: string) {
  const { data: shipment, isLoading, isFetching, refetch, error } = useGet_inboundQuery(shipmentId, {
    skip: !shipmentId,
  });

  useFocusEffect(
    useCallback(() => {
      // Only refetch when the query has actually started. When `shipmentId` is
      // empty the query is skipped and calling refetch() throws
      // "Cannot refetch a query that has not been started yet."
      if (!shipmentId) return;
      void refetch();
    }, [shipmentId, refetch]),
  );

  return { shipment: shipment ?? null, isLoading, isFetching, refetch, error };
}

export function useInboundActions() {
  const [createInbound, { isLoading: isCreating }] = useCreate_inboundMutation();
  const [updateInbound, { isLoading: isUpdating }] = useUpdate_inboundMutation();
  const [cancelInbound, { isLoading: isCancelling }] = useCancel_inboundMutation();
  const [addLine, { isLoading: isAddingLine }] = useAdd_manifest_lineMutation();
  const [updateLine, { isLoading: isUpdatingLine }] = useUpdate_manifest_lineMutation();
  const [removeLine, { isLoading: isRemovingLine }] = useRemove_manifest_lineMutation();
  const [quoteInbound, { isLoading: isQuoting }] = useQuote_inboundMutation();
  const [submitInbound, { isLoading: isSubmitting }] = useSubmit_inboundMutation();

  const create = useCallback(
    (payload?: {
      delivery_method?: InboundDeliveryMethod;
      reference_notes?: string;
      expected_arrival_at?: string;
    }) => createInbound(payload ?? {}).unwrap(),
    [createInbound],
  );

  const update = useCallback(
    (shipmentId: string, payload: Partial<{
      delivery_method: InboundDeliveryMethod;
      reference_notes: string;
      expected_arrival_at: string;
    }>) => updateInbound({ shipmentId, ...payload }).unwrap(),
    [updateInbound],
  );

  const cancel = useCallback(
    (shipmentId: string) => cancelInbound(shipmentId).unwrap(),
    [cancelInbound],
  );

  const addManifestLine = useCallback(
    (shipmentId: string, payload: {
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
    }) => addLine({ shipmentId, ...payload }).unwrap(),
    [addLine],
  );

  const updateManifestLine = useCallback(
    (shipmentId: string, lineId: number, payload: Record<string, unknown>) =>
      updateLine({ shipmentId, lineId, ...payload }).unwrap(),
    [updateLine],
  );

  const removeManifestLine = useCallback(
    (shipmentId: string, lineId: number) => removeLine({ shipmentId, lineId }).unwrap(),
    [removeLine],
  );

  const quote = useCallback(
    (shipmentId: string) => quoteInbound(shipmentId).unwrap(),
    [quoteInbound],
  );

  const submit = useCallback(
    (shipmentId: string) => submitInbound(shipmentId).unwrap(),
    [submitInbound],
  );

  return {
    create,
    update,
    cancel,
    addManifestLine,
    updateManifestLine,
    removeManifestLine,
    quote,
    submit,
    isCreating,
    isUpdating,
    isCancelling,
    isAddingLine,
    isUpdatingLine,
    isRemovingLine,
    isQuoting,
    isSubmitting,
  };
}

export default useInboundList;
