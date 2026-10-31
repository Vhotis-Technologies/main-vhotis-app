import { getBuyerReasonByTicketType } from '@/app/constants/main/supportTicketDummyData';
import type {
  SupportTicket,
  TicketApiDetail,
  TicketApiListItem,
  TicketMessage,
  TicketMessageApi,
} from '@/app/interfaces/main/support/TicketInterfaces';

export const BUYER_TICKETABLE_ORDER_STATUSES = new Set([
  'picked_up',
  'in_transit',
  'rider_arrived_delivery',
  'delivered',
  'refund_requested',
  'returned',
]);

/** Statuses where "Report a problem" is shown on order details. */
export function canReportProblemForOrderStatus(status: string): boolean {
  return BUYER_TICKETABLE_ORDER_STATUSES.has(status);
}

function reasonLabelFor(ticketType: string): string {
  return getBuyerReasonByTicketType(ticketType)?.label ?? ticketType.replace(/_/g, ' ');
}

export function mapTicketListItem(dto: TicketApiListItem): SupportTicket {
  return {
    id: dto.id,
    ticketNumber: dto.ticket_number,
    ticketType: dto.ticket_type,
    reasonLabel: reasonLabelFor(dto.ticket_type),
    title: dto.title,
    description: '',
    status: dto.status,
    priority: dto.priority,
    orderId: dto.order_id ?? undefined,
    resolvedAt: dto.resolved_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapTicketDetail(dto: TicketApiDetail): SupportTicket {
  return {
    id: dto.id,
    ticketNumber: dto.ticket_number,
    ticketType: dto.ticket_type,
    reasonLabel: reasonLabelFor(dto.ticket_type),
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    orderId: dto.order_id ?? undefined,
    resolutionType: dto.resolution_type,
    resolutionNotes: dto.resolution_notes || undefined,
    resolvedAmount: dto.resolved_amount,
    resolvedAt: dto.resolved_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapApiMessages(
  messages: TicketMessageApi[],
  ticketId: string,
): TicketMessage[] {
  return messages.map((message) => ({
    id: message.id,
    ticketId,
    role: message.sender_role,
    text: message.body,
    createdAt: message.created_at,
  }));
}
