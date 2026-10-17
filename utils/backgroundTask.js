// Mise à jour de la météo en arrière-plan, comme une vraie application météo.
// Android décide du moment exact (au plus tôt toutes les 15 minutes, et moins souvent
// si la batterie est faible) : l'application n'a donc pas besoin de rester ouverte.
//
// La tâche doit être définie au chargement du code, d'où l'import dans app/_layout.js.

import { AppState, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { refreshSavedLocations } from './weatherSync';

export const BACKGROUND_TASK = 'ma-meteo-background-refresh';

// Modules natifs absents dans Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Redessine le widget Android avec les données enregistrées
export const updateWidget = async () => {
  if (isExpoGo || Platform.OS !== 'android') return;
  try {
    await require('./widgetTask').updateWeatherWidget();
  } catch {
    // Widget indisponible (Expo Go, iOS)
  }
};

if (!isExpoGo) {
  TaskManager.defineTask(BACKGROUND_TASK, async () => {
    // Application ouverte : elle se met déjà à jour toute seule
    if (AppState.currentState === 'active') return BackgroundTask.BackgroundTaskResult.Success;
    try {
      const updated = await refreshSavedLocations({ maxAgeMs: 10 * 60 * 1000 });
      if (updated) await updateWidget();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

// Active, modifie ou coupe la tâche selon le réglage (minutes, 0 = désactivée)
export async function syncBackgroundTask(minutes) {
  if (isExpoGo) return;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (!minutes) {
      if (registered) await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK);
      return;
    }
    if (registered) {
      const options = await TaskManager.getTaskOptionsAsync(BACKGROUND_TASK);
      if (options?.minimumInterval === minutes) return;
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK);
    }
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK, { minimumInterval: minutes });
  } catch {
    // Pas bloquant : l'application se met quand même à jour à l'ouverture
  }
}
