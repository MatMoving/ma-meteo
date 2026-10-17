// Sauvegarde locale des villes et de leur dernière météo.
// La clé 'weather_locations' est aussi lue par le widget Android et la mise à jour
// en arrière-plan : ne pas la changer.
//
// C'est la réponse brute d'Open-Meteo qui est gardée ('raw') : elle est remise en forme
// à chaque lecture, pour que l'heure en cours et "aujourd'hui" soient toujours justes.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatSaved } from './weatherFormat';

const KEY = 'weather_locations';

// Remet en forme une entrée sauvegardée (anciens formats compris).
// L'état "chargement" n'est jamais restauré : c'est la cause des villes bloquées.
const normalize = (entry, now) => {
  const latitude = entry.latitude ?? entry.region?.latitude ?? null;
  const longitude = entry.longitude ?? entry.region?.longitude ?? null;
  if (!entry.isLocal && (latitude == null || longitude == null)) return null;

  const raw = entry.raw?.forecast ? entry.raw : null;
  // Ancien format (sans réponse brute) : données affichées telles quelles en attendant le rechargement
  const data = (raw && formatSaved(raw, now)) ?? (entry.data?.fetchedAt ? entry.data : null);

  return {
    id: String(entry.id),
    name: entry.name ?? '',
    latitude,
    longitude,
    isLocal: !!entry.isLocal,
    raw: data ? raw : null,
    data,
    lastRefreshed: data ? (entry.lastRefreshed ?? data.fetchedAt ?? null) : null,
    loading: false,
    error: null,
  };
};

export const loadLocations = async (now = Date.now()) => {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    const list = stored ? JSON.parse(stored) : [];
    return Array.isArray(list) ? list.map((entry) => normalize(entry, now)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const saveLocations = async (locations) => {
  const stored = locations.map(({ id, name, latitude, longitude, isLocal, raw, data, lastRefreshed }) => ({
    id,
    name,
    latitude,
    longitude,
    isLocal,
    lastRefreshed,
    // La réponse brute suffit ; les données mises en forme ne sont gardées que pour l'ancien format
    ...(raw ? { raw } : { data }),
  }));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Pas bloquant : au pire la ville est rechargée au prochain démarrage
  }
};

// Reformate des villes déjà en mémoire pour l'heure actuelle
export const reformat = (location, now = Date.now()) => {
  if (!location.raw) return location;
  const data = formatSaved(location.raw, now);
  return data ? { ...location, data } : location;
};
