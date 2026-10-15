// Radar météo plein écran (Windy) avec choix de la couche : pluie, vent, nuages, température.

import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { buildRadarUrl } from '../utils/radar';
import { COLORS } from '../constants/theme';

const LAYERS = [
  { id: 'rain', label: 'Pluie', icon: 'rainy', color: '#3B82F6', source: 'précipitations ECMWF' },
  { id: 'wind', label: 'Vent', icon: 'leaf', color: '#10B981', source: 'vent en surface' },
  { id: 'clouds', label: 'Nuages', icon: 'cloud', color: '#9CA3AF', source: 'couverture nuageuse' },
  { id: 'temp', label: 'Temp.', icon: 'thermometer', color: '#F97316', source: 'température' },
];

export default function RainRadarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const latitude = parseFloat(params.lat) || 48.856;
  const longitude = parseFloat(params.lon) || 2.352;
  const cityName = params.city || 'Radar météo';

  const [layer, setLayer] = useState('rain');
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef(null);

  const uri = buildRadarUrl({ latitude, longitude, zoom: 8, overlay: layer });

  // Changement de couche sans recharger la page
  const switchLayer = (layerId) => {
    setLayer(layerId);
    webviewRef.current?.injectJavaScript(`
      try { W.store.set('overlay', '${layerId}'); } catch (e) { window.location.href = '${buildRadarUrl({ latitude, longitude, zoom: 8, overlay: layerId })}'; }
      true;
    `);
  };

  const current = LAYERS.find((l) => l.id === layer);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Ionicons name="location-sharp" size={14} color={COLORS.accent} />
          <Text style={styles.title} numberOfLines={1}>{cityName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.layerBar}>
        {LAYERS.map((item) => {
          const active = layer === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => switchLayer(item.id)}
              activeOpacity={0.7}
              style={[styles.layerBtn, active && { backgroundColor: `${item.color}33`, borderColor: item.color }]}
            >
              <Ionicons name={item.icon} size={16} color={active ? item.color : COLORS.textMuted} />
              <Text style={[styles.layerLabel, active && { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.mapBox}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Chargement du radar…</Text>
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ uri }}
          style={{ flex: 1, backgroundColor: '#0f172a' }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          bounces={false}
          scrollEnabled={false}
          mixedContentMode="always"
          originWhitelist={['https://*', 'http://*']}
          androidLayerType="hardware"
        />
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.footerText}>Pincez pour zoomer · Données : {current.source}</Text>
      </View>
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
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  layerBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  layerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  layerLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  mapBox: { flex: 1, backgroundColor: '#0f172a' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    zIndex: 10,
  },
  loadingText: { color: COLORS.textMuted, marginTop: 12, fontSize: 14, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerText: { color: COLORS.textMuted, fontSize: 12 },
});
