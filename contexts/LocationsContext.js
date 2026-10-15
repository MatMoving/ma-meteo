// Villes et météo partagées entre l'accueil et les paramètres.
// Ce contexte relance aussi la mise à jour des données quand l'application revient au premier plan.

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import useLocations from '../hooks/useLocations';
import { useSettings } from './SettingsContext';

const LocationsContext = createContext(null);

export function LocationsProvider({ children }) {
  const { settings } = useSettings();
  const state = useLocations();
  const { locations, ready, refresh } = state;

  const latest = useRef(locations);
  latest.current = locations;

  const minutes = settings.autoRefresh;

  const refreshStale = useCallback(() => {
    if (!minutes) return;
    const limit = minutes * 60 * 1000;
    latest.current.forEach((loc) => {
      if (!loc.lastRefreshed || Date.now() - loc.lastRefreshed > limit) refresh(loc.id);
    });
  }, [minutes, refresh]);

  useEffect(() => {
    if (!ready) return undefined;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshStale();
    });
    return () => subscription.remove();
  }, [ready, refreshStale]);

  return <LocationsContext.Provider value={state}>{children}</LocationsContext.Provider>;
}

export const useLocationsContext = () => {
  const context = useContext(LocationsContext);
  if (!context) throw new Error('useLocationsContext doit être utilisé dans LocationsProvider');
  return context;
};
