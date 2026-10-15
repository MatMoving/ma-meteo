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
    ? "Pas de pluie prévue dans l'heure"
    : firstRain === 0
      ? 'Pluie en cours'
      : `Pluie dans ${firstRain * SLOT_MINUTES} min`;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={dry ? 'sunny-outline' : 'water'}
          size={16}
          color={dry ? COLORS.sun : COLORS.accent}
        />
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
  card: { marginBottom: 24, paddingVertical: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center', gap: 6, marginHorizontal: 2 },
  bar: { width: '100%', height: 12, borderRadius: 4 },
  time: { color: COLORS.textSecondary, fontSize: 11 },
});
