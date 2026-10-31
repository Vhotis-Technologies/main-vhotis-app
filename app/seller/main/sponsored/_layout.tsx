import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from "@/hooks/useDrawerStackScreenOptions";

const SponsoredProductsLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack
      screenOptions={screenOptions}
      initialRouteName="SponsorScreen"
    >
      <Stack.Screen
        name="SponsorScreen"
        options={{ title: "Sponsor Products" }}
      />
      <Stack.Screen
        name="SponsorHistoryScreen"
        options={{ title: "Sponsorship history" }}
      />
    </Stack>
  );
};

export default SponsoredProductsLayout;

const styles = StyleSheet.create({});
