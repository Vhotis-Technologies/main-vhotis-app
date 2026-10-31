import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GiftedChat, type IMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StyledText from '@/app/component/helpers/forms/StyledText';
import TicketChatPanel from '@/app/component/shared/support/TicketChatPanel';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import {
  useGetSellerTicketDetailQuery,
  useSendSellerTicketMessageMutation,
} from '@/app/store/seller/api/sellerTicketApi';
import {
  mapSellerApiMessages,
  mapSellerTicketDetail,
} from '@/app/utils/seller/supportTicketMappers';
import {
  TICKET_CHAT_POLL_MS,
  toTicketGiftedMessage,
} from '@/app/utils/shared/ticketChatGifted';
import { useTicketChatSocket } from '@/app/utils/shared/useTicketChatSocket';
import { useThemeColor } from '@/hooks/useThemeColor';

const SELLER_USER = { _id: 'seller', name: 'You' };

const TicketDetailScreen = () => {
  const { ticketId, ticketNumber } = useLocalSearchParams<{
    ticketId: string;
    ticketNumber: string;
  }>();
  const { showSnackbar } = useSnackbar();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useGetSellerTicketDetailQuery(ticketNumber ?? '', {
    skip: !ticketNumber,
    // REST polling stays as the fallback source of truth — see
    // useTicketChatSocket's module docstring for why the socket below is
    // additive (an instant "refetch now" nudge), not a replacement for this.
    pollingInterval: ticketNumber ? TICKET_CHAT_POLL_MS : 0,
    refetchOnFocus: true,
  });
  const [sendMessage, { isLoading: isSending }] = useSendSellerTicketMessageMutation();

  // Live delivery: any new line on this ticket (buyer/seller/agent/system)
  // triggers an immediate refetch instead of waiting up to
  // TICKET_CHAT_POLL_MS for the next poll tick.
  useTicketChatSocket(ticketId, refetch);

  const ticket = useMemo(
    () => (detail ? mapSellerTicketDetail(detail) : undefined),
    [detail],
  );

  const apiMessages = useMemo(
    () =>
      detail && ticketId
        ? mapSellerApiMessages(detail.messages ?? [], ticketId)
        : [],
    [detail, ticketId],
  );

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages(
      apiMessages.map((m) => toTicketGiftedMessage(m, 'seller')).reverse(),
    );
  }, [apiMessages]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!ticketNumber || newMessages.length === 0 || isSending) return;
      const text = newMessages[0].text?.trim();
      if (!text) return;

      try {
        await sendMessage({ ticket_number: ticketNumber, body: text }).unwrap();
        setMessages((prev) => GiftedChat.append(prev, newMessages));
      } catch {
        showSnackbar('Failed to send message', 'error');
      }
    },
    [ticketNumber, sendMessage, isSending, showSnackbar],
  );

  if (!ticketNumber) {
    return (
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        <StyledText variant="bodyMedium">Ticket not found</StyledText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor, paddingTop: insets.top }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !ticket) {
    return (
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        <StyledText variant="bodyMedium">Ticket not found</StyledText>
      </View>
    );
  }

  return (
    <TicketChatPanel
      ticket={ticket}
      messages={messages}
      onSend={onSend}
      user={SELLER_USER}
    />
  );
};

export default TicketDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
