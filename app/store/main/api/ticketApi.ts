import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './rtkBaseQuery';
import type {
  AddTicketEvidencePayload,
  CreateTicketApiPayload,
  ListTicketsParams,
  ReportProblemApiPayload,
  SendTicketMessagePayload,
  TicketApiDetail,
  TicketApiListItem,
  TicketEvidenceApi,
  TicketMessageApi,
  UploadEvidenceApiResponse,
  WithdrawDisputePayload,
  WithdrawDisputeResponse,
} from '@/app/interfaces/main/support/TicketInterfaces';

const ticketApi = createApi({
  reducerPath: 'ticketApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Tickets'],
  endpoints: (builder) => ({
    listTickets: builder.query<TicketApiListItem[], ListTicketsParams | void>({
      query: (params) => ({
        url: '/api/v1/tickets/list/',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((ticket) => ({
                type: 'Tickets' as const,
                id: ticket.ticket_number,
              })),
              { type: 'Tickets' as const, id: 'LIST' },
            ]
          : [{ type: 'Tickets' as const, id: 'LIST' }],
    }),

    getTicketDetail: builder.query<TicketApiDetail, string>({
      query: (ticketNumber) => ({
        url: '/api/v1/tickets/detail/',
        method: 'GET',
        params: { ticket_number: ticketNumber },
      }),
      providesTags: (_result, _error, ticketNumber) => [
        { type: 'Tickets', id: ticketNumber },
      ],
    }),

    listTicketMessages: builder.query<TicketMessageApi[], string>({
      query: (ticketNumber) => ({
        url: '/api/v1/tickets/list_messages/',
        method: 'GET',
        params: { ticket_number: ticketNumber },
      }),
      providesTags: (_result, _error, ticketNumber) => [
        { type: 'Tickets', id: `${ticketNumber}-messages` },
      ],
    }),

    createTicket: builder.mutation<TicketApiDetail, CreateTicketApiPayload>({
      query: (data) => ({
        url: '/api/v1/tickets/create/',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Tickets', id: 'LIST' }],
    }),

    reportProblem: builder.mutation<TicketApiDetail, ReportProblemApiPayload>({
      query: (data) => ({
        url: '/api/v1/tickets/report_problem/',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Tickets', id: 'LIST' }],
    }),

    uploadTicketEvidence: builder.mutation<
      UploadEvidenceApiResponse,
      FormData
    >({
      // Do not set Content-Type — RN/axios must add multipart boundary.
      query: (formData) => ({
        url: '/api/v1/tickets/upload_evidence/',
        method: 'POST',
        data: formData,
      }),
    }),

    sendTicketMessage: builder.mutation<
      TicketMessageApi,
      SendTicketMessagePayload
    >({
      query: (data) => ({
        url: '/api/v1/tickets/send_message/',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tickets', id: arg.ticket_number },
        { type: 'Tickets', id: `${arg.ticket_number}-messages` },
        { type: 'Tickets', id: 'LIST' },
      ],
    }),

    addTicketEvidence: builder.mutation<
      TicketEvidenceApi,
      AddTicketEvidencePayload
    >({
      query: (data) => ({
        url: '/api/v1/tickets/add_evidence/',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tickets', id: arg.ticket_number },
        { type: 'Tickets', id: 'LIST' },
      ],
    }),

    withdrawDispute: builder.mutation<
      WithdrawDisputeResponse,
      WithdrawDisputePayload
    >({
      query: (data) => ({
        url: '/api/v1/tickets/withdraw_dispute/',
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tickets', id: arg.ticket_number },
        { type: 'Tickets', id: `${arg.ticket_number}-messages` },
        { type: 'Tickets', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListTicketsQuery,
  useGetTicketDetailQuery,
  useListTicketMessagesQuery,
  useCreateTicketMutation,
  useReportProblemMutation,
  useUploadTicketEvidenceMutation,
  useSendTicketMessageMutation,
  useAddTicketEvidenceMutation,
  useWithdrawDisputeMutation,
} = ticketApi;

export default ticketApi;
