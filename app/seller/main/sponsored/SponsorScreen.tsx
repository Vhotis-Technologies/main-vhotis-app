import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import StoreWideSponsorForm from "@/app/component/seller/sponsored/StoreWideSponsorForm";
import ProductSponsorForm from "@/app/component/seller/sponsored/ProductSponsorForm";
import SponsorPayment from "@/app/component/seller/sponsored/SponsorPayment";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import useSponsor from "@/app/hook/seller/useSponsor";
import { usePromotionRates } from "@/app/hook/seller/usePromotionRates";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useAppDispatch } from "@/app/store/store";
import { setSponsorSelectedProducts } from "@/app/store/seller/slice/sponsorSlice";
import { SponsorMode } from "@/app/interfaces/seller/SponsorInterface";

const MODE_OPTIONS: {
  value: SponsorMode;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    value: "store",
    title: "Store-wide",
    subtitle: "Feature your entire catalog in search & home",
    icon: "storefront",
  },
  {
    value: "product",
    title: "Specific products",
    subtitle: "Sponsor selected items only",
    icon: "star-outline",
  },
];

const SponsorScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    mode?: string;
    productId?: string;
    productName?: string;
  }>();

  const {
    isPaymentModalVisible,
    showPaymentModal,
    hidePaymentModal,
    storePaymentDetails,
    productSponsorPaymentDetails,
    canLaunchStoreSponsor,
    canLaunchProductSponsor,
    resetStoreSponsor,
    resetProductSponsor,
  } = useSponsor();

  const { rates } = usePromotionRates();
  const [sponsorMode, setSponsorMode] = useState<SponsorMode>("store");
  const [activePaymentMode, setActivePaymentMode] = useState<SponsorMode>("store");
  const [prefillHandled, setPrefillHandled] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const isDark = backgroundColor === "#000";

  useEffect(() => {
    if (prefillHandled) return;

    const mode =
      params.mode === "product" || params.mode === "store"
        ? (params.mode as SponsorMode)
        : null;

    if (mode) setSponsorMode(mode);

    if (mode === "product" && params.productId && params.productName) {
      dispatch(
        setSponsorSelectedProducts([
          { id: String(params.productId), name: String(params.productName) },
        ])
      );
    }

    if (mode) setPrefillHandled(true);
  }, [dispatch, params.mode, params.productId, params.productName, prefillHandled]);

  const actionDisabled =
    sponsorMode === "store" ? !canLaunchStoreSponsor : !canLaunchProductSponsor;

  const paymentDetails = useMemo(() => {
    return activePaymentMode === "store"
      ? storePaymentDetails
      : productSponsorPaymentDetails;
  }, [
    activePaymentMode,
    productSponsorPaymentDetails,
    storePaymentDetails,
  ]);

  const rateHint =
    sponsorMode === "store"
      ? `${formatCurrency(rates.dailyStorePromotionRate)}/day for whole store`
      : `${formatCurrency(rates.productDailyRate)}/product/day`;

  const prefillName =
    params.productName && sponsorMode === "product"
      ? String(params.productName)
      : null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <StyledText variant="headlineSmall" style={{ color: textColor }}>
            Sponsored listings
          </StyledText>
          <StyledText variant="bodyMedium" style={{ color: iconColor, marginTop: 6 }}>
            Pay for featured placement. This is separate from discount deals and
            promotions.
          </StyledText>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push("/seller/main/sponsored/SponsorHistoryScreen")
          }
          style={[
            styles.historyLink,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <MaterialIcons name="history" size={20} color="#6366F1" />
          <View style={{ flex: 1 }}>
            <StyledText
              variant="labelLarge"
              style={{ color: textColor, fontWeight: "700" }}
            >
              Sponsorship history
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              Past and active featured listing campaigns
            </StyledText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={iconColor} />
        </TouchableOpacity>

        <StyledText variant="labelMedium" style={[styles.sectionLabel, { color: iconColor }]}>
          Sponsorship type
        </StyledText>

        <View style={styles.modeRow}>
          {MODE_OPTIONS.map((mode) => {
            const active = sponsorMode === mode.value;
            return (
              <TouchableOpacity
                key={mode.value}
                onPress={() => setSponsorMode(mode.value)}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: cardColor,
                    borderColor: active ? "#6366F1" : borderColor,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                <MaterialIcons
                  name={mode.icon}
                  size={22}
                  color={active ? "#6366F1" : iconColor}
                />
                <StyledText
                  variant="labelLarge"
                  style={{ color: textColor, fontWeight: "700", marginTop: 8 }}
                >
                  {mode.title}
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: iconColor, marginTop: 4 }}>
                  {mode.subtitle}
                </StyledText>
              </TouchableOpacity>
            );
          })}
        </View>

        {prefillName ? (
          <View
            style={[
              styles.banner,
              { backgroundColor, borderColor },
            ]}
          >
            <MaterialIcons name="star" size={18} color={iconColor} />
            <StyledText variant="bodySmall" style={{ flex: 1 }}>
              Sponsoring <StyledText style={{ fontWeight: "700" }}>{prefillName}</StyledText>
            </StyledText>
          </View>
        ) : null}

        <StyledText variant="bodySmall" style={{ marginBottom: 12 }}>
          {rateHint}
        </StyledText>

        {sponsorMode === "store" ? <StoreWideSponsorForm /> : <ProductSponsorForm />}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          Sponsored products show a badge and rank higher in listings
        </StyledText>
        <StyledButton
          title="Review & Pay"
          variant="tonal"
          disabled={actionDisabled}
          onPress={() => {
            if (actionDisabled) return;
            setActivePaymentMode(sponsorMode);
            showPaymentModal();
          }}
          buttonStyles={[
            styles.cta,
            !actionDisabled && { backgroundColor: "#6366F1", borderWidth: 0 },
          ]}
          textStyles={!actionDisabled ? { color: "#fff" } : undefined}
        />
      </View>

      <SponsorPayment
        isVisible={isPaymentModalVisible}
        onClose={hidePaymentModal}
        details={paymentDetails}
        onPaymentComplete={() => {
          hidePaymentModal();
          if (activePaymentMode === "store") {
            resetStoreSponsor();
          } else {
            resetProductSponsor();
          }
        }}
      />
    </View>
  );
};

export default SponsorScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  hero: { marginBottom: 16 },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 10,
  },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  modeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: { width: "100%" },
});
