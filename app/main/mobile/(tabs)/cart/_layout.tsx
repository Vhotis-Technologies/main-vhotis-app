import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const MainCartScreen = () => {
  return (
    <Stack>
    <Stack.Screen name="CartScreen" options={{headerShown:false}} />
    <Stack.Screen name="CheckoutScreen" options={{headerShown:false}} />
    </Stack>
  )
}

export default MainCartScreen

const styles = StyleSheet.create({})