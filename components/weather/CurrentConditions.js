// Bloc principal : température actuelle, ressenti, description et vent.

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { COLORS } from '../../constants/theme';

const Chip = ({ icon, text }) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={14} color={COLORS.textSecondary} />
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

export default function CurrentConditions({ current }) {
  const rain = current.precipitation.toFixed(1).replace('.', ',');

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.temp}>{current.temp}°</Text>
      <Text style={styles.feels}>Ressenti {current.apparentTemp}°</Text>
      <Text style={styles.summary}>{current.summary}</Text>

      <View style={styles.chips}>
        <Chip icon="leaf-outline" text={`Vent ${current.windSpeed} km/h`} />
        <Chip icon="flash-outline" text={`Rafales ${current.windGusts} km/h`} />
        <Chip icon="water-outline" text={`${rain} mm/h`} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', marginTop: 10, marginBottom: 24, paddingVertical: 24 },
  temp: {
    color: COLORS.text,
    fontSize: 110,
    fontWeight: '300',
    letterSpacing: -4,
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowRadius: 12,
  },
  feels: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '500', marginTop: -5 },
  summary: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
});
