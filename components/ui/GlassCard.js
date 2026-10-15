// Carte translucide. Le fond reste assez sombre pour garder le texte lisible.

import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
