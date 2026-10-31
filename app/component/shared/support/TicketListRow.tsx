import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StyledText from '@/app/component/helpers/forms/StyledText';
import type { SupportTicket } from '@/app/interfaces/main/support/TicketInterfaces';
import {
  formatTicketDate,
  ticketStatusColor,
  ticketStatusLabel,
} from '@/app/component/shared/support/ticketDisplay';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Props {
  ticket: SupportTicket;
  onPress: () => void;
}

export default function TicketListRow({ ticket, onPress }: Props) {
  const borderColor = useThemeColor({}, 'borders');
  const cardColor = useThemeColor({}, 'cards');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icons');
  const warnColor = useThemeColor({}, 'warning');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: cardColor, borderColor, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.rowTop}>
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {ticket.ticketNumber}
        </StyledText>
        <View style={styles.badges}>
          {ticket.isInvitedDispute ? (
            <View style={[styles.badge, { backgroundColor: `${warnColor}22` }]}>
              <StyledText
                variant="labelSmall"
                style={{ color: warnColor, fontSize: 10 }}
              >
                Buyer dispute
              </StyledText>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: `${ticketStatusColor(ticket.status)}22` }]}>
            <StyledText
              variant="labelSmall"
              style={{ color: ticketStatusColor(ticket.status), fontSize: 10 }}
            >
              {ticketStatusLabel(ticket.status)}
            </StyledText>
          </View>
        </View>
      </View>
      <StyledText variant="titleSmall" style={{ color: textColor, marginTop: 4 }}>
        {ticket.title}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 2 }} numberOfLines={1}>
        {ticket.reasonLabel}
        {ticket.orderLabel ? ` · ${ticket.orderLabel}` : ''}
      </StyledText>
      <View style={styles.rowBottom}>
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {formatTicketDate(ticket.updatedAt)}
        </StyledText>
        <MaterialIcons name="chevron-right" size={20} color={mutedColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
