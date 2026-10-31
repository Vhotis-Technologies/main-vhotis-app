import React from "react";
import { Stack } from "expo-router";
import { useDrawerStackScreenOptions } from "@/hooks/useDrawerStackScreenOptions";

const PrivacyLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="PrivacyAndSecurityScreen"
        options={{ title: "Privacy & Security" }}
      />
      <Stack.Screen
        name="DevicesAndSession"
        options={{ title: "Devices & sessions" }}
      />
      <Stack.Screen
        name="PasswordAndSecurity"
        options={{ title: "Password & wallet" }}
      />
    </Stack>
  );
};

export default PrivacyLayout;
