import { StatusBar } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaView } from "react-native-safe-area-context";

const MobileSellerOnboardingLayout = () => {
  const { currentTheme } = useThemeContext();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle={currentTheme === "dark" ? "light-content" : "dark-content"}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="SellerLandingPage"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SellerInformation"
            options={{ headerShown: false }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default MobileSellerOnboardingLayout;
