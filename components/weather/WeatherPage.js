// Contenu d'une ville : chargement ou erreur, puis toutes les sections météo.

import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '../ui/Button';
import FadeInView from '../ui/FadeInView';
import InfoModal from '../ui/InfoModal';
import CurrentConditions from './CurrentConditions';
import NowcastCard from './NowcastCard';
import DetailTiles, { sunInfo } from './DetailTiles';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import DayDetailModal from './DayDetailModal';
import RadarPreview from './RadarPreview';
import { useSettings } from '../../contexts/SettingsContext';
import { AQI_GUIDE, HUMIDITY_GUIDE, UV_GUIDE } from '../../constants/info';
import { COLORS } from '../../constants/theme';
import { aqiLevel } from '../../utils/format';

const SunMoonContent = ({ info }) => (
  <View style={styles.sunGrid}>
    <View style={styles.sunCard}>
      <Ionicons name="sunny" size={30} color={COLORS.sun} />
      <Text style={styles.sunCardTitle}>Durée du jour</Text>
      <Text style={[styles.sunCardValue, { color: COLORS.sun }]}>{info.daylight || '-'}</Text>
    </View>
    <View style={styles.sunCard}>
      <Ionicons name="moon" size={30} color="#E5E7EB" />
      <Text style={styles.sunCardTitle}>Phase lunaire</Text>
      <Text style={styles.sunCardValue}>{info.moon}</Text>
    </View>
  </View>
);

export default function WeatherPage({ location, onRefresh, onDelete }) {
  const router = useRouter();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [infoKey, setInfoKey] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.text} colors={[COLORS.accent]} />
  );

  const data = location.data;

  // Pas encore de données : chargement, ou erreur avec "Réessayer" et "Supprimer"
  if (!data) {
    return (
      <ScrollView contentContainerStyle={styles.centered} refreshControl={refreshControl}>
        {location.loading ? (
          <>
            <ActivityIndicator size="large" color={COLORS.text} />
            <Text style={styles.message}>Chargement de {location.name}…</Text>
          </>
        ) : (
          <>
            <View style={styles.errorIcon}>
              <Ionicons name="cloud-offline-outline" size={40} color={COLORS.text} />
            </View>
            <Text style={styles.message}>{location.error ?? 'Météo indisponible.'}</Text>
            <Button label="Réessayer" variant="primary" onPress={handleRefresh} />
          </>
        )}
        {onDelete && (
          <View style={styles.deleteWrap}>
            <Button label="Supprimer cette ville" variant="danger" onPress={onDelete} />
          </View>
        )}
      </ScrollView>
    );
  }

  const today = data.daily[0];
  const info = infoKey === 'sun' ? sunInfo(today) : null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
      {location.error ? (
        <View style={styles.banner}>
          <Ionicons name="alert-circle-outline" size={18} color="#FCD34D" />
          <Text style={styles.bannerText}>{location.error} Données du dernier chargement affichées.</Text>
          <Button label="Réessayer" onPress={handleRefresh} />
        </View>
      ) : null}

      <FadeInView delay={0}>
        <CurrentConditions current={data.current} today={today} />
      </FadeInView>

      {settings.showNowcast && (
        <FadeInView delay={80}>
          <NowcastCard minutely={data.minutely} />
        </FadeInView>
      )}

      <FadeInView delay={160}>
        <DetailTiles current={data.current} today={today} onInfo={setInfoKey} />
      </FadeInView>

      <FadeInView delay={240}>
        <HourlyForecast hours={data.hourly} />
      </FadeInView>

      <FadeInView delay={320}>
        <DailyForecast days={data.daily} onSelectDay={setSelectedDay} />
      </FadeInView>

      {settings.showRadar && location.latitude != null && (
        <FadeInView delay={400}>
          <RadarPreview
            latitude={location.latitude}
            longitude={location.longitude}
            layer={settings.radarLayer}
            onOpenFullscreen={() =>
              router.push({
                pathname: '/rain-radar',
                params: { lat: location.latitude, lon: location.longitude, city: location.name },
              })
            }
          />
        </FadeInView>
      )}

      {infoKey === 'humidity' && <InfoModal {...HUMIDITY_GUIDE} onClose={() => setInfoKey(null)} />}
      {infoKey === 'uv' && <InfoModal {...UV_GUIDE} onClose={() => setInfoKey(null)} />}
      {infoKey === 'aqi' && (
        <InfoModal {...AQI_GUIDE} onClose={() => setInfoKey(null)}>
          <Text style={styles.aqiNow}>
            Actuellement : {data.current.aqi ?? '-'} ({aqiLevel(data.current.aqi)?.label ?? 'indisponible'})
            {data.current.pm25 != null ? ` · PM2,5 : ${Math.round(data.current.pm25)} µg/m³` : ''}
          </Text>
        </InfoModal>
      )}
      {infoKey === 'sun' && (
        <InfoModal title="Soleil & Lune" onClose={() => setInfoKey(null)}>
          <SunMoonContent info={info} />
        </InfoModal>
      )}

      {selectedDay && <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  centered: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  errorIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  message: { color: COLORS.text, fontSize: 16, textAlign: 'center', lineHeight: 22 },
  deleteWrap: { marginTop: 24 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  bannerText: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
  aqiNow: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 16 },
  sunGrid: { flexDirection: 'row', gap: 10 },
  sunCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sunCardTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sunCardValue: { color: COLORS.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
