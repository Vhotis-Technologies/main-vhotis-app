import type {
  SupportTicket,
  TicketResolutionType,
  TicketStatus,
} from '@/app/interfaces/main/support/TicketInterfaces';

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_response: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: '#2563eb',
  in_progress: '#d97706',
  waiting_response: '#7c3aed',
  resolved: '#16a34a',
  closed: '#6b7280',
};

const RESOLUTION_LABELS: Record<string, string> = {
  full_refund: 'Full refund issued',
  partial_refund: 'Partial refund issued',
  replacement: 'Resolved with replacement',
  denied: 'Request denied',
  info_only: 'Information provided',
  no_action: 'No further action',
  withdrawn: 'Withdrawn by buyer',
};

export function ticketStatusLabel(status: TicketStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function ticketStatusColor(status: TicketStatus): string {
  return STATUS_COLORS[status] ?? '#6b7280';
}

export function ticketResolutionLabel(
  resolutionType?: TicketResolutionType | null,
): string {
  if (!resolutionType) return '';
  return RESOLUTION_LABELS[resolutionType] ?? resolutionType.replace(/_/g, ' ');
}

export function isTicketTerminal(ticket: Pick<SupportTicket, 'status'>): boolean {
  return ticket.status === 'resolved' || ticket.status === 'closed';
}

export function canBuyerWithdrawTicket(
  ticket: Pick<SupportTicket, 'status' | 'resolutionType'>,
): boolean {
  if (isTicketTerminal(ticket)) return false;
  if (
    ticket.resolutionType === 'full_refund' ||
    ticket.resolutionType === 'partial_refund'
  ) {
    return false;
  }
  return ['open', 'in_progress', 'waiting_response'].includes(ticket.status);
}

export function formatTicketDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
