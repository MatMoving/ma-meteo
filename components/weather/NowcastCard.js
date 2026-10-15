// Pluie dans l'heure qui vient (données par tranches de 15 minutes).

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { COLORS } from '../../constants/theme';

const SLOT_MINUTES = 15;

const barColor = (mm) => {
  if (mm > 2.5) return COLORS.rainStrong;
  if (mm > 0.5) return COLORS.rain;
  if (mm > 0) return COLORS.rainLight;
  return 'rgba(255, 255, 255, 0.18)';
};

export default function NowcastCard({ minutely }) {
  const nextHour = minutely.slice(0, 4);
  if (nextHour.length < 4) return null;

  const firstRain = nextHour.findIndex((slot) => slot.precipitation > 0);
  const dry = firstRain === -1;
  const title = dry
    ? "Pas de pluie dans l'heure"
    : firstRain === 0
      ? 'Pluie en cours'
      : `Pluie dans ${firstRain * SLOT_MINUTES} min`;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: dry ? 'rgba(251, 191, 36, 0.18)' : 'rgba(96, 165, 250, 0.2)' }]}>
          <Ionicons name={dry ? 'sunny-outline' : 'water'} size={16} color={dry ? COLORS.sun : COLORS.accent} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.row}>
        {nextHour.map((slot, i) => (
          <View key={i} style={styles.cell}>
            <View style={[styles.bar, { backgroundColor: barColor(slot.precipitation) }]} />
            <Text style={styles.time}>{slot.time}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 20, paddingVertical: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center', gap: 6, marginHorizontal: 3 },
  bar: { width: '100%', height: 12, borderRadius: 6 },
  time: { color: COLORS.textSecondary, fontSize: 11 },
});
