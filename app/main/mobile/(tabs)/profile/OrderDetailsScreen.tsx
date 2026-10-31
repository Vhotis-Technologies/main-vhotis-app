import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetOrderDetailsQuery } from "@/app/store/main/api/mainOrderApi";
import { OrderDetails } from "@/app/interfaces/main/orders/OrderInterfaces";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { formatCurrency } from "@/app/_utils/main/helpers";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import {
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  getDeliveredToLabel,
  formatOrderPaymentMethod,
} from "@/app/component/main/mobile/orders/orderHelpers";
import { canReportProblemForOrderStatus } from "@/app/utils/main/supportTicketMappers";

const OrderDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");

  const [expandedSections, setExpandedSections] = useState({
    items: true,
    delivery: false,
    payment: false,
    contact: false,
  });

  const {
    data: orderDetails,
    isLoading,
    isError,
    error,
  } = useGetOrderDetailsQuery(id || "", {
    skip: !id,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBuyAgain = (productId: string) => {
    // TODO: Implement buy again functionality
    console.log("Buy again for product:", productId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.orderItemCard,
        { backgroundColor: cardColor, borderColor },
      ]}
    >
      <View style={styles.orderItemHeader}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.orderItemImage} />
        )}
        <View style={styles.orderItemInfo}>
          <StyledText
            variant="bodyMedium"
            style={[styles.orderItemName, { color: textColor }]}
          >
            {item.product_name}
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={[styles.orderItemDescription, { color: textColor }]}
          >
            {item.product_description || "No description available"}
          </StyledText>
          <View style={styles.orderItemDetails}>
            <StyledText
              variant="bodySmall"
              style={[styles.orderItemQuantity, { color: textColor }]}
            >
              Qty: {item.quantity}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.orderItemPrice, { color: textColor }]}
            >
              {formatCurrency(item.unit_price)} each
            </StyledText>
          </View>
        </View>
        <View style={styles.orderItemTotal}>
          <StyledText
            variant="labelMedium"
            style={[styles.orderItemSubtotal, { color: textColor }]}
          >
            {formatCurrency(item.sub_total)}
          </StyledText>
          <TouchableOpacity
            style={[styles.buyAgainButton, { borderColor }]}
            onPress={() => handleBuyAgain(item.product_id)}
          >
            <MaterialIcons name="replay" size={14} color="#666" />
            <StyledText
              variant="bodySmall"
              style={[styles.buyAgainText, { color: "#666" }]}
            >
              Buy Again
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    icon: string,
  ) => (
    <TouchableOpacity
      style={[styles.sectionHeader, { borderColor }]}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <StyledText
          variant="labelMedium"
          style={[styles.sectionTitle, { color: textColor }]}
        >
          {title}
        </StyledText>
      </View>
      <Ionicons
        name={expandedSections[section] ? "chevron-up" : "chevron-down"}
        size={20}
        color="#666"
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centerContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color="#0066CC" />
        <StyledText
          variant="bodyMedium"
          style={[styles.loadingText, { color: textColor }]}
        >
          Loading order details...
        </StyledText>
      </View>
    );
  }

  if (isError || !orderDetails) {
    return (
      <View
        style={[styles.container, styles.centerContainer, { backgroundColor }]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#DC3545" />
        <StyledText
          variant="titleMedium"
          style={[styles.errorText, { color: textColor }]}
        >
          Failed to load order details
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.errorSubtext, { color: textColor }]}
        >
          {(error as any)?.message || "Order not found"}
        </StyledText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <StyledText variant="bodyMedium" style={styles.retryButtonText}>
            Go Back
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Order Header */}
      <View
        style={[
          styles.orderHeader,
          { backgroundColor: cardColor, borderColor },
        ]}
      >
        <View style={styles.orderHeaderTop}>
          <View style={styles.orderNumberContainer}>
            <StyledText
              variant="titleMedium"
              style={[styles.orderNumber, { color: textColor }]}
            >
              {orderDetails.order_number}
            </StyledText>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(orderDetails.status)}
                size={16}
                color={getStatusColor(orderDetails.status)}
              />
              <StyledText
                variant="labelSmall"
                style={[
                  styles.statusText,
                  { color: getStatusColor(orderDetails.status) },
                ]}
              >
                {getStatusLabel(orderDetails.status)}
              </StyledText>
            </View>
          </View>
          <StyledText
            variant="bodySmall"
            style={[styles.orderDate, { color: textColor }]}
          >
            Ordered on {formatDate(orderDetails.created_at)}
          </StyledText>
        </View>

        {orderDetails.status === "delivered" && !orderDetails.is_reviewed ? (
          <View style={styles.rateOrderBanner}>
            <StyledText
              variant="bodySmall"
              style={{ color: textColor, flex: 1 }}
            >
              How was your order? Rate each product to help other shoppers.
            </StyledText>
            <StyledButton
              title="Rate your order"
              onPress={() =>
                router.push(
                  `/main/mobile/(tabs)/profile/OrderRatingScreen?id=${orderDetails.id}`,
                )
              }
            />
          </View>
        ) : null}

        {orderDetails.is_reviewed && orderDetails.order_review ? (
          <View style={[styles.reviewedBanner, { borderColor }]}>
            <Ionicons name="star" size={16} color="#F5B301" />
            <StyledText variant="bodySmall" style={{ color: textColor }}>
              You rated this order{" "}
              {orderDetails.order_review.average_rating.toFixed(1)} / 5
            </StyledText>
          </View>
        ) : null}

        {canReportProblemForOrderStatus(orderDetails.status) ? (
          <View style={[styles.helpBanner, { borderColor }]}>
            <StyledText
              variant="bodySmall"
              style={{ color: textColor, flex: 1 }}
            >
              Problem with a product?
            </StyledText>
            <StyledButton
              title="Report a problem"
              variant="small"
              onPress={() =>
                router.push({
                  pathname:
                    "/main/mobile/(screens)/(support)/ReportProblemScreen",
                  params: { orderId: String(orderDetails.id) },
                })
              }
            />
          </View>
        ) : null}

        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Items ({orderDetails.order_items.length})
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatCurrency(orderDetails.items_subtotal)}
            </StyledText>
          </View>
          <View style={styles.summaryRow}>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Shipping
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatCurrency(orderDetails.shipping_cost)}
            </StyledText>
          </View>
          <View style={styles.summaryRow}>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryLabel, { color: textColor }]}
            >
              Tax
            </StyledText>
            <StyledText
              variant="bodyMedium"
              style={[styles.summaryValue, { color: textColor }]}
            >
              {formatCurrency(orderDetails.tax_amount)}
            </StyledText>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <StyledText
              variant="labelMedium"
              style={[styles.totalLabel, { color: textColor }]}
            >
              Total
            </StyledText>
            <StyledText
              variant="labelMedium"
              style={[styles.totalValue, { color: textColor }]}
            >
              {formatCurrency(orderDetails.total_amount)}
            </StyledText>
          </View>
        </View>
      </View>

      {/* Order Items Section */}
      <View
        style={[styles.section, { backgroundColor: cardColor, borderColor }]}
      >
        {renderSectionHeader("Order Items", "items", "bag-outline")}
        {expandedSections.items && (
          <FlatList
            data={orderDetails.order_items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Delivery Information Section */}
      {orderDetails.delivery_address && (
        <View
          style={[styles.section, { backgroundColor: cardColor, borderColor }]}
        >
          {renderSectionHeader(
            "Delivery Information",
            "delivery",
            "location-outline",
          )}
          {expandedSections.delivery && (
            <View style={styles.deliveryContent}>
              <View style={styles.deliveryAddress}>
                <StyledText
                  variant="bodyMedium"
                  style={[styles.deliveryName, { color: textColor }]}
                >
                  {orderDetails.delivery_address.delivery_name ||
                    "Delivery Address"}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.deliveryAddressText, { color: textColor }]}
                >
                  {orderDetails.delivery_address.full_address}
                </StyledText>
              </View>

              {orderDetails.delivery_left_at_door ? (
                <>
                  {orderDetails.status === "delivered" &&
                  orderDetails.delivery_photo_url ? (
                    <View
                      style={[styles.deliveryCodeContainer, { borderColor }]}
                    >
                      <View style={styles.deliveryCodeHeader}>
                        <Ionicons
                          name="camera-outline"
                          size={16}
                          color="#666"
                        />
                        <StyledText
                          variant="bodyMedium"
                          style={[
                            styles.deliveryCodeLabel,
                            { color: textColor },
                          ]}
                        >
                          Proof of Delivery
                        </StyledText>
                      </View>
                      {getDeliveredToLabel(
                        orderDetails.delivery_delivered_to,
                      ) ? (
                        <StyledText
                          variant="bodySmall"
                          style={[
                            styles.deliveryAddressText,
                            { color: textColor },
                          ]}
                        >
                          Left at:{" "}
                          {getDeliveredToLabel(
                            orderDetails.delivery_delivered_to,
                          )}
                        </StyledText>
                      ) : null}
                      <Image
                        source={{ uri: orderDetails.delivery_photo_url }}
                        style={styles.deliveryProofImage}
                        contentFit="cover"
                        accessibilityLabel="Photo of where your order was left"
                      />
                      {orderDetails.delivery_proof_notes ? (
                        <StyledText
                          variant="bodySmall"
                          style={[
                            styles.deliveryAddressText,
                            styles.deliveryProofNotes,
                            { color: textColor },
                          ]}
                        >
                          {orderDetails.delivery_proof_notes}
                        </StyledText>
                      ) : null}
                    </View>
                  ) : orderDetails.status === "delivered" ? (
                    <View
                      style={[styles.deliveryCodeContainer, { borderColor }]}
                    >
                      <StyledText
                        variant="bodySmall"
                        style={[
                          styles.deliveryAddressText,
                          { color: textColor },
                        ]}
                      >
                        Delivery proof is being processed.
                      </StyledText>
                    </View>
                  ) : (
                    <View
                      style={[styles.deliveryCodeContainer, { borderColor }]}
                    >
                      <View style={styles.deliveryCodeHeader}>
                        <Ionicons name="home-outline" size={16} color="#666" />
                        <StyledText
                          variant="bodyMedium"
                          style={[
                            styles.deliveryCodeLabel,
                            { color: textColor },
                          ]}
                        >
                          Leave at Door
                        </StyledText>
                      </View>
                      <StyledText
                        variant="bodySmall"
                        style={[
                          styles.deliveryAddressText,
                          { color: textColor },
                        ]}
                      >
                        No delivery code is required. Your rider will leave the
                        order at your door and upload a photo as proof of
                        delivery.
                      </StyledText>
                    </View>
                  )}
                </>
              ) : (
                orderDetails.delivery_code && (
                  <View style={[styles.deliveryCodeContainer, { borderColor }]}>
                    <View style={styles.deliveryCodeHeader}>
                      <Ionicons name="key-outline" size={16} color="#666" />
                      <StyledText
                        variant="bodyMedium"
                        style={[styles.deliveryCodeLabel, { color: textColor }]}
                      >
                        Delivery Code
                      </StyledText>
                    </View>
                    <StyledText
                      variant="titleMedium"
                      style={[styles.deliveryCode, { color: textColor }]}
                    >
                      {orderDetails.delivery_code}
                    </StyledText>
                    {orderDetails.delivery_code_expires_at && (
                      <StyledText
                        variant="bodySmall"
                        style={[
                          styles.deliveryCodeExpiry,
                          { color: textColor },
                        ]}
                      >
                        Expires:{" "}
                        {formatDate(orderDetails.delivery_code_expires_at)}
                      </StyledText>
                    )}
                  </View>
                )
              )}

              {orderDetails.delivery_instructions ? (
                <View style={[styles.deliveryCodeContainer, { borderColor }]}>
                  <View style={styles.deliveryCodeHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#666"
                    />
                    <StyledText
                      variant="bodyMedium"
                      style={[styles.deliveryCodeLabel, { color: textColor }]}
                    >
                      Delivery Instructions
                    </StyledText>
                  </View>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.deliveryAddressText, { color: textColor }]}
                  >
                    {orderDetails.delivery_instructions}
                  </StyledText>
                </View>
              ) : null}
            </View>
          )}
        </View>
      )}

      {/* Payment Information Section */}
      <View
        style={[styles.section, { backgroundColor: cardColor, borderColor }]}
      >
        {renderSectionHeader("Payment Information", "payment", "card-outline")}
        {expandedSections.payment && (
          <View style={styles.paymentContent}>
            <View style={styles.paymentRow}>
              <StyledText
                variant="bodyMedium"
                style={[styles.paymentLabel, { color: textColor }]}
              >
                Payment Status
              </StyledText>
              <View style={styles.paymentStatusContainer}>
                <Ionicons
                  name={
                    orderDetails.payment_status === "paid"
                      ? "checkmark-circle"
                      : "time"
                  }
                  size={16}
                  color={
                    orderDetails.payment_status === "paid"
                      ? "#28A745"
                      : "#FFC107"
                  }
                />
                <StyledText
                  variant="bodyMedium"
                  style={[
                    styles.paymentStatus,
                    {
                      color:
                        orderDetails.payment_status === "paid"
                          ? "#28A745"
                          : "#FFC107",
                    },
                  ]}
                >
                  {orderDetails.payment_status.charAt(0).toUpperCase() +
                    orderDetails.payment_status.slice(1)}
                </StyledText>
              </View>
            </View>
            <View style={styles.paymentRow}>
              <StyledText
                variant="bodyMedium"
                style={[styles.paymentLabel, { color: textColor }]}
              >
                Payment Method
              </StyledText>
              <StyledText
                variant="bodyMedium"
                style={[styles.paymentValue, { color: textColor }]}
              >
                {formatOrderPaymentMethod(orderDetails.payment_method)}
              </StyledText>
            </View>
          </View>
        )}
      </View>

      {/* Contact Information Section */}
      <View
        style={[styles.section, { backgroundColor: cardColor, borderColor }]}
      >
        {renderSectionHeader(
          "Contact Information",
          "contact",
          "person-outline",
        )}
        {expandedSections.contact && (
          <View style={styles.contactContent}>
            <View style={styles.contactRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <StyledText
                variant="bodyMedium"
                style={[styles.contactText, { color: textColor }]}
              >
                {orderDetails.user_contact.name}
              </StyledText>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <StyledText
                variant="bodyMedium"
                style={[styles.contactText, { color: textColor }]}
              >
                {orderDetails.user_contact.email}
              </StyledText>
            </View>
            {orderDetails.user_contact.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <StyledText
                  variant="bodyMedium"
                  style={[styles.contactText, { color: textColor }]}
                >
                  {orderDetails.user_contact.phone}
                </StyledText>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 12,
  },
  orderHeader: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeaderTop: {
    marginBottom: 16,
  },
  orderNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontWeight: "500",
  },
  orderDate: {
    opacity: 0.7,
  },
  rateOrderBanner: {
    marginBottom: 16,
    gap: 12,
  },
  reviewedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  helpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    opacity: 0.8,
  },
  summaryValue: {
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: "600",
  },
  totalValue: {
    fontWeight: "600",
    fontSize: 18,
  },
  section: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  orderItemCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    padding: 10,
  },
  orderItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  orderItemDescription: {
    opacity: 0.7,
    marginBottom: 8,
  },
  orderItemDetails: {
    flexDirection: "row",
    gap: 16,
  },
  orderItemQuantity: {
    opacity: 0.8,
  },
  orderItemPrice: {
    opacity: 0.8,
  },
  orderItemTotal: {
    alignItems: "flex-end",
  },
  orderItemSubtotal: {
    fontWeight: "600",
    marginBottom: 8,
  },
  buyAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  buyAgainText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deliveryContent: {
    padding: 10,
  },
  deliveryAddress: {
    marginBottom: 16,
  },
  deliveryName: {
    fontWeight: "500",
    marginBottom: 8,
  },
  deliveryAddressText: {
    opacity: 0.8,
    lineHeight: 20,
  },
  deliveryCodeContainer: {
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
  },
  deliveryCodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  deliveryCodeLabel: {
    fontWeight: "500",
  },
  deliveryCode: {
    fontWeight: "600",
    fontSize: 24,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 4,
  },
  deliveryCodeExpiry: {
    textAlign: "center",
    opacity: 0.7,
  },
  deliveryProofImage: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginTop: 8,
  },
  deliveryProofNotes: {
    marginTop: 8,
    fontStyle: "italic",
  },
  paymentContent: {
    padding: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    opacity: 0.8,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentStatus: {
    fontWeight: "500",
  },
  paymentValue: {
    fontWeight: "500",
  },
  contactContent: {
    padding: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  contactText: {
    fontWeight: "500",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    marginTop: 16,
    textAlign: "center",
    color: "#DC3545",
  },
  errorSubtext: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
