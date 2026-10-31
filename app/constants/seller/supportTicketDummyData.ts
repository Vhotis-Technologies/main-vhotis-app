import type {
  MockOrderOption,
  SupportTicket,
  TicketMessage,
  TicketReason,
} from '@/app/interfaces/seller/support/TicketInterfaces';

export const SELLER_TICKET_REASONS: TicketReason[] = [
  { id: 'pickup_issue', category: 'Orders', label: 'Pickup issue', ticketType: 'pickup_issue', requiresOrder: true },
  { id: 'order_not_ready', category: 'Orders', label: 'Order not ready', ticketType: 'order_not_ready', requiresOrder: true },
  { id: 'incorrect_order_details', category: 'Orders', label: 'Incorrect order details', ticketType: 'incorrect_order_details', requiresOrder: true },
  { id: 'delivery_issue', category: 'Orders', label: 'Delivery issue', ticketType: 'delivery_issue', requiresOrder: true },
  { id: 'payment_dispute', category: 'Business', label: 'Payout / payment dispute', ticketType: 'payment_dispute', requiresOrder: false },
  { id: 'store_listing', category: 'Business', label: 'Store / listing', ticketType: 'store_listing', requiresOrder: false },
  { id: 'policy_question', category: 'Business', label: 'Policy question', ticketType: 'policy_question', requiresOrder: false },
  { id: 'other', category: 'General', label: 'Other', ticketType: 'other', requiresOrder: false },
  { id: 'speak_to_agent', category: 'General', label: 'Speak to an agent', ticketType: 'speak_to_agent', requiresOrder: false },
];

export const MOCK_SELLER_ORDERS: MockOrderOption[] = [
  { id: 'ord-s-201', label: 'ORD-201 · Claimed · €32.00', status: 'claimed' },
  { id: 'ord-s-198', label: 'ORD-198 · Packed · €54.20', status: 'packed' },
  { id: 'ord-s-195', label: 'ORD-195 · Delivered · €28.75', status: 'delivered' },
];

export const SEED_SELLER_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-seller-1',
    ticketNumber: 'TKT-20260627-00004',
    ticketType: 'pickup_issue',
    reasonLabel: 'Pickup issue',
    title: 'Rider arrived before order was ready',
    description: 'Rider came 10 minutes early and the order was still being packed.',
    status: 'waiting_response',
    priority: 'normal',
    orderId: 'ord-s-201',
    orderLabel: 'ORD-201',
    createdAt: '2026-06-27T09:00:00Z',
    updatedAt: '2026-06-28T11:30:00Z',
  },
];

export const SEED_SELLER_MESSAGES: TicketMessage[] = [
  {
    id: 'smsg-1',
    ticketId: 'tkt-seller-1',
    role: 'system',
    text: 'Your ticket was created. A support agent will respond shortly.',
    createdAt: '2026-06-27T09:00:05Z',
  },
  {
    id: 'smsg-2',
    ticketId: 'tkt-seller-1',
    role: 'seller',
    text: 'Rider came 10 minutes early and the order was still being packed.',
    createdAt: '2026-06-27T09:00:10Z',
  },
  {
    id: 'smsg-3',
    ticketId: 'tkt-seller-1',
    role: 'agent',
    text: 'Thanks for reporting this. We will note the pickup timing on this order.',
    createdAt: '2026-06-28T11:25:00Z',
  },
];

export function getSellerReasonById(id: string): TicketReason | undefined {
  return SELLER_TICKET_REASONS.find((r) => r.id === id);
}

export function getSellerReasonByTicketType(ticketType: string): TicketReason | undefined {
  return SELLER_TICKET_REASONS.find((r) => r.ticketType === ticketType);
}
