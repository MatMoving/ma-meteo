// Conversions d'unités. Les données sont stockées en métrique (°C, km/h, mm)
// et converties uniquement à l'affichage, pour ne pas perdre de précision.

const KMH_TO_MS = 1 / 3.6;
const KMH_TO_MPH = 0.621371;

export const WIND_UNIT_LABELS = { kmh: 'km/h', ms: 'm/s', mph: 'mph' };

export const windLabel = (unit = 'kmh') => WIND_UNIT_LABELS[unit] ?? WIND_UNIT_LABELS.kmh;

export const formatTemp = (celsius, unit = 'C') => {
  if (celsius == null) return '-';
  const value = unit === 'F' ? celsius * 1.8 + 32 : celsius;
  return `${Math.round(value)}°`;
};

export const formatWind = (kmh, unit = 'kmh') => {
  if (kmh == null) return '-';
  if (unit === 'ms') return (kmh * KMH_TO_MS).toFixed(1).replace('.', ',');
  if (unit === 'mph') return `${Math.round(kmh * KMH_TO_MPH)}`;
  return `${Math.round(kmh)}`;
};

export const formatMm = (mm) => `${(mm ?? 0).toFixed(1).replace('.', ',')} mm`;
