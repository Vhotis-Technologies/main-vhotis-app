import { useCallback } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import {
  useCreatePaymentSheetMutation,
  PromotionPaymentData,
  PaymentSheetResponse,
} from "@/app/store/seller/api/sellerPaymentApi";
import { getCountryCode, currencyCode } from "@/app/_utils/paymentUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

/**
 * Custom hook for managing seller promotion payment functionality using Stripe
 *
 * This hook provides a comprehensive interface for handling promotion payment operations,
 * including payment sheet initialization, payment processing, and error handling.
 *
 * Features:
 * - Payment sheet initialization with Stripe for promotions
 * - Payment processing for both store-wide and product-specific promotions
 * - Error handling and user feedback
 * - Support for different promotion types
 *
 * @returns Object containing payment methods and utilities
 */
const useSellerPayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [createPaymentSheet] = useCreatePaymentSheetMutation();
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showSnackbarWithConfig } = useSnackbar();

  /* Get the country from the users auth  */
  const { user } = useSelector((state: RootState) => state.auth);

  /**
   * Fetches payment sheet details from the server for promotion payments
   *
   * @param promotionData - Promotion data including type and configuration
   * @returns Promise that resolves to payment sheet details
   */
  const fetchPaymentSheetDetails = useCallback(
    async (
      promotionData: PromotionPaymentData
    ): Promise<PaymentSheetResponse> => {
      try {
        const response = await createPaymentSheet(promotionData).unwrap();
        if (response.skip_payment) {
          return {
            ...response,
            skip_payment: true,
            amount: response.amount ?? 0,
            paymentIntentId: `promotion_waived_${Date.now()}`,
          };
        }
        return response;
      } catch (error: any) {
        console.error("Error fetching payment sheet details:", error);
        const errorMessage =
          error?.data?.error ||
          error?.data ||
          "Failed to create payment sheet. Please try again.";
        throw new Error(errorMessage);
      }
    },
    [createPaymentSheet]
  );

  /**
   * Initializes the payment sheet for promotion payments
   *
   * @param promotionData - Promotion data including type and configuration
   * @param merchantDisplayName - Optional custom merchant display name (defaults to "Vhotis")
   */
  const initializePaymentSheet = useCallback(
    async (
      promotionData: PromotionPaymentData,
      merchantDisplayName: string = "Vhotis"
    ) => {
      // Default to GBP for seller payments
      const countryCode = "IE";
      const currencyCode = "EUR";

      console.log("Promotion Payment Config:", {
        countryCode,
        currencyCode,
        testEnv: __DEV__,
        merchantDisplayName,
        promotionType: promotionData.promotion_type,
      });

      try {
        const sheetDetails = await fetchPaymentSheetDetails(promotionData);
        if (sheetDetails.skip_payment) {
          return sheetDetails;
        }

        const { paymentIntent, ephemeralKey, customer } = sheetDetails;
        if (!paymentIntent || !ephemeralKey || !customer) {
          throw new Error("Incomplete payment sheet response from server.");
        }

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
          allowsDelayedPaymentMethods: true,
        });

        if (error) {
          console.error("Payment sheet initialization error:", error);
          throw error;
        }

        console.log("Payment sheet initialized successfully");
        return sheetDetails;
      } catch (error: any) {
        console.error("Error initializing payment sheet:", error);
        throw error;
      }
    },
    [fetchPaymentSheetDetails, initPaymentSheet]
  );

  /**
   * Opens the payment sheet for promotion payments
   *
   * @param promotionData - Promotion data including type and configuration
   * @param merchantDisplayName - Optional custom merchant display name
   * @param onSuccess - Optional callback when payment succeeds
   * @param onCancel - Optional callback when payment is cancelled
   * @returns Promise that resolves to true if payment successful, false if cancelled
   */
  const openPaymentSheet = useCallback(
    async (
      promotionData: PromotionPaymentData,
      merchantDisplayName: string = "Vhotis",
      onSuccess?: (result: {
        paymentIntentId?: string;
        amount?: number;
      }) => void,
      onCancel?: () => void
    ): Promise<{
      success: boolean;
      paymentIntentId?: string;
      amount?: number;
    }> => {
      try {
        const sheetDetails = await fetchPaymentSheetDetails(promotionData);

        if (sheetDetails.skip_payment) {
          const waived = {
            success: true as const,
            paymentIntentId: sheetDetails.paymentIntentId,
            amount: sheetDetails.amount ?? 0,
          };
          onSuccess?.(waived);
          return waived;
        }

        const { paymentIntent, ephemeralKey, customer } = sheetDetails;
        if (!paymentIntent || !ephemeralKey || !customer) {
          throw new Error("Incomplete payment sheet response from server.");
        }

        const countryCode = "IE";
        const currency = "EUR";

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          merchantDisplayName: merchantDisplayName,
          customerEphemeralKeySecret: ephemeralKey,
          customerId: customer,
          returnURL: "vhotis://payment-success",
          applePay: { merchantCountryCode: countryCode },
          googlePay: {
            merchantCountryCode: countryCode,
            testEnv: __DEV__,
            currencyCode: currency,
          },
          allowsDelayedPaymentMethods: true,
        });

        if (initError) {
          throw initError;
        }

        const { error } = await presentPaymentSheet();

        if (error) {
          if (error.code === "Canceled") {
            console.log("Payment cancelled by user");
            onCancel?.();
            return { success: false };
          }

          console.error("Payment sheet error:", error);
          showSnackbarWithConfig({
            message: error.message || "Payment failed. Please try again.",
            type: "error",
            duration: 4000,
          });
          return { success: false };
        }

        // Payment successful
        console.log("Payment successful");
        showSnackbarWithConfig({
          message: "Payment successful! Your promotion has been activated.",
          type: "success",
          duration: 3000,
        });
        const successPayload = {
          paymentIntentId: sheetDetails?.paymentIntentId,
          amount: sheetDetails?.amount,
        };
        onSuccess?.(successPayload);
        return { success: true, ...successPayload };
      } catch (error: any) {
        console.error("Error processing payment:", error);
        const errorMessage =
          error?.message ||
          error?.data?.error ||
          "Failed to process payment. Please try again.";

        setAlertConfig({
          title: "Payment Error",
          message: errorMessage,
          type: "error",
          isVisible: true,
          onConfirm: () => {
            setIsVisible(false);
          },
        });
        return { success: false };
      }
    },
    [
      fetchPaymentSheetDetails,
      initPaymentSheet,
      presentPaymentSheet,
      showSnackbarWithConfig,
      setAlertConfig,
      setIsVisible,
    ]
  );

  return {
    openPaymentSheet,
    initializePaymentSheet,
    fetchPaymentSheetDetails,
  };
};

export default useSellerPayment;
