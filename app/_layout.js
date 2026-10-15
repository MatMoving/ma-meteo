// Racine de l'application : réglages et villes partagés, puis les écrans.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LocationsProvider } from '../contexts/LocationsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <LocationsProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="rain-radar" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="light" />
      </LocationsProvider>
    </SettingsProvider>
  );
}
