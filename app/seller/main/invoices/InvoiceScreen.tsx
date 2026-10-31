import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Button, IconButton } from "react-native-paper";
import { Stack } from "expo-router";
import BillingRecord from "@/app/interfaces/others/BillingInterface";
import { InvoiceDetails } from "@/app/interfaces/others/InvoiceInterface";
import InvoiceComponent from "@/app/component/seller/invoice/InvoiceComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { formatCurrency } from "@/app/_utils/main/helpers";

// Mock data - Replace with actual API call in production
const MOCK_INVOICES: InvoiceDetails[] = [
  {
    invoiceNumber: "INV-2024-001",
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingRecord: {
      id: "1",
      amount: 299.99,
      billing_date: new Date().toISOString(),
      status: "paid",
      transaction_id: "TRX-123456",
      payment_method: {
        id: "1",
        payment_type: "stripe",
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
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
    companyDetails: {
      name: "Your Store Name",
      address: "123 Business St, City, State, ZIP",
      email: "billing@yourstore.com",
      phone: "+1 (555) 123-4567",
    },
    customerDetails: {
      name: "John Doe",
      email: "john@example.com",
      address: "456 Customer Ave, City, State, ZIP",
    },
    subtotal: 299.99,
    total: 299.99,
    notes: "This is a test invoice",
    terms: "This is a test terms",
    paymentInstructions: "This is a test payment instructions",
  },
  // Add more mock invoices as needed
];

const InvoiceScreen = () => {
  const backgroundColor = useThemeColor({}, "background");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(
    null
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleDownload = async (invoice: InvoiceDetails) => {
    // Implement download logic
    console.log("Downloading invoice:", invoice.invoiceNumber);
  };

  const handleShare = async (invoice: InvoiceDetails) => {
    // Implement share logic
    console.log("Sharing invoice:", invoice.invoiceNumber);
  };

  const renderInvoiceCard = ({ item }: { item: InvoiceDetails }) => (
    <Pressable
      style={styles.invoiceItem}
      onPress={() => setSelectedInvoice(item)}
    >
      <View style={styles.invoiceHeader}>
        <StyledText variant="titleMedium" style={styles.invoiceNumber}>
          #{item.invoiceNumber}
        </StyledText>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.billingRecord.status === "paid" ? "#4CAF50" : "#FF9800",
            },
          ]}
        >
          <StyledText variant="labelSmall" style={styles.statusText}>
            {item.billingRecord.status.toUpperCase()}
          </StyledText>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailColumn}>
          <StyledText variant="labelSmall" style={styles.detailLabel}>
            Date
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.detailValue}>
            {new Date(item.issueDate).toLocaleDateString()}
          </StyledText>
        </View>

        <View style={styles.detailColumn}>
          <StyledText variant="labelSmall" style={styles.detailLabel}>
            Amount
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.detailValue}>
            {formatCurrency(item.total)}
          </StyledText>
        </View>

        <View style={styles.detailColumn}>
          <StyledText variant="labelSmall" style={styles.detailLabel}>
            Customer
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.detailValue}>
            {item.customerDetails.name}
          </StyledText>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          style={styles.actionButton}
          onPress={() => setSelectedInvoice(item)}
        >
          <IconButton
            icon="eye"
            mode="outlined"
            size={20}
            style={styles.iconButton}
          />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDownload(item)}
        >
          <IconButton
            icon="download"
            mode="outlined"
            size={20}
            style={styles.iconButton}
          />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {selectedInvoice ? (
        <View style={styles.invoiceContainer}>
          <Button
            mode="outlined"
            onPress={() => setSelectedInvoice(null)}
            style={styles.backButton}
          >
            Back to List
          </Button>
          <InvoiceComponent
            invoice={selectedInvoice}
            onDownload={() => handleDownload(selectedInvoice)}
            onShare={() => handleShare(selectedInvoice)}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ marginHorizontal: 5, minHeight: 50}}>
            <StyledTextInput
              placeholder="Search invoices..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              data={MOCK_INVOICES}
              renderItem={renderInvoiceCard}
              keyExtractor={(item) => item.invoiceNumber}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: 5,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 10,
  },
  invoiceItem: {
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceNumber: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
    alignItems: "flex-start",
  },
  detailLabel: {
    color: "#999999",
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    margin: 0,
    width: 40,
    height: 40,
  },
  invoiceContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
});

export default InvoiceScreen;
