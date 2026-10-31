import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useSellerPayment from "@/app/hook/seller/useSellerPayment";
import { PromotionPaymentData } from "@/app/store/seller/api/sellerPaymentApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { formatStoreMoney } from "@/app/_utils/storeCurrency";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  ProductDealType,
} from "@/app/interfaces/seller/PromotionsInterface";
import { useCreateProductPromotionMutation } from "@/app/store/seller/api/promotionApi";
import { usePromotionRates } from "@/app/hook/seller/usePromotionRates";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";

const ACCENT = "#0E7490";

const formatDate = (date?: Date | string) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const DEAL_META: Record<
  string,
  { label: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  percentage: { label: "Percentage off", icon: "percent" },
  fixed: { label: "Fixed amount off", icon: "attach-money" },
  bogo: { label: "Buy one get one", icon: "card-giftcard" },
  bundle: { label: "Bundle deal", icon: "layers" },
};

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isLast?: boolean;
};

const InfoRow = ({
  icon,
  label,
  value,
  textColor,
  mutedColor,
  borderColor,
  isLast,
}: InfoRowProps) => (
  <View
    style={[
      styles.infoRow,
      {
        borderBottomColor: borderColor,
        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      },
    ]}
  >
    <View style={[styles.infoIconWrap, { backgroundColor: `${ACCENT}14` }]}>
      <MaterialIcons name={icon} size={18} color={ACCENT} />
    </View>
    <View style={styles.infoCopy}>
      <StyledText variant="labelSmall" style={{ color: mutedColor }}>
        {label}
      </StyledText>
      <StyledText variant="bodyMedium" style={{ color: textColor, fontWeight: "600" }}>
        {value}
      </StyledText>
    </View>
  </View>
);

export interface PromotionPaymentContentProps {
  onClose: () => void;
  promotionDetails: {
    startDate?: Date | string;
    endDate?: Date | string;
    name?: string;
    dealType?: string;
    discountValue?: string;
    displayDiscountValue?: string;
    minimumPurchase?: string;
    maxDiscount?: string;
    usageLimit?: string;
    productIds?: string[];
    productNames?: string[];
    bogoBuyQuantity?: string;
    bogoGetQuantity?: string;
    bundlePrice?: string;
    bundleQuantity?: string;
    campaignFee?: number;
    promotionsRequirePayment?: boolean;
    storeCountry?: string;
  };
  onPaymentComplete: () => void;
}

