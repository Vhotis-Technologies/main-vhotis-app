import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router, useLocalSearchParams } from "expo-router";
import NotificationComponent from "@/app/component/helpers/settings/NotificationComponent";
import ProfileSettingComponent from "@/app/component/helpers/settings/ProfileSettingComponent";
import DetailDisplayComponent from "@/app/component/helpers/settings/DetailDisplayComponent";
import { UserDetails } from "@/app/interfaces/others/SettingsInterface";
import GeneralSettingComponent from "@/app/component/helpers/settings/GeneralSettingComponent";
import BillingSettingComponent from "@/app/component/helpers/settings/BillingSettingComponent";
import PasswordSettingComponent from "@/app/component/helpers/settings/PasswordSettingComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  canAccessSellerOwnerBilling,
} from "@/app/interfaces/main/Authentication";
import StyledText from "@/app/component/helpers/forms/StyledText";

const PRIVACY_STACK_HREF =
  "/seller/main/settings/privacy/PrivacyAndSecurityScreen" as Href;

const userDetails: UserDetails = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  photoUrl: "https://via.placeholder.com/150",
  role: "Seller",
  country: "Nigeria",
  timezone: "Africa/Lagos",
  bio: "I am a seller",
};

/** All settings entries (titles must match `getSettingContent` switch keys). */
const SETTING_TITLES = [
  "My Details",
  "Profile",
  "Notifications",
  "General",
  "Privacy & Security",
  "Billing",
  "Payment Methods",
  "Help",
  "Store",
] as const;

type SettingTitle = (typeof SETTING_TITLES)[number];

const OWNER_ONLY_SETTING_TITLES: SettingTitle[] = [
  "Billing",
  "Payment Methods",
];

