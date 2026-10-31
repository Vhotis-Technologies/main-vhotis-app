export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_response'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketMessageRole = 'buyer' | 'seller' | 'agent' | 'system';

export interface TicketReason {
  id: string;
  category: string;
  label: string;
  ticketType: string;
  requiresOrder: boolean;
}

export interface MockOrderOption {
  id: string;
  label: string;
  status: string;
}

export type TicketResolutionType =
  | 'full_refund'
  | 'partial_refund'
  | 'replacement'
  | 'denied'
  | 'info_only'
  | 'no_action'
  | 'withdrawn'
  | string;

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  ticketType: string;
  reasonLabel: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  orderId?: string;
  orderLabel?: string;
  /** Who opened the ticket (seller API includes this). */
  raisedByRole?: 'buyer' | 'seller' | 'agent' | 'system';
  /** Seller was invited into a buyer-raised dispute (Phase 4). */
  isInvitedDispute?: boolean;
  /** Phase 7 — present when case is terminal. */
  resolutionType?: TicketResolutionType | null;
  resolutionNotes?: string;
  resolvedAmount?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  role: TicketMessageRole;
  text: string;
  createdAt: string;
}

export interface CreateTicketInput {
  ticketType: string;
  reasonLabel: string;
  title: string;
  description: string;
  priority?: TicketPriority;
  orderId?: string;
  orderLabel?: string;
  orderItemIds?: Array<string | number>;
  evidenceUrls?: string[];
}

export interface ReportProblemInput {
  orderId: string;
  orderLabel?: string;
  orderItemIds: Array<string | number>;
  ticketType: string;
  reasonLabel: string;
  title: string;
  description: string;
  evidenceUrls?: string[];
  priority?: TicketPriority;
}

// ---------------------------------------------------------------------------
// API DTOs (snake_case — matches BuyerTicketView responses)
// ---------------------------------------------------------------------------

export interface TicketApiListItem {
  id: string;
  ticket_number: string;
  ticket_type: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  /** Present on seller ticket list/detail (Phase 4). */
  raised_by_role?: 'buyer' | 'seller' | 'agent' | 'system';
  participation?: 'owner' | 'invited';
}

export interface TicketOrderItemApi {
  id: string;
  product__name: string;
  quantity: number;
  sub_total: number;
}

export interface TicketEvidenceApi {
  id: string;
  evidence_type: string;
  file_url: string | null;
  text_content: string | null;
  created_at: string;
}

export interface TicketMessageApi {
  id: string;
  ticket_id: string;
  sender_role: TicketMessageRole;
  message_type: 'text' | 'attachment' | 'system';
  body: string;
  attachment_url: string | null;
  created_at: string;
}

export interface TicketApiDetail extends TicketApiListItem {
  description: string;
  resolution_type: string | null;
  resolution_notes: string;
  resolved_amount: number | null;
  support_case_id: string | null;
  order_items: TicketOrderItemApi[];
  messages: TicketMessageApi[];
}

export interface ListTicketsParams {
  status?: TicketStatus;
  order_id?: string;
}

export interface CreateTicketApiPayload {
  ticket_type: string;
  title: string;
  description: string;
  order_id?: string;
  order_item_ids?: Array<string | number>;
  evidence_urls?: string[];
  priority?: TicketPriority;
}

/** Phase 3 — order product dispute (requires items, single seller). */
export interface ReportProblemApiPayload {
  order_id: string;
  order_item_ids: Array<string | number>;
  ticket_type: string;
  title: string;
  description: string;
  evidence_urls?: string[];
  priority?: TicketPriority;
}

export interface UploadEvidenceApiResponse {
  url: string;
  path?: string;
}

export interface AddTicketEvidencePayload {
  ticket_number: string;
  evidence_type: string;
  file_url?: string;
  text_content?: string;
  order_item_id?: string;
}

export interface SendTicketMessagePayload {
  ticket_number: string;
  body: string;
}

/** Phase 7 — buyer withdraws an open dispute / ticket. */
export interface WithdrawDisputePayload {
  ticket_number: string;
  note?: string;
}

export interface WithdrawDisputeResponse {
  id: string;
  ticket_number: string;
  status: TicketStatus;
  resolution_type: string;
  resolution_notes: string;
  resolved_at: string | null;
  unfrozen_escrow_entry_ids: number[];
  outcome_label?: string;
}
