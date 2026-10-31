import React, { useMemo, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import {
  MembershipTier,
  UserMembership,
  MembershipStatus,
  useCreateMembershipMutation,
  useCancelMembershipMutation,
} from "@/app/store/main/api/membershipApi";
import {
  useGetPlansQuery,
  useGetCurrentMembershipQuery,
} from "@/app/store/main/api/membershipApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { formatCurrency, formatDate } from "@/app/_utils/main/helpers";

export interface MembershipHookResponse {
  plans: MembershipTier[];
  membership: UserMembership;
  selectedPlan?: MembershipTier;
  isSubscribed: boolean;
  isPendingCancellation: boolean;
  getPlanById: (planId: string) => MembershipTier | undefined;
  // Plan selection methods
  handlePlanSelect: (plan: MembershipTier) => void;
  handleCreateMembership: (plan: MembershipTier) => Promise<void>;
  handleCancelMembership: () => void;
  isCreatingMembership: boolean;
  isCancelingMembership: boolean;
  // Status utility methods
  formatStatusLabel: (
    status?: MembershipStatus | "pending" | "expired"
  ) => string;
  resolveStatusColor: (
    status?: MembershipStatus | "pending" | "expired"
  ) => string;
  // Info modal method
  handleShowInfoModal: () => void;
}

/**
 * Format status label for display
 */
export const formatStatusLabel = (
  status?: MembershipStatus | "pending" | "expired"
): string => {
  if (!status) {
    return "Status unavailable";
  }
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

/**
 * Hook that fetches membership data from the server API and provides membership-related methods.
 */
const useMembership = (): MembershipHookResponse => {
  // Fetch plans from API
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useGetPlansQuery();

  // Fetch current membership from API
  const {
    data: membershipData,
    isLoading: membershipLoading,
    error: membershipError,
  } = useGetCurrentMembershipQuery();

  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier | null>(null);

  // Hooks for services
  const [createMembership, { isLoading: isCreatingMembership }] =
    useCreateMembershipMutation();
  const [cancelMembership, { isLoading: isCancelingMembership }] =
    useCancelMembershipMutation();
  const { showCenterModal, closeModal } = useModalService();
  const { showSnackbar } = useSnackbar();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const accentColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const iconColor = useThemeColor({}, "icons");
  const mutedTextColor = iconColor;

  // Transform plans data from API response
  const plans: MembershipTier[] = useMemo(() => {
    if (!plansData?.plans) {
      return [];
    }
    return plansData.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tagLine: plan.tagLine,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      yearlyBillingText: plan.yearlyBillingText,
      badge: plan.badge,
      features: plan.features || [],
    }));
  }, [plansData]);

  // Transform membership data from API response
  const membership: UserMembership = useMemo(() => {
    if (!membershipData?.membership) {
      // Return default membership if none exists
      return {
        status: "expired",
        billingCycle: "monthly",
      };
    }

    const mem = membershipData.membership;
    return {
      currentPlan: mem.currentPlan,
      status: mem.status,
      renewsOn: mem.renewsOn,
      billingCycle: "monthly",
      freeDeliveryUsed: mem.freeDeliveryUsed,
      freeDeliveryAvailable: mem.freeDeliveryAvailable,
      autoRenew: mem.autoRenew,
      cancelAtPeriodEnd: mem.cancelAtPeriodEnd,
      cancelsOn: mem.cancelsOn,
    };
  }, [membershipData]);

  const selectedPlanFromMembership = useMemo(() => {
    if (!membership.currentPlan) {
      return undefined;
    }
    // Find plan by name match (currentPlan is the tier name)
    return plans.find((plan) => plan.name === membership.currentPlan);
  }, [plans, membership.currentPlan]);

  const isSubscribed = membership.status === "active";
  const isPendingCancellation =
    isSubscribed && membership.cancelAtPeriodEnd === true;

  const getPlanById = (planId: string) =>
    plans.find((plan) => plan.id === planId);

  // Plan selection handler
  const handlePlanSelect = (plan: MembershipTier) => {
    setSelectedPlan(plan);
    setIsModalVisible(true);

    const formattedPrice = formatCurrency(plan.monthlyPrice);
    const billingText = "per month";

    // Show confirmation modal
    showCenterModal(
      <View style={{ gap: 16, padding: 4 }}>
        <View style={{ gap: 8 }}>
          <StyledText variant="bodyMedium" style={{ color: textColor }}>
            You're about to subscribe to:
          </StyledText>
          <View
            style={{
              backgroundColor: cardColor,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <StyledText
              variant="titleSmall"
              style={{ color: textColor, marginBottom: 4 }}
            >
              {plan.name}
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: textColor }}>
              {formattedPrice} {billingText}
            </StyledText>
            {plan.tagLine && (
              <StyledText
                variant="bodySmall"
                style={{ color: textColor, marginTop: 4, opacity: 0.7 }}
              >
                {plan.tagLine}
              </StyledText>
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Pressable
            onPress={() => {
              setIsModalVisible(false);
              setSelectedPlan(null);
            }}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor,
              alignItems: "center",
            }}
          >
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              Cancel
            </StyledText>
          </Pressable>
          <Pressable
            onPress={async () => {
              setIsModalVisible(false);
              setSelectedPlan(null);
              // Wait a bit for modal to close before creating membership
              await new Promise((resolve) => setTimeout(resolve, 300));
              if (plan) {
                handleCreateMembership(plan);
              }
            }}
            disabled={isCreatingMembership}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: accentColor,
              alignItems: "center",
              opacity: isCreatingMembership ? 0.6 : 1,
            }}
          >
            {isCreatingMembership ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <StyledText
                variant="labelLarge"
                style={{ color: "white", fontFamily: "RobotoMedium" }}
              >
                Confirm
              </StyledText>
            )}
          </Pressable>
        </View>
      </View>,
      "Confirm Membership",
      () => {
        setIsModalVisible(false);
        setSelectedPlan(null);
      }
    );
  };

  // Create membership handler
  const handleCreateMembership = async (plan: MembershipTier) => {
    try {
      const result = await createMembership({
        tierId: plan.id,
        billingCycle: "monthly",
      }).unwrap();

      // Check if payment sheet is needed
      if (result.paymentSheet) {
        // Payment sheet needed - initialize and present payment sheet
        try {
          const { paymentIntent, ephemeralKey, customer } = result.paymentSheet;

          // Initialize payment sheet
          const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: paymentIntent,
            merchantDisplayName: "Vhotis",
            customerEphemeralKeySecret: ephemeralKey,
            customerId: customer,
            returnURL: "vhotis://payment-success",
            applePay: {
              merchantCountryCode: "IE",
            },
            googlePay: {
              merchantCountryCode: "IE",
              testEnv: __DEV__,
              currencyCode: "EUR",
            },
            allowsDelayedPaymentMethods: true,
          });

          if (initError) {
            console.error("Payment sheet initialization error:", initError);
            showSnackbar(
              "Failed to initialize payment. Please try again.",
              "error"
            );
            return;
          }

          // Present payment sheet
          const { error: presentError } = await presentPaymentSheet();

          if (presentError) {
            if (presentError.code === "Canceled") {
              console.log("Payment was canceled by user");
              showSnackbar("Payment was canceled", "info");
              return;
            }

            console.error("Payment sheet error:", presentError);
            showSnackbar(
              presentError.message || "Payment failed. Please try again.",
              "error"
            );
            return;
          }

          // Payment successful - webhook will activate membership
          showSnackbar(
            "Payment successful! Your membership will be activated shortly.",
            "success"
          );

          // Navigate to membership screen after a short delay
          setTimeout(() => {
            try {
              router.replace("/main/mobile/(tabs)/menu/MembershipScreen");
            } catch (error) {
              console.error("Navigation error:", error);
              router.push("/main/mobile/(tabs)/menu/MembershipScreen");
            }
          }, 1500);
        } catch (paymentError: any) {
          console.error("Error processing payment:", paymentError);
          showSnackbar(
            paymentError?.message ||
              "An error occurred during payment. Please try again.",
            "error"
          );
        }
      } else {
        // Free plan - already activated
        showSnackbar(
          result.message || "Membership activated successfully!",
          "success"
        );

        // Navigate to membership screen after a short delay
        setTimeout(() => {
          try {
            router.replace("/main/mobile/(tabs)/menu/MembershipScreen");
          } catch (error) {
            console.error("Navigation error:", error);
            router.push("/main/mobile/(tabs)/menu/MembershipScreen");
          }
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.details ||
        "Failed to create membership. Please try again.";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleCancelMembership = () => {
    const accessUntil = membership.cancelsOn || membership.renewsOn;

    showCenterModal(
      <View style={{ gap: 16, padding: 4 }}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          Cancel your membership? You&apos;ll keep all member perks until the
          end of your current billing period
          {accessUntil ? ` (${formatDate(accessUntil)})` : ""}.
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: textColor, opacity: 0.75 }}>
          After that, free delivery, priority delivery, and delivery discounts
          will no longer apply.
        </StyledText>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Pressable
            onPress={() => closeModal()}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor,
              alignItems: "center",
            }}
          >
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              Keep membership
            </StyledText>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const result = await cancelMembership().unwrap();
                closeModal();
                showSnackbar(
                  result.message ||
                    "Membership will cancel at the end of your billing period.",
                  "success"
                );
              } catch (error: any) {
                const errorMessage =
                  error?.data?.error ||
                  "Failed to cancel membership. Please try again.";
                showSnackbar(errorMessage, "error");
              }
            }}
            disabled={isCancelingMembership}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: warningColor,
              alignItems: "center",
              opacity: isCancelingMembership ? 0.6 : 1,
            }}
          >
            {isCancelingMembership ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <StyledText
                variant="labelLarge"
                style={{ color: "white", fontFamily: "RobotoMedium" }}
              >
                Cancel membership
              </StyledText>
            )}
          </Pressable>
        </View>
      </View>,
      "Cancel Membership",
      () => {}
    );
  };

  // Resolve status color
  const resolveStatusColor = (
    status?: MembershipStatus | "pending" | "expired"
  ): string => {
    switch (status) {
      case "active":
        return successColor;
      case "past_due":
        return warningColor;
      default:
        return mutedTextColor;
    }
  };

  // Show info modal handler
  const handleShowInfoModal = () => {
    showCenterModal(
      <View style={{ gap: 12 }}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          Your monthly membership includes:
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: textColor }}>
          • 1 free delivery each billing month
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: textColor }}>
          • Priority delivery on every order at no extra cost
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: textColor }}>
          • Free delivery on orders over €50 after your monthly free delivery is used
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: textColor }}>
          • Orders under €50 pay standard delivery once the free delivery is used
        </StyledText>
      </View>,
      "Membership Benefits",
      () => {}
    );
  };

  return {
    plans,
    membership,
    selectedPlan: selectedPlanFromMembership,
    isSubscribed,
    isPendingCancellation,
    getPlanById,
    handlePlanSelect,
    handleCreateMembership,
    handleCancelMembership,
    isCreatingMembership,
    isCancelingMembership,
    formatStatusLabel,
    resolveStatusColor,
    handleShowInfoModal,
  };
};

export default useMembership;
