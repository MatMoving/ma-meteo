// Transforme la réponse brute d'Open-Meteo en données prêtes pour l'affichage.
// Aucune donnée n'est inventée : les valeurs absentes restent null.

import { describeWeather, getKind, iconForCode } from './weatherCodes';
import { clockLabel, dayLabel, hourLabel, moonPhaseAt, parseLocalDate, toMinutes } from './format';

// Au-delà, les valeurs "actuelles" du chargement sont remplacées par la prévision de l'heure en cours
const CURRENT_MAX_AGE = 30 * 60 * 1000;

// Date, heure et minute courantes au fuseau de la ville (et non celui du téléphone),
// au même format que les dates Open-Meteo.
const currentKeys = (utcOffsetSeconds, now) => {
  const local = new Date(now + utcOffsetSeconds * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
  return {
    date,
    hour: `${date}T${pad(local.getUTCHours())}:00`,
    minute: `${date}T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
  };
};

// Couleur d'un segment de la barre journalière (pluie, soleil, nuit...)
const segmentColor = (h) => {
  if (h.rainProb >= 70 || h.precipitation > 2.5) return '#2563EB';
  if (h.rainProb >= 40 || h.precipitation > 0) return '#60A5FA';
  switch (getKind(h.weatherCode)) {
    case 'storm': return '#6D28D9';
    case 'snow': return '#E2E8F0';
    case 'clear': return h.isDay ? '#FBBF24' : '#374151';
    case 'overcast': return '#9CA3AF';
    default: return '#9CA3AF';
  }
};

const buildHour = (h, i) => {
  const weatherCode = h.weather_code[i];
  const isDay = h.is_day[i] === 1;
  return {
    time: hourLabel(h.time[i]),
    temp: h.temperature_2m[i],
    precipitation: h.precipitation[i] ?? 0,
    rainProb: h.precipitation_probability[i] ?? 0,
    windSpeed: h.wind_speed_10m[i],
    windGusts: h.wind_gusts_10m[i],
    windDirection: h.wind_direction_10m[i],
    uvIndex: h.uv_index[i] == null ? null : Math.round(h.uv_index[i]),
    weatherCode,
    isDay,
    iconInfo: iconForCode(weatherCode, isDay),
  };
};

const buildDay = (daily, hourly, index, position) => {
  const iso = daily.time[index];
  const prefix = iso.slice(0, 10);
  const hours = [];
  hourly.time.forEach((t, i) => {
    if (t.startsWith(prefix)) hours.push(buildHour(hourly, i));
  });

  const weatherCode = daily.weather_code[index];
  const sunrise = clockLabel(daily.sunrise[index]);
  const sunset = clockLabel(daily.sunset[index]);

  return {
    id: String(index),
    day: dayLabel(iso, position),
    weatherCode,
    iconInfo: iconForCode(weatherCode, true),
    min: daily.temperature_2m_min[index],
    max: daily.temperature_2m_max[index],
    rainProb: daily.precipitation_probability_max[index] ?? 0,
    precipitationSum: Math.round((daily.precipitation_sum[index] ?? 0) * 10) / 10,
    uvIndex: daily.uv_index_max[index] == null ? null : Math.round(daily.uv_index_max[index]),
    sunrise,
    sunset,
    sunrisePercent: sunrise ? (toMinutes(sunrise) / 1440) * 100 : null,
    sunsetPercent: sunset ? (toMinutes(sunset) / 1440) * 100 : null,
    moonPhase: moonPhaseAt(new Date(parseLocalDate(iso).getTime() + 12 * 3600000)),
    hours,
    segments: hours.map(segmentColor),
  };
};

const buildNowcast = (minutely, minuteKey) => {
  if (!minutely?.time?.length) return [];
  const next = minutely.time.findIndex((t) => t >= minuteKey);
  // Données trop anciennes : aucune prévision ne couvre l'heure actuelle
  if (next < 1) return [];
  const start = next - 1;
  return minutely.time.slice(start, start + 17).map((t, i) => ({
    time: clockLabel(t),
    precipitation: minutely.precipitation[start + i] ?? 0,
  }));
};

// Les données sont recalculées pour l'instant "now" : une réponse en cache d'hier
// affiche donc bien l'heure en cours et la journée d'aujourd'hui.
export const formatWeather = ({ forecast, air, fetchedAt }, now = Date.now()) => {
  const { current, hourly, daily, minutely_15: minutely } = forecast;
  const keys = currentKeys(forecast.utc_offset_seconds ?? 0, now);

  const startIndex = Math.max(0, hourly.time.findIndex((t) => t >= keys.hour));
  const next24 = [];
  for (let i = startIndex; i < Math.min(startIndex + 24, hourly.time.length); i++) {
    next24.push(buildHour(hourly, i));
  }
  const hour = next24[0];

  const firstDay = Math.max(0, daily.time.findIndex((t) => t >= keys.date));
  const days = [];
  for (let i = firstDay; i < daily.time.length; i++) {
    days.push(buildDay(daily, hourly, i, i - firstDay));
  }

  // Valeurs mesurées si elles sont récentes, sinon prévision de l'heure en cours
  const fresh = now - fetchedAt < CURRENT_MAX_AGE || !hour;
  const at = fresh ? null : startIndex;
  const pick = (currentValue, hourlyValues) => (fresh ? currentValue : hourlyValues?.[at] ?? currentValue);
  const weatherCode = pick(current.weather_code, hourly.weather_code);

  return {
    fetchedAt,
    current: {
      temp: pick(current.temperature_2m, hourly.temperature_2m),
      apparentTemp: pick(current.apparent_temperature, hourly.apparent_temperature),
      humidity: Math.round(pick(current.relative_humidity_2m, hourly.relative_humidity_2m)),
      weatherCode,
      isDay: pick(current.is_day, hourly.is_day) === 1,
      summary: describeWeather(weatherCode),
      precipitation: pick(current.precipitation, hourly.precipitation) ?? 0,
      windSpeed: pick(current.wind_speed_10m, hourly.wind_speed_10m),
      windGusts: pick(current.wind_gusts_10m, hourly.wind_gusts_10m),
      windDirection: pick(current.wind_direction_10m, hourly.wind_direction_10m),
      rainProb: hour?.rainProb ?? 0,
      uvIndex: hour?.uvIndex ?? null,
      aqi: air?.current?.european_aqi ?? null,
      pm25: air?.current?.pm2_5 ?? null,
    },
    hourly: next24,
    daily: days,
    minutely: buildNowcast(minutely, keys.minute),
  };
};

// Remet en forme une réponse sauvegardée ; null si elle est illisible
export const formatSaved = (raw, now) => {
  if (!raw?.forecast?.hourly || !raw.fetchedAt) return null;
  try {
    return formatWeather(raw, now);
  } catch {
    return null;
  }
};
