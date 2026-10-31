import { useCallback } from "react";
import { useStripe } from "@stripe/stripe-react-native";

import { useAlertContext } from "@/app/contexts/AlertContext";
import { PaymentSheetResponse } from "@/app/interfaces/main/payment/PaymentInterface";
import { RootState, useAppSelector } from "@/app/store/store";
import { useAddresses } from "@/app/hook/main/useAddresses";
import { useCreatePaymentSheetMutation } from "@/app/store/main/api/paymentApi";

/**
 * Custom hook for managing payment functionality using Stripe
 *
 * This hook provides a comprehensive interface for handling payment operations,
 * including payment sheet initialization, payment processing, and error handling.
 * It can be used across the application for various payment scenarios like
 * booking payments, tips, subscriptions, etc.
 *
 * Features:
 * - Payment sheet initialization with Stripe
 * - Payment processing with error handling
 * - Support for different currencies and countries
 * - Comprehensive error handling for various payment scenarios
 *
 * @returns Object containing payment methods and utilities
 */
const usePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [createPaymentSheet] = useCreatePaymentSheetMutation();
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { addresses } = useAddresses();

  /**
   * Fetches payment sheet details from the server
   *
   * @param finalPrice - The total price in euros
   * @param checkoutData - Optional checkout and address data for order creation
   * @returns Promise that resolves to payment sheet details
   */
  const fetchPaymentSheetDetails = useCallback(
    async (
      finalPrice: number,
      checkoutData?: any
    ): Promise<PaymentSheetResponse> => {
      try {
        const amountInCents = Math.round(finalPrice * 100);
        const response = await createPaymentSheet({
          amount: amountInCents,
          checkout_id: checkoutData?.checkout_id,
          delivery_address_id: checkoutData?.delivery_address_id,
        }).unwrap();
        return response;
      } catch (error) {
        console.error("Error fetching payment sheet details:", error);
        throw error;
      }
    },
    [createPaymentSheet]
  );

  /**
   * Initializes the payment sheet when the checkout page is opened.
   * Calls the fetchPaymentSheetDetails method to fetch the payment sheet details from the server.
   * Then calls the initPaymentSheet method to initialize the payment sheet.
   *
   * @param finalPrice - The total price to charge
   * @param merchantDisplayName - Optional custom merchant display name (defaults to "Vhotis")
   */
  const initializePaymentSheet = useCallback(
    async (
      finalPrice: number,
      merchantDisplayName: string = "Vhotis",
      checkoutData?: any
    ) => {
      const address = addresses[0];
      let countryCode = "";
      let currencyCode = "";

      if (address?.country === "Ireland") {
        countryCode = "IE";
        currencyCode = "EUR";
      } else {
        countryCode = "GB";
        currencyCode = "GBP";
      }

      console.log("Google Pay Config:", {
        countryCode,
        currencyCode,
        testEnv: __DEV__,
        merchantDisplayName,
      });

      try {
        const { paymentIntent, ephemeralKey, customer } =
          await fetchPaymentSheetDetails(finalPrice, checkoutData);

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          merchantDisplayName: merchantDisplayName,
          customerEphemeralKeySecret: ephemeralKey,
          customerId: customer,
          returnURL: "vhotis://payment-success",
          applePay: {
            merchantCountryCode: countryCode,
          },
          googlePay: {
            merchantCountryCode: countryCode,
            testEnv: __DEV__,
            currencyCode: currencyCode,
          },
          // Enable saving payment methods for future use
          allowsDelayedPaymentMethods: true,
        });

        if (error) {
          console.error("Payment sheet initialization error:", error);
          throw error;
        }

        console.log("Payment sheet initialized successfully");
      } catch (error: any) {
        console.error("Error initializing payment sheet:", error);
        throw error;
      }
    },
    [fetchPaymentSheetDetails, initPaymentSheet]
  );

  /**
   * Opens the payment sheet when clicked on the checkout page.
   * Calls the initializePaymentSheet method to initialize the payment sheet first on the server.
   * Then calls the presentPaymentSheet method to present the payment sheet to the user.
   *
   * @param finalPrice - The total price to charge
   * @param merchantDisplayName - Optional custom merchant display name
   * @returns Promise that resolves to true if payment successful, false if cancelled, throws error if failed
   */
  const openPaymentSheet = useCallback(
    async (
      finalPrice: number,
      merchantDisplayName: string = "Vhotis",
      checkoutData?: any
    ): Promise<boolean> => {
      try {
        // Initialize payment sheet first
        await initializePaymentSheet(
          finalPrice,
          merchantDisplayName,
          checkoutData
        );

        // Present payment sheet
        const { error } = await presentPaymentSheet();

        if (error) {
          // Handle specific error cases
          if (error.code === "Canceled") {
            console.log("Payment was canceled by user");
            return false;
          }

          // Handle other errors
          let errorMessage = "Payment failed. Please try again.";
          let errorTitle = "Payment Error";

          if (error.message?.includes("card_declined")) {
            errorMessage =
              "Your card was declined. Please try a different payment method.";
            errorTitle = "Card Declined";
          } else if (error.message?.includes("insufficient_funds")) {
            errorMessage =
              "Insufficient funds. Please try a different payment method.";
            errorTitle = "Insufficient Funds";
          } else if (error.message?.includes("expired_card")) {
            errorMessage =
              "Your card has expired. Please use a different payment method.";
            errorTitle = "Expired Card";
          }

          setAlertConfig({
            title: errorTitle,
            message: errorMessage,
            type: "error",
            isVisible: true,
            onConfirm() {
              setIsVisible(false);
            },
          });

          throw error;
        }

        return true;
      } catch (error: any) {
        console.error("Error in payment process:", error);

        // Handle network or initialization errors
        let errorMessage = "An error occurred during payment";
        let errorTitle = "Payment Error";

        if (error.message?.includes("network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
          errorTitle = "Connection Error";
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
          errorTitle = "Timeout Error";
        }

        setAlertConfig({
          title: errorTitle,
          message: errorMessage,
          type: "error",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
        throw error;
      }
    },
    [initializePaymentSheet, presentPaymentSheet, setAlertConfig, setIsVisible]
  );

  /**
   * Processes a tip payment
   *
   * @param tipAmount - The tip amount to charge
   * @returns Promise that resolves to true if payment successful, false if cancelled, throws error if failed
   */
  const processTipPayment = useCallback(
    async (tipAmount: number): Promise<boolean> => {
      return openPaymentSheet(tipAmount, "Vhotis - Tip");
    },
    [openPaymentSheet]
  );

  return {
    // Core payment methods
    fetchPaymentSheetDetails,
    initializePaymentSheet,
    openPaymentSheet,

    // Specialized payment methods
    processTipPayment,
  };
};

export default usePayment;
