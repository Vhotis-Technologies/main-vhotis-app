import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useSellerPayment from "@/app/hook/seller/useSellerPayment";
import { PromotionPaymentData } from "@/app/store/seller/api/sellerPaymentApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { formatCurrency } from "@/app/_utils/main/helpers";
import {
  ServerStorePromotionTargeting,
  StorePromotionTargeting,
} from "@/app/interfaces/seller/PromotionsInterface";
import {
  useCreateStoreSponsorshipMutation,
  useCreateProductSponsorshipMutation,
} from "@/app/store/seller/api/sponsorshipApi";
import { SponsorPaymentDetails } from "@/app/interfaces/seller/SponsorInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { usePromotionRates } from "@/app/hook/seller/usePromotionRates";

const ACCENT = "#6366F1";

type SponsorPaymentContentProps = {
  onClose: () => void;
  details: SponsorPaymentDetails;
  onPaymentComplete: () => void;
};

const formatDate = (date?: Date | string | null) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
};

const InfoRow = ({
  icon,
  label,
  value,
  textColor,
  mutedColor,
  borderColor,
}: InfoRowProps) => (
  <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
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

const SponsorPaymentContent = ({
  onClose,
  details,
  onPaymentComplete,
}: SponsorPaymentContentProps) => {
  const { openPaymentSheet } = useSellerPayment();
  const { rates } = usePromotionRates();
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [createStoreSponsorship] = useCreateStoreSponsorshipMutation();
  const [createProductSponsorship] = useCreateProductSponsorshipMutation();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const isDark = backgroundColor === "#000";

  useEffect(() => {
    if (details.promotionType === "store") {
      setCalculatedPrice(details.budget || 0);
    } else {
      setCalculatedPrice(details.estimatedCost || 0);
    }
  }, [details]);

  const isStore = details.promotionType === "store";

  const products = useMemo(() => {
    if (isStore) return [];
    if (details.selectedProducts?.length) return details.selectedProducts;
    return (details.productNames ?? []).map((name, index) => ({
      id: details.productIds?.[index] ?? String(index),
      name,
    }));
  }, [details, isStore]);

  const stripLocations = (
    targeting: StorePromotionTargeting
  ): ServerStorePromotionTargeting => {
    const { locations, ...rest } = targeting;
    return rest;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setCreationError(null);
    try {
      const startDate = details.startDate
        ? new Date(details.startDate as Date).toISOString()
        : new Date().toISOString();

      const endDate = details.endDate
        ? new Date(details.endDate as Date).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      let paymentData: PromotionPaymentData;

      if (details.promotionType === "store") {
        paymentData = {
          promotion_type: "store_sponsorship",
          promotion_data: {
            budget: details.budget || 0,
            dailyBudget: details.dailyBudget || 0,
            startDate,
            endDate,
          },
        };
      } else {
        paymentData = {
          promotion_type: "product_sponsorship",
          promotion_data: {
            productIds: details.productIds,
            startDate,
            endDate,
          },
        };
      }

      const paymentResult = await openPaymentSheet(paymentData, "Vhotis");
      if (!paymentResult.success) {
        setIsProcessing(false);
        return;
      }

      const paymentIntentId = paymentResult.paymentIntentId;
      if (!paymentIntentId) {
        setIsProcessing(false);
        return;
      }

      if (details.promotionType === "store") {
        const defaultTargeting: StorePromotionTargeting = {
          ageRanges: [],
          interests: [],
          genders: [],
          ethnicities: [],
          locations: [],
        };

        await createStoreSponsorship({
          paymentIntentId,
          budget: details.budget || 0,
          dailyBudget: details.dailyBudget || 0,
          startDate,
          endDate,
          estimatedReach: details.estimatedReach ?? 0,
          durationDays: details.durationDays ?? 0,
          targeting: stripLocations(details.targeting ?? defaultTargeting),
        }).unwrap();
      } else {
        const defaultTargeting: StorePromotionTargeting = {
          ageRanges: [],
          interests: [],
          genders: [],
          ethnicities: [],
          locations: [],
        };

        await createProductSponsorship({
          paymentIntentId,
          productIds: details.productIds,
          startDate,
          endDate,
          budget: details.estimatedCost,
          dailyBudget: details.estimatedCost,
          estimatedReach: 0,
          targeting: stripLocations(details.targeting ?? defaultTargeting),
        }).unwrap();
      }

      onPaymentComplete();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string }; message?: string };
      setCreationError(
        err?.data?.error ||
          err?.message ||
          "Unable to complete sponsorship. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const durationDays = isStore
    ? (details.durationDays ?? 0)
    : (details.durationDays ?? 0);

  const dateRange = `${formatDate(details.startDate)} – ${formatDate(details.endDate)}`;

  const costBreakdown = !isStore
    ? `${products.length} product${products.length === 1 ? "" : "s"} × ${durationDays} day${durationDays === 1 ? "" : "s"} × ${formatCurrency(rates.productDailyRate)}/day`
    : null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${ACCENT}20` }]}>
            <MaterialIcons
              name={isStore ? "storefront" : "star"}
              size={28}
              color={ACCENT}
            />
          </View>
          <StyledText variant="titleMedium" style={{ color: textColor, fontWeight: "700" }}>
            {isStore ? "Store-wide sponsorship" : "Product sponsorship"}
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconColor, textAlign: "center", marginTop: 4 }}
          >
            {isStore
              ? "Your entire catalog gets priority placement"
              : "Selected products show a sponsored badge"}
          </StyledText>
          <View style={[styles.totalPill, { backgroundColor: `${ACCENT}18` }]}>
            <StyledText variant="labelSmall" style={{ color: iconColor }}>
              Total due
            </StyledText>
            <StyledText variant="headlineSmall" style={{ color: ACCENT, fontWeight: "800" }}>
              {formatCurrency(calculatedPrice)}
            </StyledText>
          </View>
        </View>

        {!isStore && products.length > 0 ? (
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${ACCENT}14` }]}>
                <MaterialIcons name="inventory-2" size={18} color={ACCENT} />
              </View>
              <View style={styles.cardHeaderCopy}>
                <StyledText variant="titleSmall" style={{ color: textColor, fontWeight: "700" }}>
                  Sponsored products
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: iconColor }}>
                  {products.length} item{products.length === 1 ? "" : "s"} selected
                </StyledText>
              </View>
            </View>
            <ScrollView
              style={styles.productScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {products.map((product, index) => (
                <View
                  key={product.id}
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
                    {product.name}
                  </StyledText>
                  <MaterialIcons name="verified" size={18} color={ACCENT} />
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
                Campaign duration and dates
              </StyledText>
            </View>
          </View>
          <InfoRow
            icon="timelapse"
            label="Duration"
            value={`${durationDays} day${durationDays === 1 ? "" : "s"}`}
            textColor={textColor}
            mutedColor={iconColor}
            borderColor={borderColor}
          />
          <InfoRow
            icon="date-range"
            label="Dates"
            value={dateRange}
            textColor={textColor}
            mutedColor={iconColor}
            borderColor={borderColor}
          />
          {isStore ? (
            <>
              <InfoRow
                icon="account-balance-wallet"
                label="Budget"
                value={formatCurrency(details.budget || 0)}
                textColor={textColor}
                mutedColor={iconColor}
                borderColor={borderColor}
              />
              {details.dailyBudget ? (
                <InfoRow
                  icon="today"
                  label="Daily budget"
                  value={formatCurrency(details.dailyBudget)}
                  textColor={textColor}
                  mutedColor={iconColor}
                  borderColor={borderColor}
                />
              ) : null}
            </>
          ) : null}
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
              {costBreakdown ? (
                <StyledText variant="bodySmall" style={{ color: iconColor }}>
                  {costBreakdown}
                </StyledText>
              ) : (
                <StyledText variant="bodySmall" style={{ color: iconColor }}>
                  One-time sponsorship fee
                </StyledText>
              )}
            </View>
          </View>
          <View style={styles.summaryRow}>
            <StyledText variant="bodyMedium" style={{ color: iconColor }}>
              Subtotal
            </StyledText>
            <StyledText variant="bodyMedium" style={{ color: textColor, fontWeight: "600" }}>
              {formatCurrency(calculatedPrice)}
            </StyledText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />
          <View style={styles.summaryRow}>
            <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
              Total
            </StyledText>
            <StyledText variant="titleLarge" style={{ color: ACCENT, fontWeight: "800" }}>
              {formatCurrency(calculatedPrice)}
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
              <MaterialIcons name="lock" size={18} color="#fff" />
              <StyledText variant="labelLarge" style={styles.payButtonText}>
                Pay {formatCurrency(calculatedPrice)}
              </StyledText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

type SponsorPaymentModalProps = {
  isVisible: boolean;
  onClose: () => void;
  details: SponsorPaymentDetails;
  onPaymentComplete: () => void;
};

const SponsorPayment = ({
  isVisible,
  onClose,
  details,
  onPaymentComplete,
}: SponsorPaymentModalProps) => {
  const { showFullscreenModal, closeModal } = useModalService();

  React.useEffect(() => {
    if (isVisible) {
      showFullscreenModal(
        <SponsorPaymentContent
          onClose={() => {
            onClose();
            closeModal();
          }}
          details={details}
          onPaymentComplete={() => {
            onPaymentComplete();
            closeModal();
          }}
        />,
        "Confirm sponsorship",
        () => {
          onClose();
          closeModal();
        }
      );
    }
  }, [isVisible, details]);

  return null;
};

export default SponsorPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24,
  },
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
  cardHeaderCopy: {
    flex: 1,
  },
  productScroll: {
    maxHeight: 220,
  },
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
  infoCopy: {
    flex: 1,
    gap: 2,
  },
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
  errorText: {
    color: "#D32F2F",
    flex: 1,
  },
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
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
