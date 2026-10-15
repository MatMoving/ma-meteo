// Tuiles cliquables : humidité, UV, qualité de l'air, soleil et lune. Un tap ouvre le guide.

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { aqiLevel, daylightLabel, moonPhaseName } from '../../utils/format';

const Tile = ({ icon, color, value, label, onPress, flex = 1, children }) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[styles.tile, { flex }]}>
    <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.45)" style={styles.info} />
    {icon ? (
      <View style={[styles.iconCircle, { backgroundColor: `${color}26` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
    ) : null}
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
          color={COLORS.humidity}
          value={`${current.humidity}%`}
          label="Humidité"
          onPress={() => onInfo('humidity')}
        />
        <Tile
          icon="sunny-outline"
          color={COLORS.uv}
          value={current.uvIndex ?? '-'}
          label="Indice UV"
          onPress={() => onInfo('uv')}
        />
      </View>

      <View style={[styles.row, styles.rowLast]}>
        <Tile
          icon="leaf-outline"
          color={aqi?.color ?? COLORS.textMuted}
          value={current.aqi ?? '-'}
          label={aqi ? `Air : ${aqi.label}` : "Qualité de l'air"}
          onPress={() => onInfo('aqi')}
          flex={1}
        />
        <Tile label="Soleil & Lune" onPress={() => onInfo('sun')} flex={1.5}>
          <View style={styles.sunRow}>
            <View style={styles.sunTime}>
              <Ionicons name="sunny" size={18} color={COLORS.sun} />
              <Text style={styles.sunText} numberOfLines={1}>{today?.sunrise || '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.sunTime}>
              <Ionicons name="moon" size={17} color="#CBD5E1" />
              <Text style={styles.sunText} numberOfLines={1}>{today?.sunset || '-'}</Text>
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
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rowLast: { marginBottom: 36 },
  tile: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  info: { position: 'absolute', top: 10, right: 10 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginBottom: 2 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500', textAlign: 'center' },
  sunRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: 2, marginBottom: 4 },
  sunTime: { flex: 1, alignItems: 'center', gap: 4 },
  sunText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
});
