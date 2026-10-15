import { FlexWidget, TextWidget, registerWidgetTaskHandler } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Récupérer les données en cache
async function getWidgetData() {
  try {
    const cached = await AsyncStorage.getItem('weather_locations');
    if (cached) {
      const locations = JSON.parse(cached);
      if (locations.length > 0 && locations[0].data) {
        return locations[0];
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Convertir le code météo en emoji
function getWeatherEmoji(weatherCode, rainProb = 0) {
  if (rainProb >= 60) return '🌧️';
  if (rainProb >= 40) return '🌦️';
  if (weatherCode === 0) return '☀️';
  if (weatherCode === 1 || weatherCode === 2) return '⛅';
  if (weatherCode === 3) return '☁️';
  if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
  if (weatherCode >= 51 && weatherCode <= 67) return '🌧️';
  if (weatherCode >= 71 && weatherCode <= 77) return '❄️';
  if (weatherCode >= 80 && weatherCode <= 82) return '🌦️';
  if (weatherCode >= 85 && weatherCode <= 86) return '🌨️';
  if (weatherCode >= 95) return '⛈️';
  return '🌤️';
}

// Widget météo 4x2 (vertical layout)
function WeatherWidgetComponent({ location }) {
  // État vide si pas de données
  if (!location || !location.data) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 12,
        }}
      >
        <TextWidget
          text="🌤️"
          style={{ fontSize: 32, color: '#FFFFFF', textAlign: 'center' }}
        />
        <TextWidget
          text="Ma Météo"
          style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}
        />
        <TextWidget
          text="En attente des données..."
          style={{ fontSize: 11, color: '#6B7280', marginTop: 4, textAlign: 'center' }}
        />
      </FlexWidget>
    );
  }

  const { current, daily, hourly } = location.data;
  const cityName = location.name || 'Ma Position';
  const temp = current.temp;
  const feelsLike = current.apparentTemp || temp;
  const humidity = current.humidity || 0;
  const summary = current.summary || '';
  const weatherCode = current.weatherCode || 0;
  const rainProb = current.rainProb || 0;
  const todayMin = daily?.[0]?.min ?? '--';
  const todayMax = daily?.[0]?.max ?? '--';
  const windSpeed = hourly?.[0]?.windSpeed ?? '--';
  const emoji = getWeatherEmoji(weatherCode, rainProb);

  // Couleur de fond selon météo
  const isRainy = rainProb >= 40 || (weatherCode >= 51 && weatherCode <= 82);
  const isThunder = weatherCode >= 95;
  const bgColor = isThunder ? '#1E293B' : isRainy ? '#1E3A5F' : '#0f172a';

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: bgColor,
        borderRadius: 20,
        padding: 14,
        justifyContent: 'space-between',
      }}
    >
      {/* === LIGNE 1 : Ville + Emoji === */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text={cityName}
          style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 'bold' }}
          maxLines={1}
        />
        <TextWidget
          text={emoji}
          style={{ fontSize: 22 }}
        />
      </FlexWidget>

      {/* === LIGNE 2 : Température principale === */}
      <FlexWidget
        style={{
          alignItems: 'flex-start',
          marginTop: 2,
        }}
      >
        <TextWidget
          text={`${temp}°`}
          style={{
            fontSize: 52,
            color: '#FFFFFF',
            fontWeight: 'bold',
            includeFontPadding: false,
          }}
        />
        <TextWidget
          text={`Ressenti ${feelsLike}°`}
          style={{ fontSize: 11, color: '#9CA3AF', marginTop: -4 }}
        />
      </FlexWidget>

      {/* === LIGNE 3 : Description === */}
      <TextWidget
        text={summary}
        style={{ fontSize: 11, color: '#60A5FA', marginTop: 2 }}
        maxLines={2}
      />

      {/* === SÉPARATEUR === */}
      <FlexWidget
        style={{
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.1)',
          marginVertical: 8,
        }}
      />

      {/* === LIGNE 4 : Min / Max === */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget text="↓ " style={{ fontSize: 11, color: '#93C5FD' }} />
          <TextWidget text={`${todayMin}°`} style={{ fontSize: 13, color: '#93C5FD', fontWeight: 'bold' }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget text="↑ " style={{ fontSize: 11, color: '#FBBF24' }} />
          <TextWidget text={`${todayMax}°`} style={{ fontSize: 13, color: '#FBBF24', fontWeight: 'bold' }} />
        </FlexWidget>
      </FlexWidget>

      {/* === LIGNE 5 : Pluie + Humidité + Vent === */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
        }}
      >
        <FlexWidget style={{ alignItems: 'center', flex: 1 }}>
          <TextWidget text="🌧️" style={{ fontSize: 14 }} />
          <TextWidget
            text={`${rainProb}%`}
            style={{ fontSize: 12, color: '#60A5FA', fontWeight: 'bold', marginTop: 2 }}
          />
          <TextWidget text="Pluie" style={{ fontSize: 9, color: '#6B7280' }} />
        </FlexWidget>

        <FlexWidget
          style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }}
        />

        <FlexWidget style={{ alignItems: 'center', flex: 1 }}>
          <TextWidget text="💧" style={{ fontSize: 14 }} />
          <TextWidget
            text={`${humidity}%`}
            style={{ fontSize: 12, color: '#93C5FD', fontWeight: 'bold', marginTop: 2 }}
          />
          <TextWidget text="Humidité" style={{ fontSize: 9, color: '#6B7280' }} />
        </FlexWidget>

        <FlexWidget
          style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }}
        />

        <FlexWidget style={{ alignItems: 'center', flex: 1 }}>
          <TextWidget text="💨" style={{ fontSize: 14 }} />
          <TextWidget
            text={`${windSpeed}`}
            style={{ fontSize: 12, color: '#A7F3D0', fontWeight: 'bold', marginTop: 2 }}
          />
          <TextWidget text="km/h" style={{ fontSize: 9, color: '#6B7280' }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

export async function widgetTaskHandler(props) {
  const location = await getWidgetData();

  if (props.widgetName === 'WeatherWidget') {
    props.renderWidget(<WeatherWidgetComponent location={location} />);
  }
}

registerWidgetTaskHandler(widgetTaskHandler);