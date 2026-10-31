import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import StoreLocationPicker from "@/app/component/seller/shared/StoreLocationPicker";
import { useThemeColor } from "@/hooks/useThemeColor";
import useSellerAdmin from "@/app/hook/seller/useSellerAdmin";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const REQUIRED_CHECKS = [
  { key: "store", label: "Store assignment" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "password", label: "Password" },
  { key: "confirmPassword", label: "Confirm password" },
] as const;

function FieldError({ message }: { message?: string }) {
  const errorColor = useThemeColor({}, "error");
  if (!message) return null;
  return (
    <StyledText
      variant="bodySmall"
      style={{ color: errorColor, marginTop: 4 }}
    >
      {message}
    </StyledText>
  );
}

const PASSWORD_REQUIREMENTS = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "letter",
    label: "Contains a letter",
    test: (p: string) => /[a-zA-Z]/.test(p),
  },
  {
    key: "number",
    label: "Contains a number",
    test: (p: string) => /\d/.test(p),
  },
] as const;

const isPasswordStrong = (password: string) =>
  PASSWORD_REQUIREMENTS.every((req) => req.test(password));

const CreateAdminScreen = () => {
  useRequireSellerOwner();
  const params = useLocalSearchParams<{ storeId?: string | string[] }>();
  const presetStoreId = useMemo(() => {
    const raw = params.storeId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() || undefined;
  }, [params.storeId]);

  const {
    formData,
    errors,
    updateField,
    handleSubmitAdminForm,
    isCreatingAdmin,
    sellerStores,
    selectedStoreId,
    setSelectedStoreId,
    isLoadingStores,
    canAddAdmin,
    planLimits,
  } = useSellerAdmin();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const errorColor = useThemeColor({}, "error");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");

  useEffect(() => {
    if (presetStoreId) {
      setSelectedStoreId(presetStoreId);
    }
  }, [presetStoreId, setSelectedStoreId]);

  const fieldFilled = useMemo(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formData.email.trim(),
    );
    const passwordOk = isPasswordStrong(formData.password);
    const confirmOk =
      formData.confirmPassword.length > 0 &&
      formData.password === formData.confirmPassword;

    return {
      store: Boolean(selectedStoreId),
      firstName: Boolean(formData.firstName.trim()),
      lastName: Boolean(formData.lastName.trim()),
      email: emailValid,
      phone: Boolean(formData.phone.trim()),
      password: passwordOk,
      confirmPassword: confirmOk,
    };
  }, [formData, selectedStoreId]);

  const completedCount = REQUIRED_CHECKS.filter(
    (item) => fieldFilled[item.key],
  ).length;
  const progress = completedCount / REQUIRED_CHECKS.length;
  const isReady = completedCount === REQUIRED_CHECKS.length;

  const selectedStoreName =
    sellerStores.find((s) => s.id === selectedStoreId)?.business_name ?? null;

  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const showMismatchError = passwordsMismatch || Boolean(errors.confirmPassword);
  const showPasswordRules =
    formData.password.length > 0 || submitAttempted || Boolean(errors.password);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    await handleSubmitAdminForm();
  };

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <View style={styles.footerMeta}>
        <MaterialIcons
          name={isReady ? "check-circle" : "info-outline"}
          size={18}
          color={isReady ? successColor : iconMuted}
        />
        <StyledText
          variant="bodySmall"
          style={{ color: iconMuted, flex: 1, marginLeft: 8 }}
        >
          {isReady
            ? "Ready to invite this team member."
            : `${completedCount} of ${REQUIRED_CHECKS.length} required fields completed`}
        </StyledText>
      </View>
      <StyledButton
        title="Add team member"
        onPress={() => {
          void handleSubmit();
        }}
        loading={isCreatingAdmin}
        disabled={isCreatingAdmin || !isReady || !canAddAdmin}
        variant="medium"
        buttonStyles={styles.submitButton}
      />
    </View>
  );

  if (isLoadingStores && !sellerStores.length) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 12 }}
        >
          Loading stores…
        </StyledText>
      </View>
    );
  }

  if (!canAddAdmin) {
    return (
      <View style={[styles.centered, styles.blocked, { backgroundColor }]}>
        <MaterialIcons name="lock" size={48} color={iconMuted} />
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, marginTop: 16, textAlign: "center" }}
        >
          Cannot add team member
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={{
            color: iconMuted,
            marginTop: 8,
            textAlign: "center",
            lineHeight: 20,
            paddingHorizontal: 24,
          }}
        >
          {sellerStores.length === 0
            ? "Create a store location first, then assign a team member to it."
            : planLimits?.max_admins != null
              ? `Your plan allows ${planLimits.max_admins} team member(s), or every location already has one assigned.`
              : "Upgrade your plan or free up a store assignment to invite someone new."}
        </StyledText>
        <StyledButton
          title="Back to management"
          onPress={() => router.back()}
          variant="medium"
          style={{ marginTop: 20, minWidth: 200 }}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor }]}>
      <KeyboardWrapper
        backgroundColor={backgroundColor}
        footer={footer}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[styles.hero, { backgroundColor: cardColor, borderColor }]}
        >
          <View
            style={[styles.heroIconWrap, { backgroundColor: `${tintColor}18` }]}
          >
            <MaterialIcons name="person-add" size={28} color={tintColor} />
          </View>
          <View style={styles.heroCopy}>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              Invite a team member
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, marginTop: 6, lineHeight: 20 }}
            >
              Give someone access to manage one store location — catalog,
              orders, and day-to-day operations.
            </StyledText>
          </View>
          <View style={styles.tipRow}>
            <View
              style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}
            >
              <MaterialIcons name="store" size={14} color={tintColor} />
              <StyledText
                variant="labelSmall"
                style={{ color: tintColor, marginLeft: 6 }}
              >
                One location
              </StyledText>
            </View>
            <View
              style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}
            >
              <MaterialIcons name="lock" size={14} color={tintColor} />
              <StyledText
                variant="labelSmall"
                style={{ color: tintColor, marginLeft: 6 }}
              >
                Own login
              </StyledText>
            </View>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <StyledText variant="labelMedium" style={{ color: textColor }}>
              Setup progress
            </StyledText>
            <StyledText variant="labelSmall" style={{ color: tintColor }}>
              {Math.round(progress * 100)}%
            </StyledText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: tintColor,
                  width: `${Math.max(progress * 100, 4)}%`,
                },
              ]}
            />
          </View>
          <View style={styles.checklist}>
            {REQUIRED_CHECKS.map((item) => {
              const done = fieldFilled[item.key];
              return (
                <View key={item.key} style={styles.checkItem}>
                  <MaterialIcons
                    name={done ? "check-circle" : "radio-button-unchecked"}
                    size={16}
                    color={done ? successColor : iconMuted}
                  />
                  <StyledText
                    variant="labelSmall"
                    style={{
                      color: done ? textColor : iconMuted,
                      marginLeft: 6,
                    }}
                  >
                    {item.label}
                  </StyledText>
                </View>
              );
            })}
          </View>
        </View>

        <OnboardingSectionCard
          icon="store"
          title="Store assignment"
          subtitle="Which location they will manage"
        >
          <StoreLocationPicker
            stores={sellerStores}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
            isLoading={isLoadingStores}
            label="Assign to store"
          />
          {selectedStoreName ? (
            <View
              style={[
                styles.storeBadge,
                { backgroundColor: `${tintColor}10`, borderColor: tintColor },
              ]}
            >
              <MaterialIcons name="check-circle" size={16} color={tintColor} />
              <StyledText
                variant="labelSmall"
                style={{ color: tintColor, marginLeft: 8, flex: 1 }}
              >
                Managing {selectedStoreName}
              </StyledText>
            </View>
          ) : null}
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="badge"
          title="Profile"
          subtitle="Name shown in your team list"
        >
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <StyledTextInput
                label="First name"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => updateField("firstName", text)}
                autoComplete="given-name"
              />
              <FieldError message={errors.firstName} />
            </View>
            <View style={styles.fieldHalf}>
              <StyledTextInput
                label="Last name"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => updateField("lastName", text)}
                autoComplete="family-name"
              />
              <FieldError message={errors.lastName} />
            </View>
          </View>
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="email"
          title="Contact"
          subtitle="How they sign in and reach you"
        >
          <StyledTextInput
            label="Email"
            placeholder="name@company.com"
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
            inputMode="email"
            autoComplete="email"
            keyboardType="email-address"
            autoCapitalize="none"
            info="Used as their login username"
          />
          <FieldError message={errors.email} />
          <StyledTextInput
            label="Phone"
            placeholder="Mobile or business line"
            value={formData.phone}
            onChangeText={(text) => updateField("phone", text)}
            keyboardType="phone-pad"
            autoComplete="tel"
            info="For urgent order and support contact"
          />
          <FieldError message={errors.phone} />
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="shield"
          title="Secure access"
          subtitle="Set their initial password"
        >
          <View style={styles.passwordWrap}>
            <StyledTextInput
              label="Password"
              placeholder="Min. 8 characters, letters and numbers"
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              secureTextEntry={!showPassword}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityLabel="Toggle password visibility"
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={iconMuted}
              />
            </Pressable>
          </View>
          {showPasswordRules ? (
            <View
              style={[
                styles.requirementsBox,
                { backgroundColor: `${tintColor}08`, borderColor },
              ]}
            >
              <StyledText
                variant="labelMedium"
                style={{ color: textColor, marginBottom: 8 }}
              >
                Password requirements
              </StyledText>
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.test(formData.password);
                return (
                  <View key={req.key} style={styles.requirementRow}>
                    <MaterialIcons
                      name={met ? "check-circle" : "radio-button-unchecked"}
                      size={18}
                      color={met ? successColor : iconMuted}
                    />
                    <StyledText
                      variant="bodySmall"
                      style={{
                        color: met ? textColor : iconMuted,
                        marginLeft: 8,
                        flex: 1,
                      }}
                    >
                      {req.label}
                    </StyledText>
                  </View>
                );
              })}
              {!isPasswordStrong(formData.password) &&
              (submitAttempted || errors.password) ? (
                <StyledText
                  variant="bodySmall"
                  style={{ color: errorColor, marginTop: 8 }}
                >
                  {errors.password ??
                    "Password must meet every requirement above."}
                </StyledText>
              ) : null}
            </View>
          ) : (
            <StyledText variant="bodySmall" style={{ color: iconMuted }}>
              Use at least 8 characters with letters and numbers.
            </StyledText>
          )}

          <View style={styles.passwordWrap}>
            <StyledTextInput
              label="Confirm password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              secureTextEntry={!showConfirmPassword}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword((v) => !v)}
              accessibilityLabel="Toggle confirm password visibility"
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={20}
                color={iconMuted}
              />
            </Pressable>
          </View>
          {showMismatchError ? (
            <View style={styles.mismatchRow}>
              <MaterialIcons name="error-outline" size={18} color={errorColor} />
              <StyledText
                variant="bodySmall"
                style={{ color: errorColor, marginLeft: 8, flex: 1 }}
              >
                {errors.confirmPassword ?? "Passwords do not match"}
              </StyledText>
            </View>
          ) : formData.confirmPassword.length > 0 &&
            formData.password === formData.confirmPassword ? (
            <View style={styles.mismatchRow}>
              <MaterialIcons
                name="check-circle"
                size={18}
                color={successColor}
              />
              <StyledText
                variant="bodySmall"
                style={{ color: successColor, marginLeft: 8 }}
              >
                Passwords match
              </StyledText>
            </View>
          ) : null}
        </OnboardingSectionCard>
      </KeyboardWrapper>
    </GestureHandlerRootView>
  );
};

export default CreateAdminScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  blocked: {
    padding: 24,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  hero: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    gap: 2,
  },
  tipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressBlock: {
    gap: 10,
    paddingHorizontal: 2,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  checklist: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  passwordWrap: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 8,
    top: 32,
    zIndex: 1,
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementsBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 6,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mismatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButton: {
    width: "100%",
  },
});
