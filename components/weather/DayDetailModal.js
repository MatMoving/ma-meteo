// Détail d'une journée : stats et courbe heure par heure, dans une feuille du bas.

import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TemperatureCurve from './TemperatureCurve';
import { COLORS } from '../../constants/theme';

const COLUMN_WIDTH = 60;
const CURVE_TOP = 48;
const CURVE_HEIGHT = 40;

const Stat = ({ icon, color, value, label }) => (
  <View style={styles.stat}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const HourColumn = ({ hour }) => (
  <View style={styles.column}>
    <Text style={styles.temp}>{hour.temp}°</Text>
    <Ionicons name={hour.iconInfo.name} size={18} color={hour.iconInfo.color} style={{ marginBottom: 4 }} />
    <View style={{ flex: 1 }} />
    <View style={styles.rainBox}>
      {hour.rainProb > 0 ? <Text style={styles.rainProb}>{hour.rainProb}%</Text> : null}
      <View
        style={{
          width: 18,
          borderRadius: 9,
          height: hour.rainProb > 0 ? Math.max(4, (hour.rainProb / 100) * 52) : 0,
          backgroundColor: hour.rainProb >= 60 ? COLORS.rainStrong : hour.rainProb >= 30 ? '#60A5FA' : 'rgba(147,197,253,0.5)',
        }}
      />
    </View>
    <Text style={styles.time}>{hour.time}</Text>
  </View>
);

export default function DayDetailModal({ day, onClose }) {
  const hours = day.hours;
  const cumul = String(day.precipitationSum).replace('.', ',');

  return (
    <Modal transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Ionicons name={day.iconInfo.name} size={28} color={day.iconInfo.color} />
              <View>
                <Text style={styles.title}>{day.day}</Text>
                <Text style={styles.subtitle}>
                  {day.min}° / {day.max}° · Pluie {day.rainProb}%
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <Stat icon="sunny" color={COLORS.sun} value={day.sunrise || '-'} label="Lever" />
            <Stat icon="moon" color="#CBD5E1" value={day.sunset || '-'} label="Coucher" />
            <Stat icon="shield-checkmark" color={COLORS.uv} value={day.uvIndex ?? '-'} label="UV max" />
            <Stat icon="water" color={COLORS.accent} value={`${cumul} mm`} label="Cumul pluie" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {hours.length > 0 ? (
              <View style={styles.chartCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
                  <View style={styles.chart}>
                    <TemperatureCurve
                      hours={hours}
                      columnWidth={COLUMN_WIDTH}
                      top={CURVE_TOP}
                      height={CURVE_HEIGHT}
                      gradientId="dayTempGradient"
                    />
                    {hours.map((hour, i) => <HourColumn key={i} hour={hour} />)}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <Text style={styles.empty}>Données horaires non disponibles</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  sheet: {
    height: '85%',
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.sheetBorder,
    paddingTop: 8,
    paddingBottom: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statValue: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 220, paddingHorizontal: 16 },
  column: { width: 50, height: '100%', alignItems: 'center', marginRight: COLUMN_WIDTH - 50 },
  temp: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  rainBox: { alignItems: 'center', height: 80, justifyContent: 'flex-end', marginBottom: 10 },
  rainProb: { color: COLORS.textMuted, fontSize: 9, marginBottom: 3 },
  time: { color: COLORS.textSecondary, fontSize: 11 },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: 20 },
});
