// Sous-titres en darija (lettres latines), modifiables sans toucher au code.
//
// Timings en SECONDES, alignés sur les segments de parole détectés dans
// public/audio/tutingo-voiceover.wav (ffmpeg silencedetect, -32 dB / 0,12 s).
// Aucun outil de transcription n'était disponible : les frontières de
// phrases sont exactes (pauses mesurées), les coupures À L'INTÉRIEUR d'une
// longue phrase sont estimées. Ajuster `start` / `end` après écoute dans
// Remotion Studio (npm run dev) si besoin.
//
// `highlight` : mots affichés en violet/lavande.
// Garder chaque entrée courte (≈ 40 caractères max) => 2 lignes max.

export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
  highlight?: string[];
  hide?: boolean;
};

export const SUBTITLES: SubtitleCue[] = [
  // --- Scène 1 : le problème -------------------------------------------
  {start: 0.2, end: 1.42, text: 'Katkhdmo nhar kamel,'},
  {start: 1.5, end: 3.3, text: 'w katwslou ldar 3yaneen…', highlight: ['3yaneen…']},
  {start: 3.45, end: 4.75, text: 'w katl9aw wlidatkom ba9i'},
  {start: 4.75, end: 6.3, text: 'khas-hom yraj3o doross-hom ?', highlight: ['doross-hom']},
  {start: 6.62, end: 7.95, text: 'Bghitio t3awnouhom,'},
  {start: 7.95, end: 9.45, text: 'walakin lwa9t ma kayse3fkomch ?', highlight: ['lwa9t']},

  // --- Scène 2 : la solution --------------------------------------------
  {start: 9.66, end: 10.75, text: 'M3a TutinGo,', highlight: ['TutinGo,']},
  {start: 10.75, end: 12.25, text: 'l7ell wlla sahal !', highlight: ['sahal', '!']},
  {start: 12.33, end: 14.6, text: 'Kanwafro likom asatida mkhtarin,', highlight: ['asatida']},
  {start: 14.6, end: 15.75, text: 'w vérifiés,', highlight: ['vérifiés,']},

  // --- Scène 3 : le professeur à domicile -------------------------------
  {start: 15.75, end: 17.45, text: 'wajdin yjiw 7ta ldarkom,', highlight: ['ldarkom,']},
  {start: 17.45, end: 19.2, text: 'w y3awnou wlidatkom f lmoraaja3a,'},

  // --- Scène 4 : la qualité des révisions -------------------------------
  {start: 19.51, end: 20.7, text: 'fhemt doross,', highlight: ['fhemt']},
  {start: 20.7, end: 22.35, text: 'w listi3dad lforod w limti7anat.', highlight: ['limti7anat.']},

  // --- Scène 5 : la tranquillité des parents ----------------------------
  {start: 22.58, end: 24.4, text: 'Ntomma rkzo 3la khedmtkom,', highlight: ['khedmtkom,']},
  {start: 24.49, end: 26.3, text: 'w khliw wlidatkom ystafdo men moraaja3a', highlight: ['ystafdo']},
  {start: 26.3, end: 27.55, text: 'b qualité 3aliya,', highlight: ['qualité', '3aliya,']},
  {start: 27.55, end: 28.45, text: "m3a l'ostad li kaynasbhom,"},
  {start: 28.45, end: 29.35, text: 'w f ra7a dyal darkom.', highlight: ['ra7a']},

  // --- Scène 6 : appel à l'action ---------------------------------------
  // `hide: true` : la phrase est déjà affichée en grand par la carte de fin
  // (BrandEndCard), synchronisée sur les mêmes timings.
  {start: 29.42, end: 30.9, text: 'Ma tdi3och lwe9t !', hide: true},
  {start: 31.12, end: 34.7, text: 'Dkhlou daba l TutinGo.com,', highlight: ['TutinGo.com,']},
  {start: 34.77, end: 37.1, text: "w khtaro l'ostad li ynasb wlidatkom."},
  {start: 37.31, end: 38.75, text: 'TutinGo… Trouvez.', hide: true},
  {start: 38.85, end: 39.6, text: 'Réservez.', hide: true},
  {start: 39.7, end: 40.5, text: 'Apprenez.', hide: true},
  {start: 40.67, end: 41.45, text: 'TutinGo…', highlight: ['TutinGo…']},
  {start: 41.6, end: 42.88, text: '9raya dyal wlidatkom,'},
  {start: 42.95, end: 44.12, text: 'w ra7t balikom !', highlight: ['ra7t', 'balikom', '!']},
];
