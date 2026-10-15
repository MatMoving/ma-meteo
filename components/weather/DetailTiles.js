// Tuiles cliquables : humidité, UV, qualité de l'air, soleil et lune.
// Un tap ouvre le guide correspondant.

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { aqiLevel, daylightLabel, moonPhaseName } from '../../utils/format';

const Tile = ({ icon, iconColor, value, label, onPress, style, children }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.tile, style]}>
    <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.5)" style={styles.info} />
    {icon ? <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} /> : null}
    {children ?? <Text style={styles.value}>{value}</Text>}
    <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
  </TouchableOpacity>
);

export default function DetailTiles({ current, today, onInfo }) {
  const aqi = aqiLevel(current.aqi);

  return (
    <>
      <View style={styles.row}>
        <Tile
          icon="water-outline"
          iconColor={COLORS.humidity}
          value={`${current.humidity}%`}
          label="Humidité"
          onPress={() => onInfo('humidity')}
        />
        <Tile
          icon="sunny-outline"
          iconColor={COLORS.uv}
          value={current.uvIndex ?? '-'}
          label="Indice UV"
          onPress={() => onInfo('uv')}
        />
      </View>

      <View style={[styles.row, styles.rowLast]}>
        <Tile
          icon="leaf-outline"
          iconColor={aqi?.color ?? COLORS.textMuted}
          value={current.aqi ?? '-'}
          label={aqi ? `Air : ${aqi.label}` : "Qualité de l'air"}
          onPress={() => onInfo('aqi')}
          style={{ flex: 1 }}
        />
        <Tile
          label="Soleil & Lune"
          onPress={() => onInfo('sun')}
          style={{ flex: 1.5 }}
        >
          <View style={styles.sunRow}>
            <View style={styles.sunTime}>
              <Ionicons name="sunny" size={18} color={COLORS.sun} />
              <Text style={styles.sunText} numberOfLines={1}>{today?.sunrise ?? '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.sunTime}>
              <Ionicons name="moon" size={18} color="#CBD5E1" />
              <Text style={styles.sunText} numberOfLines={1}>{today?.sunset ?? '-'}</Text>
            </View>
          </View>
        </Tile>
      </View>
    </>
  );
}

export const sunInfo = (today) => ({
  daylight: daylightLabel(today?.sunrise, today?.sunset),
  moon: moonPhaseName(today?.moonPhase),
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  rowLast: { marginBottom: 40 },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  info: { position: 'absolute', top: 8, right: 8 },
  icon: { marginBottom: 8 },
  value: { color: COLORS.text, fontSize: 22, fontWeight: '600', marginBottom: 4 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  sunRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginBottom: 6 },
  sunTime: { flex: 1, alignItems: 'center', gap: 4 },
  sunText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
});
