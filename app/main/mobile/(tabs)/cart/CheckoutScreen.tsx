import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import CheckoutProgress from "@/app/component/main/checkout/CheckoutProgress";
import OrderSummary from "@/app/component/main/checkout/OrderSummary";
import ShippingForm from "@/app/component/main/checkout/ShippingForm";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppSelector } from "@/app/store/store";
import { router } from "expo-router";
import useCheckout from "@/app/hook/main/useCheckout";
import useMainCart from "@/app/hook/main/useMainCart";
import { useFocusEffect } from "@react-navigation/native";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { getMinimumOrderMessage } from "@/app/_utils/main/orderLimits";

const CHECKOUT_STEPS = ["Shipping", "Order Review"];

const CheckoutScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const { cartItems, cartCalculation, isLoading } = useAppSelector(
    (state) => state.cart
  );
  const user = useAppSelector((state) => state.auth.user);
  const isGuest = Boolean(
    user && "is_guest" in user && (user as { is_guest?: boolean }).is_guest
  );

  // Cart refetch helpers to keep checkout in sync with latest cart totals
  const { refetchCartItems, refetchCartCheckout } = useMainCart();

  // Use the checkout hook
  const {
    currentStep,
    setCurrentStep,
    checkoutState,
    isCreatingCheckout,
    isProcessingPayment,
    handleShippingSubmit,
    handlePayment,
    handlePriorityToggle,
    handleLeaveAtDoorToggle,
    handleDeliveryInstructionsChange,
    persistDeliveryOptions,
    recalculateCheckout,
    isUpdatingPriority,
    isUpdatingDeliveryOptions,
  } = useCheckout();

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!isLoading && (!cartItems || cartItems.length === 0)) {
      router.back();
    }
  }, [cartItems, isLoading]);

  const subtotal = checkoutState.subtotal || cartCalculation?.sub_total || 0;
  const meetsMinimumOrder =
    cartCalculation?.meets_minimum_order ??
    subtotal >= (cartCalculation?.minimum_order_amount ?? 20);
  const minimumOrderMessage = getMinimumOrderMessage(
    subtotal,
    checkoutState.shippingAddress?.country,
    cartCalculation?.minimum_order_amount
  );

  // Refetch cart and checkout data whenever CheckoutScreen gains focus
  useFocusEffect(
    React.useCallback(() => {
      refetchCartItems();
      refetchCartCheckout();
    }, [refetchCartItems, refetchCartCheckout])
  );

  if (isGuest) {
    return (
      <View style={[styles.container, { backgroundColor, padding: 24 }]}>
        <StyledText variant="titleMedium">Create an account to check out</StyledText>
        <StyledText variant="bodyMedium" style={{ marginTop: 8, marginBottom: 16 }}>
          Your cart stays with you. Sign in or create an account, then come back to pay.
        </StyledText>
        <StyledButton
          title="Sign in"
          onPress={() => router.push("/onboarding/main/Signin")}
        />
      </View>
    );
  }

  // Show loading state while cart data is being fetched or checkout is being created
  if (isLoading || !cartItems || isCreatingCheckout) {
    return (
      <View
        style={[styles.container, styles.loadingContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color="#0066CC" />
        <StyledText variant="labelMedium" style={styles.loadingText}>
          {isCreatingCheckout
            ? "Calculating delivery fees..."
            : "Loading checkout..."}
        </StyledText>
      </View>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ShippingForm
            initialAddress={checkoutState.shippingAddress || undefined}
            onSubmit={handleShippingSubmit}
          />
        );
      case 1:
        return (
          <View style={[styles.reviewContainer, { backgroundColor }]}>
            <StyledText variant="labelLarge" children="Order Review" />
            <StyledText variant="labelMedium" style={styles.reviewNote}>
              Review your order details and shipping address below. You can
              modify quantities, remove items, or save items for later.
            </StyledText>
            <OrderSummary
              items={checkoutState.items}
              subtotal={checkoutState.subtotal}
              serviceFee={checkoutState.serviceFee}
              tax={checkoutState.tax}
              shippingCost={checkoutState.shippingCost}
              priorityFee={checkoutState.priorityFee}
              total={checkoutState.total}
              isPriorityDelivery={checkoutState.isPriorityDelivery}
              deliveryLeftAtDoor={checkoutState.deliveryLeftAtDoor}
              deliveryInstructions={checkoutState.deliveryInstructions}
              membershipBenefits={checkoutState.membershipBenefits}
              isPriorityUpdating={isUpdatingPriority}
              isDeliveryOptionsUpdating={isUpdatingDeliveryOptions}
              onPriorityToggle={handlePriorityToggle}
              onLeaveAtDoorToggle={handleLeaveAtDoorToggle}
              onDeliveryInstructionsChange={handleDeliveryInstructionsChange}
              onDeliveryInstructionsBlur={persistDeliveryOptions}
              onRecalculateCosts={recalculateCheckout}
            />
            {checkoutState.shippingAddress && (
              <View style={styles.section}>
                <StyledText variant="labelLarge" children="Shipping Address" />
                <View style={[styles.addressContainer, { backgroundColor }]}>
                  <StyledText
                    variant="labelMedium"
                    children={checkoutState.shippingAddress.delivery_name}
                  />
                  <StyledText
                    variant="labelMedium"
                    children={checkoutState.shippingAddress.address}
                  />
                  {checkoutState.shippingAddress.address2 && (
                    <StyledText
                      variant="labelMedium"
                      children={checkoutState.shippingAddress.address2}
                    />
                  )}
                  <StyledText
                    variant="labelMedium"
                    children={`${checkoutState.shippingAddress.city}, ${checkoutState.shippingAddress.zip_code} ${checkoutState.shippingAddress.country}`}
                  />
                  <StyledText
                    variant="labelMedium"
                    children={checkoutState.shippingAddress.country}
                  />
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setCurrentStep(0)}
                >
                  <StyledText
                    variant="labelSmall"
                    style={styles.editButtonText}
                  >
                    Edit Address
                  </StyledText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <CheckoutProgress currentStep={currentStep} steps={CHECKOUT_STEPS} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>{renderStep()}</View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <StyledButton
            title="Back"
            onPress={() => setCurrentStep(currentStep - 1)}
            variant="tonal"
            buttonStyles={styles.button}
          />
        )}

        {/* Show Continue button for Order Review step */}
        {currentStep === 1 && (
          <>
            {!meetsMinimumOrder && minimumOrderMessage && (
              <StyledText
                variant="labelMedium"
                style={styles.minimumOrderText}
                children={minimumOrderMessage}
              />
            )}
            <StyledButton
              title={
                isProcessingPayment
                  ? "Processing Payment..."
                  : "Continue to Payment"
              }
              onPress={handlePayment}
              disabled={isProcessingPayment || !meetsMinimumOrder}
              variant="tonal"
              buttonStyles={[styles.button, styles.secondaryButton]}
              textStyles={styles.buttonText}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
  },
  scrollView: {},
  content: {
    padding: 10,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  button: {
    padding: 15,
    alignItems: "center",
    height: 50,
    borderWidth: 0,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },
  secondaryButton: {
    borderWidth: 0.2,
    flex:1

  },
  secondaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  reviewContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewNote: {
    marginTop: 8,
    marginBottom: 16,
    color: "#666",
    fontStyle: "italic",
  },
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  addressContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  editButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    marginTop: 8,
  },
  editButtonText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  minimumOrderText: {
    flex: 1,
    marginRight: 8,
    color: "#C62828",
    alignSelf: "center",
  },
});
