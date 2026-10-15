// Écran principal : barre du haut, pages des villes (glisser horizontalement) et recherche.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import useLocations, { MAX_CITIES } from '../hooks/useLocations';
import useNow from '../hooks/useNow';
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

// Ciels de test (bouton fiole) pour vérifier les animations sans attendre la météo
const TEST_SKIES = [
  { label: 'Soleil', kind: 'clear', isDay: true },
  { label: 'Nuages', kind: 'partly', isDay: true },
  { label: 'Pluie', kind: 'rain', isDay: true },
  { label: 'Orage', kind: 'storm', isDay: true },
  { label: 'Neige', kind: 'snow', isDay: true },
  { label: 'Nuit', kind: 'clear', isDay: false },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { locations, ready, addCity, removeCity, refresh } = useLocations();
  const now = useNow();

  const pagerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [testIndex, setTestIndex] = useState(null);

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
  const test = testIndex === null ? null : TEST_SKIES[testIndex];

  const kind = test ? test.kind : getKind(active?.data?.current.weatherCode);
  const isDay = test ? test.isDay : (active?.data?.current.isDay ?? true);
  const gradient = getBackgroundColors(kind, isDay);

  // Parcourt les ciels de test, puis revient à la météo réelle
  const cycleTest = () =>
    setTestIndex((i) => {
      if (i === null) return 0;
      return i === TEST_SKIES.length - 1 ? null : i + 1;
    });

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
      Alert.alert('Limite atteinte', `Vous pouvez suivre jusqu'à ${MAX_CITIES} villes.`);
      return;
    }
    if (result === 'duplicate') {
      Alert.alert('Déjà ajoutée', `${city.name} est déjà dans votre liste.`);
      return;
    }
    setShowSearch(false);
    // La nouvelle ville est ajoutée en fin de liste
    setTimeout(() => goTo(locations.length), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.container}>
        <WeatherBackground kind={kind} isDay={isDay} />

        <View style={styles.topBar}>
          <TouchableOpacity onPress={cycleTest} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="flask" size={20} color={test ? '#10B981' : COLORS.text} />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            {active?.lastRefreshed && !test ? (
              <Text style={styles.updated}>Mis à jour il y a {timeAgo(active.lastRefreshed, now)}</Text>
            ) : null}
            <View style={styles.titleRow}>
              {active ? (
                <Ionicons name={active.isLocal ? 'location-sharp' : 'map'} size={16} color={COLORS.text} />
              ) : null}
              <Text style={styles.title} numberOfLines={1}>
                {test ? `[TEST] ${test.label}` : active?.name ?? ''}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {active && !active.isLocal && (
              <TouchableOpacity onPress={() => confirmRemove(active)} style={styles.iconBtn} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowSearch(true)}
              style={styles.iconBtn}
              hitSlop={8}
              disabled={!ready}
            >
              <Ionicons name="add" size={26} color={COLORS.text} />
            </TouchableOpacity>
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
            onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
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
      </LinearGradient>

      {showSearch && (
        <CitySearchModal onClose={() => setShowSearch(false)} onSelect={handleSelectCity} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { flex: 1, overflow: 'hidden' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  titleBox: { flex: 1, alignItems: 'center' },
  updated: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 4 },
  dotActive: { backgroundColor: COLORS.text, width: 8, height: 8, borderRadius: 4 },
});
