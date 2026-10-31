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

type FinancialAccessMode = "setup" | "verify";

type FinancialAccessCodeModalProps = {
  mode: FinancialAccessMode;
  onSuccess: (walletCode: string) => void;
};

const sanitizeCode = (value: string) => value.replace(/\D/g, "").slice(0, 6);

const getErrorMessage = (error: unknown, fallback: string) => {
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

const FinancialAccessCodeModal = ({
  mode,
  onSuccess,
}: FinancialAccessCodeModalProps) => {
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
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          isSetupMode
            ? "Could not create your wallet code. Try again."
            : "Could not verify your wallet code. Try again.",
        ),
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${tintColor}18` }]}>
        <MaterialIcons
          name={isSetupMode ? "add-moderator" : "lock-outline"}
          size={28}
          color={tintColor}
        />
      </View>

      <StyledText
        variant="titleLarge"
        style={[styles.title, { color: textColor }]}
      >
        {isSetupMode ? "Create your wallet code" : "Enter your wallet code"}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={[styles.description, { color: iconMuted }]}
      >
        {isSetupMode
          ? "Set a private 4 to 6 digit wallet code before viewing financial analytics."
          : "Confirm your private code to unlock financial analytics."}
      </StyledText>

      <View style={styles.form}>
        <StyledTextInput
          label={isSetupMode ? "New code" : "Wallet code"}
          value={walletCode}
          onChangeText={(value) => {
            clearError();
            setWalletCode(sanitizeCode(value));
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
              setConfirmWalletCode(sanitizeCode(value));
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
        title={isSetupMode ? "Create and continue" : "Unlock analytics"}
        onPress={handleSubmit}
        disabled={isSubmitting}
        loading={isSubmitting}
        buttonStyles={styles.primaryButton}
        variant="tonal"
      />
    </View>
  );
};

export default FinancialAccessCodeModal;
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
  primaryButtonText: {
    color: "#FFFFFF",
  },
});
