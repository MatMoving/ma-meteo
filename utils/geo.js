// Position du téléphone et distances, partagées par l'application et la mise à jour en arrière-plan.

import * as Location from 'expo-location';

// En dessous, la météo est la même : inutile de recharger ou de renommer la position
export const MOVE_THRESHOLD_KM = 2;

export const distanceKm = (a, b) => {
  if (a?.latitude == null || b?.latitude == null) return Infinity;
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

export const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// "Ville, FR" à partir de coordonnées ; null si le géocodage échoue
export const placeName = async (coords) => {
  try {
    const [place] = await withTimeout(Location.reverseGeocodeAsync(coords), 5000);
    if (!place) return null;
    return [place.city ?? place.subregion ?? place.region, place.isoCountryCode].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
};

// Dernière position connue du téléphone (instantané), si elle est assez récente
export const lastKnownCoords = async (maxAgeMinutes = 15) => {
  try {
    const position = await Location.getLastKnownPositionAsync({
      maxAge: maxAgeMinutes * 60 * 1000,
      requiredAccuracy: 3000,
    });
    return position ? position.coords : null;
  } catch {
    return null;
  }
};

// Position précise (quelques secondes), avec repli sur la dernière connue
export const currentCoords = async (timeoutMs = 10000) => {
  try {
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      timeoutMs,
    );
    return position.coords;
  } catch {
    return lastKnownCoords(24 * 60);
  }
};
