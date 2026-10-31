import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAppSelector } from "@/app/store/store";
import type { FulfillmentEnrollmentStatus } from "@/app/interfaces/seller/FulfillmentInterface";
import {
  mapBackendStatus,
  useApply_fulfillmentMutation,
  useGet_fulfillment_statusQuery,
  type StoragePaymentIntent,
  type StorageZoneQty,
} from "@/app/store/seller/api/fulfillmentApi";

export function useFulfillmentStatus() {
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading, refetch } = useGet_fulfillment_statusQuery();
  const [applyFulfillment] = useApply_fulfillmentMutation();

  const status: FulfillmentEnrollmentStatus = data
    ? mapBackendStatus(data.status)
    : mapBackendStatus(user?.fulfillment_status);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const submitApplication = useCallback(
    async (payload: {
      warehouse_code: string;
      space_unit: "cbm" | "pallet";
      inbound_method: "seller_delivery" | "vhotis_collection";
      zones: StorageZoneQty[];
    }): Promise<{ status: FulfillmentEnrollmentStatus; payment: StoragePaymentIntent }> => {
      const result = await applyFulfillment(payload).unwrap();
      await refetch();
      return {
        status: mapBackendStatus(result.status),
        payment: result.payment,
      };
    },
    [applyFulfillment, refetch],
  );

  return { status, loading: isLoading, refresh: refetch, submitApplication };
}

export default useFulfillmentStatus;
