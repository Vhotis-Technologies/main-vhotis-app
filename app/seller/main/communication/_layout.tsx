import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions'

const CommunicationLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="MessageScreen" options={{ title: "Messages" }} />
      <Stack.Screen name="ReviewScreen" options={{ title: "Reviews" }} />
      <Stack.Screen name="MessageDetailScreen" options={{ title: "Message Detail" }} />
      <Stack.Screen name="ReviewDetailScreen" options={{ title: "Review Detail" }} />
    </Stack>
  )
}

export default CommunicationLayout

const styles = StyleSheet.create({})