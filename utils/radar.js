// URL de la carte radar Windy (intégrée, sans clé API).

export const buildRadarUrl = ({ latitude, longitude, zoom = 8, overlay = 'rain' }) =>
  'https://embed.windy.com/embed2.html' +
  `?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}` +
  `&zoom=${zoom}&level=surface&overlay=${overlay}&product=ecmwf` +
  '&menu=&message=&marker=true&calendar=now&pressure=&type=map' +
  '&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1';
