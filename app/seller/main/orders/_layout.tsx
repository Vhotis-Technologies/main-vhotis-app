import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import React from "react";
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions' 

const SellerOrderLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="OrderScreen" options={{ title: "Orders" }} />
      <Stack.Screen
        name="SellerOrdersDetailsScreen"
        options={{ title: "Order details" }}
      />
    </Stack>
  );
};

export default SellerOrderLayout;

const styles = StyleSheet.create({});
