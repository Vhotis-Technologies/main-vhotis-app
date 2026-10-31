import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import SubscriptionTierComponent from "@/app/component/seller/subscription/SubscriptionTierComponent";
import SubscriptionBillingToggle, {
  SubscriptionBillingCycle,
} from "@/app/component/seller/subscription/SubscriptionBillingToggle";
import useSellerSubcription from "@/app/hook/seller/useSellerSubcription";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useCreateSubscriptionMutation,
  useConfirmSubscriptionPaymentMutation,
} from "@/app/store/seller/api/subscriptionApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import SubscriptionTier from "@/app/interfaces/seller/SubscriptionInterface";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useAppDispatch } from "@/app/store/store";
import { mergeAuthenticatedUser } from "@/app/store/main/slices/authSlice";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

const SubscriptionPlans = () => {
  useRequireSellerOwner();

  const insets = useSafeAreaInsets();
  const { plans, subscription } = useSellerSubcription();
  const [billingCycle, setBillingCycle] =
    useState<SubscriptionBillingCycle>("monthly");

  const [createSubscription, { isLoading: isCreatingSubscription }] =
    useCreateSubscriptionMutation();
  const [confirmSubscriptionPayment] = useConfirmSubscriptionPaymentMutation();
  const dispatch = useAppDispatch();
  const { showCenterModal, closeAllModals } = useModalService();
  const { showSnackbar } = useSnackbar();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const backgroundColor = useThemeColor({}, "background");
  const accentColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const iconMuted = useThemeColor({}, "icons");

  const yearlySavingsLabel = useMemo(() => {
    const paid = plans.filter((p) => (p.monthlyPrice ?? 0) > 0);
    if (!paid.length) return undefined;
    const plan = paid[0];
    if (!plan.monthlyPrice || !plan.yearlyPrice) return "Save 8%";
    const annualFromMonthly = plan.monthlyPrice * 12;
    if (annualFromMonthly <= 0) return undefined;
    const pct = Math.round((1 - plan.yearlyPrice / annualFromMonthly) * 100);
    return pct > 0 ? `Save ${pct}%` : undefined;
  }, [plans]);

  const featuredIndex = useMemo(() => {
    const badgeIdx = plans.findIndex((p) => p.badge);
    if (badgeIdx >= 0) return badgeIdx;
    const paidIdx = plans.findIndex((p) => (p.monthlyPrice ?? 0) > 0);
    return paidIdx >= 0 ? paidIdx : 0;
  }, [plans]);

  const handleCreateSubscription = useCallback(
    async (plan: SubscriptionTier) => {
      try {
        const result = await createSubscription({
          tierId: plan.id,
          billingCycle,
        }).unwrap();

        if (result.paymentSheet) {
          try {
            const { paymentIntent, ephemeralKey, customer } =
              result.paymentSheet;
            const { error: initError } = await initPaymentSheet({
              paymentIntentClientSecret: paymentIntent,
              merchantDisplayName: "Vhotis",
              customerEphemeralKeySecret: ephemeralKey,
              customerId: customer,
              returnURL: "vhotis://payment-success",
              applePay: { merchantCountryCode: "IE" },
              googlePay: {
                merchantCountryCode: "IE",
                testEnv: __DEV__,
                currencyCode: "EUR",
              },
              allowsDelayedPaymentMethods: true,
            });

            if (initError) {
              showSnackbar(
                "Failed to initialize payment. Please try again.",
                "error",
              );
              return;
            }

            const { error: presentError } = await presentPaymentSheet();
            if (presentError) {
              if (presentError.code === "Canceled") {
                showSnackbar("Payment was canceled", "info");
                return;
              }
              showSnackbar(
                presentError.message || "Payment failed. Please try again.",
                "error",
              );
              return;
            }

            const subscriptionId = result.subscription?.id;
            if (!subscriptionId) {
              showSnackbar(
                "Payment received but subscription could not be confirmed. Contact support.",
                "error",
              );
              return;
            }

            try {
              const confirmResult = await confirmSubscriptionPayment({
                subscriptionId,
              }).unwrap();

              if (confirmResult.entitlements) {
                dispatch(mergeAuthenticatedUser(confirmResult.entitlements));
              }

              showSnackbar(
                confirmResult.message || "Subscription activated successfully!",
                "success",
              );
            } catch (confirmError: unknown) {
              const err = confirmError as { data?: { error?: string } };
              showSnackbar(
                err?.data?.error ||
                  "Payment succeeded but activation failed. Pull to refresh or contact support.",
                "error",
              );
              return;
            }

            setTimeout(() => {
              router.replace("/seller/main/store/SubscriptionScreen");
            }, 1500);
          } catch (paymentError: unknown) {
            const message =
              paymentError instanceof Error
                ? paymentError.message
                : "An error occurred during payment.";
            showSnackbar(message, "error");
          }
        } else {
          showSnackbar(
            result.message || "Subscription activated successfully!",
            "success",
          );
          setTimeout(() => {
            router.replace("/seller/main/store/SubscriptionScreen");
          }, 1500);
        }
      } catch (error: unknown) {
        const err = error as { data?: { error?: string; details?: string } };
        showSnackbar(
          err?.data?.error ||
            err?.data?.details ||
            "Failed to create subscription. Please try again.",
          "error",
        );
      }
    },
    [
      billingCycle,
      confirmSubscriptionPayment,
      createSubscription,
      dispatch,
      initPaymentSheet,
      presentPaymentSheet,
      showSnackbar,
    ],
  );

  const handlePlanSelect = useCallback(
    (plan: SubscriptionTier) => {
      const price =
        billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
      const formattedPrice = formatCurrency(price);
      const billingText = billingCycle === "yearly" ? "per year" : "per month";

      showCenterModal(
        <View style={styles.modalBody}>
          <StyledText variant="bodyMedium" style={{ color: textColor }}>
            Subscribe to {plan.name}?
          </StyledText>
          <View
            style={[
              styles.modalPlanCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <StyledText variant="titleSmall" style={{ color: textColor }}>
              {formattedPrice} {billingText}
            </StyledText>
            {plan.tagLine ? (
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 4 }}
              >
                {plan.tagLine}
              </StyledText>
            ) : null}
          </View>
          <View style={styles.modalActions}>
            <Pressable
              onPress={closeAllModals}
              style={[styles.modalBtn, styles.modalBtnGhost, { borderColor }]}
            >
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                Cancel
              </StyledText>
            </Pressable>
            <Pressable
              onPress={async () => {
                closeAllModals();
                await new Promise((r) => setTimeout(r, 300));
                handleCreateSubscription(plan);
              }}
              disabled={isCreatingSubscription}
              style={[
                styles.modalBtn,
                {
                  backgroundColor: accentColor,
                  opacity: isCreatingSubscription ? 0.6 : 1,
                },
              ]}
            >
              {isCreatingSubscription ? (
                <ActivityIndicator size="small" color={backgroundColor} />
              ) : (
                <StyledText
                  variant="labelLarge"
                  style={{ color: backgroundColor, fontWeight: "700" }}
                >
                  Confirm
                </StyledText>
              )}
            </Pressable>
          </View>
        </View>,
        "Confirm plan",
        closeAllModals,
      );
    },
    [
      billingCycle,
      accentColor,
      backgroundColor,
      borderColor,
      cardColor,
      closeAllModals,
      handleCreateSubscription,
      iconMuted,
      isCreatingSubscription,
      showCenterModal,
      textColor,
    ],
  );

  if (!plans.length) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator color={accentColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: iconMuted, marginTop: 12 }}
        >
          Loading plans…
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 24 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <StyledText
          variant="headlineSmall"
          style={{ color: textColor, fontWeight: "800" }}
        >
          Choose your plan
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{ color: iconMuted, marginTop: 6 }}
        >
          Scroll to compare all tiers. Switch billing before you subscribe.
        </StyledText>
        <View style={styles.toggleRow}>
          <SubscriptionBillingToggle
            value={billingCycle}
            onChange={setBillingCycle}
            yearlySavingsLabel={yearlySavingsLabel}
          />
        </View>
      </View>

      <View style={styles.planList}>
        {plans.map((plan, index) => {
          const isActive =
            Boolean(subscription.currentPlan) &&
            plan.name === subscription.currentPlan &&
            subscription.status === "active";

          return (
            <View key={plan.id} style={styles.planItem}>
              <SubscriptionTierComponent
                plan={plan}
                billingCycle={billingCycle}
                isActive={isActive}
                isFeatured={index === featuredIndex}
                cardWidth={CARD_WIDTH}
                onSelect={handlePlanSelect}
              />
            </View>
          );
        })}
      </View>

      <StyledText
        variant="labelSmall"
        style={[styles.footerHint, { color: iconMuted }]}
      >
        {plans.length} plans available
      </StyledText>
    </ScrollView>
  );
};

export default SubscriptionPlans;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  toggleRow: {
    marginTop: 16,
    alignItems: "center",
  },
  planList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
    alignItems: "center",
  },
  planItem: {
    width: "100%",
    alignItems: "center",
  },
  footerHint: {
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  modalBody: {
    gap: 16,
    padding: 4,
  },
  modalPlanCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnGhost: {
    borderWidth: 1,
  },
});
