// Réglages de l'application : valeurs par défaut et options proposées dans l'écran Paramètres.

export const SETTINGS_KEY = 'app_settings';
// À augmenter quand une valeur par défaut doit remplacer l'ancien choix enregistré
export const SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS = {
  version: SETTINGS_VERSION,
  temperatureUnit: 'C', // 'C' | 'F'
  windUnit: 'kmh', // 'kmh' | 'ms' | 'mph'
  animations: 'full', // 'full' | 'reduced' | 'off'
  autoRefresh: 1, // minutes avant mise à jour au retour dans l'app (1 = à chaque fois, 0 = jamais)
  backgroundRefresh: 30, // minutes entre deux mises à jour en arrière-plan (0 = désactivée)
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
    { value: 1, label: 'Toujours' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 0, label: 'Jamais' },
  ],
  backgroundRefresh: [
    { value: 30, label: '30 min' },
    { value: 60, label: '1 h' },
    { value: 180, label: '3 h' },
    { value: 0, label: 'Non' },
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
