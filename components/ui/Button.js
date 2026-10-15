// Bouton simple utilisé pour "Réessayer" et "Supprimer".

import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';

const VARIANTS = {
  primary: { backgroundColor: COLORS.rain, borderColor: 'transparent' },
  danger: { backgroundColor: 'rgba(239, 68, 68, 0.18)', borderColor: 'rgba(248, 113, 113, 0.5)' },
  ghost: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: COLORS.glassBorder },
};

const TEXT_COLORS = { primary: COLORS.text, danger: '#FCA5A5', ghost: COLORS.text };

export default function Button({ label, onPress, variant = 'ghost' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.base, VARIANTS[variant]]}
    >
      <Text style={[styles.label, { color: TEXT_COLORS[variant] }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 180,
  },
  label: { fontSize: 15, fontWeight: '600' },
});
