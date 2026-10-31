import { Stack } from 'expo-router';
import React from 'react';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(support)" options={{ headerShown: false }} />
    </Stack>
  );
}
