import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions'

const InvoicesLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="InvoiceScreen" options={{ title: "Invoices" }} />
    </Stack>
  )
}

export default InvoicesLayout

const styles = StyleSheet.create({})