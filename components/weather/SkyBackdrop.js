// Dégradé de fond qui se fond doucement vers la nouvelle couleur quand le temps change.

import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SkyBackdrop({ colors, animated = true }) {
  const key = colors.join(',');
  const [layers, setLayers] = useState({ from: colors, to: colors });
  const fade = useRef(new Animated.Value(1)).current;
  const lastKey = useRef(key);

  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    setLayers((prev) => ({ from: prev.to, to: colors }));
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: animated ? 900 : 0,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, animated]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={layers.from} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient colors={layers.to} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
