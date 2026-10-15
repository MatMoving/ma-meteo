// Prévisions sur 7 jours. Chaque ligne montre la barre de 24 h (pluie, soleil, nuit...).

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../ui/GlassCard';
import { COLORS } from '../../constants/theme';

const LEGEND = [
  { color: '#3B82F6', label: 'Pluie' },
  { color: '#FBBF24', label: 'Soleil' },
  { color: '#9CA3AF', label: 'Nuages' },
  { color: '#374151', label: 'Nuit claire' },
  { color: '#E2E8F0', label: 'Neige' },
  { color: '#6D28D9', label: 'Orage' },
];

const DayTimeline = ({ day }) => {
  const n = day.segments.length;
  return (
    <View style={styles.timeline}>
      {n > 0 && (
        <LinearGradient
          colors={day.segments.flatMap((c) => [c, c])}
          locations={day.segments.flatMap((_, i) => [i / n, (i + 1) / n])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {day.sunrisePercent != null && (
        <View style={[styles.marker, { left: `${day.sunrisePercent}%` }]}>
          <Ionicons name="sunny" size={14} color="#FBBF24" style={styles.markerIcon} />
        </View>
      )}
      {day.sunsetPercent != null && (
        <View style={[styles.marker, { left: `${day.sunsetPercent}%` }]}>
          <Ionicons name="moon" size={12} color="#FFFFFF" style={[styles.markerIcon, { top: -15 }]} />
        </View>
      )}
    </View>
  );
};

export default function DailyForecast({ days, onSelectDay }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Prévisions sur 7 jours</Text>

      <GlassCard style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.id}
            activeOpacity={0.7}
            onPress={() => onSelectDay(day)}
            style={[styles.row, index === days.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={{ width: 104 }}>
              <Text style={styles.dayName}>{day.day}</Text>
              <Text style={styles.subText} numberOfLines={1}>
                {day.precipitationSum > 0 ? `Pluie ${String(day.precipitationSum).replace('.', ',')} mm` : 'Pas de pluie'}
              </Text>
            </View>

            <View style={styles.iconBox}>
              <Ionicons name={day.iconInfo.name} size={24} color={day.iconInfo.color} />
            </View>
            <Text style={styles.rainProb}>{day.rainProb > 0 ? `${day.rainProb}%` : ''}</Text>

            <View style={styles.temps}>
              <Text style={styles.min}>{day.min}°</Text>
              <DayTimeline day={day} />
              <Text style={styles.max}>{day.max}°</Text>
            </View>

            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        ))}
      </GlassCard>

      <View style={styles.legend}>
        {LEGEND.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 40 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  dayName: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
  subText: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  iconBox: { width: 32, alignItems: 'center' },
  rainProb: { color: COLORS.accent, fontSize: 12, fontWeight: '600', width: 40, textAlign: 'center' },
  temps: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 8 },
  min: { color: COLORS.textMuted, fontSize: 16, width: 36, textAlign: 'right' },
  max: { color: COLORS.text, fontSize: 16, fontWeight: '500', width: 36 },
  timeline: {
    flex: 1,
    height: 8,
    marginHorizontal: 10,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  marker: { position: 'absolute', alignItems: 'center' },
  markerIcon: { position: 'absolute', top: -16, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, paddingHorizontal: 8, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
});