const PromotionPaymentContent = ({
  onClose,
  promotionDetails,
  onPaymentComplete,
}: PromotionPaymentContentProps) => {
  const { openPaymentSheet } = useSellerPayment();
  const { rates } = usePromotionRates();
  const [isProcessing, setIsProcessing] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const [createProductPromotion] = useCreateProductPromotionMutation();
  const storeId = useCampaignHistoryStoreId();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const isDark = backgroundColor === "#000";

  const storeCountry = promotionDetails.storeCountry ?? "";
  const promotionsRequirePayment =
    promotionDetails.promotionsRequirePayment ?? true;
  const campaignFee =
    promotionDetails.campaignFee ??
    rates.promotionCreationFee ??
    rates.promotionCampaignFee ??
    5;

  const calculatedPrice = promotionsRequirePayment ? campaignFee : 0;

  const formatMoney = (amount: number) =>
    formatStoreMoney(amount, storeCountry);

  const products = useMemo(
    () => promotionDetails.productNames ?? [],
    [promotionDetails.productNames]
  );

  const dealMeta = DEAL_META[promotionDetails.dealType ?? "percentage"] ?? DEAL_META.percentage;
  const savingsLabel =
    promotionDetails.displayDiscountValue ??
    promotionDetails.discountValue ??
    "—";

  const dateRange = `${formatDate(promotionDetails.startDate)} – ${formatDate(promotionDetails.endDate)}`;

  const handlePayment = async () => {
    setIsProcessing(true);
    setCreationError(null);
    try {
      const startDate = promotionDetails.startDate
        ? new Date(promotionDetails.startDate).toISOString()
        : new Date().toISOString();
      const endDate = promotionDetails.endDate
        ? new Date(promotionDetails.endDate).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const productPromotionPayload = {
        name: promotionDetails.name || "",
        dealType: promotionDetails.dealType || "percentage",
        productIds: promotionDetails.productIds || [],
        discountValue: promotionDetails.discountValue,
        minimumPurchase: promotionDetails.minimumPurchase,
        maxDiscount: promotionDetails.maxDiscount,
        usageLimit: promotionDetails.usageLimit,
        startDate,
        endDate,
      };

      let paymentIntentId: string | undefined;

      if (!promotionsRequirePayment) {
        paymentIntentId = `promotion_waived_${Date.now()}`;
      } else {
        const paymentData: PromotionPaymentData = {
          promotion_type: "promotion",
          storeId,
          promotion_data: productPromotionPayload,
        };

        const paymentResult = await openPaymentSheet(paymentData, "Vhotis");

        if (!paymentResult.success) {
          setIsProcessing(false);
          return;
        }

        paymentIntentId = paymentResult.paymentIntentId;
        if (!paymentIntentId) {
          setIsProcessing(false);
          return;
        }
      }

      await createProductPromotion({
        paymentIntentId: paymentIntentId!,
        storeId,
        dealType: (promotionDetails.dealType as ProductDealType) || "percentage",
        discountValue: promotionDetails.discountValue,
        minimumPurchase: promotionDetails.minimumPurchase,
        maxDiscount: promotionDetails.maxDiscount,
        usageLimit: promotionDetails.usageLimit,
        productIds: promotionDetails.productIds || [],
        bogoBuyQuantity: promotionDetails.bogoBuyQuantity,
        bogoGetQuantity: promotionDetails.bogoGetQuantity,
        bundlePrice: promotionDetails.bundlePrice,
        bundleQuantity: promotionDetails.bundleQuantity,
        startDate,
        endDate,
      }).unwrap();

      onPaymentComplete();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string }; message?: string };
      setCreationError(
        err?.data?.error ||
          err?.message ||
          "Unable to finalise your promotion. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const primaryCtaLabel = !promotionsRequirePayment
    ? "Create deal"
    : `Pay ${formatMoney(calculatedPrice)}`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${ACCENT}20` }]}>
            <MaterialIcons name={dealMeta.icon} size={28} color={ACCENT} />
          </View>
          <StyledText variant="titleMedium" style={{ color: textColor, fontWeight: "700" }}>
            Product deal
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconColor, textAlign: "center", marginTop: 4 }}
          >
            {`${dealMeta.label} · ${savingsLabel}`}
          </StyledText>
          <View style={[styles.totalPill, { backgroundColor: `${ACCENT}18` }]}>
            <StyledText variant="labelSmall" style={{ color: iconColor }}>
              {!promotionsRequirePayment ? "Campaign fee" : "Total due"}
            </StyledText>
            <StyledText variant="headlineSmall" style={{ color: ACCENT, fontWeight: "800" }}>
              {!promotionsRequirePayment ? "Included" : formatMoney(calculatedPrice)}
            </StyledText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: `${ACCENT}14` }]}>
              <MaterialIcons name="local-offer" size={18} color={ACCENT} />
            </View>
            <View style={styles.cardHeaderCopy}>
              <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
                Deal details
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconColor }}>
                What shoppers see at checkout
              </StyledText>
            </View>
          </View>
          <InfoRow
            icon={dealMeta.icon}
            label="Deal type"
            value={dealMeta.label}
            textColor={textColor}
            mutedColor={iconColor}
            borderColor={borderColor}
          />
          <InfoRow
            icon="sell"
            label="Savings"
            value={savingsLabel}
            textColor={textColor}
            mutedColor={iconColor}
            borderColor={borderColor}
          />
          {promotionDetails.usageLimit ? (
            <InfoRow
              icon="confirmation-number"
              label="Usage limit"
              value={promotionDetails.usageLimit}
              textColor={textColor}
              mutedColor={iconColor}
              borderColor={borderColor}
              isLast={
                !promotionDetails.minimumPurchase && !promotionDetails.maxDiscount
              }
            />
          ) : null}
          {promotionDetails.minimumPurchase ? (
            <InfoRow
              icon="shopping-cart"
              label="Minimum purchase"
              value={formatMoney(Number(promotionDetails.minimumPurchase))}
              textColor={textColor}
              mutedColor={iconColor}
              borderColor={borderColor}
              isLast={!promotionDetails.maxDiscount}
            />
          ) : null}
          {promotionDetails.maxDiscount ? (
            <InfoRow
              icon="savings"
              label="Max discount"
              value={formatMoney(Number(promotionDetails.maxDiscount))}
              textColor={textColor}
              mutedColor={iconColor}
              borderColor={borderColor}
              isLast
            />
          ) : null}
        </View>

        {products.length > 0 ? (
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${ACCENT}14` }]}>
                <MaterialIcons name="inventory-2" size={18} color={ACCENT} />
              </View>
              <View style={styles.cardHeaderCopy}>
                <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
                  Products in this deal
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: iconColor }}>
                  {products.length} item{products.length === 1 ? "" : "s"}
                </StyledText>
              </View>
            </View>
            <ScrollView
              style={styles.productScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {products.map((name, index) => (
                <View
                  key={`${name}-${index}`}
                  style={[
                    styles.productRow,
                    {
                      borderBottomColor: borderColor,
                      borderBottomWidth:
                        index < products.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}
                >
                  <View style={[styles.productIndex, { backgroundColor: `${ACCENT}14` }]}>
                    <StyledText variant="labelSmall" style={{ color: ACCENT, fontWeight: "700" }}>
                      {index + 1}
                    </StyledText>
                  </View>
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: textColor, flex: 1 }}
                    numberOfLines={2}
                  >
                    {name}
                  </StyledText>
                  <MaterialIcons name="local-offer" size={18} color={ACCENT} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: `${ACCENT}14` }]}>
              <MaterialIcons name="event" size={18} color={ACCENT} />
            </View>
            <View style={styles.cardHeaderCopy}>
              <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
                Schedule
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconColor }}>
                When this deal is live
              </StyledText>
            </View>
          </View>
          <InfoRow
            icon="date-range"
            label="Active dates"
            value={dateRange}
            textColor={textColor}
            mutedColor={iconColor}
            borderColor={borderColor}
            isLast
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: `${ACCENT}14` }]}>
              <MaterialIcons name="receipt-long" size={18} color={ACCENT} />
            </View>
            <View style={styles.cardHeaderCopy}>
              <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
                Payment summary
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconColor }}>
                {promotionsRequirePayment
                  ? "One flat fee per campaign"
                  : "No charge on your plan"}
              </StyledText>
            </View>
          </View>
          {promotionsRequirePayment ? (
            <StyledText variant="bodySmall" style={{ color: iconColor, marginBottom: 8 }}>
              Flat fee — not based on how many products or how long the deal runs.
            </StyledText>
          ) : null}
          <View style={styles.summaryRow}>
            <StyledText variant="bodyMedium" style={{ color: iconColor }}>
              {!promotionsRequirePayment ? "Campaign fee" : "Subtotal"}
            </StyledText>
            <StyledText variant="bodyMedium" style={{ color: textColor, fontWeight: "600" }}>
              {!promotionsRequirePayment
                ? "Included on your plan"
                : formatMoney(calculatedPrice)}
            </StyledText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />
          <View style={styles.summaryRow}>
            <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
              Total
            </StyledText>
            <StyledText variant="titleLarge" style={{ color: ACCENT, fontWeight: "800" }}>
              {!promotionsRequirePayment ? "Free" : formatMoney(calculatedPrice)}
            </StyledText>
          </View>
        </View>

        {creationError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: isDark ? "#3f1515" : "#FEE2E2",
                borderColor: isDark ? "#7f1d1d" : "#FECACA",
              },
            ]}
          >
            <MaterialIcons name="error-outline" size={20} color="#D32F2F" />
            <StyledText variant="bodySmall" style={styles.errorText}>
              {creationError}
            </StyledText>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: cardColor, borderTopColor: borderColor },
        ]}
      >
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor }]}
          onPress={onClose}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Cancel
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: buttonColor },
            isProcessing && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons
                name={!promotionsRequirePayment ? "check-circle" : "lock"}
                size={18}
                color="#fff"
              />
              <StyledText variant="labelLarge" style={styles.payButtonText}>
                {primaryCtaLabel}
              </StyledText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface PromotionPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  promotionDetails: PromotionPaymentContentProps["promotionDetails"];
  onPaymentComplete: () => void;
}

const PromotionPayment = ({
  isVisible,
  onClose,
  promotionDetails,
  onPaymentComplete,
}: PromotionPaymentModalProps) => {
  const { showFullscreenModal, closeModal } = useModalService();

  React.useEffect(() => {
    if (isVisible) {
      showFullscreenModal(
        <PromotionPaymentContent
          onClose={() => {
            onClose();
            closeModal();
          }}
          promotionDetails={promotionDetails}
          onPaymentComplete={() => {
            onPaymentComplete();
            closeModal();
          }}
        />,
        "Confirm deal",
        () => {
          onClose();
          closeModal();
        }
      );
    }
  }, [isVisible, promotionDetails]);

  return null;
};

export default PromotionPayment;
export { PromotionPaymentContent };

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 24 },
  heroCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  totalPill: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
    gap: 2,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderCopy: { flex: 1 },
  productScroll: { maxHeight: 220 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  productIndex: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: { flex: 1, gap: 2 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { color: "#D32F2F", flex: 1 },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  payButton: {
    flex: 1.4,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: "#fff", fontWeight: "700" },
});
