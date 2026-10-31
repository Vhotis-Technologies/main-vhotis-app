import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions'

const SettingsLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="SellerSettingScreens"
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="StoreDisplayscreen"
        options={{ title: "Store profile" }}
      />
      <Stack.Screen
        name="PaymentFlowScreen"
        options={{ title: "Payout account" }}
      />
      {/* Nested privacy Stack renders its own header */}
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
    </Stack>
  )
}

export default SettingsLayout

const styles = StyleSheet.create({})