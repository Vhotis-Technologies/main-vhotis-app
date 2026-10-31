/**
 * Root layout component for the mobile version of the application.
 * Handles the main navigation structure and search functionality.
 */
import { Pressable, StyleSheet, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import SearchBar from "@/app/component/helpers/others/SearchBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StyledText from "@/app/component/helpers/forms/StyledText";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { PermissionsProvider } from "@/app/contexts/PermissionsProvider";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";

const topRowItems = ["Home", "Todays Deals", "Sell", "Customer Support"];
/**
 * Root layout component for mobile views that provides:
 * - Search functionality with history
 * - Navigation stack management
 * - Gesture handling support
 *
 * @returns {JSX.Element} The rendered mobile root layout
 */
const MobileRootLayout = () => {
  const { handleLogout } = useAuthContext();

  const backgroundColor = useThemeColor({}, "background");
  // State for search functionality
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");

  /* Implement the logic to save the users search history using the expo secure store */
  const saveSearchHistory = async (search: string) => {
    try {
      await AsyncStorage.setItem("searchHistory", search);
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  /* Handles the navigaiton to other pages like the deals page, sell page, and customer support page
   * @param item the item to navigate to
   */
  const handleNavigation = (item: string) => {
    switch (item) {
      case "Home":
        router.push("/main/mobile/(tabs)/home/HomeScreen");
        setSelectedItem(item);
        break;
      // All deal types active today → TodaysDealScreen → GET get_todays_deals
      // (not the same as Home deal tiles → MainProductScreen → get_deals_and_promotions)
      case "Todays Deals":
        router.push("/main/mobile/(tabs)/home/TodaysDealScreen");
        setSelectedItem(item);
        break;
      // Log the user out and route to the seller landing page where thay can create a seller account
      case "Sell":
        handleLogout(true);
        router.push("/onboarding/seller/SellerLandingPage");
        setSelectedItem(item);
        break;
      case "Customer Support":
        router.push(
          "/main/mobile/(screens)/(support)/TicketListScreen",
        );
        setSelectedItem(item);
        break;
      default:
        router.push("/main/mobile/(tabs)/home/HomeScreen");
        setSelectedItem(item);
        break;
    }
  };

  const handleSearch = async () => {
    if (searchValue.trim()) {
      // Save search history
      await saveSearchHistory(searchValue);

      // Navigate to MainProductScreen with search query
      router.navigate({
        pathname: "/main/mobile/(tabs)/home/MainProductScreen",
        params: { searchQuery: searchValue.trim() },
      });
      setSearchValue("");
      setIsFocused(false);
    }
  };

  return (
      <PermissionsProvider>
        <GestureHandlerRootView style={styles.mainContainer}>
          <SafeAreaView
            style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
          >
            {/* Header with search bar */}
            <View style={styles.headerContainer}>
              <SearchBar
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                setIsFocused={setIsFocused}
                isFocused={isFocused}
                onSearch={handleSearch}
              />
              {/* Display a row item here to direct the user to the todays deals screen, sell page, and customer support page */}
              <View style={styles.topRowContainer}>
                {topRowItems.map((item, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.topRowItem,
                      selectedItem === item && styles.selectedItem,
                    ]}
                    onPress={() => handleNavigation(item)}
                  >
                    <StyledText
                      children={item}
                      variant="labelSmall"
                      style={selectedItem === item && styles.selectedItemText}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Conditional rendering based on search focus */}
            {isFocused ? (
              // Search results view
              <View>
                <StyledText variant="labelMedium" children="Search" />
              </View>
            ) : (
              // Main navigation stack
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(screens)" options={{ headerShown: false }} />
              </Stack>
            )}
          </SafeAreaView>
        </GestureHandlerRootView>
      </PermissionsProvider>
  );
};

export default MobileRootLayout;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  topRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  topRowItem: {
    padding: 5,
  },
  selectedItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  selectedItemText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.5,
  },
});
