import type { IMessage } from 'react-native-gifted-chat';

/** GiftedChat user ids for ticket roles (Phase 5 — 3-party thread). */
export const TICKET_CHAT_USERS = {
  buyer: { _id: 'buyer', name: 'Buyer' },
  seller: { _id: 'seller', name: 'Seller' },
  agent: { _id: 'agent', name: 'Support' },
  system: { _id: 'system', name: 'System' },
} as const;

export type TicketChatViewer = 'buyer' | 'seller';

/**
 * Map a stored ticket message into GiftedChat.
 * The signed-in party sees their own bubbles as "You".
 */
export function toTicketGiftedMessage(
  msg: { id: string; role: string; text: string; createdAt: string },
  viewer: TicketChatViewer,
): IMessage {
  const role = msg.role;
  let user = TICKET_CHAT_USERS.agent;
  if (role === 'system') {
    user = TICKET_CHAT_USERS.system;
  } else if (role === 'buyer') {
    user =
      viewer === 'buyer'
        ? { _id: 'buyer', name: 'You' }
        : TICKET_CHAT_USERS.buyer;
  } else if (role === 'seller') {
    user =
      viewer === 'seller'
        ? { _id: 'seller', name: 'You' }
        : TICKET_CHAT_USERS.seller;
  } else if (role === 'agent') {
    user = TICKET_CHAT_USERS.agent;
  }

  return {
    _id: msg.id,
    text: msg.text,
    createdAt: new Date(msg.createdAt),
    user,
    system: role === 'system',
  };
}

export const TICKET_CHAT_POLL_MS = 5000;
