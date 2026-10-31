import { getSellerReasonByTicketType } from '@/app/constants/seller/supportTicketDummyData';
import type {
  SupportTicket,
  TicketApiDetail,
  TicketApiListItem,
  TicketMessage,
  TicketMessageApi,
} from '@/app/interfaces/main/support/TicketInterfaces';

function reasonLabelFor(ticketType: string): string {
  return getSellerReasonByTicketType(ticketType)?.label ?? ticketType.replace(/_/g, ' ');
}

function invitedFromDto(dto: TicketApiListItem): boolean {
  return (
    dto.participation === 'invited' ||
    dto.raised_by_role === 'buyer'
  );
}

export function mapSellerTicketListItem(dto: TicketApiListItem): SupportTicket {
  const isInvitedDispute = invitedFromDto(dto);
  return {
    id: dto.id,
    ticketNumber: dto.ticket_number,
    ticketType: dto.ticket_type,
    reasonLabel: isInvitedDispute
      ? 'Buyer dispute'
      : reasonLabelFor(dto.ticket_type),
    title: dto.title,
    description: '',
    status: dto.status,
    priority: dto.priority,
    orderId: dto.order_id ?? undefined,
    raisedByRole: dto.raised_by_role,
    isInvitedDispute,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapSellerTicketDetail(dto: TicketApiDetail): SupportTicket {
  const isInvitedDispute = invitedFromDto(dto);
  return {
    id: dto.id,
    ticketNumber: dto.ticket_number,
    ticketType: dto.ticket_type,
    reasonLabel: isInvitedDispute
      ? 'Buyer dispute'
      : reasonLabelFor(dto.ticket_type),
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    orderId: dto.order_id ?? undefined,
    raisedByRole: dto.raised_by_role,
    isInvitedDispute,
    resolutionType: dto.resolution_type,
    resolutionNotes: dto.resolution_notes || undefined,
    resolvedAmount: dto.resolved_amount,
    resolvedAt: dto.resolved_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapSellerApiMessages(
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
