import { StyleSheet, View, ScrollView } from "react-native";
import React from "react";
import { Card, Text, Divider, Button } from "react-native-paper";
import  BillingRecord  from "@/app/interfaces/others/BillingInterface";

interface BillingDetailsComponentProps {
  billingRecord: BillingRecord;
  onClose: () => void;
}

const BillingDetailsComponent = ({
  billingRecord,
  onClose,
}: BillingDetailsComponentProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall">Transaction Details</Text>
            <Button mode="text" onPress={onClose}>
              Close
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium">Transaction Information</Text>
            <View style={styles.row}>
              <Text variant="labelMedium">Transaction ID:</Text>
              <Text variant="bodyMedium" style={styles.monospace}>
                {billingRecord.transaction_id}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="labelMedium">Date:</Text>
              <Text variant="bodyMedium">
                {formatDate(billingRecord.billing_date)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="labelMedium">Status:</Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.status,
                  { color: getStatusColor(billingRecord.status) },
                ]}
              >
                {billingRecord.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium">Payment Details</Text>
            <View style={styles.row}>
              <Text variant="labelMedium">Amount:</Text>
              <Text variant="headlineSmall" style={styles.amount}>
                ${billingRecord.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text variant="labelMedium">Payment Method:</Text>
              <Text variant="bodyMedium">
                {billingRecord.payment_method.payment_type}
              </Text>
            </View>
          </View>

          {billingRecord.billing_details.items && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium">Items</Text>
                {billingRecord.billing_details.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text variant="bodyMedium">{item.name}</Text>
                      {item.quantity && (
                        <Text variant="bodySmall">Qty: {item.quantity}</Text>
                      )}
                    </View>
                    <Text variant="bodyMedium">${item.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {billingRecord.billing_details.description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium">Description</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  {billingRecord.billing_details.description}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const getStatusColor = (status: BillingRecord["status"]) => {
  switch (status) {
    case "paid":
      return "#4CAF50";
    case "pending":
      return "#FFC107";
    case "failed":
      return "#F44336";
    case "refunded":
      return "#2196F3";
    default:
      return "#9E9E9E";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monospace: {
    fontFamily: "monospace",
  },
  status: {
    fontWeight: "bold",
  },
  amount: {
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  description: {
    marginTop: 8,
  },
});

export default BillingDetailsComponent;
