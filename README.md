# Ma Météo

Application météo Android (et iOS) faite avec Expo / React Native.
Données fournies par [Open-Meteo](https://open-meteo.com) (gratuit, sans clé API) et le radar [Windy](https://www.windy.com).

## Fonctionnalités

- **Position actuelle** en premier, puis jusqu'à 5 villes au total.
- **Ajouter une ville** : recherche pendant la frappe, 10 résultats, nom de région et pays affichés.
- **Supprimer une ville** : icône corbeille en haut, ou bouton dans la page si la ville ne charge pas.
- **Météo détaillée** : température, ressenti, vent, rafales, pluie maintenant, humidité, UV, qualité de l'air (IQA européen), lever et coucher du soleil, phase lunaire.
- **Pluie dans l'heure** par tranches de 15 minutes.
- **Prévisions 24 h** (température, pluie ou vent) et **7 jours** (cumul de pluie, UV, lever et coucher).
- **Radar de pluie** intégré, en aperçu et en plein écran (pluie, vent, nuages, température).
- **Fond animé** selon le temps : soleil, nuages, pluie, orage avec éclairs, neige, brouillard, nuit étoilée.
- **Ouverture instantanée** : la dernière météo s'affiche tout de suite (remise à l'heure et au jour actuels), puis tout est rechargé en parallèle sans attendre le GPS.
- **Mise à jour en arrière-plan** (toutes les 30 min par défaut) : météo et widget à jour même application fermée.
- **Widget Android** « Météo Actuelle » (4×2) : heure de mise à jour, ouverture de l'application au toucher, rechargement automatique.
- **Logo** soleil, nuage et pluie (icône adaptative Android avec version monochrome), généré par `scripts/make-icons.py`.
- **Paramètres** : unités (°C/°F, km/h, m/s, mph), intensité des animations, actualisation à l'ouverture, fréquence de mise à jour en arrière-plan, couche radar par défaut, affichage de la pluie dans l'heure et du radar, gestion des villes, aperçus de ciel pour tester les animations.

## Installer l'application (APK)

Une fois l'APK généré (voir ci-dessous), téléchargez-le sur le téléphone, autorisez l'installation depuis les sources inconnues, puis installez-le.

## Développement

```bash
npm install
npx expo start
```

Compiler un APK Android avec EAS (dans le cloud, il faut un compte Expo) :

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

## Structure

```
app/                      Écrans (Expo Router)
  index.js                Écran principal : barre du haut, pages des villes, recherche
  rain-radar.js           Radar plein écran
components/
  weather/                Sections de la page météo et fond animé
  ui/                     Composants réutilisables (carte, bouton, fenêtre d'info)
  CitySearchModal.js      Recherche de villes
constants/                Couleurs, dégradés, textes des guides
hooks/                    useLocations (villes, GPS, cache), useCitySearch, useNow
utils/
  weatherApi.js           Appels Open-Meteo (prévisions, air, géocodage)
  weatherFormat.js        Mise en forme des données brutes
  weatherCodes.js         Codes météo WMO : type de temps, libellé, icône
  format.js               Dates, phase lunaire, qualité de l'air
  storage.js              Sauvegarde locale des villes (réponse brute, remise en forme à la lecture)
  geo.js                  Position du téléphone et distances
  weatherSync.js          Mise à jour des villes enregistrées sans l'interface
  backgroundTask.js       Tâche de mise à jour en arrière-plan
  widgetTask.js           Widget Android
scripts/
  make-icons.py           Génère le logo et les icônes (python scripts/make-icons.py)
```

Après avoir changé le logo ou ajouté un module natif, un build local demande de régénérer le dossier `android` :

```bash
npx expo prebuild --clean --platform android
```

## Historique

### 2.2.0

- **Logo** : soleil derrière un nuage avec de la pluie, sur un ciel bleu. Icône adaptative Android, icône monochrome (Android 13+), écran de démarrage assorti. Nom affiché : « Ma Météo ».
- **Ouverture rapide** : l'écran de démarrage passe directement à la dernière météo connue. Elle est recalculée pour l'heure actuelle (heure en cours, « Aujourd'hui », pluie dans l'heure), même si elle date de la veille. Toutes les villes se rechargent en parallèle ; la météo de la position part avec la dernière position connue, et n'est rechargée que si le téléphone a bougé de plus de 2 km.
- **Actualisation à l'ouverture** réglée sur « Toujours » par défaut ; tant que l'application reste ouverte, l'affichage est remis à l'heure toutes les 5 minutes.
- **Mise à jour en arrière-plan** (30 min, 1 h, 3 h ou désactivée) : l'application reprend aussitôt ces données à son retour au premier plan.
- **Widget** : il ne s'affichait pas (mauvais nom de widget lu dans le gestionnaire) ; il s'ouvre maintenant au toucher, montre l'heure de mise à jour et recharge la météo si elle a plus de 25 minutes.
- Réponse météo allégée (12 Ko au lieu de plusieurs dizaines) ; indicateur « Actualisation… » dans la barre du haut.

### 2.1.0

- Écran **Paramètres** (icône engrenage en haut à gauche) : unités, animations (complètes, réduites, aucune), mise à jour au retour dans l'application, couche radar par défaut, sections affichées, gestion des villes, aperçus de ciel.
- Fond qui se fond en douceur quand le temps change ; sections qui apparaissent en fondu.
- Design : bloc principal avec icône et extrêmes du jour, tuiles avec pastille colorée, titres de section, barre du haut revue.
- Animations : flocons qui oscillent, étoile filante la nuit, halo de lune qui respire, moins de particules en mode réduit.
- Le titre de la ville suit le défilement.
- Widget Android aligné sur les unités choisies.

### 2.0.0

- Suppression de villes possible. Une ville restée sur « Chargement » après un redémarrage est corrigée : l'état de chargement n'est plus sauvegardé, et chaque requête a un délai maximum.
- Recherche de villes plus fiable : délai pendant la frappe, annulation des réponses périmées, 10 résultats, essai avec et sans tirets pour les noms de communes.
- Animations réécrites : pluie inclinée, orage avec éclairs, neige, brouillard, soleil avec rayons, nuit étoilée avec lune.
- Lisibilité : fonds plus sombres, textes plus contrastés, fenêtres d'information opaques.
- Données plus justes :
  - suppression de la « fiabilité » calculée artificiellement ;
  - plus de fausses données silencieuses en cas d'erreur (un bandeau indique les données anciennes) ;
  - qualité de l'air sur l'échelle européenne (EAQI) au lieu de l'échelle américaine ;
  - icônes selon le code météo réel (le pourcentage de pluie ne les change plus) ;
  - heure courante calculée au fuseau de la ville ;
  - phase lunaire complète (les quartiers n'étaient jamais affichés) ;
  - cumul de pluie journalier et rafales de vent.
- Code réorganisé en composants, hooks et utilitaires. Dépendances inutilisées retirées.

### 1.x

Première version : position, villes multiples, prévisions, radar, widget.
