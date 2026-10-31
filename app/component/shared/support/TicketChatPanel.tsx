import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import {
  Composer,
  GiftedChat,
  Send,
  type IMessage,
  type User,
} from 'react-native-gifted-chat';
import KeyboardWrapper from '@/app/component/helpers/KeyboardWrapper';
import StyledText from '@/app/component/helpers/forms/StyledText';
import type { SupportTicket } from '@/app/interfaces/main/support/TicketInterfaces';
import {
  canBuyerWithdrawTicket,
  isTicketTerminal,
  ticketResolutionLabel,
  ticketStatusColor,
  ticketStatusLabel,
} from '@/app/component/shared/support/ticketDisplay';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TicketChatPanelProps {
  ticket: SupportTicket;
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  user: User;
  /** Buyer-only Phase 7 withdraw. */
  onWithdraw?: () => void;
  isWithdrawing?: boolean;
  showWithdraw?: boolean;
}

export default function TicketChatPanel({
  ticket,
  messages,
  onSend,
  user,
  onWithdraw,
  isWithdrawing = false,
  showWithdraw = false,
}: TicketChatPanelProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'cards');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icons');
  const borderColor = useThemeColor({}, 'borders');
  const warnColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  const [composerText, setComposerText] = useState('');

  const terminal = isTicketTerminal(ticket);
  const allowWithdraw =
    showWithdraw && canBuyerWithdrawTicket(ticket) && typeof onWithdraw === 'function';

  const handleComposerSend = useCallback(
    (
      outgoing: Partial<IMessage> | Partial<IMessage>[],
      shouldReset: boolean,
    ) => {
      if (terminal) return;
      const list = Array.isArray(outgoing) ? outgoing : [outgoing];
      const enriched = list
        .map((message) => ({
          _id: String(Math.random()),
          text: message.text?.trim() ?? '',
          createdAt: new Date(),
          user,
        }))
        .filter((message) => message.text.length > 0);

      if (enriched.length === 0) return;

      onSend(enriched as IMessage[]);

      if (shouldReset) {
        setComposerText('');
      }
    },
    [onSend, user, terminal],
  );

  const header = useMemo(
    () => (
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerTop}>
          <StyledText variant="labelSmall" style={{ color: mutedColor }}>
            {ticket.ticketNumber}
          </StyledText>
          {ticket.isInvitedDispute ? (
            <StyledText
              variant="labelSmall"
              style={{ color: warnColor, fontWeight: '600' }}
            >
              Buyer dispute
            </StyledText>
          ) : null}
        </View>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          {ticket.title}
        </StyledText>
        <View style={styles.headerMeta}>
          <StyledText variant="labelSmall" style={{ color: mutedColor }}>
            {ticket.reasonLabel}
          </StyledText>
          <StyledText
            variant="labelSmall"
            style={{ color: ticketStatusColor(ticket.status), fontWeight: '600' }}
          >
            {ticketStatusLabel(ticket.status)}
          </StyledText>
        </View>
        {terminal && ticket.resolutionType ? (
          <View
            style={[
              styles.outcome,
              { backgroundColor: `${ticketStatusColor(ticket.status)}18` },
            ]}
          >
            <StyledText
              variant="labelMedium"
              style={{ color: ticketStatusColor(ticket.status), fontWeight: '600' }}
            >
              {ticketResolutionLabel(ticket.resolutionType)}
            </StyledText>
            {ticket.resolutionNotes ? (
              <StyledText
                variant="bodySmall"
                style={{ color: mutedColor, marginTop: 4 }}
              >
                {ticket.resolutionNotes}
              </StyledText>
            ) : null}
            {ticket.resolvedAmount != null ? (
              <StyledText
                variant="labelSmall"
                style={{ color: mutedColor, marginTop: 4 }}
              >
                Amount: {ticket.resolvedAmount}
              </StyledText>
            ) : null}
          </View>
        ) : null}
        {allowWithdraw ? (
          <Pressable
            onPress={onWithdraw}
            disabled={isWithdrawing}
            style={[styles.withdrawBtn, { borderColor: errorColor }]}
          >
            {isWithdrawing ? (
              <ActivityIndicator size="small" color={errorColor} />
            ) : (
              <StyledText variant="labelMedium" style={{ color: errorColor }}>
                Withdraw dispute
              </StyledText>
            )}
          </Pressable>
        ) : null}
      </View>
    ),
    [
      ticket,
      textColor,
      mutedColor,
      borderColor,
      warnColor,
      errorColor,
      allowWithdraw,
      isWithdrawing,
      onWithdraw,
    ],
  );

  const footer = terminal ? (
    <View
      style={[
        styles.footerClosed,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <StyledText variant="bodySmall" style={{ color: mutedColor, textAlign: 'center' }}>
        This case is closed. Messaging is disabled.
      </StyledText>
    </View>
  ) : (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <View style={styles.composer}>
        <Composer
          text={composerText}
          textInputProps={{
            placeholder: 'Message support...',
            placeholderTextColor: mutedColor,
            onChangeText: setComposerText,
          }}
        />
      </View>
      <Send
        text={composerText}
        onSend={handleComposerSend}
        isSendButtonAlwaysVisible
      />
    </View>
  );

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      header={header}
      footer={footer}
      scrollable={true}
      contentContainerStyle={styles.chatBody}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderInputToolbar={() => null}
        isScrollToBottomEnabled
        isUsernameVisible
        keyboardAvoidingViewProps={{ enabled: false }}
      />
    </KeyboardWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  outcome: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  withdrawBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatBody: {
    flex: 1,
    paddingHorizontal: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  footerClosed: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  composer: {
    flex: 1,
  },
});
