// Renvoie l'heure actuelle, mise à jour à intervalle régulier (pour "Mis à jour il y a…").

import { useEffect, useState } from 'react';

export default function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
