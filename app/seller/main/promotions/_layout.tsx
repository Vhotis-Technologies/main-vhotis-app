import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions'

const PromotionsLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="PromotionsScreen" options={{ title: "Promotions" }} />
      <Stack.Screen
        name="PromotionHistoryScreen"
        options={{ title: "Deal history" }}
      />
    </Stack>
  )
}

export default PromotionsLayout

const styles = StyleSheet.create({})