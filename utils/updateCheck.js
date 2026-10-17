// Recherche d'une nouvelle version publiée sur GitHub (Releases du dépôt).
// L'APK n'est pas distribué par un store : c'est cette vérification qui propose la mise à jour.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const REPO = 'MatMoving/ma-meteo';
const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
export const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;

const STATE_KEY = 'update_check';
// Vérification automatique au plus une fois toutes les 6 heures
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export const currentVersion = () => Constants.expoConfig?.version ?? '0.0.0';

// "v2.10.0" > "2.9.1"
export const isNewer = (candidate, current) => {
  const parse = (v) => String(v).replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const a = parse(candidate);
  const b = parse(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return false;
};

const readState = async () => {
  try {
    return JSON.parse((await AsyncStorage.getItem(STATE_KEY)) ?? '{}');
  } catch {
    return {};
  }
};

const writeState = (state) => AsyncStorage.setItem(STATE_KEY, JSON.stringify(state)).catch(() => {});

// Retourne { version, apkUrl, pageUrl, notes } si une version plus récente existe, sinon null.
// force : ignore l'intervalle et le "Plus tard" (bouton des paramètres).
export async function checkForUpdate({ force = false } = {}) {
  const state = await readState();
  if (!force && state.checkedAt && Date.now() - state.checkedAt < CHECK_INTERVAL) {
    return state.latest && isNewer(state.latest.version, currentVersion()) && state.dismissed !== state.latest.version
      ? state.latest
      : null;
  }

  const { data } = await axios.get(LATEST_URL, {
    timeout: 8000,
    headers: { Accept: 'application/vnd.github+json' },
  });
  const apk = (data.assets ?? []).find((asset) => asset.name?.toLowerCase().endsWith('.apk'));
  const latest = {
    version: String(data.tag_name ?? '').replace(/^v/i, ''),
    apkUrl: apk?.browser_download_url ?? null,
    pageUrl: data.html_url ?? RELEASES_URL,
    notes: data.body ?? '',
  };
  await writeState({ ...state, checkedAt: Date.now(), latest });

  if (!isNewer(latest.version, currentVersion())) return null;
  if (!force && state.dismissed === latest.version) return null;
  return latest;
}

// "Plus tard" : la même version n'est plus proposée automatiquement
export async function dismissUpdate(version) {
  const state = await readState();
  await writeState({ ...state, dismissed: version });
}
