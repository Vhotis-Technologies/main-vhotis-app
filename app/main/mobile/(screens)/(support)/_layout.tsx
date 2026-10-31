import { Stack } from "expo-router";
import React from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function SupportLayout() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="TicketListScreen" options={{ title: "Support" }} />
      <Stack.Screen
        name="MainMobileCustomerSupportScreen"
        options={{ title: "Support" }}
      />
      <Stack.Screen
        name="CreateTicketScreen"
        options={{ title: "New ticket" }}
      />
      <Stack.Screen
        name="ReportProblemScreen"
        options={{ title: "Report a problem" }}
      />
      <Stack.Screen name="TicketChatScreen" options={{ title: "Chat" }} />
    </Stack>
  );
}
