import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import StyledText from '@/app/component/helpers/forms/StyledText';
import StyledButton from '@/app/component/helpers/buttons/StyledButton';
import {
  getSellerReasonById,
  getSellerReasonByTicketType,
  SELLER_TICKET_REASONS,
} from '@/app/constants/seller/supportTicketDummyData';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import useSellerTicket from '@/app/hook/seller/useSellerTicket';
import type { TicketReason } from '@/app/interfaces/seller/support/TicketInterfaces';
import type { OrderItemInterface } from '@/app/interfaces/seller/orders/OrdersInterface';
import { useGetAllOrdersQuery } from '@/app/store/seller/api/orderApi';
import { useThemeColor } from '@/hooks/useThemeColor';

type Step = 'category' | 'reason' | 'order' | 'details';

function formatSellerOrderLabel(order: OrderItemInterface): string {
  const status = order.order_status ?? order.claim_status ?? 'unknown';
  const statusLabel = String(status).replace(/_/g, ' ');
  const amount = order.total_amount ?? order.seller_total ?? 0;
  return `ORD-${order.order_id} · ${statusLabel} · €${Number(amount).toFixed(2)}`;
}

export default function CreateTicketScreen() {
  const { orderId, prefillReason } = useLocalSearchParams<{
    orderId?: string;
    prefillReason?: string;
  }>();
  const { createTicket, isCreating } = useSellerTicket();
  const { showSnackbar } = useSnackbar();
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery(undefined);
  const orders = (ordersData ?? []) as OrderItemInterface[];
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borders');
  const cardColor = useThemeColor({}, 'cards');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icons');

  const prefilledReason = prefillReason
    ? getSellerReasonByTicketType(prefillReason) ?? getSellerReasonById(prefillReason)
    : undefined;

  const [step, setStep] = useState<Step>(
    prefilledReason?.requiresOrder && !orderId ? 'order' : prefilledReason ? 'details' : 'category',
  );
  const [category, setCategory] = useState(prefilledReason?.category ?? '');
  const [reason, setReason] = useState<TicketReason | null>(prefilledReason ?? null);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId ?? '');
  const [title, setTitle] = useState(
    prefilledReason ? `${prefilledReason.label}${orderId ? ` — ${orderId}` : ''}` : '',
  );
  const [description, setDescription] = useState('');

  const categories = useMemo(
    () => [...new Set(SELLER_TICKET_REASONS.map((r) => r.category))],
    [],
  );

  const reasonsInCategory = useMemo(
    () => SELLER_TICKET_REASONS.filter((r) => r.category === category),
    [category],
  );

  const claimableOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.claim_status === 'claimed' || order.status === 'claimed',
      ),
    [orders],
  );

  const selectedOrder = claimableOrders.find(
    (order) => String(order.order_id) === selectedOrderId,
  );

  const handleSelectReason = (r: TicketReason) => {
    setReason(r);
    if (!title) setTitle(r.label);
    if (r.requiresOrder && !selectedOrderId) {
      setStep('order');
    } else {
      setStep('details');
    }
  };

  const handleSubmit = async () => {
    if (!reason || !title.trim() || !description.trim() || isCreating) return;
    if (reason.requiresOrder && !selectedOrderId) return;

    try {
      const ticket = await createTicket({
        ticketType: reason.ticketType,
        reasonLabel: reason.label,
        title: title.trim(),
        description: description.trim(),
        orderId: selectedOrderId || undefined,
        orderLabel: selectedOrder ? formatSellerOrderLabel(selectedOrder).split(' · ')[0] : undefined,
      });

      router.replace({
        pathname: '/seller/main/tickets/TicketDetailScreen',
        params: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
        },
      });
    } catch {
      showSnackbar('Failed to create ticket', 'error');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {step === 'category' && (
        <View>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            What do you need help with?
          </StyledText>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                setCategory(cat);
                setStep('reason');
              }}
              style={[styles.option, { borderColor, backgroundColor: cardColor }]}
            >
              <StyledText variant="bodyLarge">{cat}</StyledText>
            </Pressable>
          ))}
        </View>
      )}

      {step === 'reason' && (
        <View>
          <Pressable onPress={() => setStep('category')} style={styles.back}>
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Categories
            </StyledText>
          </Pressable>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            {category}
          </StyledText>
          {reasonsInCategory.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => handleSelectReason(r)}
              style={[styles.option, { borderColor, backgroundColor: cardColor }]}
            >
              <StyledText variant="bodyLarge">{r.label}</StyledText>
            </Pressable>
          ))}
        </View>
      )}

      {step === 'order' && reason && (
        <View>
          <Pressable onPress={() => setStep('reason')} style={styles.back}>
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Reasons
            </StyledText>
          </Pressable>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            Select a claimed order
          </StyledText>
          {ordersLoading ? (
            <ActivityIndicator />
          ) : claimableOrders.length === 0 ? (
            <StyledText variant="bodyMedium">No claimed orders available.</StyledText>
          ) : (
            claimableOrders.map((order) => {
              const orderIdValue = String(order.order_id);
              const label = formatSellerOrderLabel(order);
              return (
                <Pressable
                  key={order.id}
                  onPress={() => {
                    setSelectedOrderId(orderIdValue);
                    setStep('details');
                    if (!title || title === reason.label) {
                      setTitle(`${reason.label} — ${label.split(' · ')[0]}`);
                    }
                  }}
                  style={[styles.option, { borderColor, backgroundColor: cardColor }]}
                >
                  <StyledText variant="bodyMedium">{label}</StyledText>
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {step === 'details' && reason && (
        <View>
          <Pressable
            onPress={() =>
              setStep(reason.requiresOrder && !orderId ? 'order' : 'reason')
            }
            style={styles.back}
          >
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Back
            </StyledText>
          </Pressable>
          <StyledText variant="labelSmall" style={{ color: mutedColor, marginBottom: 4 }}>
            {reason.label}
            {selectedOrder ? ` · ${formatSellerOrderLabel(selectedOrder).split(' · ')[0]}` : ''}
          </StyledText>
          <StyledText variant="titleMedium" style={{ marginBottom: 16 }}>
            Describe your issue
          </StyledText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Subject"
            placeholderTextColor={mutedColor}
            style={[styles.input, { borderColor, color: textColor, backgroundColor: cardColor }]}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us what happened..."
            placeholderTextColor={mutedColor}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              { borderColor, color: textColor, backgroundColor: cardColor, marginTop: 12 },
            ]}
          />
          <View style={{ marginTop: 24 }}>
            <StyledButton
              title={isCreating ? 'Creating…' : 'Start chat'}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || isCreating}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  option: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  back: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: { minHeight: 120 },
});
