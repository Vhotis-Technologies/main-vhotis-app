import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import FAQComponent from "@/app/component/helpers/forms/FAQ";
import SellerInformation from "@/app/component/onboarding/seller/SellerInformationComponent";
import SellerStore from "@/app/component/onboarding/seller/SellerStore";
import SellerBrand from "@/app/component/onboarding/seller/SellerBrand";
import SellingPathStep from "@/app/component/onboarding/seller/SellingPathStep";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useOnboarding from "@/app/hook/useOnboarding";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";

const { width } = Dimensions.get("window");

const STEP_META: Record<number, { title: string; description: string }> = {
  1: {
    title: "How will you sell?",
    description: "Choose the operating model that fits your business today.",
  },
  2: {
    title: "Your profile",
    description:
      "Enter your personal details exactly as they appear on your ID.",
  },
  3: {
    title: "Your business",
    description: "Tell us about your brand and what you sell.",
  },
};

const MobileSellerInformation = () => {
  const { showSheetModal } = useModalService();
  const {
    currentPage,
    handleNext,
    handleBack,
    totalPages,
    confirmPassword,
    setConfirmPassword,
    isRegistering,
    operatingMode,
    setOperatingMode,
    capConflictSlugs,
  } = useOnboarding();

  const { seller_id } = useSelector((state: RootState) => state.onboarding);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  const stepMeta = STEP_META[currentPage] ?? STEP_META[1];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <SellingPathStep
            value={operatingMode}
            onChange={setOperatingMode}
          />
        );
      case 2:
        return (
          <SellerInformation
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />
        );
      case 3:
        return operatingMode === "fulfillment" ? (
          <SellerBrand capConflictSlugs={capConflictSlugs} />
        ) : (
          <SellerStore />
        );
      default:
        return (
          <SellingPathStep
            value={operatingMode}
            onChange={setOperatingMode}
          />
        );
    }
  };

  useEffect(() => {
    if (seller_id) {
      setShowResumeBanner(true);
      const timer = setTimeout(() => setShowResumeBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [seller_id]);

  if (isRegistering) {
    return (
      <View
        style={[styles.container, styles.loadingContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={buttonColor} />
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, marginTop: 16 }}
        >
          {currentPage === 2
            ? "Creating your seller account…"
            : currentPage === 3
              ? "Setting up your business…"
              : "Loading…"}
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{ color: iconMuted, marginTop: 8, textAlign: "center" }}
        >
          This will only take a moment.
        </StyledText>
      </View>
    );
  }

  const header = (
    <>
      {showResumeBanner && (
        <View
          style={[
            styles.resumeBanner,
            { backgroundColor: `${buttonColor}20`, borderColor: buttonColor },
          ]}
        >
          <MaterialIcons name="info-outline" size={18} color={buttonColor} />
          <StyledText variant="bodySmall" style={{ color: textColor, flex: 1 }}>
            Welcome back — continue where you left off.
          </StyledText>
        </View>
      )}

      <View
        style={[
          styles.headerSection,
          { backgroundColor, borderBottomColor: borderColor },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => (currentPage > 1 ? handleBack() : router.back())}
            style={styles.backButton}
            hitSlop={8}
          >
            <MaterialIcons name="arrow-back" size={22} color={textColor} />
          </Pressable>

          <StyledText variant="labelMedium" style={{ color: iconMuted }}>
            Step {currentPage} of {totalPages}
          </StyledText>

          <Pressable
            onPress={() =>
              showSheetModal(<FAQComponent />, "Frequently Asked Questions")
            }
            style={[styles.helpButton, { borderColor }]}
          >
            <MaterialIcons name="help-outline" size={16} color={buttonColor} />
            <StyledText variant="labelMedium" style={{ color: buttonColor }}>
              Help
            </StyledText>
          </Pressable>
        </View>

        <View style={styles.stepInfo}>
          <StyledText
            variant="headlineSmall"
            style={[styles.stepTitle, { color: textColor }]}
          >
            {stepMeta.title}
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.stepDescription, { color: iconMuted }]}
          >
            {stepMeta.description}
          </StyledText>
        </View>
      </View>
    </>
  );

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardBackground, borderTopColor: borderColor },
      ]}
    >
      {currentPage > 1 && (
        <StyledButton
          variant="tonal"
          title="Back"
          onPress={handleBack}
          buttonStyles={styles.navButton}
        />
      )}
      <StyledButton
        variant="small"
        title={
          currentPage === totalPages
            ? operatingMode === "fulfillment"
              ? "Continue to fulfillment"
              : "Launch store"
            : "Continue"
        }
        onPress={handleNext}
        buttonStyles={[
          styles.navButton,
          currentPage === 1 && styles.navButtonFull,
        ]}
      />
    </View>
  );

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      header={header}
      footer={footer}
    >
      {renderCurrentPage()}
    </KeyboardWrapper>
  );
};

export default MobileSellerInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerSection: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  stepInfo: {
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  stepDescription: {
    textAlign: "center",
    lineHeight: 20,
    maxWidth: width * 0.85,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
  },
  navButtonFull: {
    flex: 1,
  },
});
