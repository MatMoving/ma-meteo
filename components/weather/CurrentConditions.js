// Bloc principal : icône du temps, température, ressenti, minimum et maximum du jour, vent et pluie.

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { useUnits } from '../../contexts/SettingsContext';
import { formatMm } from '../../utils/units';
import { iconForCode } from '../../utils/weatherCodes';
import { COLORS } from '../../constants/theme';

const Chip = ({ icon, text }) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={14} color={COLORS.textSecondary} />
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

const Extreme = ({ icon, color, value }) => (
  <View style={styles.extreme}>
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[styles.extremeText, { color }]}>{value}</Text>
  </View>
);

export default function CurrentConditions({ current, today }) {
  const { temp, wind, windUnit } = useUnits();
  const icon = iconForCode(current.weatherCode, current.isDay);

  return (
    <GlassCard style={styles.card}>
      <Ionicons name={icon.name} size={58} color={icon.color} style={styles.icon} />
      <Text style={styles.temp}>{temp(current.temp)}</Text>
      <Text style={styles.feels}>Ressenti {temp(current.apparentTemp)}</Text>
      <Text style={styles.summary}>{current.summary}</Text>

      {today ? (
        <View style={styles.extremes}>
          <Extreme icon="arrow-up" color={COLORS.sun} value={temp(today.max)} />
          <View style={styles.separator} />
          <Extreme icon="arrow-down" color={COLORS.rainLight} value={temp(today.min)} />
        </View>
      ) : null}

      <View style={styles.chips}>
        <Chip icon="leaf-outline" text={`${wind(current.windSpeed)} ${windUnit}`} />
        <Chip icon="flash-outline" text={`Rafales ${wind(current.windGusts)}`} />
        <Chip icon="water-outline" text={formatMm(current.precipitation)} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', marginTop: 8, marginBottom: 20, paddingVertical: 22 },
  icon: { marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 8 },
  temp: {
    color: COLORS.text,
    fontSize: 104,
    fontWeight: '200',
    letterSpacing: -4,
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowRadius: 12,
  },
  feels: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500', marginTop: -4 },
  summary: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  extremes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  extreme: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  extremeText: { fontSize: 15, fontWeight: '700' },
  separator: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
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
