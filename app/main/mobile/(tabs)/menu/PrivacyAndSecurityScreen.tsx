import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import DeviceSessionsSection from "@/app/component/helpers/settings/DeviceSessionsSection";

type SecurityTip = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
};

const SECURITY_TIPS: SecurityTip[] = [
  {
    icon: "devices",
    title: "Review active sessions",
    body: "Check which devices are signed in and remove ones you do not recognize.",
  },
  {
    icon: "logout",
    title: "Sign out unused devices",
    body: "End sessions on old phones, tablets, or browsers you no longer use.",
  },
  {
    icon: "lock-outline",
    title: "Use a strong password",
    body: "Update your password regularly from account settings.",
  },
];

const PrivacyAndSecurityScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Privacy & security
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconMuted }}>
            Manage where you are signed in and keep your account safe
          </StyledText>
        </View>

        <View style={[styles.heroCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${tintColor}14` }]}>
            <MaterialIcons name="shield" size={28} color={tintColor} />
          </View>
          <View style={styles.heroCopy}>
            <StyledText variant="labelLarge" style={{ color: textColor }}>
              Your account protection
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted, lineHeight: 18 }}>
              Monitor signed-in devices and follow the tips below to reduce
              unauthorized access.
            </StyledText>
          </View>
        </View>

        <DeviceSessionsSection />

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Security tips
          </StyledText>
          <View style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}>
            {SECURITY_TIPS.map((tip, index) => (
              <View
                key={tip.title}
                style={[
                  styles.tipRow,
                  index < SECURITY_TIPS.length - 1 && styles.tipRowDivider,
                  index < SECURITY_TIPS.length - 1 && { borderBottomColor: borderColor },
                ]}
              >
                <View
                  style={[styles.tipIconWrap, { backgroundColor: `${tintColor}14` }]}
                >
                  <MaterialIcons name={tip.icon} size={20} color={tintColor} />
                </View>
                <View style={styles.tipCopy}>
                  <StyledText variant="labelMedium" style={{ color: textColor }}>
                    {tip.title}
                  </StyledText>
                  <StyledText variant="bodySmall" style={{ color: iconMuted, lineHeight: 18 }}>
                    {tip.body}
                  </StyledText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Two-factor authentication
          </StyledText>
          <View style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.twoFactorRow}>
              <View
                style={[styles.tipIconWrap, { backgroundColor: `${tintColor}14` }]}
              >
                <MaterialIcons name="verified-user" size={20} color={tintColor} />
              </View>
              <View style={styles.tipCopy}>
                <View style={styles.twoFactorTitleRow}>
                  <StyledText variant="labelMedium" style={{ color: textColor }}>
                    Extra sign-in protection
                  </StyledText>
                  <View style={[styles.comingSoonBadge, { backgroundColor: `${iconMuted}22` }]}>
                    <StyledText variant="labelSmall" style={{ color: iconMuted }}>
                      Coming soon
                    </StyledText>
                  </View>
                </View>
                <StyledText variant="bodySmall" style={{ color: iconMuted, lineHeight: 18 }}>
                  Add a verification step when signing in for stronger account
                  security.
                </StyledText>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.disabledAction,
                {
                  borderColor,
                  opacity: pressed ? 0.85 : 0.55,
                },
              ]}
              disabled
            >
              <MaterialIcons name="phonelink-lock" size={18} color={iconMuted} />
              <StyledText variant="labelMedium" style={{ color: iconMuted }}>
                Enable two-factor authentication
              </StyledText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyAndSecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 20,
  },
  headerCopy: {
    gap: 4,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  section: {
    gap: 10,
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tipRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCopy: {
    flex: 1,
    gap: 4,
  },
  twoFactorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  twoFactorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  disabledAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 14,
    marginTop: 4,
    marginBottom: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
