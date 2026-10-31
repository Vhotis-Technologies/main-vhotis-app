import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions' 

const NotificationLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="NotificationScreen"
        options={{ title: "Notifications" }}
      />
    </Stack>
  )
}

export default NotificationLayout

const styles = StyleSheet.create({})