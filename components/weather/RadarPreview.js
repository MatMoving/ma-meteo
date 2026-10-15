// Aperçu du radar de pluie (Windy) avec bouton plein écran.

import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import SectionTitle from '../ui/SectionTitle';
import { buildRadarUrl } from '../../utils/radar';
import { COLORS } from '../../constants/theme';

export default function RadarPreview({ latitude, longitude, layer, onOpenFullscreen }) {
  const source = useMemo(
    () => ({ uri: buildRadarUrl({ latitude, longitude, zoom: 9, overlay: layer }) }),
    [latitude, longitude, layer],
  );

  return (
    <View style={styles.section}>
      <SectionTitle
        icon="map-outline"
        right={
          <TouchableOpacity style={styles.fullscreenBtn} onPress={onOpenFullscreen} activeOpacity={0.7}>
            <Ionicons name="expand" size={14} color={COLORS.accent} />
            <Text style={styles.fullscreenText}>Plein écran</Text>
          </TouchableOpacity>
        }
      >
        Radar de pluie
      </SectionTitle>

      <View style={styles.box}>
        <WebView
          source={source}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          mixedContentMode="always"
          originWhitelist={['https://*', 'http://*']}
          androidLayerType="hardware"
        />
      </View>
      <Text style={styles.caption}>Pincez pour zoomer · Plein écran pour plus de détails</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  fullscreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(96,165,250,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.4)',
  },
  fullscreenText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  box: {
    height: 320,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: '#0f172a',
  },
  caption: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