type SettingRowConfig = {
  title: SettingTitle;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const GROUPS: { label: string; hint: string; items: SettingRowConfig[] }[] = [
  {
    label: "Profile & identity",
    hint: "How you appear to buyers",
    items: [
      {
        title: "My Details",
        subtitle: "Name, contact, bio",
        icon: "badge",
      },
      {
        title: "Profile",
        subtitle: "Photo & public profile",
        icon: "person",
      },
    ],
  },
  {
    label: "Preferences",
    hint: "App behaviour",
    items: [
      {
        title: "Notifications",
        subtitle: "Push, email, order alerts",
        icon: "notifications-none",
      },
      {
        title: "General",
        subtitle: "Language, theme, region",
        icon: "tune",
      },
    ],
  },
  {
    label: "Security & payments",
    hint: "Safety and money",
    items: [
      {
        title: "Privacy & Security",
        subtitle: "Password, devices, data",
        icon: "lock-outline",
      },
      {
        title: "Billing",
        subtitle: "Invoices & subscription",
        icon: "receipt-long",
      },
      {
        title: "Payment Methods",
        subtitle: "Payout accounts",
        icon: "payment",
      },
    ],
  },
  {
    label: "Business",
    hint: "Your storefront",
    items: [
      {
        title: "Store",
        subtitle: "Branding, hours, policies",
        icon: "storefront",
      },
    ],
  },
  {
    label: "Support",
    hint: "Guidance & policies",
    items: [
      {
        title: "Help",
        subtitle: "FAQs and contact",
        icon: "help-outline",
      },
    ],
  },
];

/** URL `section` query → fullscreen modal title (aligned with Store / Profile links). */
const SECTION_QUERY_TO_TITLE: Record<string, SettingTitle> = {
  payment_methods: "Payment Methods",
  billing: "Billing",
  store: "Store",
  notifications: "Notifications",
  profile: "Profile",
  general: "General",
  privacy: "Privacy & Security",
  details: "My Details",
  help: "Help",
};

const SellerSettingScreens = () => {
  const insets = useSafeAreaInsets();
  const { showFullscreenModal } = useModalService();
  const { user } = useAppSelector((state) => state.auth);
  const seller = user as Seller;
  const params = useLocalSearchParams<{
    section?: string | string[];
    storeFocus?: string | string[];
    storeId?: string | string[];
  }>();

  const isStoreAdmin = !canAccessSellerOwnerBilling(seller);

  const visibleGroups = useMemo(() => {
    if (!isStoreAdmin) {
      return GROUPS;
    }
    return GROUPS.map((group) => ({
      ...group,
      label: group.label === "Security & payments" ? "Security" : group.label,
      hint:
        group.label === "Security & payments" ? "Account safety" : group.hint,
      items: group.items.filter(
        (item) => !OWNER_ONLY_SETTING_TITLES.includes(item.title),
      ),
    })).filter((group) => group.items.length > 0);
  }, [isStoreAdmin]);

  const sectionParam = useMemo(() => {
    const s = params.section;
    if (s === undefined || s === null) return undefined;
    return Array.isArray(s) ? s[0] : s;
  }, [params.section]);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");

  const displayName = useMemo(
    () =>
      seller?.business_name?.trim() ||
      seller?.email?.split("@")[0] ||
      "Seller settings",
    [seller?.business_name, seller?.email],
  );

  const getSettingContent = useCallback(
    (setting: string) => {
      switch (setting.toLowerCase()) {
        case "notifications":
          return <NotificationComponent />;
        case "profile":
          return <ProfileSettingComponent />;
        case "my details":
          return <DetailDisplayComponent userDetails={userDetails} />;
        case "billing":
          return <BillingSettingComponent />;
        case "general":
          return <GeneralSettingComponent />;
        case "password":
          return <PasswordSettingComponent />;
        default:
          return <DetailDisplayComponent userDetails={userDetails} />;
      }
    },
    [],
  );

  const pushStoreProfile = useCallback(
    (options?: { storeId?: string; storeFocus?: string }) => {
      router.push({
        pathname: "/seller/main/settings/StoreDisplayscreen",
        params: {
          ...(options?.storeId ? { storeId: options.storeId } : {}),
          ...(options?.storeFocus ? { storeFocus: options.storeFocus } : {}),
        },
      });
    },
    [],
  );

  const openSetting = useCallback(
    (title: SettingTitle) => {
      if (isStoreAdmin && OWNER_ONLY_SETTING_TITLES.includes(title)) {
        return;
      }
      showFullscreenModal(getSettingContent(title), title);
    },
    [getSettingContent, isStoreAdmin, showFullscreenModal],
  );

  const openSettingRow = useCallback(
    (title: SettingTitle) => {
      if (isStoreAdmin && OWNER_ONLY_SETTING_TITLES.includes(title)) {
        return;
      }
      if (title === "Payment Methods") {
        router.push("/seller/main/settings/PaymentFlowScreen");
        return;
      }
      if (title === "Privacy & Security") {
        router.push(PRIVACY_STACK_HREF);
        return;
      }
      if (title === "Store") {
        pushStoreProfile();
        return;
      }
      openSetting(title);
    },
    [openSetting, isStoreAdmin, pushStoreProfile],
  );

  useEffect(() => {
    if (!sectionParam || typeof sectionParam !== "string") return;

    const mappedTitle =
      SECTION_QUERY_TO_TITLE[sectionParam] ??
      (SETTING_TITLES.includes(sectionParam as SettingTitle)
        ? (sectionParam as SettingTitle)
        : undefined);

    if (!mappedTitle || !SETTING_TITLES.includes(mappedTitle)) return;

    if (isStoreAdmin && OWNER_ONLY_SETTING_TITLES.includes(mappedTitle)) {
      return;
    }

    const storeIdFromQuery = (() => {
      const s = params.storeId;
      if (s == null) return undefined;
      const v = Array.isArray(s) ? s[0] : s;
      return v?.trim() || undefined;
    })();
    const storeFocusFromQuery = (() => {
      const s = params.storeFocus;
      if (s == null) return undefined;
      const v = Array.isArray(s) ? s[0] : s;
      if (v === "hours" || v === "policies" || v === "identity") return v;
      return undefined;
    })();

    const id = requestAnimationFrame(() => {
      if (mappedTitle === "Payment Methods") {
        router.push("/seller/main/settings/PaymentFlowScreen");
        return;
      }
      if (mappedTitle === "Privacy & Security") {
        router.push(PRIVACY_STACK_HREF);
        return;
      }
      if (mappedTitle === "Store") {
        pushStoreProfile({
          storeId: storeIdFromQuery,
          storeFocus: storeFocusFromQuery,
        });
        return;
      }
      showFullscreenModal(getSettingContent(mappedTitle), mappedTitle);
    });

    return () => cancelAnimationFrame(id);
  }, [
    sectionParam,
    getSettingContent,
    showFullscreenModal,
    isStoreAdmin,
    pushStoreProfile,
    params.storeId,
    params.storeFocus,
  ]);

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
        <LinearGradient
          colors={[`${backgroundColor}B3`, `${tintColor}40`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <StyledText variant="labelMedium" style={styles.heroEyebrow}>
            Control center
          </StyledText>
          <StyledText variant="headlineSmall" style={styles.heroTitle}>
            Settings
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.heroSubtitle}>
            {displayName}
            {seller?.email ? ` · ${seller.email}` : ""}
          </StyledText>
        </LinearGradient>

        {visibleGroups.map((group) => (
          <View key={group.label} style={styles.group}>
            <View style={styles.groupHeader}>
              <StyledText variant="titleSmall" style={{ color: textColor }}>
                {group.label}
              </StyledText>
              <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                {group.hint}
              </StyledText>
            </View>
            <View
              style={[
                styles.groupCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              {group.items.map((item, index) => (
                <Pressable
                  key={item.title}
                  onPress={() => openSettingRow(item.title)}
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
                    style={[
                      styles.rowIcon,
                      { backgroundColor: `${tintColor}18` },
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={22}
                      color={tintColor}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <StyledText
                      variant="titleSmall"
                      style={{ color: textColor }}
                    >
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SellerSettingScreens;

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
  hero: {
    marginHorizontal: -16,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    marginBottom: 8,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 11,
  },
  heroTitle: {
    color: "#FFFFFF",
    marginTop: 6,
    fontFamily: "RobotoBold",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 8,
    lineHeight: 22,
  },
  group: {
    marginTop: 22,
  },
  groupHeader: {
    marginBottom: 10,
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
