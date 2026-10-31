import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import StyledText from "../../helpers/forms/StyledText";
import { useAppSelector } from "@/app/store/store";
import CustomSwitchComponent from "../../helpers/others/CustomSwitchComponent";
import { RootState } from "@/app/store/store";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import { showFulfillmentInNav } from "@/app/_utils/seller/fulfillmentAccess";
import { router } from "expo-router";
import { Seller } from "@/app/interfaces/main/Authentication";

const PRIMARY = "#6366F1";
const ACTIVE_BG_LIGHT = "#000000";
const BADGE_SOFT_BG = "#EEF2FF";
const BORDER_LIGHT = "#E5E7EB";

type NavItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  badge?: string;
  badgeVariant?: "purple" | "danger";
  fulfillment?: boolean;
};

const PRIMARY_ITEMS: NavItem[] = [
  { key: "home", label: "Home", icon: "home-outline", route: "dashboard" },
  {
    key: "inventory",
    label: "Inventory",
    icon: "cube-outline",
    route: "products",
  },
  {
    key: "orders",
    label: "Orders",
    icon: "people-outline",
    route: "orders",
  },
  {
    key: "promotions",
    label: "Promotions",
    icon: "pricetag-outline",
    route: "promotions",
  },
  {
    key: "sponsored",
    label: "Sponsored",
    icon: "megaphone-outline",
    route: "sponsored",
  },
  {
    key: "store",
    label: "My Business",
    icon: "business-outline",
    route: "store",
  },
];

const SECONDARY_ITEMS: NavItem[] = [
  {
    key: "tickets",
    label: "Tickets",
    icon: "ticket-outline",
    route: "tickets",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    route: "notification",
    badge: "+9",
    badgeVariant: "danger",
  },
  {
    key: "communication",
    label: "Communication",
    icon: "chatbox-outline",
    route: "communication",
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings-outline",
    route: "settings",
  },
  { key: "help", label: "Help", icon: "help-circle-outline", route: "help" },
];

