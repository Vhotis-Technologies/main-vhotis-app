import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { PermissionsProvider } from "../contexts/PermissionsProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const MainSellerLayout = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PermissionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="main" options={{ headerShown: false }} />
          </Stack>
        </PermissionsProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default MainSellerLayout;

const styles = StyleSheet.create({});
