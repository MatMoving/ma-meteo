// Écran principal : barre du haut, pages des villes (glisser horizontalement) et recherche.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useLocationsContext } from '../contexts/LocationsContext';
import { useSettings } from '../contexts/SettingsContext';
import { MAX_CITIES } from '../hooks/useLocations';
import useNow from '../hooks/useNow';
import SkyBackdrop from '../components/weather/SkyBackdrop';
import WeatherBackground from '../components/weather/WeatherBackground';
import WeatherPage from '../components/weather/WeatherPage';
import CitySearchModal from '../components/CitySearchModal';
import { COLORS, getBackgroundColors } from '../constants/theme';
import { getKind } from '../utils/weatherCodes';
import { timeAgo } from '../utils/format';

// Le widget Android a besoin de modules natifs : indisponible dans Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
if (!isExpoGo) {
  try {
    require('../utils/widgetTask');
  } catch (e) {
    console.log('Widget indisponible dans cet environnement', e);
  }
}

const IconButton = ({ icon, onPress, tone = 'default', disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    hitSlop={8}
    activeOpacity={0.7}
    style={[styles.iconBtn, tone === 'primary' && styles.iconPrimary, disabled && styles.iconDisabled]}
  >
    <Ionicons
      name={icon}
      size={tone === 'primary' ? 24 : 20}
      color={tone === 'danger' ? '#FCA5A5' : COLORS.text}
    />
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { locations, ready, addCity, removeCity, refresh } = useLocationsContext();
  const { settings, previewSky, setPreviewSky } = useSettings();
  const now = useNow();

  const pagerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const goTo = useCallback((index, animated = true) => {
    setActiveIndex(index);
    pagerRef.current?.scrollTo({ x: index * width, animated });
  }, [width]);

  // Si une ville disparaît, on revient sur la ville la plus proche
  useEffect(() => {
    if (locations.length && activeIndex > locations.length - 1) {
      goTo(locations.length - 1);
    }
  }, [locations.length, activeIndex, goTo]);

  const active = locations[Math.min(activeIndex, locations.length - 1)];

  const kind = previewSky ? previewSky.kind : getKind(active?.data?.current.weatherCode);
  const isDay = previewSky ? previewSky.isDay : (active?.data?.current.isDay ?? true);
  const colors = getBackgroundColors(kind, isDay);

  const confirmRemove = (location) => {
    if (location.isLocal) return;
    Alert.alert('Supprimer la ville', `Retirer ${location.name} de vos villes ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeCity(location.id) },
    ]);
  };

  const handleSelectCity = (city) => {
    const result = addCity(city);
    if (result === 'limit') {
      Alert.alert('Limite atteinte', `Vous pouvez suivre jusqu'à ${MAX_CITIES} emplacements, position comprise.`);
      return;
    }
    if (result === 'duplicate') {
      Alert.alert('Déjà ajoutée', `${city.name} est déjà dans votre liste.`);
      return;
    }
    setShowSearch(false);
    // La nouvelle ville est ajoutée en fin de liste : on s'y rend
    setTimeout(() => goTo(locations.length), 100);
  };

  let subtitle = '';
  const updating = !previewSky && !!active?.loading;
  if (previewSky) subtitle = `Aperçu : ${previewSky.label} · toucher pour quitter`;
  else if (updating) subtitle = 'Actualisation…';
  else if (active?.lastRefreshed) subtitle = `Mis à jour ${timeAgo(active.lastRefreshed, now)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <SkyBackdrop colors={colors} animated={settings.animations !== 'off'} />
        <WeatherBackground kind={kind} isDay={isDay} level={settings.animations} />

        <View style={styles.topBar}>
          <IconButton icon="settings-outline" onPress={() => router.push('/settings')} />

          <Pressable
            style={styles.titlePill}
            onPress={() => previewSky && setPreviewSky(null)}
            disabled={!previewSky}
          >
            <View style={styles.titleRow}>
              {active ? (
                <Ionicons name={active.isLocal ? 'location-sharp' : 'map'} size={14} color={COLORS.accent} />
              ) : null}
              <Text style={styles.title} numberOfLines={1}>{active?.name ?? ''}</Text>
            </View>
            {subtitle ? (
              <View style={styles.titleRow}>
                {updating ? <ActivityIndicator size={10} color={COLORS.textMuted} /> : null}
                <Text style={[styles.subtitle, previewSky && styles.subtitlePreview]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.actions}>
            {active && !active.isLocal && (
              <IconButton icon="trash-outline" tone="danger" onPress={() => confirmRemove(active)} />
            )}
            <IconButton icon="add" tone="primary" onPress={() => setShowSearch(true)} disabled={!ready} />
          </View>
        </View>

        {locations.length > 1 && (
          <View style={styles.dots}>
            {locations.map((loc, i) => (
              <View key={loc.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.text} />
          </View>
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              // Le titre suit le défilement, sans attendre la fin du glissement
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              if (index !== activeIndex) setActiveIndex(index);
            }}
          >
            {locations.map((loc) => (
              <View key={loc.id} style={{ width }}>
                <WeatherPage
                  location={loc}
                  onRefresh={() => refresh(loc.id)}
                  onDelete={loc.isLocal ? undefined : () => confirmRemove(loc)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {showSearch && (
        <CitySearchModal onClose={() => setShowSearch(false)} onSelect={handleSelectCity} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1736' },
  container: { flex: 1, overflow: 'hidden' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  iconPrimary: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(59, 130, 246, 0.9)', borderColor: 'transparent' },
  iconDisabled: { opacity: 0.4 },
  titlePill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  subtitle: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  subtitlePreview: { color: '#FCD34D', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 3 },
  dotActive: { width: 18, backgroundColor: COLORS.text },
});
