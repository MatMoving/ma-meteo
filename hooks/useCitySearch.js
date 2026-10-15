// Recherche de villes avec délai (pas une requête par lettre) et annulation
// des requêtes périmées (une ancienne réponse ne remplace jamais la nouvelle).

import { useEffect, useState } from 'react';
import { searchCities } from '../utils/weatherApi';

const DEBOUNCE_MS = 350;
const MIN_LENGTH = 2;

export default function useCitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_LENGTH) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');

    const timer = setTimeout(async () => {
      try {
        const found = await searchCities(term, controller.signal);
        if (controller.signal.aborted) return;
        setResults(found);
        setStatus('done');
      } catch {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { query, setQuery, results, status };
}
