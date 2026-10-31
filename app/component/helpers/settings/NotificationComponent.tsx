import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import StyledButton from "../buttons/StyledButton";
import StyledText from "../forms/StyledText";
import KeyboardWrapper from "../KeyboardWrapper";
import ToggleComponent from "./helpers/ToggleComponent";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNotificationPreferences } from "@/app/hook/main/useNotificationPreferences";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { NotificationSettings } from "@/app/interfaces/main/settings/SettingsInterface";

type ToggleRow = {
  key: keyof NotificationSettings;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
};

const NOTIFICATION_ROWS: ToggleRow[] = [
  {
    key: "pushNotifications",
    icon: "notifications-active",
    title: "Push notifications",
    subtitle: "Order alerts, claims, and delivery updates on this device",
  },
  {
    key: "emailNotifications",
    icon: "email",
    title: "Email notifications",
    subtitle: "Receipts, account messages, and important account updates",
  },
  {
    key: "marketingEmails",
    icon: "campaign",
    title: "Marketing emails",
    subtitle: "Promotions, tips, and product recommendations",
  },
];

const NotificationComponent = () => {
  const { showSnackbarWithConfig } = useSnackbar();
  const {
    settings,
    hasChanges,
    isLoading,
    isSaving,
    toggleSetting,
    saveSettings,
  } = useNotificationPreferences();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");

  const handleSave = useCallback(async () => {
    try {
      await saveSettings();
      showSnackbarWithConfig({
        message: "Notification preferences saved.",
        type: "success",
        duration: 3000,
      });
    } catch {
      showSnackbarWithConfig({
        message: "Could not save notification settings. Try again.",
        type: "error",
        duration: 3500,
      });
    }
  }, [saveSettings, showSnackbarWithConfig]);

  const openSupport = useCallback(() => {
    router.push("/seller/main/help/HelpScreen");
  }, []);

  const renderToggleRow = (row: ToggleRow, isLast: boolean) => (
    <View
      key={row.key}
      style={[
        styles.toggleRow,
        !isLast && styles.rowDivider,
        !isLast && { borderBottomColor: borderColor },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: `${tintColor}14` }]}
      >
        <MaterialIcons name={row.icon} size={20} color={tintColor} />
      </View>
      <View style={styles.rowCopy}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {row.title}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: mutedColor }}>
          {row.subtitle}
        </StyledText>
      </View>
      <ToggleComponent
        label={row.title}
        value={settings[row.key]}
        onValueChange={(value) => toggleSetting(row.key, value)}
        size="small"
        disabled={isLoading || isSaving}
      />
    </View>
  );

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <View style={styles.footerMeta}>
        <MaterialIcons
          name={hasChanges ? "sync" : "cloud-done"}
          size={18}
          color={hasChanges ? tintColor : successColor}
        />
        <StyledText
          variant="bodySmall"
          style={{ color: mutedColor, flex: 1, marginLeft: 8 }}
        >
          {isLoading
            ? "Loading preferences from your account…"
            : hasChanges
              ? "Unsaved changes — sync when ready."
              : "Synced with your account."}
        </StyledText>
      </View>
      <StyledButton
        title="Update settings"
        onPress={handleSave}
        variant="medium"
        loading={isSaving}
        disabled={isLoading || isSaving || !hasChanges}
        buttonStyles={styles.submitButton}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <KeyboardWrapper
        backgroundColor={backgroundColor}
        footer={footer}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[`${tintColor}CC`, `${tintColor}55`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.heroIcon, { backgroundColor: cardColor }]}>
            <MaterialIcons name="notifications" size={32} color={tintColor} />
          </View>
          <StyledText variant="headlineSmall" style={styles.heroTitle}>
            Stay in the loop
          </StyledText>
          <StyledText variant="bodySmall" style={styles.heroHint}>
            Choose how we reach you for orders and account activity
          </StyledText>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={tintColor} />
            <StyledText
              variant="bodySmall"
              style={{ color: mutedColor, marginTop: 10 }}
            >
              Fetching your notification preferences…
            </StyledText>
          </View>
        ) : (
          <View style={styles.sectionsGap}>
            <OnboardingSectionCard
              icon="tune"
              title="Delivery channels"
              subtitle="Synced with your Vhotis account"
            >
              {NOTIFICATION_ROWS.map((row, index) =>
                renderToggleRow(row, index === NOTIFICATION_ROWS.length - 1),
              )}
            </OnboardingSectionCard>

            <OnboardingSectionCard
              icon="help-outline"
              title="Need more help?"
              subtitle="Our support team can adjust alerts for your store"
            >
              <StyledText
                variant="bodySmall"
                style={{ color: mutedColor, marginBottom: 14, lineHeight: 20 }}
              >
                If you require further assistance or have questions about
                notifications, we are here to help.
              </StyledText>
              <Pressable
                onPress={openSupport}
                style={({ pressed }) => [
                  styles.supportBtn,
                  {
                    backgroundColor: `${tintColor}14`,
                    borderColor: tintColor,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <MaterialIcons name="support-agent" size={18} color={tintColor} />
                <StyledText
                  variant="labelLarge"
                  style={{ color: tintColor, marginLeft: 8 }}
                >
                  Contact support
                </StyledText>
              </Pressable>
            </OnboardingSectionCard>
          </View>
        )}
      </KeyboardWrapper>
    </View>
  );
};

export default NotificationComponent;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  hero: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroHint: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionsGap: {
    gap: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
