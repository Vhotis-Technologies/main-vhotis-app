import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import AuthContextProvider from "@/app/contexts/AuthContextProvider";

const MainOnboardingLayout = () => {
  return (
    <AuthContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="main" options={{ headerShown: false }} />
        <Stack.Screen name="seller" options={{ headerShown: false }} />
      </Stack>
    </AuthContextProvider>
  );
};

export default MainOnboardingLayout;

const styles = StyleSheet.create({});
