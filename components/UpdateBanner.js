// Bandeau "Nouvelle version disponible" en haut de l'accueil.
// "Installer" télécharge l'APK depuis GitHub ; Android propose ensuite de l'installer
// par-dessus l'application actuelle (villes et réglages conservés).

import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FadeInView from './ui/FadeInView';
import { COLORS } from '../constants/theme';
import { checkForUpdate, dismissUpdate } from '../utils/updateCheck';

export default function UpdateBanner() {
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Après l'affichage de la météo : la vérification ne doit rien ralentir
    const timer = setTimeout(() => {
      checkForUpdate()
        .then((found) => !cancelled && setUpdate(found))
        .catch(() => {});
    }, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!update) return null;

  const install = () => Linking.openURL(update.apkUrl ?? update.pageUrl).catch(() => {});
  const later = () => {
    dismissUpdate(update.version);
    setUpdate(null);
  };

  return (
    <FadeInView delay={0}>
      <View style={styles.banner}>
        <View style={styles.icon}>
          <Ionicons name="arrow-down-circle" size={22} color={COLORS.text} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Version {update.version} disponible</Text>
          <Text style={styles.hint}>Téléchargez-la puis installez-la : vos villes sont conservées.</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={install} style={styles.primary} activeOpacity={0.8}>
            <Text style={styles.primaryText}>Installer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={later} hitSlop={8}>
            <Text style={styles.later}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.5)',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.rain,
  },
  text: { flex: 1, gap: 2 },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  hint: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  actions: { alignItems: 'center', gap: 6 },
  primary: { backgroundColor: COLORS.rain, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 12 },
  primaryText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  later: { color: COLORS.textMuted, fontSize: 12 },
});
