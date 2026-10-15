// Textes des fenêtres d'information (UV, humidité, qualité de l'air).

export const UV_GUIDE = {
  title: "Guide de l'indice UV",
  levels: [
    { color: '#4ADE80', range: '0 - 2 (Bas)', text: 'Aucun danger.' },
    { color: '#FBBF24', range: '3 - 5 (Modéré)', text: 'Protection légère.' },
    { color: '#F97316', range: '6 - 7 (Élevé)', text: 'Chapeau et crème solaire.' },
    { color: '#EF4444', range: '8 - 10 (Très élevé)', text: "Réduisez l'exposition au soleil." },
    { color: '#A855F7', range: '11+ (Extrême)', text: 'Danger immédiat, restez à l\'ombre.' },
  ],
};

export const HUMIDITY_GUIDE = {
  title: "Guide de l'humidité",
  intro: "Le taux d'humidité mesure la quantité de vapeur d'eau dans l'air.",
  levels: [
    { color: '#FCD34D', range: 'Moins de 30 %', text: 'Air trop sec.' },
    { color: '#4ADE80', range: '30 % à 60 %', text: 'Confortable.' },
    { color: '#60A5FA', range: '60 % à 80 %', text: 'Un peu lourd.' },
    { color: '#3B82F6', range: 'Plus de 80 %', text: 'Très humide.' },
  ],
};

// Indice européen de la qualité de l'air (EAQI), seuils officiels de l'Agence européenne
export const AQI_GUIDE = {
  title: "Qualité de l'air (IQA européen)",
  intro: "Plus l'indice est bas, meilleur est l'air.",
  levels: [
    { color: '#4ADE80', range: '0 - 20 (Bon)', text: 'Air pur, aucun risque.' },
    { color: '#A3E635', range: '21 - 40 (Correct)', text: 'Risque très faible.' },
    { color: '#FBBF24', range: '41 - 60 (Moyen)', text: 'Gêne possible pour les personnes sensibles.' },
    { color: '#F97316', range: '61 - 80 (Mauvais)', text: 'Limitez les efforts intenses en extérieur.' },
    { color: '#EF4444', range: '81 - 100 (Très mauvais)', text: 'Réduisez les activités en extérieur.' },
    { color: '#A855F7', range: '101+ (Extrêmement mauvais)', text: 'Évitez toute activité en extérieur.' },
  ],
};
