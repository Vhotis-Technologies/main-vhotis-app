import React, { useState, useEffect, useMemo, useCallback } from "react";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { useCreateCheckoutMutation } from "@/app/store/main/api/cartApi";
import usePayment from "@/app/hook/main/usePayment";
import { CartItems } from "@/app/interfaces/main/cart/CartInterface";
import { OrderItem } from "@/app/interfaces/main/orders/Orders";
import { CheckoutState } from "@/app/interfaces/main/checkout/Checkout";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import cartApi from "@/app/store/main/api/cartApi";
import membershipApi from "@/app/store/main/api/membershipApi";
import { clearCart } from "@/app/store/main/slices/cartSlice";
import { useAlertContext } from "../../contexts/AlertContext";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import OrderConfirmationComponent from "@/app/component/main/checkout/OrderConfirmationComponent";
import {
  getMinimumOrderMessage,
  resolveMinimumOrderStatus,
} from "@/app/_utils/main/orderLimits";

/**
 * Transform CartItems from Redux to OrderItem format for checkout
 */
const transformCartToOrderItems = (items: CartItems[]): OrderItem[] => {
  return items.map((item) => ({
    id: item.id,
    title: item.product_name,
    image: item.image,
    price: item.price,
    quantity: item.quantity.toString(),
    date: new Date().toISOString(),
  }));
};

/**
 * Custom hook for managing checkout process
 * Handles all checkout logic including shipping, payment, and cart refresh
 */
