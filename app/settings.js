// Écran Paramètres : unités, affichage, mise à jour, radar, villes et informations.

import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  ActionRow,
  Chips,
  InfoRow,
  Section,
  Segmented,
  SettingRow,
  SwitchRow,
} from '../components/settings/SettingsControls';
import { useSettings } from '../contexts/SettingsContext';
import { useLocationsContext } from '../contexts/LocationsContext';
import { MAX_CITIES } from '../hooks/useLocations';
import { OPTIONS, PREVIEW_SKIES } from '../constants/settings';
import { COLORS } from '../constants/theme';

const REPO_URL = 'https://github.com/MatMoving/ma-meteo';
const NONE = 'none';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting, resetSettings, previewSky, setPreviewSky } = useSettings();
  const { locations, removeCity } = useLocationsContext();
  const cities = locations.filter((loc) => !loc.isLocal);

  const set = (key) => (value) => updateSetting(key, value);

  const confirmReset = () => {
    Alert.alert('Réinitialiser', 'Remettre tous les réglages par défaut ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Réinitialiser', style: 'destructive', onPress: resetSettings },
    ]);
  };

  const confirmRemove = (city) => {
    Alert.alert('Supprimer la ville', `Retirer ${city.name} de vos villes ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeCity(city.id) },
    ]);
  };

  const skyOptions = [
    { label: 'Réel', value: NONE },
    ...PREVIEW_SKIES.map((sky) => ({ label: sky.label, value: sky.label })),
  ];
  const onSkyChange = (value) => {
    setPreviewSky(value === NONE ? null : PREVIEW_SKIES.find((sky) => sky.label === value));
  };

  const version = Constants.expoConfig?.version ?? '-';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section icon="thermometer-outline" title="Unités">
          <SettingRow label="Température">
            <Segmented options={OPTIONS.temperatureUnit} value={settings.temperatureUnit} onChange={set('temperatureUnit')} />
          </SettingRow>
          <SettingRow label="Vitesse du vent">
            <Segmented options={OPTIONS.windUnit} value={settings.windUnit} onChange={set('windUnit')} />
          </SettingRow>
        </Section>

        <Section icon="color-palette-outline" title="Affichage">
          <SettingRow
            label="Animations"
            hint="Pluie, orage, étoiles, soleil. Réduire ou couper ces effets économise la batterie."
          >
            <Segmented options={OPTIONS.animations} value={settings.animations} onChange={set('animations')} />
          </SettingRow>
          <SwitchRow
            label="Pluie dans l'heure"
            hint="Affiche la pluie prévue dans les 60 prochaines minutes."
            value={settings.showNowcast}
            onChange={set('showNowcast')}
          />
          <SwitchRow
            label="Radar de pluie"
            hint="Carte Windy sur la page de chaque ville."
            value={settings.showRadar}
            onChange={set('showRadar')}
          />
        </Section>

        <Section icon="refresh-outline" title="Mise à jour">
          <SettingRow
            label="Actualiser au retour dans l'app"
            hint="Les villes dont les données sont plus anciennes que ce délai sont mises à jour."
          >
            <Segmented options={OPTIONS.autoRefresh} value={settings.autoRefresh} onChange={set('autoRefresh')} />
          </SettingRow>
          <SettingRow label="Couche du radar par défaut">
            <Segmented options={OPTIONS.radarLayer} value={settings.radarLayer} onChange={set('radarLayer')} />
          </SettingRow>
        </Section>

        <Section icon="location-outline" title={`Villes (${locations.length}/${MAX_CITIES})`}>
          {cities.length === 0 ? (
            <Text style={styles.empty}>Aucune ville ajoutée. Utilisez le + sur l’accueil pour en ajouter.</Text>
          ) : (
            cities.map((city) => (
              <View key={city.id} style={[styles.row, styles.cityRow]}>
                <View style={styles.cityText}>
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.cityMeta}>
                    {city.data ? 'Météo chargée' : city.error ? 'Chargement impossible' : 'Chargement…'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(city)} hitSlop={10} style={styles.trash}>
                  <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Section>

        <Section icon="flask-outline" title="Tester les animations">
          <View style={styles.testBlock}>
            <Text style={styles.hint}>
              Affiche un ciel de démonstration sur l’accueil. Choisissez « Réel » pour revenir à la météo.
            </Text>
            <Chips options={skyOptions} value={previewSky ? previewSky.label : NONE} onChange={onSkyChange} />
          </View>
        </Section>

        <Section icon="information-circle-outline" title="À propos">
          <InfoRow label="Version" value={version} />
          <ActionRow
            icon="cloud-outline"
            label="Données météo"
            hint="Open-Meteo : gratuit, sans clé API"
            onPress={() => Linking.openURL('https://open-meteo.com')}
          />
          <ActionRow
            icon="map-outline"
            label="Radar"
            hint="Windy"
            onPress={() => Linking.openURL('https://www.windy.com')}
          />
          <ActionRow
            icon="logo-github"
            label="Code source"
            hint="Dépôt GitHub du projet"
            onPress={() => Linking.openURL(REPO_URL)}
          />
        </Section>

        <Section icon="build-outline" title="Données">
          <ActionRow
            icon="refresh-circle-outline"
            label="Réinitialiser les réglages"
            hint="Remet toutes les options par défaut. Vos villes sont conservées."
            onPress={confirmReset}
            danger
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  spacer: { width: 40, height: 40 },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 60 },
  empty: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, paddingVertical: 14 },
  cityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cityText: { flex: 1, gap: 2 },
  cityName: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  cityMeta: { color: COLORS.textMuted, fontSize: 13 },
  trash: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
  testBlock: { paddingVertical: 14 },
  hint: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
});
