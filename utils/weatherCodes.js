// Codes météo WMO (utilisés par Open-Meteo) : type de temps, libellé et icône.

// Regroupe les codes WMO en une dizaine de familles de temps.
export const getKind = (code = 0) => {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 45 && code <= 48) return 'fog';
  if (code === 3) return 'overcast';
  if (code === 1 || code === 2) return 'partly';
  return 'clear';
};

const DESCRIPTIONS = {
  0: 'Ciel dégagé',
  1: 'Globalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Ciel couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant',
  51: 'Bruine faible',
  53: 'Bruine modérée',
  55: 'Bruine forte',
  56: 'Bruine verglaçante',
  57: 'Bruine verglaçante forte',
  61: 'Pluie faible',
  63: 'Pluie modérée',
  65: 'Pluie forte',
  66: 'Pluie verglaçante',
  67: 'Pluie verglaçante forte',
  71: 'Neige faible',
  73: 'Neige modérée',
  75: 'Neige forte',
  77: 'Grains de neige',
  80: 'Averses faibles',
  81: 'Averses modérées',
  82: 'Averses violentes',
  85: 'Averses de neige faibles',
  86: 'Averses de neige fortes',
  95: 'Orage',
  96: 'Orage avec grêle',
  99: 'Orage violent avec grêle',
};

export const describeWeather = (code) => DESCRIPTIONS[code] ?? 'Temps variable';

export const iconForCode = (code = 0, isDay = true) => {
  switch (getKind(code)) {
    case 'storm': return { name: 'thunderstorm', color: '#A78BFA' };
    case 'snow': return { name: 'snow', color: '#E5E7EB' };
    case 'rain': return { name: 'rainy', color: '#60A5FA' };
    case 'fog': return { name: 'reorder-three-outline', color: '#CBD5E1' };
    case 'overcast': return { name: 'cloud', color: '#D1D5DB' };
    case 'partly':
      return isDay
        ? { name: 'partly-sunny', color: '#FCD34D' }
        : { name: 'cloudy-night', color: '#D1D5DB' };
    default:
      return isDay
        ? { name: 'sunny', color: '#FBBF24' }
        : { name: 'moon', color: '#E5E7EB' };
  }
};
