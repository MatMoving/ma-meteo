// Fenêtre d'information (guides UV, humidité, qualité de l'air, soleil & lune).
// Fond opaque : le texte reste lisible quel que soit le fond de la page.

import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function InfoModal({ title, intro, levels = [], children, onClose }) {
  return (
    <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {intro ? <Text style={styles.intro}>{intro}</Text> : null}

            {levels.map((level) => (
              <View key={level.range} style={styles.level}>
                <View style={[styles.dot, { backgroundColor: level.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.levelRange}>{level.range}</Text>
                  <Text style={styles.levelText}>{level.text}</Text>
                </View>
              </View>
            ))}

            {children}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Compris</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: COLORS.sheetBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', flex: 1, marginRight: 12 },
  intro: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  level: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
  levelRange: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  levelText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.rain,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});
