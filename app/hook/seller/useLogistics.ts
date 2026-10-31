import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type {
  BookCollectionResult,
  LogisticsAddress,
} from "@/app/interfaces/seller/LogisticsInterface";
import {
  useQuote_collectionMutation,
  useBook_collectionMutation,
  useList_jobsQuery,
  useGet_jobQuery,
} from "@/app/store/seller/api/logisticsApi";

export function useLogisticsList() {
  const { data, isLoading, isFetching, refetch, error } = useList_jobsQuery();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return {
    jobs: data?.jobs ?? [],
    isLoading,
    isFetching,
    refetch,
    error,
  };
}

export function useLogisticsJobDetail(jobId: string) {
  const {
    data: job,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGet_jobQuery(jobId, {
    skip: !jobId,
  });

  useFocusEffect(
    useCallback(() => {
      if (!jobId) return;
      void refetch();
    }, [jobId, refetch]),
  );

  return { job: job ?? null, isLoading, isFetching, refetch, error };
}

export function useCollectionBooking() {
  const [quoteCollection, { isLoading: isQuoting }] =
    useQuote_collectionMutation();
  const [bookCollection, { isLoading: isBooking }] =
    useBook_collectionMutation();

  const quote = useCallback(
    (payload: {
      inbound_shipment_id: string;
      pickup_address: Omit<LogisticsAddress, "instructions"> & {
        instructions?: string;
      };
      is_priority?: boolean;
    }) => quoteCollection(payload).unwrap(),
    [quoteCollection],
  );

  const book = useCallback(
    (payload: {
      inbound_shipment_id: string;
      pickup_address: Omit<LogisticsAddress, "instructions"> & {
        instructions?: string;
      };
      is_priority?: boolean;
      special_instructions?: string;
    }): Promise<BookCollectionResult> => bookCollection(payload).unwrap(),
    [bookCollection],
  );

  return { quote, book, isQuoting, isBooking };
}

export default useLogisticsList;
