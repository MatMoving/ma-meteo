// Réglages de l'application : valeurs par défaut et options proposées dans l'écran Paramètres.

export const SETTINGS_KEY = 'app_settings';

export const DEFAULT_SETTINGS = {
  temperatureUnit: 'C', // 'C' | 'F'
  windUnit: 'kmh', // 'kmh' | 'ms' | 'mph'
  animations: 'full', // 'full' | 'reduced' | 'off'
  autoRefresh: 30, // minutes avant mise à jour au retour dans l'app (0 = jamais)
  radarLayer: 'rain', // 'rain' | 'wind' | 'clouds' | 'temp'
  showNowcast: true,
  showRadar: true,
};

export const OPTIONS = {
  temperatureUnit: [
    { value: 'C', label: '°C' },
    { value: 'F', label: '°F' },
  ],
  windUnit: [
    { value: 'kmh', label: 'km/h' },
    { value: 'ms', label: 'm/s' },
    { value: 'mph', label: 'mph' },
  ],
  animations: [
    { value: 'full', label: 'Complètes' },
    { value: 'reduced', label: 'Réduites' },
    { value: 'off', label: 'Aucune' },
  ],
  autoRefresh: [
    { value: 0, label: 'Jamais' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 h' },
  ],
  radarLayer: [
    { value: 'rain', label: 'Pluie' },
    { value: 'wind', label: 'Vent' },
    { value: 'clouds', label: 'Nuages' },
    { value: 'temp', label: 'Temp.' },
  ],
};

// Ciels de démonstration pour vérifier les animations (non sauvegardés)
export const PREVIEW_SKIES = [
  { label: 'Soleil', kind: 'clear', isDay: true },
  { label: 'Nuages', kind: 'partly', isDay: true },
  { label: 'Brouillard', kind: 'fog', isDay: true },
  { label: 'Pluie', kind: 'rain', isDay: true },
  { label: 'Orage', kind: 'storm', isDay: true },
  { label: 'Neige', kind: 'snow', isDay: true },
  { label: 'Nuit', kind: 'clear', isDay: false },
  { label: 'Nuit pluvieuse', kind: 'rain', isDay: false },
];
