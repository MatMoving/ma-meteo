// Accès aux API Open-Meteo (prévisions, qualité de l'air, recherche de villes).
// Pas de clé API nécessaire.

import axios from 'axios';
import { formatWeather } from './weatherFormat';

const http = axios.create({ timeout: 15000 });

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Réponse brute (prévisions + air) : c'est elle qui est sauvegardée, puis remise en
// forme à chaque ouverture pour que "maintenant" et "aujourd'hui" restent justes.
export const fetchWeatherRaw = async (latitude, longitude, timeout = 15000) => {
  const [forecast, air] = await Promise.all([
    http.get(FORECAST_URL, {
      timeout,
      params: {
        latitude,
        longitude,
        current: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
          'precipitation', 'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
        ].join(','),
        hourly: [
          'temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'precipitation',
          'precipitation_probability', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
          'weather_code', 'is_day', 'uv_index',
        ].join(','),
        // Seulement les quelques heures utiles à "Pluie dans l'heure" : réponse plus légère
        minutely_15: 'precipitation',
        past_minutely_15: 2,
        forecast_minutely_15: 24,
        daily: [
          'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max',
          'precipitation_sum', 'uv_index_max', 'sunrise', 'sunset',
        ].join(','),
        timezone: 'auto',
        forecast_days: 7,
      },
    }),
    // La qualité de l'air est facultative : si elle échoue, la météo reste affichée
    http.get(AIR_URL, {
      timeout,
      params: { latitude, longitude, current: 'european_aqi,pm2_5', timezone: 'auto' },
    }).catch(() => null),
  ]);

  return { forecast: forecast.data, air: air?.data ?? null, fetchedAt: Date.now() };
};

export const fetchWeather = async (latitude, longitude, timeout) => {
  const raw = await fetchWeatherRaw(latitude, longitude, timeout);
  return { raw, data: formatWeather(raw) };
};

const toCity = (r) => ({
  id: String(r.id),
  name: r.name,
  region: r.admin1,
  admin: [r.admin2, r.admin1, r.country].filter(Boolean).join(', '),
  latitude: r.latitude,
  longitude: r.longitude,
});

const searchOnce = async (name, signal) => {
  const { data } = await http.get(GEOCODING_URL, {
    params: { name, count: 10, language: 'fr', format: 'json' },
    signal,
  });
  return (data.results ?? []).map(toCity);
};

// Les tirets et espaces ne sont pas toujours équivalents dans la base :
// "Saint Pierre" et "Saint-Pierre" sont donc essayés tous les deux.
export const searchCities = async (query, signal) => {
  const variants = [...new Set([query, query.replace(/-/g, ' '), query.replace(/\s+/g, '-')])];
  for (const variant of variants) {
    const found = await searchOnce(variant, signal);
    if (found.length) return found;
    if (signal?.aborted) break;
  }
  return [];
};
