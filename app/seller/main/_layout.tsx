/**
 * Seller app shell: drawer navigation + push notification bootstrap.
 *
 * Each Drawer.Screen maps to a folder under app/seller/main/. Store-scoped
 * flows (finance, subscription) live under the store/ nested stack.
 */
import React from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import {StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import DrawerComponent from "@/app/component/seller/helper/DrawerComponent";
import NotificationSetup from "@/app/component/main/notification/NotificationSetup";
import { SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import { transpose } from "date-fns";

const SellerMobileLayout = () => {
  const { currentTheme } = useThemeContext();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <React.Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor}} edges={["bottom"]} >
        <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
      {/* Registers FCM token and handles foreground notification taps */}
      <NotificationSetup />
      <Drawer
        drawerContent={(props) => <DrawerComponent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            width: 300,
            backgroundColor: backgroundColor,
          },
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            title: "Home",
            headerTitle: "Home",
          }}
        />

        <Drawer.Screen
          name="products"
          options={{
            title: "Products",
            headerTitle: "Products",
          }}
        />
        <Drawer.Screen
          name="orders"
          options={{
            title: "Orders",
            headerTitle: "Orders",
          }}
        />
        <Drawer.Screen
          name="promotions"
          options={{
            title: "Promotions",
            headerTitle: "Promotions",
          }}
        />
        <Drawer.Screen
          name="sponsored"
          options={{
            title: "Sponsored",
            headerTitle: "Sponsored",
          }}
        />
        <Drawer.Screen
          name="store"
          options={{
            title: "My Business",
            headerTitle: "My Business",
          }}
        />
        <Drawer.Screen
          name="tickets"
          options={{
            title: "Tickets",
            headerTitle: "Tickets",
          }}
        />
        <Drawer.Screen
          name="notification"
          options={{
            title: "Notifications",
            headerTitle: "Notifications",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            headerTitle: "Settings",
          }}
        />
        <Drawer.Screen
          name="help"
          options={{
            title: "Help",
            headerTitle: "Help",
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: "Profile",
          }}
        />
      </Drawer>
      </SafeAreaView>
    </React.Fragment>
  );
};

export default SellerMobileLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    gap: 20,
    borderBottomWidth: 2,
    marginVertical: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 5,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
