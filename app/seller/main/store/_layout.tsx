/**
 * Store hub stack: subscription, management, nested finance routes.
 *
 * finance/ is a nested stack with headerShown:false so FinanceLayout controls
 * its own titles and owner guard.
 */
import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from "@/hooks/useDrawerStackScreenOptions";

const SellerStoreLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions} initialRouteName="StoreScreen">
      <Stack.Screen name="StoreScreen" options={{ title: "My Business" }} />
      <Stack.Screen
        name="CreateStoreScreen"
        options={{ title: "Add store location" }}
      />
      <Stack.Screen
        name="SubscriptionScreen"
        options={{ title: "Subscription" }}
      />
      <Stack.Screen
        name="SubscriptionPlans"
        options={{ title: "Subscription plans" }}
      />
      <Stack.Screen name="ManagementScreen" options={{ title: "Management" }} />
      <Stack.Screen
        name="StoreDetailsScreen"
        options={{ title: "Store details" }}
      />
      <Stack.Screen
        name="BillingHistoryScreen"
        options={{ title: "Billing history" }}
      />
      <Stack.Screen name="AnalyticScreen" options={{ title: "Analytics" }} />
      <Stack.Screen name="finance" options={{ headerShown: false }} />
      <Stack.Screen name="fufillment" options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateAdminScreen"
        options={{ title: "Add team member" }}
      />
    </Stack>
  );
};

export default SellerStoreLayout;

const styles = StyleSheet.create({});
