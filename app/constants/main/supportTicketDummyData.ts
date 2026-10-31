import type {
  SupportTicket,
  TicketMessage,
  TicketReason,
} from '@/app/interfaces/main/support/TicketInterfaces';

export const BUYER_TICKET_REASONS: TicketReason[] = [
  { id: 'item_not_received', category: 'Orders', label: 'Item not received', ticketType: 'item_not_received', requiresOrder: true },
  { id: 'wrong_item', category: 'Orders', label: 'Wrong item delivered', ticketType: 'wrong_item', requiresOrder: true },
  { id: 'damaged_item', category: 'Orders', label: 'Item arrived damaged', ticketType: 'damaged_item', requiresOrder: true },
  { id: 'missing_item', category: 'Orders', label: 'Missing item from order', ticketType: 'missing_item', requiresOrder: true },
  { id: 'quality_issue', category: 'Orders', label: 'Quality issue', ticketType: 'quality_issue', requiresOrder: true },
  { id: 'delivery_issue', category: 'Orders', label: 'Delivery issue', ticketType: 'delivery_issue', requiresOrder: true },
  { id: 'refund_request', category: 'Orders', label: 'Refund request', ticketType: 'refund_request', requiresOrder: true },
  { id: 'account_help', category: 'Account', label: 'Account help', ticketType: 'account_help', requiresOrder: false },
  { id: 'payment_issue', category: 'Account', label: 'Payment issue', ticketType: 'payment_issue', requiresOrder: false },
  { id: 'other', category: 'General', label: 'Other', ticketType: 'other', requiresOrder: false },
  { id: 'speak_to_agent', category: 'General', label: 'Speak to an agent', ticketType: 'speak_to_agent', requiresOrder: false },
];

/** Product disputes that freeze escrow and require line-item selection (Phase 3). */
export const BUYER_PRODUCT_DISPUTE_TICKET_TYPES = new Set([
  'item_not_received',
  'wrong_item',
  'damaged_item',
  'missing_item',
  'quality_issue',
  'partial_fulfillment',
  'refund_request',
]);

export const BUYER_REPORT_PROBLEM_REASONS: TicketReason[] =
  BUYER_TICKET_REASONS.filter((r) => BUYER_PRODUCT_DISPUTE_TICKET_TYPES.has(r.ticketType));

export const SEED_BUYER_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-seed-1',
    ticketNumber: 'TKT-20260628-00012',
    ticketType: 'delivery_issue',
    reasonLabel: 'Delivery issue',
    title: 'Order arrived late',
    description: 'My order was supposed to arrive by 6pm but came at 9pm.',
    status: 'in_progress',
    priority: 'normal',
    orderId: 'ord-1001',
    orderLabel: 'ORD-1001',
    createdAt: '2026-06-28T14:30:00Z',
    updatedAt: '2026-06-29T09:15:00Z',
  },
  {
    id: 'tkt-seed-2',
    ticketNumber: 'TKT-20260625-00008',
    ticketType: 'payment_issue',
    reasonLabel: 'Payment issue',
    title: 'Double charge on card',
    description: 'I see two pending charges for the same order.',
    status: 'resolved',
    priority: 'high',
    createdAt: '2026-06-25T11:00:00Z',
    updatedAt: '2026-06-26T16:45:00Z',
  },
];

export const SEED_BUYER_MESSAGES: TicketMessage[] = [
  {
    id: 'msg-1',
    ticketId: 'tkt-seed-1',
    role: 'system',
    text: 'Your ticket was created. A support agent will respond shortly.',
    createdAt: '2026-06-28T14:30:05Z',
  },
  {
    id: 'msg-2',
    ticketId: 'tkt-seed-1',
    role: 'buyer',
    text: 'My order was supposed to arrive by 6pm but came at 9pm.',
    createdAt: '2026-06-28T14:30:10Z',
  },
  {
    id: 'msg-3',
    ticketId: 'tkt-seed-1',
    role: 'agent',
    text: 'Hi, I am sorry about the delay. I am looking into this with the delivery team.',
    createdAt: '2026-06-28T15:02:00Z',
  },
  {
    id: 'msg-4',
    ticketId: 'tkt-seed-2',
    role: 'system',
    text: 'Your ticket was created. A support agent will respond shortly.',
    createdAt: '2026-06-25T11:00:05Z',
  },
  {
    id: 'msg-5',
    ticketId: 'tkt-seed-2',
    role: 'buyer',
    text: 'I see two pending charges for the same order.',
    createdAt: '2026-06-25T11:00:10Z',
  },
  {
    id: 'msg-6',
    ticketId: 'tkt-seed-2',
    role: 'agent',
    text: 'We have issued a refund for the duplicate charge. It may take 3–5 business days.',
    createdAt: '2026-06-26T16:40:00Z',
  },
];

export function getBuyerReasonById(id: string): TicketReason | undefined {
  return BUYER_TICKET_REASONS.find((r) => r.id === id);
}

export function getBuyerReasonByTicketType(ticketType: string): TicketReason | undefined {
  return BUYER_TICKET_REASONS.find((r) => r.ticketType === ticketType);
}
