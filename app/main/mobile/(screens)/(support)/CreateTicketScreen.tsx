import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import {
  BUYER_TICKET_REASONS,
  getBuyerReasonById,
  getBuyerReasonByTicketType,
} from "@/app/constants/main/supportTicketDummyData";
import useBuyersTicket from "@/app/hook/main/useBuyersTicket";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import type { TicketReason } from "@/app/interfaces/main/support/TicketInterfaces";
import type { Order } from "@/app/interfaces/main/orders/OrderInterfaces";
import { useGetAllOrdersQuery } from "@/app/store/main/api/mainOrderApi";
import { BUYER_TICKETABLE_ORDER_STATUSES } from "@/app/utils/main/supportTicketMappers";
import { useThemeColor } from "@/hooks/useThemeColor";

type Step = "category" | "reason" | "order" | "details";

function formatOrderLabel(
  order: Pick<Order, "order_number" | "status" | "total_amount">,
): string {
  const statusLabel = order.status.replace(/_/g, " ");
  return `${order.order_number} · ${statusLabel} · €${order.total_amount.toFixed(2)}`;
}

export default function CreateTicketScreen() {
  const { orderId, prefillReason } = useLocalSearchParams<{
    orderId?: string;
    prefillReason?: string;
  }>();
  const { createTicket } = useBuyersTicket();
  const { showSnackbar } = useSnackbar();
  const { data: ordersData, isLoading: ordersLoading } =
    useGetAllOrdersQuery(undefined);
  const orders = (ordersData ?? []) as Order[];
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");

  const prefilledReason = prefillReason
    ? (getBuyerReasonByTicketType(prefillReason) ??
      getBuyerReasonById(prefillReason))
    : undefined;

  const [step, setStep] = useState<Step>(
    prefilledReason?.requiresOrder && !orderId
      ? "order"
      : prefilledReason
        ? "details"
        : "category",
  );
  const [category, setCategory] = useState(prefilledReason?.category ?? "");
  const [reason, setReason] = useState<TicketReason | null>(
    prefilledReason ?? null,
  );
  const [selectedOrderId, setSelectedOrderId] = useState(orderId ?? "");
  const [title, setTitle] = useState(
    prefilledReason
      ? `${prefilledReason.label}${orderId ? ` — ${orderId}` : ""}`
      : "",
  );
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(
    () => [...new Set(BUYER_TICKET_REASONS.map((r) => r.category))],
    [],
  );

  const reasonsInCategory = useMemo(
    () => BUYER_TICKET_REASONS.filter((r) => r.category === category),
    [category],
  );

  const ticketableOrders = useMemo(
    () =>
      orders.filter((order) =>
        BUYER_TICKETABLE_ORDER_STATUSES.has(order.status),
      ),
    [orders],
  );

  const selectedOrder = ticketableOrders.find((o) => o.id === selectedOrderId);

  const handleSelectReason = (r: TicketReason) => {
    setReason(r);
    if (!title) setTitle(r.label);
    if (r.requiresOrder && !selectedOrderId) {
      setStep("order");
    } else {
      setStep("details");
    }
  };

  const handleSubmit = async () => {
    if (!reason || !title.trim() || !description.trim()) return;
    if (reason.requiresOrder && !selectedOrderId) return;

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        ticketType: reason.ticketType,
        reasonLabel: reason.label,
        title: title.trim(),
        description: description.trim(),
        orderId: selectedOrderId || undefined,
        orderLabel: selectedOrder?.order_number,
      });

      router.replace({
        pathname: "/main/mobile/(screens)/(support)/TicketChatScreen",
        params: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
        },
      });
    } catch (error: unknown) {
      const message =
        (error as { data?: { error?: string } })?.data?.error ??
        "Could not create ticket. Please try again.";
      showSnackbar(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {step === "category" && (
        <View>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            What do you need help with?
          </StyledText>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                setCategory(cat);
                setStep("reason");
              }}
              style={[
                styles.option,
                { borderColor, backgroundColor: cardColor },
              ]}
            >
              <StyledText variant="bodyLarge">{cat}</StyledText>
            </Pressable>
          ))}
        </View>
      )}

      {step === "reason" && (
        <View>
          <Pressable onPress={() => setStep("category")} style={styles.back}>
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
              style={[
                styles.option,
                { borderColor, backgroundColor: cardColor },
              ]}
            >
              <StyledText variant="bodyLarge">{r.label}</StyledText>
            </Pressable>
          ))}
        </View>
      )}

      {step === "order" && reason && (
        <View>
          <Pressable onPress={() => setStep("reason")} style={styles.back}>
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Reasons
            </StyledText>
          </Pressable>
          <StyledText variant="titleMedium" style={{ marginBottom: 12 }}>
            Select an order
          </StyledText>
          {ordersLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : ticketableOrders.length === 0 ? (
            <StyledText variant="bodyMedium" style={{ opacity: 0.7 }}>
              No eligible orders found. Tickets can be opened for orders that
              are in transit or delivered.
            </StyledText>
          ) : (
            ticketableOrders.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => {
                  setSelectedOrderId(o.id);
                  setStep("details");
                  if (!title || title === reason.label) {
                    setTitle(`${reason.label} — ${o.order_number}`);
                  }
                }}
                style={[
                  styles.option,
                  {
                    borderColor:
                      selectedOrderId === o.id ? "#2563eb" : borderColor,
                    backgroundColor: cardColor,
                  },
                ]}
              >
                <StyledText variant="bodyMedium">
                  {formatOrderLabel(o)}
                </StyledText>
              </Pressable>
            ))
          )}
        </View>
      )}

      {step === "details" && reason && (
        <View>
          <Pressable
            onPress={() =>
              setStep(reason.requiresOrder && !orderId ? "order" : "reason")
            }
            style={styles.back}
          >
            <StyledText variant="labelMedium" style={{ color: mutedColor }}>
              ← Back
            </StyledText>
          </Pressable>
          <StyledText
            variant="labelSmall"
            style={{ color: mutedColor, marginBottom: 4 }}
          >
            {reason.label}
            {selectedOrder ? ` · ${selectedOrder.order_number}` : ""}
          </StyledText>
          <StyledText variant="titleMedium" style={{ marginBottom: 16 }}>
            Describe your issue
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
            Message
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
          <View style={{ marginTop: 24 }}>
            <StyledButton
              title={submitting ? "Creating…" : "Start chat"}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || submitting}
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
  textArea: {
    minHeight: 120,
  },
});
