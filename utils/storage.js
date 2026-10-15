// Sauvegarde locale des villes et de leur dernière météo.
// La clé 'weather_locations' est aussi lue par le widget Android : ne pas la changer.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'weather_locations';

// Remet en forme une entrée sauvegardée (ancien format compris).
// L'état "chargement" n'est jamais restauré : c'est la cause des villes bloquées.
const normalize = (raw) => {
  const latitude = raw.latitude ?? raw.region?.latitude ?? null;
  const longitude = raw.longitude ?? raw.region?.longitude ?? null;
  if (!raw.isLocal && (latitude == null || longitude == null)) return null;

  return {
    id: String(raw.id),
    name: raw.name ?? '',
    latitude,
    longitude,
    isLocal: !!raw.isLocal,
    // Les anciennes données (sans fetchedAt) sont ignorées et seront rechargées
    data: raw.data?.fetchedAt ? raw.data : null,
    lastRefreshed: raw.lastRefreshed ?? raw.data?.fetchedAt ?? null,
    loading: false,
    error: null,
  };
};

export const loadLocations = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(normalize).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const saveLocations = async (locations) => {
  const stored = locations.map(({ id, name, latitude, longitude, isLocal, data, lastRefreshed }) => ({
    id, name, latitude, longitude, isLocal, data, lastRefreshed,
  }));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Pas bloquant : au pire la ville est rechargée au prochain démarrage
  }
};
