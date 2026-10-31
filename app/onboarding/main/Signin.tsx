import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import GoogleAuthButton from "@/app/component/helpers/buttons/GoogleAuthButton";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { updateLoginFormData } from "@/app/store/main/slices/authSlice";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";

const SigninScreen = () => {
  const dispatch = useAppDispatch();
  const { onLogin, onGoogleLogin, rememberMe, setRememberMe } =
    useAuthContext();
  const { showSnackbarWithConfig } = useSnackbar();

  const { loginFormData, isLoading } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    if (!loginFormData?.email?.trim()) {
      showSnackbarWithConfig({
        message: "Please enter your email address",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!loginFormData?.password?.trim()) {
      showSnackbarWithConfig({
        message: "Please enter your password",
        type: "error",
        duration: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginFormData.email.trim())) {
      showSnackbarWithConfig({
        message: "Please enter a valid email address",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await onLogin();
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={insets.bottom + 12}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <MaterialIcons name="arrow-back" size={22} color={textColor} />
          </Pressable>

          <StyledText
            variant="headlineSmall"
            style={[styles.title, { color: textColor }]}
          >
            Welcome back
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={{ color: iconMuted, lineHeight: 20 }}
          >
            Sign in to continue shopping on Vhotis.
          </StyledText>
        </View>

        {/* Quick sign in */}
        <OnboardingSectionCard
          icon="login"
          title="Quick sign in"
          subtitle="Use your Google account"
        >
          <GoogleAuthButton
            onPress={onGoogleLogin}
            disabled={isLoading}
          />
        </OnboardingSectionCard>

        {/* Email sign in */}
        <OnboardingSectionCard
          icon="email"
          title="Sign in with email"
          subtitle="Enter your account credentials"
        >
          <StyledTextInput
            label="Email"
            placeholder="you@example.com"
            value={loginFormData?.email || ""}
            onChangeText={(text) =>
              dispatch(updateLoginFormData({ key: "email", value: text }))
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            importantForAutofill="yes"
            autoComplete="email"
          />

          <View style={styles.passwordWrap}>
            <StyledTextInput
              label="Password"
              placeholder="Enter your password"
              value={loginFormData?.password || ""}
              onChangeText={(text) =>
                dispatch(updateLoginFormData({ key: "password", value: text }))
              }
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              importantForAutofill="yes"
              autoComplete="password"
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={iconMuted}
              />
            </Pressable>
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: rememberMe ? buttonColor : borderColor },
                  rememberMe && { backgroundColor: buttonColor },
                ]}
              >
                {rememberMe && (
                  <MaterialIcons name="check" size={14} color="#fff" />
                )}
              </View>
              <StyledText variant="bodyMedium" style={{ color: textColor }}>
                Remember me
              </StyledText>
            </Pressable>

            <Pressable onPress={() => router.push("/onboarding/main/OnboardingScreen")}>
              <StyledText variant="bodySmall" style={{ color: buttonColor }}>
                Forgot password?
              </StyledText>
            </Pressable>
          </View>

          <StyledButton
            variant="small"
            onPress={handleSignIn}
            disabled={isLoading}
            title={isLoading ? "Signing in…" : "Sign in"}
            buttonStyles={{ width: "100%", paddingVertical: 12 }}
          />
        </OnboardingSectionCard>

        {/* Register link */}
        <View
          style={[
            styles.registerCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <StyledText variant="bodyMedium" style={{ color: iconMuted }}>
            New to Vhotis?
          </StyledText>
          <Pressable onPress={() => router.push("/onboarding/main/OnboardingScreen")}>
            <StyledText
              variant="labelLarge"
              style={{ color: buttonColor, fontWeight: "600" }}
            >
              Create an account
            </StyledText>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SigninScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 8,
    marginLeft: -8,
  },
  title: {
    fontWeight: "700",
    marginBottom: 6,
  },
  passwordWrap: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: 28,
    minWidth: 35,
    minHeight: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  registerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
});
