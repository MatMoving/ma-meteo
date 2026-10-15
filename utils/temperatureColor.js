// Couleur associée à une température (dégradé du graphique horaire).

const SCALE = [
  { t: 35, c: '#EF4444' },
  { t: 32, c: '#F97316' },
  { t: 26, c: '#FBBF24' },
  { t: 17, c: '#4ADE80' },
  { t: 10, c: '#60A5FA' },
  { t: 0, c: '#1E3A8A' },
  { t: -10, c: '#172554' },
];

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
};

const mix = (from, to, factor) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const channel = (i) => Math.round(a[i] + factor * (b[i] - a[i]));
  return `#${[0, 1, 2].map((i) => channel(i).toString(16).padStart(2, '0')).join('')}`;
};

export const temperatureColor = (temp) => {
  if (temp >= SCALE[0].t) return SCALE[0].c;
  if (temp <= SCALE[SCALE.length - 1].t) return SCALE[SCALE.length - 1].c;
  for (let i = 0; i < SCALE.length - 1; i++) {
    const upper = SCALE[i];
    const lower = SCALE[i + 1];
    if (temp <= upper.t && temp >= lower.t) {
      return mix(upper.c, lower.c, (upper.t - temp) / (upper.t - lower.t));
    }
  }
  return '#FFFFFF';
};

// Arrêts de dégradé (offset en %) pour une courbe allant de minTemp à maxTemp.
export const temperatureStops = (minTemp, maxTemp) => {
  const range = Math.max(1, maxTemp - minTemp);
  const stops = [{ offset: '0%', color: temperatureColor(maxTemp) }];
  SCALE.forEach(({ t, c }) => {
    if (t < maxTemp && t > minTemp) {
      stops.push({ offset: `${(((maxTemp - t) / range) * 100).toFixed(1)}%`, color: c });
    }
  });
  stops.push({ offset: '100%', color: temperatureColor(minTemp) });
  return stops;
};
