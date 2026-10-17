// Villes et météo partagées entre l'accueil et les paramètres.
// Ce contexte remet aussi les données à jour quand l'application revient au premier plan,
// régulièrement tant qu'elle reste ouverte, et programme la mise à jour en arrière-plan.

import { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import useLocations from '../hooks/useLocations';
import { useSettings } from './SettingsContext';
import { syncBackgroundTask, updateWidget } from '../utils/backgroundTask';

// Application restée ouverte : affichage remis à l'heure, et météo rechargée si elle a vieilli
const TICK = 5 * 60 * 1000;
const OPEN_MAX_AGE = 30 * 60 * 1000;

const LocationsContext = createContext(null);

export function LocationsProvider({ children }) {
  const { settings, ready: settingsReady } = useSettings();
  const state = useLocations();
  const { ready, resume, locations } = state;
  const localRefreshed = locations[0]?.lastRefreshed;

  const minutes = settings.autoRefresh;
  const resumeMaxAge = minutes ? minutes * 60 * 1000 : null;

  useEffect(() => {
    if (!ready) return undefined;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') resume(resumeMaxAge);
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') resume(OPEN_MAX_AGE);
    }, TICK);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [ready, resume, resumeMaxAge]);

  // L'écran de démarrage reste affiché le temps de lire le cache (quelques millisecondes)
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Le widget suit la position actuelle dès qu'elle est rechargée dans l'application
  useEffect(() => {
    if (!localRefreshed) return undefined;
    // Petit délai : la sauvegarde des nouvelles données doit passer avant
    const timer = setTimeout(updateWidget, 500);
    return () => clearTimeout(timer);
  }, [localRefreshed]);

  useEffect(() => {
    if (settingsReady) syncBackgroundTask(settings.backgroundRefresh);
  }, [settingsReady, settings.backgroundRefresh]);

  return <LocationsContext.Provider value={state}>{children}</LocationsContext.Provider>;
}

export const useLocationsContext = () => {
  const context = useContext(LocationsContext);
  if (!context) throw new Error('useLocationsContext doit être utilisé dans LocationsProvider');
  return context;
};
