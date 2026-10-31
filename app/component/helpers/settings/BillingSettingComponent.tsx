import { StyleSheet, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Text, Portal, Modal, ActivityIndicator } from "react-native-paper";
import BillingFiltersComponent from "./billing/BillingFiltersComponent";
import BillingHistoryList from "./billing/BillingHistoryList";
import BillingDetailsComponent from "./billing/BillingDetailsComponent";
import BillingRecord, {
  BillingFilters,
  BillingSummary,
} from "@/app/interfaces/others/BillingInterface";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

// Mock billing data for development and testing purposes
// In production, this would be replaced with actual API data
const DUMMY_BILLING_RECORDS: BillingRecord[] = [
  {
    id: "1",
    amount: 299.99,
    billing_date: "2024-03-20T10:30:00Z",
    status: "paid",
    transaction_id: "TRX-123456",
    payment_method: {
      id: "1",
      payment_type: "stripe",
      is_default: true,
      is_active: true,
      created_at: "2024-03-01T00:00:00Z",
    },
    billing_details: {
      description: "Premium Plan Subscription - March 2024",
      items: [
        {
          name: "Premium Plan",
          amount: 299.99,
          quantity: 1,
        },
      ],
    },
  },
  {
    id: "2",
    amount: 499.99,
    billing_date: "2024-03-15T14:20:00Z",
    status: "pending",
    transaction_id: "TRX-123457",
    payment_method: {
      id: "2",
      payment_type: "paypal",
      is_default: false,
      is_active: true,
      created_at: "2024-03-01T00:00:00Z",
    },
    billing_details: {
      description: "Advertisement Campaign - Q1 2024",
      items: [
        {
          name: "Premium Ad Placement",
          amount: 399.99,
          quantity: 1,
        },
        {
          name: "Ad Boost",
          amount: 100.0,
          quantity: 2,
        },
      ],
    },
  },
  {
    id: "3",
    amount: 199.99,
    billing_date: "2024-03-10T12:45:00Z",
    status: "failed",
    transaction_id: "TRX-123458",
    payment_method: {
      id: "3",
      payment_type: "bank transfer",
      is_default: false,
      is_active: true,
      created_at: "2024-03-01T00:00:00Z",
    },
    billing_details: {
      description: "Ad Boost Campaign - Q1 2024",
      items: [
        {
          name: "Ad Boost",
          amount: 100.0,
          quantity: 2,
        },
      ],
    },
  },
];

/**
 * BillingSettingComponent
 *
 * A comprehensive billing management component that displays billing history,
 * provides filtering capabilities, and shows detailed billing summaries.
 *
 * Features:
 * - Displays billing summary with total amounts and transaction counts
 * - Provides filtering functionality for billing records
 * - Shows detailed billing history in a list format
 * - Allows viewing detailed information for individual transactions
 *
 * @component
 * @returns {JSX.Element} The rendered billing settings interface
 */
