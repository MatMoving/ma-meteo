// Fenêtre de recherche de ville. La recherche se lance pendant la frappe (avec délai).

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCitySearch from '../hooks/useCitySearch';
import { COLORS } from '../constants/theme';

const emptyMessage = (query, status) => {
  if (query.trim().length < 2) return 'Tapez au moins 2 lettres.';
  if (status === 'error') return 'Recherche impossible. Vérifiez votre connexion.';
  if (status === 'done') return 'Aucune ville trouvée. Vérifiez l’orthographe ou essayez une commune plus grande à proximité.';
  return null;
};

export default function CitySearchModal({ onClose, onSelect }) {
  const { query, setQuery, results, status } = useCitySearch();
  const message = emptyMessage(query, status);

  return (
    <Modal transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Ajouter une ville</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nom de la ville…"
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
            />
            {status === 'loading' ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={results}
            keyExtractor={(city) => city.id}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => onSelect(item)} activeOpacity={0.7}>
                <Text style={styles.name}>{item.name}</Text>
                {item.admin ? <Text style={styles.admin}>{item.admin}</Text> : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              message && status !== 'loading' ? <Text style={styles.message}>{message}</Text> : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '80%',
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.sheetBorder,
    padding: 20,
    paddingBottom: 32,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 16, padding: 0 },
  list: { marginTop: 8, flexGrow: 0 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  name: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  admin: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  message: { color: COLORS.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 20 },
});
