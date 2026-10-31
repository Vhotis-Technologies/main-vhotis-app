import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";

const OnboardingLayout = () => {
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
            name="OnboardingScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Signin" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default OnboardingLayout;
