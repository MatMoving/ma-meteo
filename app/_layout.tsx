import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="rain-radar" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
