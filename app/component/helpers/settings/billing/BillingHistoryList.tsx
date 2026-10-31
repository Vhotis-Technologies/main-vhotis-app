import { StyleSheet, View } from "react-native";
import React from "react";
import { Card, Text, useTheme, Badge } from "react-native-paper";
import BillingRecord from "@/app/interfaces/others/BillingInterface";

interface BillingHistoryListProps {
  billingRecords: BillingRecord[];
  onRecordPress: (record: BillingRecord) => void;
}

const BillingHistoryList = ({
  billingRecords,
  onRecordPress,
}: BillingHistoryListProps) => {
  const { colors } = useTheme();

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
        return "#666";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.listContainer}>
      {billingRecords.map((item) => (
        <Card
          key={item.id}
          style={styles.card}
          onPress={() => onRecordPress(item)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text variant="titleMedium" style={styles.transactionId}>
                #{item.transaction_id}
              </Text>
              <Badge
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                {item.status.toUpperCase()}
              </Badge>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text variant="labelSmall">Date</Text>
                <Text variant="bodyMedium">
                  {formatDate(item.billing_date)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text variant="labelSmall">Amount</Text>
                <Text variant="bodyMedium" style={styles.amount}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text variant="labelSmall">Payment Method</Text>
                <Text variant="bodyMedium">
                  {item.payment_method.payment_type}
                </Text>
              </View>
            </View>

            {item.billing_details.description && (
              <Text variant="bodySmall" style={styles.description}>
                {item.billing_details.description}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionId: {
    fontFamily: "monospace",
  },
  statusBadge: {
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailColumn: {
    flex: 1,
  },
  amount: {
    fontWeight: "bold",
  },
  description: {
    marginTop: 8,
    color: "#666",
  },
});

export default BillingHistoryList;
