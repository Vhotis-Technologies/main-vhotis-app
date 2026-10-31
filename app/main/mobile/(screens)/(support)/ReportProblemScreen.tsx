/**
 * Phase 3 — Report a problem on an order.
 *
 * Flow: reason → select product(s) → description + optional photo → submit
 * via /api/v1/tickets/report_problem/ (freezes escrow for that seller).
 */
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import StyledText from '@/app/component/helpers/forms/StyledText';
import StyledButton from '@/app/component/helpers/buttons/StyledButton';
import { BUYER_REPORT_PROBLEM_REASONS } from '@/app/constants/main/supportTicketDummyData';
import useBuyersTicket from '@/app/hook/main/useBuyersTicket';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import type { TicketReason } from '@/app/interfaces/main/support/TicketInterfaces';
import type { OrderItem } from '@/app/interfaces/main/orders/OrderInterfaces';
import { useGetOrderDetailsQuery } from '@/app/store/main/api/mainOrderApi';
import { canReportProblemForOrderStatus } from '@/app/utils/main/supportTicketMappers';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatCurrency } from '@/app/_utils/main/helpers';

type Step = 'reason' | 'items' | 'details';

export default function ReportProblemScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { reportProblem, uploadEvidencePhoto, isCreating, isUploadingEvidence } =
    useBuyersTicket();
  const { showSnackbar } = useSnackbar();
  const {
    data: order,
    isLoading: orderLoading,
    isError: orderError,
  } = useGetOrderDetailsQuery(orderId || '', { skip: !orderId });

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borders');
  const cardColor = useThemeColor({}, 'cards');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icons');

  const [step, setStep] = useState<Step>('reason');
  const [reason, setReason] = useState<TicketReason | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Array<string | number>>(
    [],
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const items: OrderItem[] = useMemo(
    () => (order?.order_items ?? []) as OrderItem[],
    [order],
  );

  const toggleItem = (id: string | number) => {
    setSelectedItemIds((prev) =>
      prev.some((x) => String(x) === String(id))
        ? prev.filter((x) => String(x) !== String(id))
        : [...prev, id],
    );
  };

  const handleSelectReason = (r: TicketReason) => {
    setReason(r);
    setTitle(r.label);
    setStep('items');
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showSnackbar('Allow photo access to attach evidence.', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!orderId || !reason || !title.trim() || !description.trim()) return;
    if (selectedItemIds.length === 0) {
      showSnackbar('Select at least one product.', 'error');
      return;
    }

    try {
      let evidenceUrls: string[] | undefined;
      if (photoUri) {
        const url = await uploadEvidencePhoto(photoUri);
        evidenceUrls = [url];
      }

      const ticket = await reportProblem({
        orderId: String(orderId),
        orderLabel: order?.order_number,
        orderItemIds: selectedItemIds,
        ticketType: reason.ticketType,
        reasonLabel: reason.label,
        title: title.trim(),
        description: description.trim(),
        evidenceUrls,
      });

      router.replace({
        pathname: '/main/mobile/(screens)/(support)/TicketChatScreen',
        params: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
        },
      });
    } catch (error: unknown) {
      const message =
        (error as { data?: { error?: string } })?.data?.error ??
        'Could not submit your report. Please try again.';
      showSnackbar(String(message), 'error');
    }
  };

  if (!orderId) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <StyledText variant="bodyMedium">Missing order.</StyledText>
      </View>
    );
  }

  if (orderLoading) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (orderError || !order) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <StyledText variant="bodyMedium">Could not load this order.</StyledText>
      </View>
    );
  }

  if (!canReportProblemForOrderStatus(order.status)) {
    return (
      <View style={[styles.center, { backgroundColor, padding: 24 }]}>
        <StyledText variant="bodyMedium" style={{ textAlign: 'center' }}>
          This order is not eligible for a product report yet (status:{' '}
          {order.status.replace(/_/g, ' ')}).
        </StyledText>
      </View>
    );
  }

  const busy = isCreating || isUploadingEvidence;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StyledText variant="labelSmall" style={{ color: mutedColor, marginBottom: 12 }}>
        {order.order_number}
      </StyledText>

      {step === 'reason' && (
        <View>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            What is wrong?
          </StyledText>
          {BUYER_REPORT_PROBLEM_REASONS.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => handleSelectReason(r)}
              style={[styles.option, { borderColor, backgroundColor: cardColor }]}
            >
              <StyledText variant="bodyLarge" style={{ color: textColor }}>
                {r.label}
              </StyledText>
            </Pressable>
          ))}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/main/mobile/(screens)/(support)/CreateTicketScreen',
                params: { orderId: String(orderId), prefillReason: 'delivery_issue' },
              })
            }
            style={{ marginTop: 8 }}
          >
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              Delivery problem instead? Open a delivery ticket →
            </StyledText>
          </Pressable>
        </View>
      )}

      {step === 'items' && reason && (
        <View>
          <Pressable onPress={() => setStep('reason')} style={styles.back}>
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Reasons
            </StyledText>
          </Pressable>
          <StyledText variant="titleMedium" style={{ marginBottom: 8 }}>
            Which product(s)?
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: mutedColor, marginBottom: 12 }}
          >
            Select items from one seller only. Open another report for a
            different seller.
          </StyledText>
          {items.map((item) => {
            const selected = selectedItemIds.some(
              (x) => String(x) === String(item.id),
            );
            return (
              <Pressable
                key={String(item.id)}
                onPress={() => toggleItem(item.id)}
                style={[
                  styles.option,
                  {
                    borderColor: selected ? '#2563eb' : borderColor,
                    backgroundColor: cardColor,
                  },
                ]}
              >
                <StyledText variant="bodyMedium" style={{ color: textColor }}>
                  {item.product_name || item.product || 'Item'}
                </StyledText>
                <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                  Qty {item.quantity}
                  {item.sub_total != null
                    ? ` · ${formatCurrency(item.sub_total)}`
                    : ''}
                </StyledText>
              </Pressable>
            );
          })}
          <View style={{ marginTop: 16 }}>
            <StyledButton
              title="Continue"
              onPress={() => {
                if (selectedItemIds.length === 0) {
                  showSnackbar('Select at least one product.', 'error');
                  return;
                }
                if (!title || title === reason.label) {
                  setTitle(`${reason.label} — ${order.order_number}`);
                }
                setStep('details');
              }}
              disabled={selectedItemIds.length === 0}
            />
          </View>
        </View>
      )}

      {step === 'details' && reason && (
        <View>
          <Pressable onPress={() => setStep('items')} style={styles.back}>
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Products
            </StyledText>
          </Pressable>
          <StyledText
            variant="labelSmall"
            style={{ color: mutedColor, marginBottom: 4 }}
          >
            {reason.label} · {selectedItemIds.length} item(s)
          </StyledText>
          <StyledText variant="titleMedium" style={{ marginBottom: 16 }}>
            Describe the issue
          </StyledText>
          <StyledText variant="labelMedium" style={{ marginBottom: 6 }}>
            Subject
          </StyledText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Brief summary"
            placeholderTextColor={mutedColor}
            style={[
              styles.input,
              { borderColor, color: textColor, backgroundColor: cardColor },
            ]}
          />
          <StyledText
            variant="labelMedium"
            style={{ marginTop: 16, marginBottom: 6 }}
          >
            Details
          </StyledText>
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
              { borderColor, color: textColor, backgroundColor: cardColor },
            ]}
          />

          <StyledText
            variant="labelMedium"
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            Photo (optional)
          </StyledText>
          {photoUri ? (
            <View style={{ marginBottom: 12 }}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <Pressable onPress={() => setPhotoUri(null)}>
                <StyledText variant="labelMedium" style={{ color: mutedColor }}>
                  Remove photo
                </StyledText>
              </Pressable>
            </View>
          ) : (
            <StyledButton title="Attach photo" variant="tonal" onPress={pickPhoto} />
          )}

          <View style={{ marginTop: 24 }}>
            <StyledButton
              title={busy ? 'Submitting…' : 'Submit report'}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || busy}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  option: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 4,
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
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
});
