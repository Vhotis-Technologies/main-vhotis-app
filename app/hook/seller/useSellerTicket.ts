import { useCallback, useMemo } from 'react';
import {
  useCreateSellerTicketMutation,
  useListSellerTicketsQuery,
} from '@/app/store/seller/api/sellerTicketApi';
import type {
  CreateTicketInput,
  SupportTicket,
} from '@/app/interfaces/main/support/TicketInterfaces';
import {
  mapSellerTicketDetail,
  mapSellerTicketListItem,
} from '@/app/utils/seller/supportTicketMappers';

/**
 * Seller support tickets — list and create via /api/v2/tickets/.
 */
const useSellerTicket = () => {
  const { data, isLoading, isError, refetch } = useListSellerTicketsQuery();
  const [createTicketMutation, { isLoading: isCreating }] =
    useCreateSellerTicketMutation();

  const tickets = useMemo(
    () => (data ?? []).map(mapSellerTicketListItem),
    [data],
  );

  const createTicket = useCallback(
    async (input: CreateTicketInput): Promise<SupportTicket> => {
      const result = await createTicketMutation({
        ticket_type: input.ticketType,
        title: input.title,
        description: input.description,
        order_id: input.orderId,
        priority: input.priority,
      }).unwrap();

      return {
        ...mapSellerTicketDetail(result),
        reasonLabel: input.reasonLabel,
        orderLabel: input.orderLabel,
      };
    },
    [createTicketMutation],
  );

  return {
    tickets,
    isLoading,
    isError,
    isCreating,
    refetch,
    createTicket,
  };
};

export default useSellerTicket;
