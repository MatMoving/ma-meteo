// Gère la liste des villes : position GPS, ajout, suppression, rafraîchissement
// et sauvegarde. Chaque chargement a un délai maximum, donc rien ne reste
// bloqué sur "Chargement" indéfiniment.

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { fetchWeather } from '../utils/weatherApi';
import { loadLocations, saveLocations } from '../utils/storage';

export const MAX_CITIES = 5;
export const LOCAL_ID = 'local';
const LOCATION_TIMEOUT = 10000;

const localPlaceholder = () => ({
  id: LOCAL_ID,
  name: 'Ma position',
  latitude: null,
  longitude: null,
  isLocal: true,
  data: null,
  loading: false,
  error: null,
  lastRefreshed: null,
});

const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const describeError = (error) => {
  if (error?.code === 'ECONNABORTED' || error?.message === 'timeout') {
    return 'Le service météo met trop de temps à répondre.';
  }
  if (error?.response) return 'Le service météo est indisponible pour le moment.';
  return 'Pas de connexion internet.';
};

const getCurrentPosition = async () => {
  try {
    return await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      LOCATION_TIMEOUT,
    );
  } catch {
    return Location.getLastKnownPositionAsync({});
  }
};

export default function useLocations() {
  const [locations, setLocations] = useState([]);
  const [ready, setReady] = useState(false);
  const locationsRef = useRef(locations);

  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  const patch = useCallback((id, changes) => {
    setLocations((list) => list.map((loc) => (loc.id === id ? { ...loc, ...changes } : loc)));
  }, []);

  const loadWeather = useCallback(async (id, latitude, longitude) => {
    patch(id, { loading: true });
    try {
      const data = await fetchWeather(latitude, longitude);
      patch(id, { data, error: null, loading: false, lastRefreshed: data.fetchedAt });
    } catch (error) {
      // On garde les anciennes données affichées, seule l'erreur change
      patch(id, { error: describeError(error), loading: false });
    }
  }, [patch]);

  const locateLocal = useCallback(async () => {
    patch(LOCAL_ID, { loading: true, error: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        patch(LOCAL_ID, { loading: false, error: 'Localisation refusée. Autorisez-la dans les réglages.' });
        return;
      }

      const position = await getCurrentPosition();
      if (!position) {
        patch(LOCAL_ID, { loading: false, error: 'Position introuvable. Vérifiez que le GPS est activé.' });
        return;
      }

      const { latitude, longitude } = position.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []);
      const name = place
        ? [place.city ?? place.subregion ?? place.region, place.isoCountryCode].filter(Boolean).join(', ')
        : 'Ma position';

      patch(LOCAL_ID, { name: name || 'Ma position', latitude, longitude });
      await loadWeather(LOCAL_ID, latitude, longitude);
    } catch {
      patch(LOCAL_ID, { loading: false, error: 'Impossible de déterminer votre position.' });
    }
  }, [patch, loadWeather]);

  // Chargement initial : cache, puis position, puis mise à jour des villes enregistrées
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadLocations();
      if (cancelled) return;

      const local = cached.find((loc) => loc.isLocal) ?? localPlaceholder();
      const cities = cached.filter((loc) => !loc.isLocal);
      setLocations([local, ...cities]);
      setReady(true);

      locateLocal();
      cities.forEach((city) => loadWeather(city.id, city.latitude, city.longitude));
    })();
    return () => {
      cancelled = true;
    };
  }, [locateLocal, loadWeather]);

  // Sauvegarde à chaque changement, une fois le cache lu
  useEffect(() => {
    if (ready) saveLocations(locations);
  }, [locations, ready]);

  // Retourne 'added', 'duplicate' ou 'limit'
  const addCity = useCallback((city) => {
    const list = locationsRef.current;
    const isDuplicate = list.some(
      (loc) =>
        !loc.isLocal &&
        Math.abs(loc.latitude - city.latitude) < 0.01 &&
        Math.abs(loc.longitude - city.longitude) < 0.01,
    );
    if (isDuplicate) return 'duplicate';
    if (list.length >= MAX_CITIES) return 'limit';

    const id = `${Date.now()}`;
    const name = city.region ? `${city.name}, ${city.region}` : city.name;
    setLocations((current) => [
      ...current,
      {
        id,
        name,
        latitude: city.latitude,
        longitude: city.longitude,
        isLocal: false,
        data: null,
        loading: true,
        error: null,
        lastRefreshed: null,
      },
    ]);
    loadWeather(id, city.latitude, city.longitude);
    return 'added';
  }, [loadWeather]);

  const removeCity = useCallback((id) => {
    setLocations((list) => list.filter((loc) => loc.isLocal || loc.id !== id));
  }, []);

  const refresh = useCallback((id) => {
    const loc = locationsRef.current.find((item) => item.id === id);
    if (!loc) return Promise.resolve();
    if (loc.isLocal) return locateLocal();
    return loadWeather(id, loc.latitude, loc.longitude);
  }, [locateLocal, loadWeather]);

  return { locations, ready, addCity, removeCity, refresh };
}
