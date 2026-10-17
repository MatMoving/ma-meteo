// Racine de l'application : réglages et villes partagés, puis les écrans.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LocationsProvider } from '../contexts/LocationsContext';
// Définit la tâche de mise à jour en arrière-plan dès le lancement (aussi sans interface)
import '../utils/backgroundTask';

// Masqué une fois le cache lu, pour passer directement du logo à la météo
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SettingsProvider>
      <LocationsProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B1736' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="rain-radar" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="light" />
      </LocationsProvider>
    </SettingsProvider>
  );
}
