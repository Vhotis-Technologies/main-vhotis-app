/**
 * Home tab stack routes.
 * - TodaysDealScreen: header "Today's Deals" → get_todays_deals (all types today)
 * - MainProductScreen: category search, OR Home deal tile (one deal_type)
 */
import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const MainHomeLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="TodaysDealScreen" />
      <Stack.Screen name="MainProductScreen" />
      <Stack.Screen name="ProductDescriptionScreen" />
      <Stack.Screen name="StoreFrontScreen" />
      <Stack.Screen name="StoreFrontProductScreen" />
    </Stack>
    </GestureHandlerRootView>
  )
}

export default MainHomeLayout

const styles = StyleSheet.create({})