function DrawerComponent(props: DrawerContentComponentProps) {
  const authUser = useAppSelector((s) => s.auth.user) as Seller | null;
  const footerLabel = useMemo(() => {
    if (authUser?.business_name?.trim()) return authUser.business_name;
    const first = authUser?.email?.split("@")[0];
    return first || "Account";
  }, [authUser?.business_name, authUser?.email]);
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === "dark";
  const { isStoreOpen } = useAppSelector((state: RootState) => state.store);
  const { toggleStoreOpen, isUpdatingStore } = useSellerStore();
  const { status: fulfillmentStatus } = useFulfillmentStatus();

  const primaryItems = useMemo(() => {
    if (!showFulfillmentInNav(fulfillmentStatus)) {
      return PRIMARY_ITEMS;
    }
    const items = [...PRIMARY_ITEMS];
    items.splice(6, 0, {
      key: "fulfillment",
      label: "Fulfillment",
      icon: "archive-outline",
      fulfillment: true,
    });
    return items;
  }, [fulfillmentStatus]);

  const surface = isDark ? Colors.dark.cards : "#FFFFFF";
  const textMain = isDark ? Colors.dark.text : "#1F2937";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const activeBg = isDark ? "#2C2C2E" : ACTIVE_BG_LIGHT;
  const border = isDark ? Colors.dark.borders : BORDER_LIGHT;

  const drawerRoute = props.state.routes[props.state.index];
  const activeRoute =
    getFocusedRouteNameFromRoute(drawerRoute) ?? drawerRoute?.name ?? "";
  const isProfileScreenActive = activeRoute === "ProfileScreen";

  const navigateTo = useCallback(
    (item: NavItem) => {
      if (item.fulfillment) {
        if (fulfillmentStatus === "active") {
          router.push("/seller/main/store/fufillment/FulfillmentDashboardScreen");
        } else {
          router.push("/seller/main/store/fufillment/FulfillmentOnboardingScreen");
        }
      } else if (item.route) {
        props.navigation.navigate(item.route as never);
      }
      props.navigation.closeDrawer();
    },
    [props.navigation, fulfillmentStatus],
  );

  const isRowActive = (item: NavItem) => {
    if (!item.route) return false;
    switch (item.key) {
      case "home":
        return activeRoute === "DashboardScreen";
      case "products":
        return (
          activeRoute === "products" ||
          activeRoute === "InventoryScreen" ||
          activeRoute === "ProductsScreen" ||
          activeRoute === "ProductDetailScreen" ||
          activeRoute === "BulkInventoryScreen" ||
          activeRoute === "BulkInventoryDetailScreen"
        );
      case "orders":
        return (
          activeRoute === "OrdersScreen" ||
          activeRoute === "SellerOrdersDetailsScreen"
        );
      case "promotions":
        return (
          activeRoute === "PromotionsScreen" ||
          activeRoute === "PromotionHistoryScreen"
        );
      case "communication":
        return (
          activeRoute === "MessageScreen" ||
          activeRoute === "MessageDetailScreen" ||
          activeRoute === "ReviewScreen" ||
          activeRoute === "ReviewDetailScreen"
        );
      case "settings":
        return (
          activeRoute === "SellerSettingScreens" ||
          activeRoute === "StoreDisplayscreen" ||
          activeRoute === "PaymentFlowScreen"
        );
      case "help":
        return activeRoute === "HelpScreen";
      case "tickets":
        return (
          activeRoute === "TicketScreen" ||
          activeRoute === "TicketDetailScreen"
        );
      case "store":
        return (
          activeRoute === "StoreScreen" ||
          activeRoute === "SubscriptionScreen" ||
          activeRoute === "SubscriptionPlans" ||
          activeRoute === "ManagementScreen" ||
          activeRoute === "StoreDetailsScreen" ||
          activeRoute === "CreateStoreScreen" ||
          activeRoute === "CreateAdminScreen" ||
          activeRoute === "BillingHistoryScreen" ||
          activeRoute === "AnalyticScreen" ||
          activeRoute === "PromotionHistoryScreen" ||
          activeRoute === "PromotionsScreen"
        );
      case "fulfillment":
        return (
          activeRoute === "FulfillmentOnboardingScreen" ||
          activeRoute === "FulfillmentDashboardScreen" ||
          activeRoute === "ManifestBuilderScreen" ||
          activeRoute === "InboundDetailScreen" ||
          activeRoute === "CollectionBookingScreen" ||
          activeRoute === "FulfillmentDetailContent"
        );
      default:
        return false;
    }
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: surface, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <StyledText
          variant="titleLarge"
          style={styles.brandText}
          children="Vhotis Seller"
        />

        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* This view is designed to close the shop or open it.
          It uses a custom switch component to toggle the shop status. */}
      <View
        style={[
          styles.shopStatusContainer,
          {
            borderColor: border,
            backgroundColor: isDark ? "#1A1A1C" : "#F8FAFC",
          },
        ]}
      >
        <View style={styles.shopStatusText}>
          <StyledText variant="titleMedium">Store</StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: textMuted, marginTop: 2 }}
          >
            {isStoreOpen ? "Accepting orders" : "Orders paused"}
          </StyledText>
        </View>
        <CustomSwitchComponent
          isOn={isStoreOpen}
          onToggle={() => {
            void toggleStoreOpen();
          }}
          onText="OPEN"
          offText="CLOSED"
          isLoading={isUpdatingStore}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navBlock}>
          {primaryItems.map((item) => {
            const rowActive = isRowActive(item);

            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  navigateTo(item);
                }}
                style={({ pressed }) => [
                  [styles.row],
                  rowActive && {
                    backgroundColor: activeBg,
                    borderWidth: 0.4,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={rowActive ? textMain : textMuted}
                />
                <Text
                  style={[
                    styles.rowLabel,
                    { color: rowActive ? textMain : textMuted },
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge ? (
                  <View
                    style={[
                      styles.badge,
                      item.badgeVariant === "purple" && {
                        backgroundColor: isDark ? "#312E81" : BADGE_SOFT_BG,
                      },
                      item.badgeVariant === "danger" && {
                        backgroundColor: isDark ? "#4C1D95" : BADGE_SOFT_BG,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: PRIMARY },
                        item.badgeVariant === "danger" && { color: PRIMARY },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <View style={styles.navBlock}>
          {SECONDARY_ITEMS.map((item) => {
            const rowActive = isRowActive(item);
            return (
              <Pressable
                key={item.key}
                onPress={() => navigateTo(item)}
                style={({ pressed }) => [
                  styles.row,
                  rowActive && { backgroundColor: activeBg },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={rowActive ? textMain : textMuted}
                />
                <Text
                  style={[
                    styles.rowLabel,
                    { color: textMain },
                    !rowActive && { color: textMuted },
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: isDark ? "#312E81" : BADGE_SOFT_BG },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: PRIMARY }]}>
                      {item.badge}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.footerChip,
            isProfileScreenActive && { backgroundColor: activeBg },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            props.navigation.navigate("profile" as never);
            props.navigation.closeDrawer();
          }}
        >
          <StyledText style={[styles.footerLabel, { color: textMain }]}>
            {footerLabel}
          </StyledText>

          <Ionicons name="chevron-forward" size={16} color={textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

export default DrawerComponent;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 22,
    fontFamily: "BarlowMedium",
    letterSpacing: -0.3,
    fontWeight: "300",
    fontStyle: "italic",
  },
  iconBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  navBlock: {
    gap: 4,
  },
  spacer: {
    height: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "RobotoRegular",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "RobotoMedium",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20,
  },
  footerChip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: 10,
  },
  teamSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  footerLabel: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "RobotoMedium",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  shopStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  shopStatusText: {
    flex: 1,
    marginRight: 8,
  },
});