const useCheckout = () => {
  const dispatch = useAppDispatch();
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showModal, closeModal } = useModalService();
  const { openPaymentSheet } = usePayment();

  // Redux store selectors
  const { cartItems, cartCalculation, isLoading } = useAppSelector(
    (state) => state.cart,
  );

  // API mutations
  const [createCheckout, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutMutation();

  // Transform cart items to order items once
  const orderItems = useMemo(
    () => transformCartToOrderItems(cartItems || []),
    [cartItems],
  );

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    items: orderItems,
    subtotal: cartCalculation?.sub_total || 0,
    serviceFee: cartCalculation?.service_fee || 0,
    tax: cartCalculation?.vat || 0,
    shippingCost: cartCalculation?.delivery_fee || 0,
    priorityFee: cartCalculation?.priority_fee || 0,
    total: cartCalculation?.total_amount || 0,
    isPriorityDelivery: false,
    deliveryLeftAtDoor: false,
    deliveryInstructions: "",
    shippingAddress: null,
    paymentMethod: null,
    orderStatus: "pending",
  });
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isUpdatingDeliveryOptions, setIsUpdatingDeliveryOptions] =
    useState(false);

  // Update checkout state when cart data changes
  useEffect(() => {
    setCheckoutState((prev) => ({
      ...prev,
      items: orderItems,
      subtotal: cartCalculation?.sub_total || 0,
      serviceFee: cartCalculation?.service_fee || 0,
      tax: cartCalculation?.vat || 0,
      shippingCost: cartCalculation?.delivery_fee || 0,
      priorityFee:
        cartCalculation?.priority_fee ??
        (typeof prev.priorityFee === "number" ? prev.priorityFee : 0),
      total: cartCalculation?.total_amount || 0,
      membershipBenefits: cartCalculation?.membership_benefits,
      isPriorityDelivery:
        cartCalculation?.membership_benefits?.priority_included ||
        cartCalculation?.is_priority ||
        prev.isPriorityDelivery,
    }));
  }, [orderItems, cartCalculation]);

  /**
   * Refresh cart data after successful payment
   * This is called after webhook clears the cart on the backend
   */
  const refreshCart = useCallback(async () => {
    try {
      // Invalidate cache to force refetch
      dispatch(cartApi.util.invalidateTags(["CartItems", "CartCheckout"]));

      // Clear local cart state
      dispatch(clearCart());
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  }, [dispatch]);

  const buildCheckoutPayload = useCallback(
    (
      address: DeliveryAddress,
      options: {
        isPriority: boolean;
        deliveryLeftAtDoor: boolean;
        deliveryInstructions: string;
      },
    ) => {
      if (!address) {
        throw new Error("Delivery address is required to create a checkout.");
      }

      const deliveryAddressPayload = address.id
        ? { address_id: address.id }
        : {
            delivery_name: address.delivery_name,
            address: address.address,
            address2: address.address2,
            city: address.city,
            zip_code: address.zip_code,
            country: address.country,
            latitude: address.latitude,
            longitude: address.longitude,
          };

      return {
        delivery_address: deliveryAddressPayload,
        priority_delivery: options.isPriority,
        delivery_left_at_door: options.deliveryLeftAtDoor,
        delivery_instructions: options.deliveryInstructions.trim(),
      };
    },
    [],
  );

  const updateCheckoutFromResponse = useCallback(
    (
      data: any,
      addressOverride?: DeliveryAddress,
      priorityOverride?: boolean,
      deliveryLeftAtDoorOverride?: boolean,
    ) => {
      if (!data) {
        return;
      }

      const {
        sub_total,
        delivery_fee,
        priority_fee,
        service_fee,
        vat,
        total_amount,
        checkout_id,
        is_priority,
        delivery_left_at_door,
        delivery_instructions,
        membership_benefits,
      } = data;

      setCheckoutState((prev) => ({
        ...prev,
        shippingAddress: addressOverride ?? prev.shippingAddress,
        subtotal: sub_total ?? prev.subtotal,
        serviceFee: service_fee ?? prev.serviceFee,
        tax: vat ?? prev.tax,
        shippingCost: delivery_fee ?? prev.shippingCost,
        priorityFee: priority_fee ?? prev.priorityFee,
        total: total_amount ?? prev.total,
        checkoutId: checkout_id ?? prev.checkoutId,
        membershipBenefits: membership_benefits ?? prev.membershipBenefits,
        isPriorityDelivery:
          membership_benefits?.priority_included ||
          (typeof is_priority === "boolean"
            ? is_priority
            : typeof priorityOverride === "boolean"
              ? priorityOverride
              : prev.isPriorityDelivery),
        deliveryLeftAtDoor:
          typeof delivery_left_at_door === "boolean"
            ? delivery_left_at_door
            : typeof deliveryLeftAtDoorOverride === "boolean"
              ? deliveryLeftAtDoorOverride
              : prev.deliveryLeftAtDoor,
        deliveryInstructions:
          typeof delivery_instructions === "string"
            ? delivery_instructions
            : prev.deliveryInstructions,
      }));
    },
    [],
  );

  const syncCheckoutWithServer = useCallback(
    async (
      address: DeliveryAddress,
      options: {
        isPriority: boolean;
        deliveryLeftAtDoor: boolean;
        deliveryInstructions: string;
      },
      addressOverride?: DeliveryAddress,
      priorityOverride?: boolean,
      deliveryLeftAtDoorOverride?: boolean,
    ) => {
      const payload = buildCheckoutPayload(address, options);
      const result = await createCheckout(payload).unwrap();

      if (result.checkout_data) {
        updateCheckoutFromResponse(
          result.checkout_data,
          addressOverride,
          priorityOverride,
          deliveryLeftAtDoorOverride,
        );
      }

      return result;
    },
    [buildCheckoutPayload, createCheckout, updateCheckoutFromResponse],
  );

  const getCheckoutOptions = useCallback(
    (overrides?: {
      isPriority?: boolean;
      deliveryLeftAtDoor?: boolean;
      deliveryInstructions?: string;
    }) => ({
      isPriority: overrides?.isPriority ?? checkoutState.isPriorityDelivery,
      deliveryLeftAtDoor:
        overrides?.deliveryLeftAtDoor ?? checkoutState.deliveryLeftAtDoor,
      deliveryInstructions:
        overrides?.deliveryInstructions ?? checkoutState.deliveryInstructions,
    }),
    [
      checkoutState.deliveryInstructions,
      checkoutState.deliveryLeftAtDoor,
      checkoutState.isPriorityDelivery,
    ],
  );

  /**
   * Handle payment processing
   * Processes payment and refreshes cart on success
   */
  const handlePayment = useCallback(async () => {
    if (!checkoutState.shippingAddress) {
      setAlertConfig({
        title: "Missing Address",
        message:
          "Please select a shipping address before proceeding to payment.",
        type: "error",
        isVisible: true,
        onConfirm() {
          setIsVisible(false);
        },
      });
      return;
    }

    const subtotal = cartCalculation?.sub_total ?? checkoutState.subtotal;
    const minimumStatus = resolveMinimumOrderStatus(
      subtotal,
      cartCalculation?.minimum_order_amount
    );
    const meetsMinimum =
      cartCalculation?.meets_minimum_order ?? minimumStatus.meetsMinimum;

    if (!meetsMinimum) {
      setAlertConfig({
        title: "Minimum Order Not Met",
        message:
          getMinimumOrderMessage(
            subtotal,
            checkoutState.shippingAddress?.country,
            cartCalculation?.minimum_order_amount
          ) ?? "Your cart does not meet the minimum order amount.",
        type: "warning",
        isVisible: true,
        onConfirm() {
          setIsVisible(false);
        },
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const syncResult = await syncCheckoutWithServer(
        checkoutState.shippingAddress,
        getCheckoutOptions(),
      );

      const syncedCheckout = syncResult.checkout_data;
      const paymentTotal = syncedCheckout?.total_amount ?? checkoutState.total;
      const paymentCheckoutId =
        syncedCheckout?.checkout_id ?? checkoutState.checkoutId;

      const checkoutData = {
        checkout_id: paymentCheckoutId,
        delivery_address_id: checkoutState.shippingAddress?.id,
        priority_delivery:
          syncedCheckout?.is_priority ?? checkoutState.isPriorityDelivery,
      };

      const paymentSuccess = await openPaymentSheet(
        paymentTotal,
        "Vhotis",
        checkoutData,
      );

      if (paymentSuccess) {
        const confirmationSnapshot = {
          items: checkoutState.items,
          subtotal: checkoutState.subtotal,
          serviceFee: checkoutState.serviceFee,
          tax: checkoutState.tax,
          shippingCost: checkoutState.shippingCost,
          priorityFee: checkoutState.priorityFee,
          total: checkoutState.total,
          isPriorityDelivery: checkoutState.isPriorityDelivery,
          shippingAddress: checkoutState.shippingAddress,
          paidAt: new Date().toISOString(),
        };

        await refreshCart();
        dispatch(membershipApi.util.invalidateTags(["Membership"]));

        showModal({
          modalType: "fullscreen",
          showCloseButton: false,
          component: React.createElement(OrderConfirmationComponent, {
            ...confirmationSnapshot,
            onViewOrders: () => {
              closeModal();
              router.replace("/main/mobile/(tabs)/profile/OrderHistoryScreen");
            },
            onContinueShopping: () => {
              closeModal();
              router.replace("/main/mobile/(tabs)/home/HomeScreen");
            },
          }),
          onClose: () => closeModal(),
        });
      }
    } catch (error) {
      console.error("Payment failed:", error);
      // Error handling is already done in usePayment hook
    } finally {
      setIsProcessingPayment(false);
    }
  }, [
    cartCalculation,
    checkoutState,
    dispatch,
    getCheckoutOptions,
    openPaymentSheet,
    refreshCart,
    setAlertConfig,
    setIsVisible,
    showModal,
    closeModal,
    syncCheckoutWithServer,
  ]);

  /**
   * Handle shipping form submission
   * Creates checkout with delivery address and calculates fees
   */
  const handleShippingSubmit = useCallback(
    async (address: DeliveryAddress) => {
      try {
        console.log("Received address in useCheckout:", address);
        console.log("Address ID:", address.id);

        await syncCheckoutWithServer(address, getCheckoutOptions(), address);
        setCurrentStep(1);
      } catch (error: any) {
        console.error("Error creating checkout:", error);
        const errorMessage =
          error?.data?.error ||
          error?.error ||
          "We couldn't calculate checkout totals. Please try again.";

        setAlertConfig({
          title: "Checkout Unavailable",
          message: errorMessage,
          type: "error",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
      }
    },
    [getCheckoutOptions, setAlertConfig, setIsVisible, syncCheckoutWithServer],
  );

  const recalculateCheckout = useCallback(async () => {
    if (!checkoutState.shippingAddress) {
      return;
    }

    try {
      await syncCheckoutWithServer(
        checkoutState.shippingAddress,
        getCheckoutOptions(),
      );
    } catch (error) {
      console.error("Error recalculating checkout:", error);
    }
  }, [
    checkoutState.shippingAddress,
    getCheckoutOptions,
    syncCheckoutWithServer,
  ]);

  const handlePriorityToggle = useCallback(
    async (enable: boolean) => {
      if (checkoutState.membershipBenefits?.priority_included) {
        return;
      }

      if (!checkoutState.shippingAddress) {
        setAlertConfig({
          title: "Add Delivery Address",
          message:
            "Please save a delivery address before enabling priority delivery.",
          type: "warning",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
        return;
      }

      setIsUpdatingPriority(true);
      try {
        await syncCheckoutWithServer(
          checkoutState.shippingAddress,
          getCheckoutOptions({ isPriority: enable }),
          checkoutState.shippingAddress,
          enable,
        );
      } catch (error) {
        console.error("Error updating priority delivery:", error);
        setAlertConfig({
          title: "Priority Update Failed",
          message: "We couldn't update priority delivery. Please try again.",
          type: "error",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
        throw error;
      } finally {
        setIsUpdatingPriority(false);
      }
    },
    [
      checkoutState.membershipBenefits?.priority_included,
      checkoutState.shippingAddress,
      getCheckoutOptions,
      setAlertConfig,
      setIsVisible,
      syncCheckoutWithServer,
    ],
  );

  const handleDeliveryInstructionsChange = useCallback((text: string) => {
    setCheckoutState((prev) => ({
      ...prev,
      deliveryInstructions: text,
    }));
  }, []);

  const persistDeliveryOptions = useCallback(
    async (instructionsOverride?: string) => {
      if (!checkoutState.shippingAddress) {
        return;
      }

      setIsUpdatingDeliveryOptions(true);
      try {
        await syncCheckoutWithServer(
          checkoutState.shippingAddress,
          getCheckoutOptions({
            deliveryInstructions:
              instructionsOverride ?? checkoutState.deliveryInstructions,
          }),
        );
      } catch (error) {
        console.error("Error saving delivery options:", error);
      } finally {
        setIsUpdatingDeliveryOptions(false);
      }
    },
    [
      checkoutState.deliveryInstructions,
      checkoutState.shippingAddress,
      getCheckoutOptions,
      syncCheckoutWithServer,
    ],
  );

  const handleLeaveAtDoorToggle = useCallback(
    async (enable: boolean) => {
      if (!checkoutState.shippingAddress) {
        setAlertConfig({
          title: "Add Delivery Address",
          message:
            "Please save a delivery address before updating delivery options.",
          type: "warning",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
        return;
      }

      setCheckoutState((prev) => ({
        ...prev,
        deliveryLeftAtDoor: enable,
      }));

      setIsUpdatingDeliveryOptions(true);
      try {
        await syncCheckoutWithServer(
          checkoutState.shippingAddress,
          getCheckoutOptions({ deliveryLeftAtDoor: enable }),
          checkoutState.shippingAddress,
          undefined,
          enable,
        );
      } catch (error) {
        console.error("Error updating leave at door option:", error);
        setCheckoutState((prev) => ({
          ...prev,
          deliveryLeftAtDoor: !enable,
        }));
        setAlertConfig({
          title: "Update Failed",
          message:
            "We couldn't update your delivery preference. Please try again.",
          type: "error",
          isVisible: true,
          onConfirm() {
            setIsVisible(false);
          },
        });
        throw error;
      } finally {
        setIsUpdatingDeliveryOptions(false);
      }
    },
    [
      checkoutState.shippingAddress,
      getCheckoutOptions,
      setAlertConfig,
      setIsVisible,
      syncCheckoutWithServer,
    ],
  );

  return {
    // State
    currentStep,
    setCurrentStep,
    checkoutState,
    setCheckoutState,
    orderItems,

    // Loading states
    isLoading,
    isCreatingCheckout,
    isProcessingPayment,
    isUpdatingPriority,
    isUpdatingDeliveryOptions,

    // Methods
    handleShippingSubmit,
    handlePayment,
    refreshCart,
    handlePriorityToggle,
    handleLeaveAtDoorToggle,
    handleDeliveryInstructionsChange,
    persistDeliveryOptions,
    recalculateCheckout,
  };
};

export default useCheckout;
