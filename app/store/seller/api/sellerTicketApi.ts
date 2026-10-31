import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/app/store/main/api/rtkBaseQuery';
import type {
  AddTicketEvidencePayload,
  CreateTicketApiPayload,
  ListTicketsParams,
  SendTicketMessagePayload,
  TicketApiDetail,
  TicketApiListItem,
  TicketEvidenceApi,
  TicketMessageApi,
} from '@/app/interfaces/main/support/TicketInterfaces';

export interface SellerTicketApiDetail extends TicketApiDetail {
  seller_order_claim_id: string | null;
}

const sellerTicketApi = createApi({
  reducerPath: 'sellerTicketApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['SellerTickets'],
  endpoints: (builder) => ({
    listSellerTickets: builder.query<TicketApiListItem[], ListTicketsParams | void>({
      query: (params) => ({
        url: '/api/v2/tickets/list/',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((ticket) => ({
                type: 'SellerTickets' as const,
                id: ticket.ticket_number,
              })),
              { type: 'SellerTickets' as const, id: 'LIST' },
            ]
          : [{ type: 'SellerTickets' as const, id: 'LIST' }],
    }),

    getSellerTicketDetail: builder.query<SellerTicketApiDetail, string>({
      query: (ticketNumber) => ({
        url: '/api/v2/tickets/detail/',
        method: 'GET',
        params: { ticket_number: ticketNumber },
      }),
      providesTags: (_result, _error, ticketNumber) => [
        { type: 'SellerTickets', id: ticketNumber },
      ],
    }),

    listSellerTicketMessages: builder.query<TicketMessageApi[], string>({
      query: (ticketNumber) => ({
        url: '/api/v2/tickets/list_messages/',
        method: 'GET',
        params: { ticket_number: ticketNumber },
      }),
      providesTags: (_result, _error, ticketNumber) => [
        { type: 'SellerTickets', id: `${ticketNumber}-messages` },
      ],
    }),

    createSellerTicket: builder.mutation<SellerTicketApiDetail, CreateTicketApiPayload>({
      query: (data) => ({
        url: '/api/v2/tickets/create/',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'SellerTickets', id: 'LIST' }],
    }),

    sendSellerTicketMessage: builder.mutation<
      TicketMessageApi,
      SendTicketMessagePayload
    >({
      query: (data) => ({
        url: '/api/v2/tickets/send_message/',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'SellerTickets', id: arg.ticket_number },
        { type: 'SellerTickets', id: `${arg.ticket_number}-messages` },
        { type: 'SellerTickets', id: 'LIST' },
      ],
    }),

    addSellerTicketEvidence: builder.mutation<
      TicketEvidenceApi,
      AddTicketEvidencePayload
    >({
      query: (data) => ({
        url: '/api/v2/tickets/add_evidence/',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'SellerTickets', id: arg.ticket_number },
        { type: 'SellerTickets', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListSellerTicketsQuery,
  useGetSellerTicketDetailQuery,
  useListSellerTicketMessagesQuery,
  useCreateSellerTicketMutation,
  useSendSellerTicketMessageMutation,
  useAddSellerTicketEvidenceMutation,
} = sellerTicketApi;

export default sellerTicketApi;
