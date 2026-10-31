import { Stack } from 'expo-router';
import React from 'react';
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions';

const TicketLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="TicketScreen" options={{ title: 'Tickets' }} />
      <Stack.Screen name="CreateTicketScreen" options={{ title: 'New ticket' }} />
      <Stack.Screen name="TicketDetailScreen" options={{ title: 'Chat' }} />
    </Stack>
  );
};

export default TicketLayout;
