import { useCallback, useMemo } from 'react';
import {
  useCreateTicketMutation,
  useListTicketsQuery,
  useReportProblemMutation,
  useUploadTicketEvidenceMutation,
} from '@/app/store/main/api/ticketApi';
import type {
  CreateTicketInput,
  ReportProblemInput,
  SupportTicket,
} from '@/app/interfaces/main/support/TicketInterfaces';
import {
  mapTicketDetail,
  mapTicketListItem,
} from '@/app/utils/main/supportTicketMappers';

/**
 * Buyer support tickets — list, create, and Phase 3 report-a-problem.
 */
const useBuyersTicket = () => {
  const { data, isLoading, isError, refetch } = useListTicketsQuery();
  const [createTicketMutation, { isLoading: isCreating }] =
    useCreateTicketMutation();
  const [reportProblemMutation, { isLoading: isReporting }] =
    useReportProblemMutation();
  const [uploadEvidenceMutation, { isLoading: isUploadingEvidence }] =
    useUploadTicketEvidenceMutation();

  const tickets = useMemo(
    () => (data ?? []).map(mapTicketListItem),
    [data],
  );

  const createTicket = useCallback(
    async (input: CreateTicketInput): Promise<SupportTicket> => {
      const result = await createTicketMutation({
        ticket_type: input.ticketType,
        title: input.title,
        description: input.description,
        order_id: input.orderId,
        order_item_ids: input.orderItemIds,
        evidence_urls: input.evidenceUrls,
        priority: input.priority,
      }).unwrap();

      return {
        ...mapTicketDetail(result),
        reasonLabel: input.reasonLabel,
        orderLabel: input.orderLabel,
      };
    },
    [createTicketMutation],
  );

  /** Phase 3: order product dispute with required line items. */
  const reportProblem = useCallback(
    async (input: ReportProblemInput): Promise<SupportTicket> => {
      const result = await reportProblemMutation({
        order_id: input.orderId,
        order_item_ids: input.orderItemIds,
        ticket_type: input.ticketType,
        title: input.title,
        description: input.description,
        evidence_urls: input.evidenceUrls,
        priority: input.priority,
      }).unwrap();

      return {
        ...mapTicketDetail(result),
        reasonLabel: input.reasonLabel,
        orderLabel: input.orderLabel,
      };
    },
    [reportProblemMutation],
  );

  /** Upload a local photo; returns public URL for evidence_urls. */
  const uploadEvidencePhoto = useCallback(
    async (localUri: string, mimeType = 'image/jpeg'): Promise<string> => {
      const formData = new FormData();
      const name = localUri.split('/').pop() || `evidence_${Date.now()}.jpg`;
      formData.append('file', {
        uri: localUri,
        name,
        type: mimeType,
      } as unknown as Blob);
      const result = await uploadEvidenceMutation(formData).unwrap();
      if (!result?.url) {
        throw new Error('Upload did not return a URL');
      }
      return result.url;
    },
    [uploadEvidenceMutation],
  );

  return {
    tickets,
    isLoading,
    isError,
    isCreating: isCreating || isReporting,
    isUploadingEvidence,
    refetch,
    createTicket,
    reportProblem,
    uploadEvidencePhoto,
  };
};

export default useBuyersTicket;
