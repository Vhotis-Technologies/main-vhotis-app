import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from "@/hooks/useDrawerStackScreenOptions";

const SellerProductLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions} initialRouteName="ProductsScreen">
      <Stack.Screen name="ProductsScreen" options={{ title: "Products" }} />
      <Stack.Screen
        name="InventoryScreen"
        options={{
          title: "Manage Single Inventory",
          headerTitleStyle: {
            fontFamily: "RobotoMedium",
            fontSize: 14,
            fontWeight: "300",
          },
        }}
      />
      <Stack.Screen
        name="BulkInventoryScreen"
        options={{
          title: "Manage Bulk Inventory",
          headerTitleStyle: {
            fontFamily: "RobotoMedium",
            fontSize: 14,
            fontWeight: "300",
          },
        }}
      />
      <Stack.Screen
        name="BulkInventoryDetailScreen"
        options={{
          title: "Import Details",
          headerTitleStyle: {
            fontFamily: "RobotoMedium",
            fontSize: 14,
            fontWeight: "300",
          },
        }}
      />
      <Stack.Screen
        name="ProductDetailScreen"
        options={{
          title: "Product Details",
          presentation: "card",
        }}
      />
    </Stack>
  );
};

export default SellerProductLayout;

const styles = StyleSheet.create({});
