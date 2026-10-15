// Fond animé selon le temps : soleil, nuit étoilée, nuages, pluie, orage, neige, brouillard.
// Trois niveaux (réglage) : complètes, réduites (moins de particules, plus lentes) ou aucune.
// Les animations tournent sur le moteur natif et s'arrêtent proprement au démontage.

import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

// Boucle infinie 0 → 1. Le délai ne sert qu'une fois, au départ, pour décaler les éléments.
const useLoop = (duration, delay = 0) => {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.timing(value, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [value, duration, delay]);
  return value;
};

// Générateur pseudo-aléatoire à graine : la disposition reste identique à chaque rendu
const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const scaled = (count, reduced) => Math.round(count * (reduced ? 0.4 : 1));

// Une goutte qui tombe en boucle
const Drop = ({ left, length, width, duration, delay, color, height }) => {
  const progress = useLoop(duration, delay);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-length, height] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top: 0,
        width,
        height: length,
        borderRadius: width / 2,
        backgroundColor: color,
        transform: [{ translateY }],
      }}
    />
  );
};

// Pluie inclinée ; l'orage est plus dense et plus rapide
const RainLayer = ({ count, heavy = false }) => {
  const { width, height } = useWindowDimensions();
  const drops = useMemo(() => {
    const rand = seeded(heavy ? 7 : 3);
    return Array.from({ length: count }, () => ({
      left: rand() * width * 1.4,
      length: heavy ? 26 + rand() * 20 : 14 + rand() * 12,
      duration: heavy ? 450 + rand() * 250 : 850 + rand() * 500,
      delay: rand() * 2000,
    }));
  }, [count, heavy, width]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -width * 0.2,
        width: width * 1.4,
        transform: [{ rotate: heavy ? '14deg' : '8deg' }],
      }}
    >
      {drops.map((d, i) => (
        <Drop
          key={i}
          left={d.left}
          length={d.length}
          width={1.6}
          duration={d.duration}
          delay={d.delay}
          color={heavy ? 'rgba(191, 219, 254, 0.55)' : 'rgba(186, 230, 253, 0.42)'}
          height={height}
        />
      ))}
    </View>
  );
};

// Flocon qui tombe en oscillant doucement de gauche à droite
const Flake = ({ left, size, duration, delay, height }) => {
  const fall = useLoop(duration, delay);
  const sway = useLoop(duration * 0.4, delay);
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-size, height] });
  const translateX = sway.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-10, 10, -10] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
};

const SnowLayer = ({ count }) => {
  const { width, height } = useWindowDimensions();
  const flakes = useMemo(() => {
    const rand = seeded(19);
    return Array.from({ length: count }, () => ({
      left: rand() * width,
      size: 3 + rand() * 4,
      duration: 6000 + rand() * 4000,
      delay: rand() * 6000,
    }));
  }, [count, width]);

  return flakes.map((f, i) => <Flake key={i} {...f} height={height} />);
};

// Éclairs : flash blanc bref et zigzag jaune, à intervalles aléatoires
const Lightning = () => {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    let timer;
    const strike = () => {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0.2, duration: 90, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0.8, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]).start(() => {
        if (alive) timer = setTimeout(strike, 2500 + Math.random() * 5000);
      });
    };
    timer = setTimeout(strike, 1200);
    return () => {
      alive = false;
      clearTimeout(timer);
      flash.stopAnimation();
    };
  }, [flash]);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(224, 231, 255, 0.22)', opacity: flash }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.bolt, { opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) }]}
      >
        <Svg width={110} height={200} viewBox="0 0 110 200">
          <Path d="M62 0 L22 110 L52 110 L36 200 L92 84 L60 84 L78 0 Z" fill="#FDE68A" />
        </Svg>
      </Animated.View>
    </>
  );
};

// Étoile filante qui traverse le ciel de temps en temps
const ShootingStar = () => {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    let timer;
    const shoot = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        if (alive) timer = setTimeout(shoot, 8000 + Math.random() * 10000);
      });
    };
    timer = setTimeout(shoot, 2500 + Math.random() * 3000);
    return () => {
      alive = false;
      clearTimeout(timer);
      progress.stopAnimation();
    };
  }, [progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.7] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.18] });
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.shootingStar, { opacity, transform: [{ translateX }, { translateY }, { rotate: '-22deg' }] }]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fill}
      />
    </Animated.View>
  );
};

const Star = ({ left, top, size, duration, delay }) => {
  const progress = useLoop(duration, delay);
  const opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
};

const Stars = ({ count }) => {
  const stars = useMemo(() => {
    const rand = seeded(11);
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 55,
      size: 1.5 + rand() * 2.5,
      duration: 1800 + rand() * 2600,
      delay: rand() * 3000,
    }));
  }, [count]);
  return stars.map((s, i) => <Star key={i} {...s} />);
};

// Lune qui flotte doucement, avec un halo qui respire
const Moon = () => {
  const float = useLoop(7000);
  const breathe = useLoop(5000);
  const translateY = float.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, 0] });
  const haloScale = breathe.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });
  return (
    <Animated.View pointerEvents="none" style={[styles.moon, { transform: [{ translateY }] }]}>
      <Animated.View style={[styles.moonHalo, { transform: [{ scale: haloScale }] }]} />
      <Ionicons name="moon" size={92} color="rgba(241, 245, 249, 0.9)" />
    </Animated.View>
  );
};

