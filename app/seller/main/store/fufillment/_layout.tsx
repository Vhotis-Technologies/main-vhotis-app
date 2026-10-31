import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from "@/hooks/useDrawerStackScreenOptions";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const FulfillmentLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  useRequireSellerOwner();

  return (
    <Stack
      screenOptions={screenOptions}
      initialRouteName="FulfillmentOnboardingScreen"
    >
      <Stack.Screen
        name="FulfillmentOnboardingScreen"
        options={{ title: "Vhotis Fulfillment" }}
      />
      <Stack.Screen
        name="FulfillmentDashboardScreen"
        options={{ title: "Vhotis Fulfillment" }}
      />
      <Stack.Screen
        name="FulfillmentDetailContent"
        options={{ title: "Vhotis Fulfillment" }}
      />
      {/* Phase 1 — inbound booking */}
      <Stack.Screen
        name="InboundDetailScreen"
        options={{ title: "Inbound Shipment" }}
      />
      <Stack.Screen
        name="ManifestBuilderScreen"
        options={{ title: "Build Manifest" }}
      />
      {/* Phase 2 — Vhotis collection */}
      <Stack.Screen
        name="CollectionBookingScreen"
        options={{ title: "Book Collection" }}
      />
      <Stack.Screen
        name="BillingStatementScreen"
        options={{ title: "Warehouse invoice" }}
      />
    </Stack>
  );
};

export default FulfillmentLayout;
