/**
 * useTicketChatSocket — live delivery for ticket chat (buyer + seller apps).
 *
 * Connects to the main app's ``TicketChatConsumer`` WebSocket
 * (``wss://.../ws/main/tickets/<ticketId>/?token=...``) and invokes
 * ``onMessage`` whenever a ``ticket_message`` frame arrives — i.e. whenever
 * *any* party (buyer, seller, agent, system) posts a new line on this
 * ticket, relayed through the Redis Stream bridge worker on the backend
 * (see ``main/server/vhotis_server/main/services/ticket_stream.py``).
 *
 * Deliberately additive, not a replacement
 * -------------------------------------------
 * ``TicketChatScreen`` / seller ``TicketDetailScreen`` already poll the
 * REST ticket-detail endpoint every ``TICKET_CHAT_POLL_MS`` via RTK Query.
 * That polling is left completely untouched — it is the fallback if this
 * socket never connects (offline, old app build, server hiccup, etc).
 * ``onMessage`` here is expected to just trigger an immediate refetch of
 * that same RTK Query (see call sites), rather than hand-rolling a second,
 * parallel source of truth for the message list. This keeps exactly ONE
 * place (the REST response + its mapper) that turns server data into
 * ``IMessage[]`` — the socket's only job is "wake up and refetch now"
 * instead of "wait up to TICKET_CHAT_POLL_MS".
 *
 * Reconnection
 * -------------
 * Mobile connections drop constantly (backgrounding, cell handoff, etc).
 * On any close/error this schedules a reconnect with jittered exponential
 * backoff (capped) rather than a tight retry loop, and gives up cleanly on
 * unmount. There is no message queue/replay here — a missed message during
 * a disconnect window is simply picked up by the next REST poll or by the
 * resync-on-reconnect call this hook makes right after a fresh connection.
 */
import { useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

import { API_CONFIG } from '@/constants/Config';
import { useAppSelector } from '@/app/store/store';

const BASE_RECONNECT_DELAY_MS = 1_500;
const MAX_RECONNECT_DELAY_MS = 20_000;

/** Server frame shape — see ``TicketChatConsumer.ticket_message`` (main app). */
interface TicketChatSocketFrame {
  type: 'ticket_message' | 'error';
  payload?: unknown;
  error?: string;
}

/**
 * Subscribe to live updates for one ticket's chat.
 *
 * @param ticketId - main app ``Ticket.id`` (UUID) — the same id the
 *   consumer's URL and Channels group are keyed on. Pass ``undefined``/``''``
 *   to skip connecting (e.g. while the ticket hasn't loaded yet).
 * @param onMessage - called with the raw payload every time a
 *   ``ticket_message`` frame arrives. Callers should treat this purely as a
 *   "something changed, go refetch" signal — see module docstring.
 */
export function useTicketChatSocket(
  ticketId: string | undefined,
  onMessage: () => void,
): void {
  const reduxAccessToken = useAppSelector((state) => state.auth.access);

  // Keep the latest onMessage in a ref so the effect below doesn't need to
  // tear down/reconnect the socket just because the caller passed a new
  // inline callback on every render (common with hooks like RTK Query's
  // `refetch`, which is referentially stable, but we don't want to rely on
  // callers getting that right).
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!ticketId || !API_CONFIG.websocketUrl) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;
    // Guards against a reconnect firing after the effect has been cleaned
    // up (component unmounted / ticketId changed) — closures below check
    // this before touching `socket`.
    let cancelled = false;

    const connect = async () => {
      if (cancelled) return;

      // Redux holds the access token after login, but SecureStore is the
      // durable source — mirrors the exact fallback order rtkBaseQuery.ts
      // uses for REST calls, so WS auth never falls out of sync with REST.
      const token =
        reduxAccessToken || (await SecureStore.getItemAsync('access'));
      if (!token || cancelled) {
        return;
      }

      // API_CONFIG.websocketUrl is the bare "wss://host/ws/" origin — this
      // consumer is mounted under main's "ws/main/" prefix (see
      // main/routing.py), so build the full ticket-room URL here.
      const url = `${API_CONFIG.websocketUrl}main/tickets/${ticketId}/?token=${encodeURIComponent(token)}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        reconnectAttempt = 0;
        // A fresh connection may have missed messages sent while we were
        // disconnected — immediately resync via the normal refetch path
        // rather than trusting the socket to have caught us up (it can't;
        // Channels groups don't replay history, only the DB/REST does).
        onMessageRef.current();
      };

      socket.onmessage = (event) => {
        try {
          const frame: TicketChatSocketFrame = JSON.parse(event.data);
          if (frame.type === 'ticket_message') {
            onMessageRef.current();
          }
          // frame.type === 'error' (e.g. send_not_supported_over_ws) is
          // expected to never happen from this hook, since it never sends —
          // silently ignored rather than surfaced to the user.
        } catch {
          // Malformed frame — ignore; the next valid frame (or the next
          // REST poll) will still keep the UI correct.
        }
      };

      const scheduleReconnect = () => {
        if (cancelled) return;
        reconnectAttempt += 1;
        // Exponential backoff with a flat jitter, capped, so a prolonged
        // outage doesn't hammer the server with reconnect attempts.
        const delay = Math.min(
          BASE_RECONNECT_DELAY_MS * 2 ** (reconnectAttempt - 1) + Math.random() * 500,
          MAX_RECONNECT_DELAY_MS,
        );
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        // onclose fires right after onerror for a failed connection — the
        // actual reconnect scheduling lives there to avoid double-scheduling.
      };

      socket.onclose = () => {
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (socket) {
        // Detach handlers before closing so a close event fired during
        // teardown can't schedule a reconnect for a socket we no longer want.
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
    // Reconnect whenever the target ticket changes; onMessage changes are
    // handled via the ref above and intentionally excluded here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, reduxAccessToken]);
}

export default useTicketChatSocket;