const BillingSettingComponent = () => {
  const { isBlocked } = useRequireSellerOwner(
    "/seller/main/settings/SellerSettingScreens",
  );

  // State management for billing records and UI
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BillingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  /* Colors */
  const cardColor = useThemeColor({}, "cards");

  // State for tracking billing summary statistics
  const [billingSummary, setBillingSummary] = useState<BillingSummary>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    refundedAmount: 0,
    totalTransactions: 0,
  });

  // Initial data fetch simulation
  useEffect(() => {
    // TODO: Replace with actual API call in production
    setTimeout(() => {
      setBillingRecords(DUMMY_BILLING_RECORDS);
      setFilteredRecords(DUMMY_BILLING_RECORDS);
      updateBillingSummary(DUMMY_BILLING_RECORDS);
      setLoading(false);
    }, 1000);
  }, []);

  /**
   * Calculates and updates the billing summary based on the provided records
   *
   * @param records - Array of billing records to calculate summary from
   */
  const updateBillingSummary = (records: BillingRecord[]) => {
    const summary = records.reduce(
      (acc, record) => {
        // Update total amounts
        acc.totalAmount += record.amount;
        acc.totalTransactions += 1;

        // Categorize amounts based on status
        switch (record.status) {
          case "paid":
            acc.paidAmount += record.amount;
            break;
          case "pending":
            acc.pendingAmount += record.amount;
            break;
          case "failed":
            acc.failedAmount += record.amount;
            break;
          case "refunded":
            acc.refundedAmount += record.amount;
            break;
        }

        return acc;
      },
      {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        failedAmount: 0,
        refundedAmount: 0,
        totalTransactions: 0,
      }
    );

    setBillingSummary(summary);
  };

  /**
   * Handles filter changes and updates the displayed billing records
   *
   * @param filters - Object containing filter criteria
   */
  const handleFiltersChange = (filters: BillingFilters) => {
    let filtered = [...billingRecords];

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.billing_date);
        return (
          recordDate >= filters.dateRange!.start &&
          recordDate <= filters.dateRange!.end
        );
      });
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((record) =>
        filters.status!.includes(record.status)
      );
    }

    // Apply amount range filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(
        (record) => record.amount >= filters.minAmount!
      );
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(
        (record) => record.amount <= filters.maxAmount!
      );
    }

    // Apply payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(
        (record) => record.payment_method.payment_type === filters.paymentMethod
      );
    }

    setFilteredRecords(filtered);
    updateBillingSummary(filtered);
  };

  /**
   * Handles the selection of a billing record for detailed view
   *
   * @param record - The selected billing record
   */
  const handleRecordPress = (record: BillingRecord) => {
    setSelectedRecord(record);
  };

  /**
   * Renders a summary item with label, amount, and percentage
   *
   * @param label - The label for the summary item
   * @param amount - The amount to display
   * @param total - The total amount for percentage calculation
   * @returns {JSX.Element} The rendered summary item
   */
  const renderSummaryItem = (label: string, amount: number, total: number) => (
    <View style={styles.summaryItem}>
      <StyledText variant="labelLarge" style={{ color: "#000" }} children={label}/>
      <View>
        <StyledText variant="labelMedium" style={{ color: "#000" }}>
          ${amount.toFixed(2)}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: "#000" }}>
          {total > 0 ? ((amount / total) * 100).toFixed(1) : "0"}%
        </StyledText>
      </View>
    </View>
  );

  if (isBlocked) {
    return null;
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Billing Summary Section */}
      <View style={[styles.summary, { backgroundColor: cardColor }]}>
        <StyledText variant="titleLarge" style={styles.summaryTitle} children="Billing Summary"/>
        <View style={[styles.summaryContent]}>
          {renderSummaryItem(
            "Total Billed",
            billingSummary.totalAmount,
            billingSummary.totalAmount
          )}
          {renderSummaryItem(
            "Paid",
            billingSummary.paidAmount,
            billingSummary.totalAmount
          )}
          {renderSummaryItem(
            "Pending",
            billingSummary.pendingAmount,
            billingSummary.totalAmount
          )}
          {renderSummaryItem(
            "Failed",
            billingSummary.failedAmount,
            billingSummary.totalAmount
          )}
          {renderSummaryItem(
            "Refunded",
            billingSummary.refundedAmount,
            billingSummary.totalAmount
          )}
        </View>
        <StyledText variant="bodySmall" style={styles.transactionCount}>
          Total Transactions: {billingSummary.totalTransactions}
        </StyledText>
      </View>

      {/* Billing Filters */}
      <BillingFiltersComponent onFiltersChange={handleFiltersChange} />

      {/* Billing History List */}
      <BillingHistoryList
        billingRecords={filteredRecords}
        onRecordPress={handleRecordPress}
      />

      {/* Billing Details Modal */}
      <Portal>
        <Modal
          visible={selectedRecord !== null}
          onDismiss={() => setSelectedRecord(null)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRecord && (
            <BillingDetailsComponent
              billingRecord={selectedRecord}
              onClose={() => setSelectedRecord(null)}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summary: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    color: "#000",
  },
  summaryContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  amount: {
    fontWeight: "bold",
  },
  percentage: {
    color: "#666",
  },
  transactionCount: {
    marginTop: 16,
    textAlign: "right",
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    margin: 16,
  },
});

export default BillingSettingComponent;
