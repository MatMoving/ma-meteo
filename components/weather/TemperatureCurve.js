// Courbe de température au-dessus d'une liste horaire. La couleur suit la température.

import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { temperatureStops } from '../../utils/temperatureColor';

export default function TemperatureCurve({ hours, columnWidth, top, height, gradientId }) {
  if (hours.length < 2) return null;

  const temps = hours.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = Math.max(1, maxTemp - minTemp);

  const points = hours.map((h, i) => ({
    x: i * columnWidth + columnWidth / 2,
    y: (1 - (h.temp - minTemp) / range) * height,
  }));
  const path = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <Svg height={height + 10} width={hours.length * columnWidth} style={{ position: 'absolute', top, left: 0 }}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {temperatureStops(minTemp, maxTemp).map((stop, i) => (
            <Stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </LinearGradient>
      </Defs>
      <Path d={path} stroke={`url(#${gradientId})`} strokeWidth="3" fill="none" />
      {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" />)}
    </Svg>
  );
}
