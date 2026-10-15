// Briques de l'écran Paramètres : sections, sélecteurs, interrupteurs et lignes d'action.

import { Children } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import SectionTitle from '../ui/SectionTitle';
import { COLORS } from '../../constants/theme';

export function Section({ icon, title, children }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      <GlassCard style={styles.card}>
        {items.map((item, index) => (
          <View key={index}>
            {item}
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </GlassCard>
    </View>
  );
}

// Choix parmi plusieurs options, affiché en segments
export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function SettingRow({ label, hint, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.control}>{children}</View>
    </View>
  );
}

export function SwitchRow({ label, hint, value, onChange }) {
  return (
    <View style={[styles.row, styles.switchRow]}>
      <View style={styles.switchText}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.18)', true: COLORS.rain }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(255,255,255,0.18)"
      />
    </View>
  );
}

export function ActionRow({ icon, label, hint, onPress, danger = false }) {
  const color = danger ? '#FCA5A5' : COLORS.text;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.row, styles.actionRow]}>
      {icon ? <Ionicons name={icon} size={20} color={color} /> : null}
      <View style={styles.switchText}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

export function InfoRow({ label, value }) {
  return (
    <View style={[styles.row, styles.actionRow]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

// Petites pastilles cliquables (ciels de démonstration)
export function Chips({ options, value, onChange }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 26 },
  card: { paddingHorizontal: 16, paddingVertical: 6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  row: { paddingVertical: 14, gap: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1, gap: 3 },
  label: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  hint: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  value: { color: COLORS.textSecondary, fontSize: 15, marginLeft: 'auto' },
  control: { marginTop: 10 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    padding: 4,
  },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  segmentActive: { backgroundColor: COLORS.rain },
  segmentText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  segmentTextActive: { color: COLORS.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: COLORS.rain, borderColor: COLORS.rain },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: COLORS.text },
});
