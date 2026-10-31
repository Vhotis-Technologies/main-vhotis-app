import { StyleSheet } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheetAccoutComponent from "@/app/component/main/mobile/profile/BottomSheetAccoutComponent";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useThemeColor } from "@/hooks/useThemeColor";

const MainProfileLayout = () => {
  const backgroundColor = useThemeColor({}, "background");

  /* Modal service for the account component */
  const { showSheetModal, closeModal } = useModalService();
  /* Open account sheet modal */
  const openAccountModal = () => {
    showSheetModal(
      <BottomSheetAccoutComponent onPress={() => closeModal()} />,
      "Account"
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
        <Stack.Screen
          name="OrderHistoryScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetailsScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderRatingScreen"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default MainProfileLayout;

const styles = StyleSheet.create({});