const RAYS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

// Soleil : cœur lumineux, halo qui respire et rayons qui tournent lentement
const SunGlow = ({ strength, spinDuration }) => {
  const pulse = useLoop(5200);
  const spin = useLoop(spinDuration);
  const haloScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View pointerEvents="none" style={[styles.sun, { opacity: strength }]}>
      <Animated.View style={[styles.fill, { transform: [{ rotate }] }]}>
        {RAYS.map((deg) => (
          <View key={deg} style={[styles.fill, { transform: [{ rotate: `${deg}deg` }] }]}>
            <View style={styles.ray} />
          </View>
        ))}
      </Animated.View>
      <Animated.View style={[styles.sunHalo, { transform: [{ scale: haloScale }] }]} />
      <View style={styles.sunCore} />
    </View>
  );
};

const Cloud = ({ top, size, color, duration, delay = 0, reverse = false }) => {
  const { width } = useWindowDimensions();
  const progress = useLoop(duration, delay);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [width, -size] : [-size, width],
  });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top, transform: [{ translateX }] }}>
      <Ionicons name="cloud" size={size} color={color} />
    </Animated.View>
  );
};

const LIGHT_CLOUD = 'rgba(255, 255, 255, 0.16)';
const GREY_CLOUD = 'rgba(15, 23, 42, 0.28)';
const DARK_CLOUD = 'rgba(15, 23, 42, 0.4)';

const CLOUD_SETS = {
  partly: [
    { top: 90, size: 170, color: LIGHT_CLOUD, duration: 60000 },
    { top: 230, size: 120, color: LIGHT_CLOUD, duration: 80000, delay: 20000, reverse: true },
  ],
  overcast: [
    { top: 40, size: 180, color: GREY_CLOUD, duration: 50000 },
    { top: 160, size: 240, color: GREY_CLOUD, duration: 70000, reverse: true },
    { top: 380, size: 200, color: GREY_CLOUD, duration: 60000, delay: 15000 },
  ],
  rain: [
    { top: 40, size: 180, color: GREY_CLOUD, duration: 50000 },
    { top: 170, size: 230, color: GREY_CLOUD, duration: 70000, reverse: true },
  ],
  storm: [
    { top: 30, size: 200, color: DARK_CLOUD, duration: 40000 },
    { top: 150, size: 260, color: DARK_CLOUD, duration: 55000, reverse: true },
    { top: 330, size: 220, color: DARK_CLOUD, duration: 48000, delay: 10000 },
  ],
  snow: [
    { top: 60, size: 190, color: LIGHT_CLOUD, duration: 65000 },
    { top: 200, size: 150, color: LIGHT_CLOUD, duration: 80000, reverse: true },
  ],
};

const FogBand = ({ top, duration, delay }) => {
  const { width } = useWindowDimensions();
  const progress = useLoop(duration, delay);
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.5, width * 0.5] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: -width * 0.5,
        width: width * 2,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(226, 232, 240, 0.1)',
        transform: [{ translateX }],
      }}
    />
  );
};

const FOG_BANDS = [
  { top: 120, duration: 30000 },
  { top: 300, duration: 38000, delay: 9000 },
  { top: 480, duration: 46000, delay: 4000 },
];

export default function WeatherBackground({ kind, isDay, level = 'full' }) {
  if (level === 'off') return null;

  const reduced = level === 'reduced';
  const clearSky = kind === 'clear' || kind === 'partly';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {isDay && clearSky && (
        <SunGlow strength={kind === 'clear' ? 1 : 0.55} spinDuration={reduced ? 400000 : 140000} />
      )}
      {!isDay && clearSky && <Stars count={scaled(kind === 'clear' ? 26 : 10, reduced)} />}
      {!isDay && clearSky && <Moon />}
      {!isDay && clearSky && !reduced && <ShootingStar />}

      {(CLOUD_SETS[kind] ?? []).map((cloud, i) => <Cloud key={i} {...cloud} />)}
      {kind === 'fog' && FOG_BANDS.map((band, i) => <FogBand key={i} {...band} />)}

      {kind === 'rain' && <RainLayer count={scaled(44, reduced)} />}
      {kind === 'storm' && <RainLayer count={scaled(80, reduced)} heavy />}
      {kind === 'snow' && <SnowLayer count={scaled(40, reduced)} />}
      {kind === 'storm' && !reduced && <Lightning />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  sun: { position: 'absolute', top: -30, right: -110, width: 300, height: 300 },
  ray: {
    position: 'absolute',
    top: 10,
    left: 148,
    width: 4,
    height: 34,
    borderRadius: 2,
    backgroundColor: 'rgba(253, 230, 138, 0.55)',
  },
  sunHalo: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(253, 230, 138, 0.22)',
  },
  sunCore: {
    position: 'absolute',
    left: 105,
    top: 105,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FDE68A',
  },
  moon: { position: 'absolute', top: 48, right: 36 },
  moonHalo: {
    position: 'absolute',
    top: -44,
    left: -44,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(226, 232, 240, 0.12)',
  },
  shootingStar: { position: 'absolute', top: '12%', left: '92%', width: 120, height: 2 },
  bolt: { position: 'absolute', top: 40, left: '58%' },
});
