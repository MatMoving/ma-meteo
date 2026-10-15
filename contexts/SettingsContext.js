// Réglages utilisateur (sauvegardés) et aperçu de ciel (temporaire) partagés dans l'application.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../constants/settings';
import { formatTemp, formatWind, windLabel } from '../utils/units';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [previewSky, setPreviewSky] = useState(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!cancelled && raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sauvegarde après chaque changement, une fois les réglages lus
  useEffect(() => {
    if (ready) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const value = useMemo(
    () => ({ settings, ready, updateSetting, resetSettings, previewSky, setPreviewSky }),
    [settings, ready, updateSetting, resetSettings, previewSky],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings doit être utilisé dans SettingsProvider');
  return context;
};

// Fonctions d'affichage selon les unités choisies
export const useUnits = () => {
  const { settings } = useSettings();
  const { temperatureUnit, windUnit } = settings;

  return useMemo(
    () => ({
      temp: (celsius) => formatTemp(celsius, temperatureUnit),
      wind: (kmh) => formatWind(kmh, windUnit),
      windUnit: windLabel(windUnit),
    }),
    [temperatureUnit, windUnit],
  );
};
