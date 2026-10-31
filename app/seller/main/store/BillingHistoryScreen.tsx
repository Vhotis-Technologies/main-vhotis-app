import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetBillingHistoryQuery } from "@/app/store/seller/api/subscriptionApi";
import { formatDate, formatCurrency } from "@/app/_utils/main/helpers";
import { MaterialIcons } from "@expo/vector-icons";

type BillingStatus = "pending" | "paid" | "failed" | "refunded";

import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const BillingHistoryScreen = () => {
  useRequireSellerOwner();

  const {
    data: billingData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetBillingHistoryQuery();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");
  const mutedTextColor = iconColor;

  const getStatusColor = (status: BillingStatus) => {
    switch (status) {
      case "paid":
        return successColor;
      case "pending":
        return warningColor;
      case "failed":
        return errorColor;
      case "refunded":
        return mutedTextColor;
      default:
        return mutedTextColor;
    }
  };

  const formatStatusLabel = (status: BillingStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatBillingCycle = (cycle: "monthly" | "annually") => {
    return cycle === "annually" ? "Yearly" : "Monthly";
  };

  const billingRecords = billingData?.billing_history || [];

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.loadingContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={iconColor} />
        <StyledText
          variant="bodyMedium"
          style={[styles.loadingText, { color: mutedTextColor }]}
        >
          Loading billing history...
        </StyledText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, styles.emptyContainer, { backgroundColor }]}
      >
        <MaterialIcons name="error-outline" size={48} color={errorColor} />
        <StyledText
          variant="titleMedium"
          style={[styles.emptyTitle, { color: textColor }]}
        >
          Error loading billing history
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.emptyText, { color: mutedTextColor }]}
        >
          Please try again later
        </StyledText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Billing History
        </StyledText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={iconColor}
          />
        }
      >
        {billingRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="receipt-long"
              size={48}
              color={mutedTextColor}
            />
            <StyledText
              variant="titleMedium"
              style={[styles.emptyTitle, { color: textColor }]}
            >
              No billing history
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.emptyText, { color: mutedTextColor }]}
            >
              Your subscription billing records will appear here
            </StyledText>
          </View>
        ) : (
          billingRecords.map((record) => {
            const statusColor = getStatusColor(record.status);
            const billingCycle = formatBillingCycle(
              record.subscription.plan.billing_cycle,
            );

            return (
              <View
                key={record.id}
                style={[
                  styles.billingCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <StyledText
                      variant="titleSmall"
                      style={{ color: textColor }}
                    >
                      {record.subscription.plan.tier.name}
                    </StyledText>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.planName, { color: mutedTextColor }]}
                    >
                      {record.subscription.plan.name} • {billingCycle}
                    </StyledText>
                  </View>
                  <View
                    style={[styles.statusBadge, { borderColor: statusColor }]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor },
                      ]}
                    />
                    <StyledText
                      variant="labelSmall"
                      style={[styles.statusText, { color: statusColor }]}
                    >
                      {formatStatusLabel(record.status)}
                    </StyledText>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.amountRow}>
                    <StyledText
                      variant="titleMedium"
                      style={{ color: textColor }}
                    >
                      {formatCurrency(parseFloat(record.amount))}
                    </StyledText>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color={mutedTextColor}
                      />
                      <StyledText
                        variant="bodySmall"
                        style={[styles.metaText, { color: mutedTextColor }]}
                      >
                        {formatDate(record.billing_date)}
                      </StyledText>
                    </View>
                  </View>

                  <View style={styles.transactionRow}>
                    <StyledText
                      variant="labelSmall"
                      style={[
                        styles.transactionLabel,
                        { color: mutedTextColor },
                      ]}
                    >
                      Transaction ID:
                    </StyledText>
                    <StyledText
                      variant="bodySmall"
                      style={[styles.transactionId, { color: textColor }]}
                    >
                      {record.transaction_id}
                    </StyledText>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default BillingHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 3,
    gap: 5,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: 32,
  },
  billingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#00000020",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  planName: {
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: "RobotoMedium",
    fontSize: 11,
  },
  cardBody: {
    gap: 8,
  },
  amountRow: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  transactionLabel: {
    fontSize: 11,
  },
  transactionId: {
    fontSize: 11,
    fontFamily: "RobotoMedium",
  },
});
