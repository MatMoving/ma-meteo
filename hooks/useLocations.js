// Gère la liste des villes : position GPS, ajout, suppression, rafraîchissement
// et sauvegarde. Chaque chargement a un délai maximum, donc rien ne reste
// bloqué sur "Chargement" indéfiniment.
//
// À l'ouverture, tout s'affiche aussitôt depuis le cache (remis à l'heure actuelle),
// puis la météo est rechargée en parallèle pour toutes les villes. La position n'est
// pas attendue : la météo part avec la dernière position connue, et n'est rechargée
// que si le téléphone a vraiment bougé. (Avant, elle attendait le GPS puis le nom de
// la ville : si l'un des deux bloquait, la position principale n'était jamais rechargée.)

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather } from '../utils/weatherApi';
import { loadLocations, reformat, saveLocations } from '../utils/storage';
import {
  MOVE_THRESHOLD_KM,
  currentCoords,
  distanceKm,
  ensureLocationPermission,
  lastKnownCoords,
  placeName,
} from '../utils/geo';

export const MAX_CITIES = 5;
export const LOCAL_ID = 'local';
const DEFAULT_LOCAL_NAME = 'Ma position';

const localPlaceholder = () => ({
  id: LOCAL_ID,
  name: DEFAULT_LOCAL_NAME,
  latitude: null,
  longitude: null,
  isLocal: true,
  raw: null,
  data: null,
  loading: false,
  error: null,
  lastRefreshed: null,
});

const describeError = (error) => {
  if (error?.code === 'ECONNABORTED' || error?.message === 'timeout') {
    return 'Le service météo met trop de temps à répondre.';
  }
  if (error?.response) return 'Le service météo est indisponible pour le moment.';
  return 'Pas de connexion internet.';
};

const isStale = (loc, maxAgeMs) => !loc.lastRefreshed || Date.now() - loc.lastRefreshed > maxAgeMs;

// Reprend une version sauvegardée plus récente (mise à jour faite en arrière-plan)
const mergeSaved = (loc, saved, now) => {
  if (saved?.raw && (saved.lastRefreshed ?? 0) > (loc.lastRefreshed ?? 0)) {
    const position = loc.isLocal
      ? { name: saved.name, latitude: saved.latitude, longitude: saved.longitude }
      : {};
    return { ...loc, ...position, raw: saved.raw, data: saved.data, lastRefreshed: saved.lastRefreshed, error: null };
  }
  return reformat(loc, now);
};

export default function useLocations() {
  const [locations, setLocations] = useState([]);
  const [ready, setReady] = useState(false);
  const locationsRef = useRef(locations);
  // Requête en cours par ville, pour ne jamais charger deux fois la même chose
  const inFlight = useRef({});

  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  const patch = useCallback((id, changes) => {
    setLocations((list) => list.map((loc) => (loc.id === id ? { ...loc, ...changes } : loc)));
  }, []);

  const loadWeather = useCallback((id, latitude, longitude) => {
    const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const running = inFlight.current[id];
    if (running?.key === key) return running.promise;

    patch(id, { loading: true });
    const request = { key };
    // Seule la requête la plus récente d'une ville a le droit de modifier l'affichage
    const isLatest = () => inFlight.current[id] === request;
    request.promise = (async () => {
      try {
        const { raw, data } = await fetchWeather(latitude, longitude);
        if (isLatest()) patch(id, { raw, data, error: null, loading: false, lastRefreshed: raw.fetchedAt });
      } catch (error) {
        // On garde les anciennes données affichées, seule l'erreur change
        if (isLatest()) patch(id, { error: describeError(error), loading: false });
      } finally {
        if (isLatest()) delete inFlight.current[id];
      }
    })();
    inFlight.current[id] = request;
    return request.promise;
  }, [patch]);

  // maxAgeMs : la météo n'est rechargée avec l'ancienne position que si elle est plus vieille
  const locateLocal = useCallback(async (maxAgeMs = 0) => {
    const known = locationsRef.current.find((loc) => loc.isLocal);
    const hasKnown = known?.latitude != null;

    // 1. Météo tout de suite à la dernière position, sans attendre le GPS
    const quick = hasKnown && isStale(known, maxAgeMs)
      ? loadWeather(LOCAL_ID, known.latitude, known.longitude)
      : null;
    if (!hasKnown) patch(LOCAL_ID, { loading: true, error: null });

    const fail = (error) => {
      if (!hasKnown) patch(LOCAL_ID, { loading: false, error });
      return quick;
    };

    // 2. En parallèle, vérifie si le téléphone a bougé
    try {
      if (!(await ensureLocationPermission())) return fail('Localisation refusée. Autorisez-la dans les réglages.');

      const coords = (await lastKnownCoords()) ?? (await currentCoords());
      if (!coords) return fail('Position introuvable. Vérifiez que le GPS est activé.');

      const moved = distanceKm(known, coords) > MOVE_THRESHOLD_KM;
      if (moved || !known?.name || known.name === DEFAULT_LOCAL_NAME) {
        placeName(coords).then((name) => name && patch(LOCAL_ID, { name }));
      }
      if (!moved) return quick;

      patch(LOCAL_ID, { latitude: coords.latitude, longitude: coords.longitude });
      return loadWeather(LOCAL_ID, coords.latitude, coords.longitude);
    } catch {
      return fail('Impossible de déterminer votre position.');
    }
  }, [patch, loadWeather]);

  // Chargement initial : cache affiché aussitôt, puis mise à jour de tout en parallèle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadLocations();
      if (cancelled) return;

      const local = cached.find((loc) => loc.isLocal) ?? localPlaceholder();
      const cities = cached.filter((loc) => !loc.isLocal);
      const list = [local, ...cities];
      locationsRef.current = list;
      setLocations(list);
      setReady(true);

      // Données de moins de 2 minutes (mise à jour en arrière-plan) : déjà à jour
      const OPEN_MAX_AGE = 2 * 60 * 1000;
      locateLocal(OPEN_MAX_AGE);
      cities
        .filter((city) => isStale(city, OPEN_MAX_AGE))
        .forEach((city) => loadWeather(city.id, city.latitude, city.longitude));
    })();
    return () => {
      cancelled = true;
    };
  }, [locateLocal, loadWeather]);

  // Sauvegarde à chaque changement, une fois le cache lu
  useEffect(() => {
    if (ready) saveLocations(locations);
  }, [locations, ready]);

  // Retour dans l'application : reprend les données mises à jour en arrière-plan,
  // remet l'affichage à l'heure, puis recharge ce qui est plus vieux que maxAgeMs.
  const resume = useCallback(async (maxAgeMs) => {
    const saved = await loadLocations();
    const byId = new Map(saved.map((loc) => [loc.id, loc]));
    const now = Date.now();
    const merge = (loc) => mergeSaved(loc, byId.get(loc.id), now);

    const merged = locationsRef.current.map(merge);
    locationsRef.current = merged;
    setLocations((list) => list.map(merge));

    if (maxAgeMs == null) return;
    locateLocal(maxAgeMs);
    merged
      .filter((loc) => !loc.isLocal && isStale(loc, maxAgeMs))
      .forEach((loc) => loadWeather(loc.id, loc.latitude, loc.longitude));
  }, [locateLocal, loadWeather]);

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
        raw: null,
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
    if (loc.isLocal) return locateLocal(0);
    return loadWeather(id, loc.latitude, loc.longitude);
  }, [locateLocal, loadWeather]);

  return { locations, ready, addCity, removeCity, refresh, resume };
}
