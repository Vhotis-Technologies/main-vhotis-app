import { StyleSheet, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Card, Text, Divider, Button, useTheme } from "react-native-paper";
import { InvoiceProps } from "@/app/interfaces/others/InvoiceInterface";
import StyledText from "../../helpers/forms/StyledText";
import { formatCurrency } from "@/app/_utils/main/helpers";

const InvoiceComponent: React.FC<InvoiceProps> = ({
  invoice,
  onDownload,
  onPrint,
  onShare,
}) => {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              {invoice.companyDetails.logo && (
                <Image
                  source={{ uri: invoice.companyDetails.logo }}
                  style={styles.logo}
                  contentFit="contain"
                />
              )}
              <StyledText variant="titleMedium" style={styles.companyName}>
                {invoice.companyDetails.name}
              </StyledText>
              <StyledText variant="labelMedium">{invoice.companyDetails.address}</StyledText>
              <StyledText variant="labelMedium">{invoice.companyDetails.email}</StyledText>
              {invoice.companyDetails.phone && (
                <StyledText variant="labelMedium">
                  {invoice.companyDetails.phone}
                </StyledText>
              )}
            </View>

            <View style={styles.invoiceInfo}>
              <StyledText variant="titleMedium">INVOICE</StyledText>
              <StyledText variant="titleSmall" style={styles.invoiceNumber}>
                #{invoice.invoiceNumber}
              </StyledText>
              <View style={styles.dates}>
                <StyledText variant="bodyMedium">
                  Issue Date: {formatDate(invoice.issueDate)}
                </StyledText>
                <StyledText variant="bodyMedium">
                  Due Date: {formatDate(invoice.dueDate)}
                </StyledText>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Customer Information */}
          <View style={styles.section}>
            <StyledText variant="titleMedium">Bill To:</StyledText>
            <StyledText variant="bodyLarge">{invoice.customerDetails.name}</StyledText>
            {invoice.customerDetails.address && (
              <StyledText variant="bodyMedium">
                {invoice.customerDetails.address}
              </StyledText>
            )}
            <StyledText variant="bodyMedium">{invoice.customerDetails.email}</StyledText>
            {invoice.customerDetails.phone && (
              <StyledText variant="bodyMedium">{invoice.customerDetails.phone}</StyledText>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <StyledText variant="titleMedium" style={styles.itemCol}>
                Item
              </StyledText>
              <StyledText variant="titleMedium" style={styles.qtyCol}>
                Qty 
              </StyledText>
              <StyledText variant="titleMedium" style={styles.priceCol}>
                Price
              </StyledText>
              <StyledText variant="titleMedium" style={styles.amountCol}>
                Amount
              </StyledText>
            </View>

            {invoice.billingRecord.billing_details.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <StyledText variant="bodyMedium" style={styles.itemCol}>
                  {item.name}
                </StyledText>
                <StyledText variant="bodyMedium" style={styles.qtyCol}>
                  {item.quantity || 1}
                </StyledText>
                <StyledText variant="bodyMedium" style={styles.priceCol}>
                  {formatCurrency(item.amount)}
                </StyledText>
                <StyledText variant="bodyMedium" style={styles.amountCol}>
                  {formatCurrency(item.amount * (item.quantity || 1))}
                </StyledText>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <StyledText variant="bodyMedium">Subtotal:</StyledText>
              <StyledText variant="bodyMedium">
                {formatCurrency(invoice.subtotal)}
              </StyledText>
            </View>

            {invoice.tax && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium">
                  Tax ({(invoice.tax.rate * 100).toFixed(2)}%):
                </Text>
                <Text variant="bodyMedium">
                  {formatCurrency(invoice.tax.amount)}
                </Text>
              </View>
            )}

            {invoice.discount && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium">
                  Discount ({invoice.discount.description}):
                </Text>
                <Text variant="bodyMedium" style={styles.discountText}>
                  -{formatCurrency(invoice.discount.amount)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text variant="titleMedium">Total:</Text>
              <Text variant="titleMedium" style={styles.totalAmount}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>

          {/* Additional Information */}
          {(invoice.notes || invoice.terms || invoice.paymentInstructions) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                {invoice.notes && (
                  <View style={styles.additionalInfo}>
                    <Text variant="titleSmall">Notes:</Text>
                    <Text variant="bodyMedium">{invoice.notes}</Text>
                  </View>
                )}
                {invoice.terms && (
                  <View style={styles.additionalInfo}>
                    <Text variant="titleSmall">Terms:</Text>
                    <Text variant="bodyMedium">{invoice.terms}</Text>
                  </View>
                )}
                {invoice.paymentInstructions && (
                  <View style={styles.additionalInfo}>
                    <Text variant="titleSmall">Payment Instructions:</Text>
                    <Text variant="bodyMedium">
                      {invoice.paymentInstructions}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {onDownload && (
              <Button
                mode="contained"
                onPress={onDownload}
                style={styles.actionButton}
              >
                Download
              </Button>
            )}
            {onPrint && (
              <Button
                mode="contained"
                onPress={onPrint}
                style={styles.actionButton}
              >
                Print
              </Button>
            )}
            {onShare && (
              <Button
                mode="contained"
                onPress={onShare}
                style={styles.actionButton}
              >
                Share
              </Button>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  companyInfo: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 8,
  },
  companyName: {
    marginBottom: 8,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceNumber: {
    marginVertical: 8,
    fontFamily: "monospace",
  },
  dates: {
    alignItems: "flex-end",
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  itemsHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemCol: {
    flex: 3,
  },
  qtyCol: {
    flex: 1,
    textAlign: "center",
  },
  priceCol: {
    flex: 2,
    textAlign: "right",
  },
  amountCol: {
    flex: 2,
    textAlign: "right",
  },
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 8,
  },
  discountText: {
    color: "#4CAF50",
  },
  totalAmount: {
    fontWeight: "bold",
  },
  additionalInfo: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 24,
  },
  actionButton: {
    minWidth: 120,
  },
});

export default InvoiceComponent;
