import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  isStoreAdminUser,
} from "@/app/interfaces/main/Authentication";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";

type MenuItem = {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  href: string;
};

const ACCOUNT_LINKS: MenuItem[] = [
  {
    key: "settings",
    icon: "tune",
    title: "All settings",
    subtitle: "Notifications, privacy, general",
    href: "/seller/main/settings/SellerSettingScreens",
  },
  {
    key: "store",
    icon: "storefront",
    title: "Store profile",
    subtitle: "Branding & storefront details",
    href: "/seller/main/settings/StoreDisplayscreen",
  },
  {
    key: "billing",
    icon: "receipt-long",
    title: "Billing",
    subtitle: "Plans & invoices",
    href: "/seller/main/settings/SellerSettingScreens?section=billing",
  },
  {
    key: "payments",
    icon: "payment",
    title: "Payment methods",
    subtitle: "Payout accounts",
    href: "/seller/main/settings/PaymentFlowScreen",
  },
];

function getAvatarSource(seller: Seller | null) {
  const fallback = require("@/assets/images/user_image.jpg");
  const p = seller?.photo;
  if (!p) return fallback;
  if (typeof p === "string" && p.length > 0) return { uri: p };
  if (typeof p === "object" && p !== null && "uri" in p) {
    const uri = (p as { uri?: string }).uri;
    if (typeof uri === "string" && uri.length > 0) return { uri };
  }
  return fallback;
}

const MORE_LINKS: MenuItem[] = [
  {
    key: "store-hub",
    icon: "dashboard-customize",
    title: "My Store hub",
    subtitle: "Products, analytics, subscription",
    href: "/seller/main/store/StoreScreen",
  },
  {
    key: "help",
    icon: "help-outline",
    title: "Help & support",
    href: "/seller/main/help/HelpScreen",
  },
];

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuthContext();
  const seller = useAppSelector((s) => s.auth.user) as Seller | null;

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");

  const displayName =
    seller?.business_name?.trim() || seller?.email?.split("@")[0] || "Seller";
  const email = seller?.email ?? "—";
  const city = seller?.business_city?.trim();
  const verified = seller?.is_verified;

  const accountLinks = useMemo(() => {
    if (!isStoreAdminUser(seller)) {
      return ACCOUNT_LINKS;
    }
    return ACCOUNT_LINKS.filter(
      (item) => item.key !== "billing" && item.key !== "payments",
    );
  }, [seller]);

  const openHref = (href: string) => {
    router.push(href as never);
  };

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.key}
      onPress={() => openHref(item.href)}
      style={({ pressed }) => [
        styles.menuRow,
        {
          backgroundColor: cardColor,
          borderColor,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: `${tintColor}14` }]}>
        <MaterialIcons name={item.icon} size={22} color={tintColor} />
      </View>
      <View style={styles.menuTextCol}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          {item.title}
        </StyledText>
        {item.subtitle ? (
          <StyledText
            variant="bodySmall"
            style={{ color: mutedColor, marginTop: 2 }}
            numberOfLines={2}
          >
            {item.subtitle}
          </StyledText>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={mutedColor} />
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[`${tintColor}CC`, `${tintColor}55`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: 8 }]}
        >
          <View style={styles.avatarWrap}>
            <Image source={getAvatarSource(seller)} style={styles.avatar} />
            {verified ? (
              <View style={[styles.verifiedBadge, { borderColor: cardColor }]}>
                <MaterialIcons name="verified" size={18} color={tintColor} />
              </View>
            ) : null}
          </View>
          <StyledText variant="headlineSmall" style={styles.heroName}>
            {displayName}
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.heroEmail}>
            {email}
          </StyledText>
          {city ? (
            <View style={styles.cityRow}>
              <MaterialIcons
                name="place"
                size={16}
                color="rgba(255,255,255,0.9)"
              />
              <StyledText variant="bodySmall" style={styles.heroMeta}>
                {city}
              </StyledText>
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.section}>
          <StyledText
            variant="labelLarge"
            style={[styles.sectionLabel, { color: mutedColor }]}
          >
            Account
          </StyledText>
          {accountLinks.map(renderMenuItem)}
        </View>

        <View style={styles.section}>
          <StyledText
            variant="labelLarge"
            style={[styles.sectionLabel, { color: mutedColor }]}
          >
            Selling
          </StyledText>
          {MORE_LINKS.map(renderMenuItem)}
        </View>

        <Pressable
          onPress={() => handleLogout()}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              borderColor: "#EF4444",
              backgroundColor: pressed ? "rgba(239,68,68,0.08)" : "transparent",
            },
          ]}
        >
          <MaterialIcons name="logout" size={22} color="#EF4444" />
          <StyledText
            variant="titleSmall"
            style={{ color: "#EF4444", marginLeft: 10 }}
          >
            Log out
          </StyledText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  hero: {
    marginHorizontal: -16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    padding: 2,
  },
  heroName: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroEmail: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    textAlign: "center",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  heroMeta: {
    color: "rgba(255,255,255,0.9)",
  },
  section: {
    marginTop: 22,
    gap: 10,
  },
  sectionLabel: {
    marginBottom: 4,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontSize: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextCol: {
    flex: 1,
  },
  logoutBtn: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
});
