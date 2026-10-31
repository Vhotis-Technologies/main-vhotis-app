import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import React from "react";

const MainAccoutLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="MenuScreen"  >
      <Stack.Screen name="MenuScreen" />
      <Stack.Screen name="MobileNotificationScreen" />
      <Stack.Screen name="MembershipScreen" />
      <Stack.Screen name="MembershipBillingHistory" />
      <Stack.Screen name="MainSettingScreen" />
      <Stack.Screen name="PrivacyAndSecurityScreen" />
      <Stack.Screen name="MembershipPlans" />
    </Stack>
  );
};

export default MainAccoutLayout;

const styles = StyleSheet.create({});
