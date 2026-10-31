import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  SEED_SELLER_MESSAGES,
  SEED_SELLER_TICKETS,
} from '@/app/constants/seller/supportTicketDummyData';
import type {
  CreateTicketInput,
  SupportTicket,
  TicketMessage,
} from '@/app/interfaces/seller/support/TicketInterfaces';

interface SellerTicketsContextValue {
  tickets: SupportTicket[];
  getTicket: (id: string) => SupportTicket | undefined;
  getMessages: (ticketId: string) => TicketMessage[];
  createTicket: (input: CreateTicketInput) => SupportTicket;
  appendMessage: (ticketId: string, text: string, role?: TicketMessage['role']) => void;
}

const SellerTicketsContext = createContext<SellerTicketsContextValue | null>(null);

function nextTicketNumber(): string {
  const prefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `TKT-${prefix}-${seq}`;
}

export function SellerTicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED_SELLER_TICKETS);
  const [messages, setMessages] = useState<TicketMessage[]>(SEED_SELLER_MESSAGES);

  const getTicket = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets],
  );

  const getMessages = useCallback(
    (ticketId: string) =>
      messages
        .filter((m) => m.ticketId === ticketId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  );

  const createTicket = useCallback((input: CreateTicketInput): SupportTicket => {
    const now = new Date().toISOString();
    const id = `tkt-seller-${Date.now()}`;
    const ticket: SupportTicket = {
      id,
      ticketNumber: nextTicketNumber(),
      ticketType: input.ticketType,
      reasonLabel: input.reasonLabel,
      title: input.title,
      description: input.description,
      status: 'open',
      priority: input.priority ?? 'normal',
      orderId: input.orderId,
      orderLabel: input.orderLabel,
      createdAt: now,
      updatedAt: now,
    };

    const seedMessages: TicketMessage[] = [
      {
        id: `smsg-${Date.now()}-sys`,
        ticketId: id,
        role: 'system',
        text: 'Your ticket was created. A support agent will respond shortly.',
        createdAt: now,
      },
      {
        id: `smsg-${Date.now()}-user`,
        ticketId: id,
        role: 'seller',
        text: input.description,
        createdAt: now,
      },
    ];

    setTickets((prev) => [ticket, ...prev]);
    setMessages((prev) => [...prev, ...seedMessages]);
    return ticket;
  }, []);

  const appendMessage = useCallback(
    (ticketId: string, text: string, role: TicketMessage['role'] = 'seller') => {
      const now = new Date().toISOString();
      const msg: TicketMessage = {
        id: `smsg-${Date.now()}`,
        ticketId,
        role,
        text,
        createdAt: now,
      };
      setMessages((prev) => [...prev, msg]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, updatedAt: now, status: t.status === 'open' ? 'waiting_response' : t.status } : t,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({ tickets, getTicket, getMessages, createTicket, appendMessage }),
    [tickets, getTicket, getMessages, createTicket, appendMessage],
  );

  return (
    <SellerTicketsContext.Provider value={value}>{children}</SellerTicketsContext.Provider>
  );
}

export function useSellerTickets(): SellerTicketsContextValue {
  const ctx = useContext(SellerTicketsContext);
  if (!ctx) {
    throw new Error('useSellerTickets must be used within SellerTicketsProvider');
  }
  return ctx;
}
