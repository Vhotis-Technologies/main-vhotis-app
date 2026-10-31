import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import PromotionPayment from "@/app/component/seller/promotions/PromotionPayment";
import PromotionForm from "@/app/component/seller/promotions/PromotionForm";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import usePromotions from "@/app/hook/seller/usePromotions";
import { useAppDispatch } from "@/app/store/store";
import { setProductSelectedProducts } from "@/app/store/seller/slice/promotionSlice";
import {
  currencySymbolForCountry,
  formatStoreMoney,
} from "@/app/_utils/storeCurrency";

const PromotionsScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    productId?: string;
    productName?: string;
  }>();

  const {
    isPaymentModalVisible,
    showPaymentModal,
    hidePaymentModal,
    productPaymentDetails,
    canLaunchProductPromotion,
    resetProductPromotion,
    promotionAccess,
  } = usePromotions();

  const [prefillHandled, setPrefillHandled] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const isDark = backgroundColor === "#000";

  const { storeCountry, currencySymbol, promotionsRequirePayment, campaignFee } =
    promotionAccess;

  useEffect(() => {
    if (prefillHandled) return;
    if (params.productId && params.productName) {
      dispatch(
        setProductSelectedProducts([
          { id: String(params.productId), name: String(params.productName) },
        ])
      );
      setPrefillHandled(true);
    }
  }, [dispatch, params.productId, params.productName, prefillHandled]);

  const modalDetails = useMemo(() => {
    const selectedProducts = productPaymentDetails.selectedProducts ?? [];
    const productNames = selectedProducts.map((product) => product.name);
    const productIds = selectedProducts.map((product) => product.id);

    let displayDiscountValue: string | undefined;
    let discountValue: string | undefined;
    if (productPaymentDetails.dealType === "percentage") {
      discountValue = productPaymentDetails.dealValue || undefined;
      displayDiscountValue = discountValue ? `${discountValue}%` : undefined;
    } else if (productPaymentDetails.dealType === "fixed") {
      discountValue = productPaymentDetails.fixedAmount || undefined;
      displayDiscountValue = discountValue
        ? `${currencySymbol}${discountValue}`
        : undefined;
    } else if (productPaymentDetails.dealType === "bogo") {
      displayDiscountValue = `Buy ${
        productPaymentDetails.bogoBuyQuantity || 0
      } get ${productPaymentDetails.bogoGetQuantity || 0}`;
    } else if (productPaymentDetails.dealType === "bundle") {
      displayDiscountValue = `${
        productPaymentDetails.bundleQuantity || 0
      } for ${currencySymbol}${productPaymentDetails.bundlePrice || "0"}`;
    }

    return {
      promotionType: "product" as const,
      dealType: productPaymentDetails.dealType,
      discountValue,
      displayDiscountValue,
      usageLimit: productPaymentDetails.usageLimit,
      productIds,
      productNames,
      startDate: productPaymentDetails.startDate ?? undefined,
      endDate: productPaymentDetails.endDate ?? undefined,
      bogoBuyQuantity: productPaymentDetails.bogoBuyQuantity,
      bogoGetQuantity: productPaymentDetails.bogoGetQuantity,
      bundlePrice: productPaymentDetails.bundlePrice,
      bundleQuantity: productPaymentDetails.bundleQuantity,
      campaignFee,
      promotionsRequirePayment,
      storeCountry,
    };
  }, [
    campaignFee,
    currencySymbol,
    productPaymentDetails,
    promotionsRequirePayment,
    storeCountry,
  ]);

  const prefillName = params.productName ? String(params.productName) : null;

  const ctaTitle = !promotionAccess.allowsPromotions
    ? "Upgrade to create deals"
    : promotionsRequirePayment
      ? "Review & Pay"
      : "Review & Create";

  if (!promotionAccess.allowsPromotions) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.blockedCard, { backgroundColor: cardColor, borderColor }]}>
          <MaterialIcons name="lock" size={40} color={iconColor} />
          <StyledText
            variant="titleMedium"
            style={{ color: textColor, fontWeight: "700", textAlign: "center" }}
          >
            Deals are not on Starter
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={{ color: iconColor, textAlign: "center", marginTop: 8 }}
          >
            Upgrade to Lite, Enterprise, or Enterprise Plus to run percentage, fixed,
            BOGO, and bundle campaigns.
          </StyledText>
          <StyledButton
            title="View plans"
            variant="tonal"
            onPress={() => router.push("/seller/main/store/SubscriptionPlans")}
            buttonStyles={{ marginTop: 20, width: "100%" }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push("/seller/main/sponsored/SponsorScreen")
          }
          style={[
            styles.linkCard,
            {
              backgroundColor,
              borderColor,
            },
          ]}
        >
          <MaterialIcons name="campaign" size={20} color="#6366F1" />
          <View style={{ flex: 1 }}>
            <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
              Need more visibility?
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              Sponsored listings are managed separately
            </StyledText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push("/seller/main/promotions/PromotionHistoryScreen")
          }
          style={[
            styles.historyLink,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <MaterialIcons name="history" size={20} color={buttonColor} />
          <View style={{ flex: 1 }}>
            <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
              Deal history
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              Past and active discount campaigns
            </StyledText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={iconColor} />
        </TouchableOpacity>

        {prefillName ? (
          <View
            style={[
              styles.banner,
              { backgroundColor, borderColor },
            ]}
          >
            <MaterialIcons name="local-offer" size={18} color="#0E7490" />
            <StyledText variant="bodySmall" style={{ color: textColor, flex: 1 }}>
              Creating a deal for{" "}
              <StyledText style={{ fontWeight: "700" }}>{prefillName}</StyledText>
            </StyledText>
          </View>
        ) : null}

        <PromotionForm />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          {promotionsRequirePayment
            ? `Campaign fee: ${formatStoreMoney(campaignFee, storeCountry)} (flat, any duration)`
            : "Campaign fee included on your plan"}
        </StyledText>
        <StyledButton
          title={ctaTitle}
          variant="tonal"
          onPress={() => {
            if (!canLaunchProductPromotion) return;
            showPaymentModal();
          }}
          disabled={!canLaunchProductPromotion}
          buttonStyles={[
            styles.cta,
            canLaunchProductPromotion && {
              backgroundColor: buttonColor,
              borderWidth: 0,
            },
          ]}
          textStyles={canLaunchProductPromotion ? { color: "#fff" } : undefined}
        />
      </View>

      <PromotionPayment
        isVisible={isPaymentModalVisible}
        onClose={hidePaymentModal}
        promotionDetails={modalDetails}
        onPaymentComplete={() => {
          hidePaymentModal();
          resetProductPromotion();
        }}
      />
    </View>
  );
};

export default PromotionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: { width: "100%" },
  blockedCard: {
    flex: 1,
    margin: 24,
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
