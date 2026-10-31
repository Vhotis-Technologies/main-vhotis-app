import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  PASSWORD_SECURITY_FLOW_PARAM,
  PASSWORD_SECURITY_FLOWS,
} from "@/app/seller/main/settings/privacy/passwordSecurityFlow";
import { useAppSelector } from "@/app/store/store";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";

type HubDestination =
  | { kind: "path"; pathname: Href }
  | {
      kind: "passwordSecurity";
      flow: (typeof PASSWORD_SECURITY_FLOWS)["PASSWORD" | "WALLET"];
    };

type HubRow = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  destination: HubDestination;
};

const DEVICE_SESSIONS_PATH =
  "/seller/main/settings/privacy/DevicesAndSession" as Href;
const PASSWORD_SECURITY_BASE_PATH =
  "/seller/main/settings/privacy/PasswordAndSecurity" as Href;

const HUB_ROWS: HubRow[] = [
  {
    title: "Devices & sessions",
    subtitle: "See where you're signed in and sign out remotely",
    icon: "devices",
    destination: { kind: "path", pathname: DEVICE_SESSIONS_PATH },
  },
  {
    title: "Account password",
    subtitle: "Change the password you use to log in",
    icon: "lock-outline",
    destination: {
      kind: "passwordSecurity",
      flow: PASSWORD_SECURITY_FLOWS.PASSWORD,
    },
  },
  {
    title: "Wallet code",
    subtitle: "4–6 digit code for withdrawals and payouts",
    icon: "payments",
    destination: {
      kind: "passwordSecurity",
      flow: PASSWORD_SECURITY_FLOWS.WALLET,
    },
  },
];

function navigateHubRow(destination: HubDestination) {
  if (destination.kind === "path") {
    router.push(destination.pathname);
    return;
  }
  const qs = `${PASSWORD_SECURITY_FLOW_PARAM}=${destination.flow}`;
  router.push(`${PASSWORD_SECURITY_BASE_PATH}?${qs}` as Href);
}

const PrivacyAndSecurityScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const isStoreAdmin = isStoreAdminUser(user);
  const hubRows = isStoreAdmin
    ? HUB_ROWS.filter((row) => row.title !== "Wallet code")
    : HUB_ROWS;
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingBottom: 28 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.groupHeader}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Security
          </StyledText>
          <StyledText variant="labelSmall" style={{ color: mutedColor }}>
            Manage access to your seller account
          </StyledText>
        </View>
        <View
          style={[
            styles.groupCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {hubRows.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() => navigateHubRow(item.destination)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && [
                  styles.rowBorder,
                  { borderTopColor: borderColor },
                ],
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <View
                style={[styles.rowIcon, { backgroundColor: `${tintColor}18` }]}
              >
                <MaterialIcons name={item.icon} size={22} color={tintColor} />
              </View>
              <View style={styles.rowText}>
                <StyledText variant="titleSmall" style={{ color: textColor }}>
                  {item.title}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={{ color: mutedColor, marginTop: 2 }}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </StyledText>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={mutedColor}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyAndSecurityScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
  },
  groupHeader: {
    marginBottom: 10,
    marginTop: 8,
    gap: 2,
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
});
