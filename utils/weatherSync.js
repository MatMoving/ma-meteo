// Mise à jour des villes enregistrées sans l'interface : utilisée par la tâche
// en arrière-plan et par le widget. Ne touche que les données météo, jamais la liste
// des villes (une ville supprimée entre-temps n'est pas recréée).

import * as Location from 'expo-location';
import { fetchWeatherRaw } from './weatherApi';
import { formatSaved } from './weatherFormat';
import { loadLocations, saveLocations } from './storage';
import { MOVE_THRESHOLD_KM, distanceKm, lastKnownCoords, placeName } from './geo';

// Position du téléphone si elle est disponible sans réveiller le GPS
const backgroundCoords = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted' ? await lastKnownCoords(60) : null;
  } catch {
    return null;
  }
};

// Recharge les villes dont la météo a plus de maxAgeMs. Retourne le nombre de villes mises à jour.
export async function refreshSavedLocations({ maxAgeMs = 10 * 60 * 1000, timeoutMs = 15000 } = {}) {
  const list = await loadLocations();
  const now = Date.now();
  const updates = new Map();

  const local = list.find((loc) => loc.isLocal);
  const coords = local ? await backgroundCoords() : null;
  if (local && coords && distanceKm(local, coords) > MOVE_THRESHOLD_KM) {
    updates.set(local.id, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      name: (await placeName(coords)) ?? local.name,
    });
  }

  await Promise.all(
    list.map(async (loc) => {
      const target = { ...loc, ...updates.get(loc.id) };
      const moved = updates.has(loc.id);
      if (target.latitude == null) return;
      if (!moved && loc.lastRefreshed && now - loc.lastRefreshed < maxAgeMs) return;
      try {
        const raw = await fetchWeatherRaw(target.latitude, target.longitude, timeoutMs);
        updates.set(loc.id, { ...updates.get(loc.id), raw, lastRefreshed: raw.fetchedAt });
      } catch {
        // Hors connexion : on réessaiera à la prochaine occasion
        if (moved) updates.delete(loc.id);
      }
    }),
  );

  const fetched = [...updates.values()].filter((u) => u.raw).length;
  if (!fetched) return 0;

  // Relit la liste juste avant d'écrire : l'application a pu la modifier entre-temps
  const latest = await loadLocations();
  await saveLocations(
    latest.map((loc) => {
      const update = updates.get(loc.id);
      if (!update?.raw || (loc.lastRefreshed ?? 0) >= update.lastRefreshed) return loc;
      return { ...loc, ...update, data: formatSaved(update.raw) };
    }),
  );
  return fetched;
}
