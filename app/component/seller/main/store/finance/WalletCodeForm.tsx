import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import {
  useSetWalletCodeMutation,
  useVerifyWalletCodeMutation,
} from "@/app/store/seller/api/financeApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

export type WalletCodeFormMode = "setup" | "verify";

export const sanitizeWalletCode = (value: string) =>
  value.replace(/\D/g, "").slice(0, 6);

export const getWalletCodeErrorMessage = (error: unknown, fallback: string) => {
  const responseError = error as {
    data?: { error?: string; message?: string };
    error?: string;
  };

  return (
    responseError?.data?.error ||
    responseError?.data?.message ||
    responseError?.error ||
    fallback
  );
};

export type WalletCodeFormProps = {
  mode: WalletCodeFormMode;
  onSuccess: (walletCode: string) => void;
  /** Optional copy overrides */
  title?: string;
  description?: string;
  primaryButtonLabel?: string;
  hideIconCircle?: boolean;
};

const WalletCodeForm = ({
  mode,
  onSuccess,
  title,
  description,
  primaryButtonLabel,
  hideIconCircle,
}: WalletCodeFormProps) => {
  const [walletCode, setWalletCode] = useState("");
  const [confirmWalletCode, setConfirmWalletCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");

  const [setupWalletCode, { isLoading: isSettingWalletCode }] =
    useSetWalletCodeMutation();
  const [verifyWalletCode, { isLoading: isVerifyingWalletCode }] =
    useVerifyWalletCodeMutation();

  const isSetupMode = mode === "setup";
  const isSubmitting = isSettingWalletCode || isVerifyingWalletCode;

  const clearError = () => {
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (walletCode.length < 4) {
      setFormError("Enter a 4 to 6 digit wallet code.");
      return;
    }

    if (isSetupMode && walletCode !== confirmWalletCode) {
      setFormError("Both wallet codes must match.");
      return;
    }

    try {
      if (isSetupMode) {
        await setupWalletCode({
          wallet_code: walletCode,
          confirm_wallet_code: confirmWalletCode,
        }).unwrap();
      } else {
        const response = await verifyWalletCode({
          wallet_code: walletCode,
        }).unwrap();

        if (response.status !== "verified") {
          setFormError("Invalid wallet code.");
          return;
        }
      }

      onSuccess(walletCode);
    } catch (submitError) {
      setFormError(
        getWalletCodeErrorMessage(
          submitError,
          isSetupMode
            ? "Could not create your wallet code. Try again."
            : "Could not verify your wallet code. Try again.",
        ),
      );
    }
  };

  const defaultTitle = isSetupMode
    ? "Create your wallet code"
    : "Enter your wallet code";
  const defaultDescription = isSetupMode
    ? "Set a private 4 to 6 digit wallet code for withdrawals and financial actions."
    : "Confirm your private code.";
  const defaultPrimary = isSetupMode
    ? "Save wallet code"
    : "Verify wallet code";

  return (
    <View style={styles.container}>
      {!hideIconCircle && (
        <View
          style={[styles.iconCircle, { backgroundColor: `${tintColor}18` }]}
        >
          <MaterialIcons
            name={isSetupMode ? "add-moderator" : "lock-outline"}
            size={28}
            color={tintColor}
          />
        </View>
      )}

      <StyledText
        variant="titleLarge"
        style={[styles.title, { color: textColor }]}
      >
        {title ?? defaultTitle}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={[styles.description, { color: iconMuted }]}
      >
        {description ?? defaultDescription}
      </StyledText>

      <View style={styles.form}>
        <StyledTextInput
          label={isSetupMode ? "New code" : "Wallet code"}
          value={walletCode}
          onChangeText={(value) => {
            clearError();
            setWalletCode(sanitizeWalletCode(value));
          }}
          placeholder="Enter 4 to 6 digits"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
        />

        {isSetupMode && (
          <StyledTextInput
            label="Confirm wallet code"
            value={confirmWalletCode}
            onChangeText={(value) => {
              clearError();
              setConfirmWalletCode(sanitizeWalletCode(value));
            }}
            placeholder="Re-enter your code"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
        )}

        {formError && (
          <StyledText variant="bodySmall" style={styles.formError}>
            {formError}
          </StyledText>
        )}
      </View>

      <StyledButton
        title={primaryButtonLabel ?? defaultPrimary}
        onPress={handleSubmit}
        disabled={isSubmitting}
        loading={isSubmitting}
        buttonStyles={styles.primaryButton}
        variant="tonal"
      />
    </View>
  );
};

export default WalletCodeForm;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  form: {
    gap: 12,
    marginTop: 18,
  },
  formError: {
    color: "#D32F2F",
    marginTop: -4,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 16,
  },
});
