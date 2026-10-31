import { Stack } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthContextProvider from "@/app/contexts/AuthContextProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useThemeContext } from "@/app/contexts/ThemeProvider";

const MainUserLayout = () => {
  const { currentTheme } = useThemeContext();
  return (
      <AuthContextProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar
            barStyle={
              currentTheme === "dark" ? "light-content" : "dark-content"
            }
          />
          <Stack>
            <Stack.Screen name="mobile" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </AuthContextProvider>
  );
};

export default MainUserLayout;

const styles = StyleSheet.create({});
