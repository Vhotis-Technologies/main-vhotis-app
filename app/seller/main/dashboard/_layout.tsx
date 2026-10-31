import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions' 

const SellerDashboardLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="DashboardScreen" options={{ title: "Home" }} />
      <Stack.Screen
        name="TopProductDetailsScreen"
        options={{ title: "Product details" }}
      />
    </Stack>
  );
};

export default SellerDashboardLayout;

const styles = StyleSheet.create({});
