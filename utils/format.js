// Fonctions d'affichage : dates, heures, phase lunaire, qualité de l'air.
// Tout est écrit à la main en français pour ne pas dépendre de Intl (absent ou
// incomplet sur certains téléphones Android avec Hermes).

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Les dates Open-Meteo sont déjà dans le fuseau local : "2026-10-15T14:00"
export const parseLocalDate = (iso) => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const dayLabel = (iso, index) => {
  if (index === 0) return "Aujourd'hui";
  if (index === 1) return 'Demain';
  return DAYS[parseLocalDate(iso).getDay()];
};

export const hourLabel = (iso) => `${Number(iso.slice(11, 13))}h`;
export const clockLabel = (iso) => (iso ? iso.slice(11, 16) : '');

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const daylightLabel = (sunrise, sunset) => {
  if (!sunrise || !sunset) return '';
  const total = toMinutes(sunset) - toMinutes(sunrise);
  return `${Math.floor(total / 60)}h et ${total % 60}min`;
};

export const timeAgo = (timestamp, now = Date.now()) => {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
};

// Phase lunaire approximée à partir d'une nouvelle lune de référence (6 janvier 2000).
// Retourne une valeur entre 0 (nouvelle lune) et 1.
const NEW_MOON_REFERENCE = Date.UTC(2000, 0, 6, 18, 14);
const LUNAR_CYCLE_DAYS = 29.53058867;

export const moonPhaseAt = (date) => {
  const days = (date.getTime() - NEW_MOON_REFERENCE) / 86400000;
  return (((days % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS) / LUNAR_CYCLE_DAYS;
};

export const moonPhaseName = (phase) => {
  if (phase == null) return 'Inconnue';
  if (phase < 0.0625 || phase >= 0.9375) return 'Nouvelle Lune';
  if (phase < 0.1875) return 'Premier Croissant';
  if (phase < 0.3125) return 'Premier Quartier';
  if (phase < 0.4375) return 'Gibbeuse Croissante';
  if (phase < 0.5625) return 'Pleine Lune';
  if (phase < 0.6875) return 'Gibbeuse Décroissante';
  if (phase < 0.8125) return 'Dernier Quartier';
  return 'Dernier Croissant';
};

// Indice européen de qualité de l'air (EAQI) : mêmes seuils que l'Agence européenne.
export const aqiLevel = (value) => {
  if (value == null) return null;
  if (value <= 20) return { label: 'Bon', color: '#4ADE80' };
  if (value <= 40) return { label: 'Correct', color: '#A3E635' };
  if (value <= 60) return { label: 'Moyen', color: '#FBBF24' };
  if (value <= 80) return { label: 'Mauvais', color: '#F97316' };
  if (value <= 100) return { label: 'Très mauvais', color: '#EF4444' };
  return { label: 'Extrêmement mauvais', color: '#A855F7' };
};

export const uvLevel = (value) => {
  if (value == null) return '-';
  return Math.round(value);
};
