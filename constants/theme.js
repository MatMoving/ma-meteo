// Couleurs partagées par toute l'application.
// Les textes sont volontairement clairs et les fonds assez sombres pour
// rester lisibles, même avec des effets de transparence au-dessus.

export const COLORS = {
  text: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#CBD5E1',

  rain: '#3B82F6',
  rainStrong: '#2563EB',
  rainLight: '#93C5FD',
  sun: '#FBBF24',
  uv: '#FBD38D',
  humidity: '#90CDF4',
  wind: '#6EE7B7',
  accent: '#60A5FA',

  // Cartes en verre : sombres pour garder le contraste sur tous les fonds
  glass: 'rgba(15, 23, 42, 0.32)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  sheet: '#0F172A',
  sheetBorder: 'rgba(255, 255, 255, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

// Dégradés de fond par type de temps (jour / nuit).
// Tous assez sombres pour que le texte blanc reste lisible.
const GRADIENTS = {
  clear:    { day: ['#1E5AA8', '#2F80D1'], night: ['#0B1026', '#1A2350'] },
  partly:   { day: ['#2B5C8F', '#1E3A5F'], night: ['#111A33', '#1C2747'] },
  overcast: { day: ['#3B4656', '#1F2937'], night: ['#151B27', '#1F2937'] },
  fog:      { day: ['#4B5563', '#1F2937'], night: ['#1F2530', '#111827'] },
  rain:     { day: ['#2E3A4D', '#111827'], night: ['#111827', '#1A2538'] },
  snow:     { day: ['#4A5A70', '#273449'], night: ['#1E2A3D', '#111827'] },
  storm:    { day: ['#1B1F3B', '#0B0B1A'], night: ['#0A0A18', '#17133A'] },
};

export const getBackgroundColors = (kind, isDay) =>
  GRADIENTS[kind]?.[isDay ? 'day' : 'night'] ?? GRADIENTS.clear.day;
