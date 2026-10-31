import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import PersonalDetailsForm from "@/app/component/onboarding/main/PersonalDetailsForm";
import AddressForm from "@/app/component/onboarding/main/AddressForm";
import PasswordForm from "@/app/component/onboarding/main/PasswordForm";
import StyledText from "@/app/component/helpers/forms/StyledText";
import GoogleAuthButton from "@/app/component/helpers/buttons/GoogleAuthButton";
import FAQComponent from "@/app/component/helpers/forms/FAQ";
import { RootState, useAppSelector } from "@/app/store/store";
import { useThemeColor } from "@/hooks/useThemeColor";
import useOnboarding from "@/app/hook/useOnboarding";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";

const { width } = Dimensions.get("window");

const TOTAL_STEPS = 3;

const STEP_META: Record<number, { title: string; description: string }> = {
  1: {
    title: "About you",
    description: "Tell us a bit about yourself to personalize your experience.",
  },
  2: {
    title: "Your address",
    description: "Where should we deliver? Accurate details help us get it right.",
  },
  3: {
    title: "Secure your account",
    description: "Create a strong password to protect your Vhotis account.",
  },
};

const OnboardingScreen = () => {
  const { showSheetModal } = useModalService();
  const {
    currentStep,
    isLoading,
    isRegisteringUser,
    setCurrentStep,
    handleUserOnboarding,
  } = useOnboarding();

  const authLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const { onGoogleLogin } = useAuthContext();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  const stepMeta = STEP_META[currentStep] ?? STEP_META[1];
  const isSubmitting = isLoading || isRegisteringUser;

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetailsForm />;
      case 2:
        return <AddressForm />;
      case 3:
        return <PasswordForm />;
      default:
        return <PersonalDetailsForm />;
    }
  };

  const nextLabel = currentStep === 3 ? "Create account" : "Continue";

  if (isSubmitting) {
    return (
      <View
        style={[styles.container, styles.loadingContainer, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={buttonColor} />
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, marginTop: 16 }}
        >
          Creating your account…
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
    <View
      style={[
        styles.headerSection,
        { backgroundColor, borderBottomColor: borderColor },
      ]}
    >
      <View style={styles.headerTopRow}>
        <Pressable
          onPress={handlePrevious}
          style={styles.backButton}
          hitSlop={8}
        >
          <MaterialIcons name="arrow-back" size={22} color={textColor} />
        </Pressable>

        <StyledText variant="labelMedium" style={{ color: iconMuted }}>
          Step {currentStep} of {TOTAL_STEPS}
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
  );

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardBackground, borderTopColor: borderColor },
      ]}
    >
      {currentStep > 1 && (
        <StyledButton
          variant="tonal"
          title="Back"
          onPress={handlePrevious}
          buttonStyles={styles.navButton}
        />
      )}
      <StyledButton
        variant="small"
        title={nextLabel}
        onPress={handleUserOnboarding}
        buttonStyles={[
          styles.navButton,
          currentStep === 1 && styles.navButtonFull,
        ]}
      />
    </View>
  );

  const footerExtra =
    currentStep === 1 ? (
      <Pressable
        onPress={() => router.push("/onboarding/main/Signin")}
        style={[styles.signInLink, { backgroundColor: cardBackground }]}
      >
        <StyledText variant="bodyMedium" style={{ color: iconMuted }}>
          Already have an account?{" "}
          <StyledText variant="bodyMedium" style={{ color: buttonColor }}>
            Sign in
          </StyledText>
        </StyledText>
      </Pressable>
    ) : undefined;

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      header={header}
      footer={footer}
      footerExtra={footerExtra}
    >
      {currentStep === 1 ? (
        <OnboardingSectionCard
          icon="login"
          title="Quick sign up"
          subtitle="Use your Google account"
        >
          <GoogleAuthButton
            onPress={onGoogleLogin}
            disabled={authLoading}
          />
        </OnboardingSectionCard>
      ) : null}
      {renderCurrentStep()}
    </KeyboardWrapper>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  signInLink: {
    alignItems: "center",
  },
});
