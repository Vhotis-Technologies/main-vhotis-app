import StyledText from "@/app/component/helpers/forms/StyledText";
import IconButtons from "@/app/component/helpers/others/IconButtons";
import { Seller } from "@/app/interfaces/main/Authentication";
import {
  LogoAndDetailsInterface,
  WebSidecomponentProps,
} from "@/app/interfaces/seller/StoreInterfaces";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import { Pressable, StyleSheet, View, Animated } from "react-native";
import LogoAndDetails from "./LogoAndDetails";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSellerMessages } from "@/app/hook/seller/useSellerMessages";
import { useAppSelector } from "@/app/store/store";
import { RootState } from "@/app/store/store";

const WebSidecomponent = ({ user, logout }: WebSidecomponentProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const widthAnim = useRef(new Animated.Value(280)).current;

  const { stats } = useSellerMessages();
  const { isStoreOpen } = useAppSelector((state: RootState) => state.store);

  const backgroundColor = useThemeColor({}, "cards");
  const tintColor = useThemeColor({}, "tint");

  // Get the user details in the store

  const toggleCollapse = () => {
    const toValue = isCollapsed ? 280 : 70;
    Animated.timing(widthAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: widthAnim, backgroundColor: backgroundColor },
      ]}
    >
      {/* Logo and business details */}
      <View style={styles.logoContainer}>
        {!isCollapsed && (
          <LogoAndDetails
            image={require("@/assets/images/user_image.jpg")}
            business_name={user?.business_name || ""}
            business_city={user?.business_city || ""}
            on_line={isStoreOpen ? "open" : "closed"}
          />
        )}
        <Pressable onPress={toggleCollapse} style={styles.arrowButton}>
          <FontAwesome
            name={isCollapsed ? "arrow-right" : "arrow-left"}
            size={20}
            color={tintColor}
          />
        </Pressable>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sections}>
          {!isCollapsed && (
            <StyledText variant="titleMedium">General</StyledText>
          )}
          <View style={styles.sectionContent}>
            <IconButtons
              icon={
                <FontAwesome name="dashboard" size={24} color={tintColor} />
              }
              onPress={() =>
                router.push("/seller/web/dashboard/WebDashboardScreen")
              }
              title={isCollapsed ? "" : "Dashboard"}
              variant="side-component"
            />

            <IconButtons
              icon={<MaterialIcons name="store" size={24} color={tintColor} />}
              onPress={() => router.push("/seller/web/store/WebStoreScreen")}
              title={isCollapsed ? "" : "Store"}
              variant="side-component"
            />

            <IconButtons
              icon={
                <MaterialIcons name="inventory" size={24} color={tintColor} />
              }
              onPress={() =>
                router.push("/seller/web/products/WebProductScreen")
              }
              title={isCollapsed ? "" : "Inventory"}
              variant="side-component"
            />

            <IconButtons
              icon={<MaterialIcons name="chat" size={24} color={tintColor} />}
              onPress={() => router.push("/seller/web/messages/MessageScreen")}
              title={isCollapsed ? "" : "Communications"}
              variant="side-component"
              helper={isCollapsed ? "" : stats.total.toString()}
            />
          </View>
        </View>

        <View style={styles.sections}>
          {!isCollapsed && (
            <StyledText variant="titleMedium">Fulfillments</StyledText>
          )}
          <View style={styles.sectionContent}>
            <IconButtons
              icon={
                <MaterialIcons name="receipt" size={24} color={tintColor} />
              }
              onPress={() => router.push("/seller/web/orders/WebOrderScreen")}
              title={isCollapsed ? "" : "Orders"}
              variant="side-component"
            />

            <IconButtons
              icon={
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={tintColor}
                />
              }
              onPress={() =>
                router.push("/seller/web/notifications/NotificationScreen")
              }
              title={isCollapsed ? "" : "Notifications"}
              variant="side-component"
            />

            <IconButtons
              icon={<FontAwesome name="inbox" size={24} color={tintColor} />}
              onPress={() =>
                router.push("/seller/web/invoices/WebInvoiceScreen")
              }
              title={isCollapsed ? "" : "Invoices"}
              variant="side-component"
            />
          </View>
        </View>

        <View style={styles.sections}>
          {!isCollapsed && (
            <StyledText variant="titleMedium">Security</StyledText>
          )}
          <View style={styles.sectionContent}>
            <IconButtons
              icon={
                <MaterialIcons name="settings" size={24} color={tintColor} />
              }
              onPress={() =>
                router.push("/seller/web/settings/WebSettingSceen")
              }
              title={isCollapsed ? "" : "Settings"}
              variant="side-component"
            />

            <IconButtons
              icon={
                <MaterialIcons name="ads-click" size={24} color={tintColor} />
              }
              onPress={() =>
                router.push("/seller/web/promotions/WebPromotionsScreen")
              }
              title={isCollapsed ? "" : "Promotions"}
              variant="side-component"
            />
          </View>
        </View>

        <View style={styles.logoutSection}>
          <IconButtons
            icon={
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={tintColor}
              />
            }
            onPress={logout}
            title={isCollapsed ? "" : "Logout"}
            variant="side-component"
          />
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default WebSidecomponent;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  logoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  sections: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    marginBottom: 15,
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionContent: {
    gap: 8,
  },
  logoutSection: {
    padding: 15,
    marginTop: "auto",
  },
});
