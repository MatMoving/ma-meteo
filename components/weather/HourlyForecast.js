// Prévisions des 24 prochaines heures : température, et pluie ou vent selon le mode choisi.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import TemperatureCurve from './TemperatureCurve';
import { COLORS } from '../../constants/theme';

const COLUMN_WIDTH = 60;
const CURVE_TOP = 55;
const CURVE_HEIGHT = 40;

const RainBar = ({ prob }) => {
  const color = prob >= 50 ? '#3B82F6' : prob >= 20 ? '#60A5FA' : 'rgba(147, 197, 253, 0.5)';
  return (
    <View style={styles.modeBox}>
      {prob > 0 ? <Text style={styles.rainProb}>{prob}%</Text> : null}
      <View
        style={{
          width: 20,
          borderRadius: 10,
          height: prob > 0 ? Math.max(5, (prob / 100) * 55) : 0,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

const WindValue = ({ hour }) => (
  <View style={[styles.modeBox, { height: 60 }]}>
    <Text style={styles.windSpeed}>{hour.windSpeed}</Text>
    <Text style={styles.unit}>km/h</Text>
    {/* La flèche indique vers où le vent souffle */}
    <Ionicons
      name="arrow-up"
      size={16}
      color={COLORS.textSecondary}
      style={{ transform: [{ rotate: `${(hour.windDirection + 180) % 360}deg` }], marginTop: 4 }}
    />
  </View>
);

export default function HourlyForecast({ hours }) {
  const [mode, setMode] = useState('rain');
  if (!hours.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Prévisions sur 24h</Text>
        <View style={styles.toggle}>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'rain' && styles.toggleActive]} onPress={() => setMode('rain')}>
            <Ionicons name="water" size={16} color={mode === 'rain' ? COLORS.rain : COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'wind' && styles.toggleActive]} onPress={() => setMode('wind')}>
            <Ionicons name="leaf" size={16} color={mode === 'wind' ? '#10B981' : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <GlassCard style={{ paddingVertical: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          <View style={styles.chart}>
            <TemperatureCurve
              hours={hours}
              columnWidth={COLUMN_WIDTH}
              top={CURVE_TOP}
              height={CURVE_HEIGHT}
              gradientId="hourlyTempGradient"
            />
            {hours.map((hour, i) => (
              <View key={i} style={styles.column}>
                <Text style={styles.temp}>{hour.temp}°</Text>
                <Ionicons name={hour.iconInfo.name} size={20} color={hour.iconInfo.color} style={{ marginBottom: 6 }} />
                <View style={{ height: 45 }} />
                <View style={{ flex: 1 }} />
                {mode === 'rain' ? <RainBar prob={hour.rainProb} /> : <WindValue hour={hour} />}
                <Text style={styles.time}>{hour.time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  toggleActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 220 },
  column: { alignItems: 'center', width: 50, height: '100%', marginRight: COLUMN_WIDTH - 50 },
  temp: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  modeBox: { alignItems: 'center', height: 80, justifyContent: 'flex-end', marginBottom: 10 },
  rainProb: { color: COLORS.textMuted, fontSize: 10, marginBottom: 4, fontWeight: '500' },
  windSpeed: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  unit: { color: COLORS.textMuted, fontSize: 10 },
  time: { color: COLORS.textSecondary, fontSize: 12 },
});
