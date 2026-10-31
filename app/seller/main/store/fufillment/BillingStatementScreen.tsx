/**
 * Monthly warehouse invoice detail (pick/pack labour + storage).
 *
 * Separate from Connect 2.5% processing fees on Payment / Finance screens.
 * Params: statementId
 */
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import {
  useGet_billing_statement_detailQuery,
  usePay_billing_statementMutation,
} from "@/app/store/seller/api/wmsApi";

function formatMoney(amount: string, currency = "EUR"): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function formatMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const BillingStatementScreen = () => {
  useRequireSellerOwner();
  const insets = useSafeAreaInsets();
  const { statementId } = useLocalSearchParams<{ statementId: string }>();
  const id = Number(statementId);

  const { data, isLoading, isFetching, isError, refetch } =
    useGet_billing_statement_detailQuery(id, { skip: !id });
  const [payStatement, { isLoading: paying }] = usePay_billing_statementMutation();

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");

  const onPay = useCallback(async () => {
    if (!id) return;
    try {
      const result = await payStatement(id).unwrap();
      if (result.hostedInvoiceUrl) {
        await Linking.openURL(result.hostedInvoiceUrl);
      }
      void refetch();
    } catch {
      // Error surface via refetch / status
    }
  }, [id, payStatement, refetch]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.centered, { padding: 24 }]}>
        <StyledText variant="bodyMedium" style={{ color: textColor, textAlign: "center" }}>
          Could not load this invoice.
        </StyledText>
        <StyledButton
          title="Back"
          onPress={() => router.back()}
          buttonStyles={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const { statement, charges, hostedInvoiceUrl, invoicePdf } = data;
  const canPay = statement.status === "failed" || statement.status === "finalised";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: insets.bottom + 32,
      }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />
      }
      style={{ flex: 1, backgroundColor: bgColor }}
    >
      <StyledText variant="titleLarge" style={{ color: textColor }}>
        {formatMonth(statement.billingMonth)}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
        Warehouse services · not your 2.5% processing fee
      </StyledText>

      <View style={[styles.hero, { borderColor, backgroundColor: cardColor }]}>
        <StyledText variant="labelLarge" style={{ color: iconMuted }}>
          {statement.status.toUpperCase()}
        </StyledText>
        <StyledText variant="titleLarge" style={{ color: textColor, marginTop: 8 }}>
          {formatMoney(statement.totalCharged)}
        </StyledText>
      </View>

      <View style={[styles.block, { borderColor, backgroundColor: cardColor }]}>
        <Row label="Fulfilment (pick & pack)" value={formatMoney(statement.fulfillmentCharges)} />
        <Row label="Storage" value={formatMoney(statement.storageCharges)} />
        {Number(statement.receivingCharges) > 0 && (
          <Row label="Receiving" value={formatMoney(statement.receivingCharges)} />
        )}
        {Number(statement.logisticsCharges) > 0 && (
          <Row label="Logistics" value={formatMoney(statement.logisticsCharges)} />
        )}
        <Row label="Total" value={formatMoney(statement.totalCharged)} bold />
      </View>

      <StyledText variant="titleMedium" style={{ color: textColor, marginTop: 20, marginBottom: 8 }}>
        Line items
      </StyledText>
      {charges.length === 0 ? (
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          No line items on this statement.
        </StyledText>
      ) : (
        charges.map((charge) => (
          <View
            key={charge.id}
            style={[styles.line, { borderColor, backgroundColor: bgColor }]}
          >
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              {charge.description || charge.feeType}
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
              {charge.feeType}
              {charge.referenceId ? ` · ${charge.referenceId}` : ""}
              {" · "}
              {charge.status}
            </StyledText>
            <StyledText variant="labelLarge" style={{ color: textColor, marginTop: 6 }}>
              {formatMoney(charge.amount, charge.currency)}
            </StyledText>
          </View>
        ))
      )}

      <View style={{ marginTop: 20, gap: 10 }}>
        {hostedInvoiceUrl ? (
          <StyledButton
            title="Open Stripe invoice"
            onPress={() => void Linking.openURL(hostedInvoiceUrl)}
          />
        ) : null}
        {invoicePdf ? (
          <Pressable onPress={() => void Linking.openURL(invoicePdf)}>
            <StyledText variant="labelLarge" style={{ color: iconMuted, textAlign: "center" }}>
              Download PDF
            </StyledText>
          </Pressable>
        ) : null}
        {canPay ? (
          <StyledButton
            title={paying ? "Charging…" : "Pay now"}
            onPress={() => void onPay()}
            disabled={paying}
          />
        ) : null}
      </View>
    </ScrollView>
  );
};

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  return (
    <View style={styles.row}>
      <StyledText
        variant={bold ? "labelLarge" : "bodySmall"}
        style={{ color: bold ? textColor : iconMuted, flex: 1 }}
      >
        {label}
      </StyledText>
      <StyledText
        variant={bold ? "labelLarge" : "bodySmall"}
        style={{ color: textColor }}
      >
        {value}
      </StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  block: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  line: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});

export default BillingStatementScreen;
