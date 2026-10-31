import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GiftedChat, type IMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StyledText from '@/app/component/helpers/forms/StyledText';
import TicketChatPanel from '@/app/component/shared/support/TicketChatPanel';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import {
  useGetTicketDetailQuery,
  useSendTicketMessageMutation,
  useWithdrawDisputeMutation,
} from '@/app/store/main/api/ticketApi';
import {
  mapApiMessages,
  mapTicketDetail,
} from '@/app/utils/main/supportTicketMappers';
import {
  TICKET_CHAT_POLL_MS,
  toTicketGiftedMessage,
} from '@/app/utils/shared/ticketChatGifted';
import { useTicketChatSocket } from '@/app/utils/shared/useTicketChatSocket';
import { useThemeColor } from '@/hooks/useThemeColor';

const BUYER_USER = { _id: 'buyer', name: 'You' };

export default function TicketChatScreen() {
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
  } = useGetTicketDetailQuery(ticketNumber ?? '', {
    skip: !ticketNumber,
    // REST polling stays as the fallback source of truth — see
    // useTicketChatSocket's module docstring for why the socket below is
    // additive (an instant "refetch now" nudge), not a replacement for this.
    pollingInterval: ticketNumber ? TICKET_CHAT_POLL_MS : 0,
    refetchOnFocus: true,
  });
  const [sendMessage, { isLoading: isSending }] = useSendTicketMessageMutation();

  // Live delivery: any new line on this ticket (buyer/seller/agent/system)
  // triggers an immediate refetch instead of waiting up to
  // TICKET_CHAT_POLL_MS for the next poll tick.
  useTicketChatSocket(ticketId, refetch);
  const [withdrawDispute, { isLoading: isWithdrawing }] =
    useWithdrawDisputeMutation();

  const ticket = useMemo(
    () => (detail ? mapTicketDetail(detail) : undefined),
    [detail],
  );

  const storedMessages = useMemo(
    () =>
      detail
        ? mapApiMessages(detail.messages ?? [], detail.id)
        : [],
    [detail],
  );

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages(
      storedMessages.map((m) => toTicketGiftedMessage(m, 'buyer')).reverse(),
    );
  }, [storedMessages]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!ticketNumber || newMessages.length === 0 || isSending) return;
      const text = newMessages[0].text?.trim();
      if (!text) return;

      setMessages((prev) => GiftedChat.append(prev, newMessages));

      try {
        await sendMessage({
          ticket_number: ticketNumber,
          body: text,
        }).unwrap();
      } catch (error: unknown) {
        setMessages(
          storedMessages.map((m) => toTicketGiftedMessage(m, 'buyer')).reverse(),
        );
        const message =
          (error as { data?: { error?: string } })?.data?.error ??
          'Could not send message. Please try again.';
        showSnackbar(message, 'error');
      }
    },
    [ticketNumber, isSending, sendMessage, storedMessages, showSnackbar],
  );

  const onWithdraw = useCallback(() => {
    if (!ticketNumber || isWithdrawing) return;
    Alert.alert(
      'Withdraw dispute?',
      'This closes your case without a refund and releases any escrow hold on the seller. You cannot undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawDispute({ ticket_number: ticketNumber }).unwrap();
              showSnackbar('Dispute withdrawn', 'success');
            } catch (error: unknown) {
              const message =
                (error as { data?: { error?: string } })?.data?.error ??
                'Could not withdraw this dispute.';
              showSnackbar(message, 'error');
            }
          },
        },
      ],
    );
  }, [ticketNumber, isWithdrawing, withdrawDispute, showSnackbar]);

  if (!ticketId || !ticketNumber) {
    return (
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
        <StyledText variant="bodyMedium">Ticket not found</StyledText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor, paddingTop: insets.top }]}>
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
      user={BUYER_USER}
      showWithdraw
      onWithdraw={onWithdraw}
      isWithdrawing={isWithdrawing}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
});
