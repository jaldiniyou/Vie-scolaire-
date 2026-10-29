// Sous-titres de la voix off en darija, modifiables sans toucher au code.
//
// Chaque réplique existe en deux écritures :
//   ar    : darija en lettres arabes (affichée par défaut, SCRIPT = 'arabic')
//   latin : darija en lettres latines / arabizi (SCRIPT = 'latin')
// Les mots prononcés en français (vérifiés, qualité, TutinGo…) restent en
// lettres latines, comme dans la voix off.
//
// Les timings sont en SECONDES. Ils sont alignés sur les segments de parole
// détectés dans public/audio/tutingo-voiceover.wav (ffmpeg silencedetect,
// -32 dB / 0,12 s). Les frontières de phrases sont mesurées ; les coupures
// à l'intérieur d'une longue phrase sont estimées. Pour les ajuster, écouter
// dans Remotion Studio (npm run dev) puis modifier `start` / `end`.
//
// `highlight` / `arHighlight` : mots affichés en lavande.
// `hide` : réplique déjà affichée en grand par la carte de fin.

export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
  ar: string;
  highlight?: string[];
  arHighlight?: string[];
  hide?: boolean;
};

export const SUBTITLES: SubtitleCue[] = [
  // --- Scène 1 : le problème -------------------------------------------
  {start: 0.2, end: 1.42, text: 'Katkhdmo nhar kamel,', ar: 'كتخدمو نهار كامل،'},
  {start: 1.5, end: 3.3, text: 'w katwslou ldar 3yaneen…', ar: 'وكتوصلو للدار عيانين…', highlight: ['3yaneen…'], arHighlight: ['عيانين…']},
  {start: 3.45, end: 4.75, text: 'w katl9aw wlidatkom ba9i', ar: 'وكتلقاو وليداتكم باقي'},
  {start: 4.75, end: 6.3, text: 'khas-hom yraj3o doross-hom ?', ar: 'خاصهم يراجعو دروسهم؟', highlight: ['doross-hom'], arHighlight: ['دروسهم؟']},
  {start: 6.62, end: 7.95, text: 'Bghitio t3awnouhom,', ar: 'بغيتو تعاونوهم،'},
  {start: 7.95, end: 9.45, text: 'walakin lwa9t ma kayse3fkomch ?', ar: 'ولكن الوقت ما كيسعفكمش؟', highlight: ['lwa9t'], arHighlight: ['الوقت']},

  // --- Scène 2 : la solution --------------------------------------------
  {start: 9.66, end: 10.75, text: 'M3a TutinGo,', ar: 'مع TutinGo،', highlight: ['TutinGo,'], arHighlight: ['TutinGo،']},
  {start: 10.75, end: 12.25, text: 'l7ell wlla sahal !', ar: 'الحل ولّى ساهل!', highlight: ['sahal', '!'], arHighlight: ['ساهل!']},
  {start: 12.33, end: 14.6, text: 'Kanwafro likom asatida mkhtarin,', ar: 'كنوفرو ليكم أساتذة مختارين،', highlight: ['asatida'], arHighlight: ['أساتذة']},
  {start: 14.6, end: 15.75, text: 'w vérifiés,', ar: 'و vérifiés،', highlight: ['vérifiés,'], arHighlight: ['vérifiés،']},

  // --- Scène 3 : le professeur à domicile -------------------------------
  {start: 15.75, end: 17.45, text: 'wajdin yjiw 7ta ldarkom,', ar: 'واجدين يجيو حتى لداركم،', highlight: ['ldarkom,'], arHighlight: ['لداركم،']},
  {start: 17.45, end: 19.2, text: 'w y3awnou wlidatkom f lmoraaja3a,', ar: 'ويعاونو وليداتكم فالمراجعة،'},

  // --- Scène 4 : la qualité des révisions -------------------------------
  {start: 19.51, end: 20.7, text: 'fhemt doross,', ar: 'فهمت الدروس،', highlight: ['fhemt'], arHighlight: ['فهمت']},
  {start: 20.7, end: 22.35, text: 'w listi3dad lforod w limti7anat.', ar: 'والاستعداد للفروض والامتحانات.', highlight: ['limti7anat.'], arHighlight: ['والامتحانات.']},

  // --- Scène 5 : la tranquillité des parents ----------------------------
  {start: 22.58, end: 24.4, text: 'Ntomma rkzo 3la khedmtkom,', ar: 'نتوما ركزو على خدمتكم،', highlight: ['khedmtkom,'], arHighlight: ['خدمتكم،']},
  {start: 24.49, end: 26.3, text: 'w khliw wlidatkom ystafdo men moraaja3a', ar: 'وخليو وليداتكم يستافدو من مراجعة', highlight: ['ystafdo'], arHighlight: ['يستافدو']},
  {start: 26.3, end: 27.55, text: 'b qualité 3aliya,', ar: 'ب qualité عالية،', highlight: ['qualité', '3aliya,'], arHighlight: ['qualité', 'عالية،']},
  {start: 27.55, end: 28.45, text: "m3a l'ostad li kaynasbhom,", ar: 'مع الأستاذ اللي كيناسبهم،'},
  {start: 28.45, end: 29.35, text: 'w f ra7a dyal darkom.', ar: 'وفراحة ديال داركم.', highlight: ['ra7a'], arHighlight: ['وفراحة']},

  // --- Scène 6 : appel à l'action ---------------------------------------
  {start: 29.42, end: 30.9, text: 'Ma tdi3och lwe9t !', ar: 'ما تضيعوش الوقت!', hide: true},
  {start: 31.12, end: 34.7, text: 'Dkhlou daba l TutinGo.com,', ar: 'دخلو دابا لـ TutinGo.com،', highlight: ['TutinGo.com,'], arHighlight: ['TutinGo.com،']},
  {start: 34.77, end: 37.1, text: "w khtaro l'ostad li ynasb wlidatkom.", ar: 'وختارو الأستاذ اللي يناسب وليداتكم.', highlight: [], arHighlight: ['الأستاذ']},
  {start: 37.31, end: 38.75, text: 'TutinGo… Trouvez.', ar: 'TutinGo… Trouvez.', hide: true},
  {start: 38.85, end: 39.6, text: 'Réservez.', ar: 'Réservez.', hide: true},
  {start: 39.7, end: 40.5, text: 'Apprenez.', ar: 'Apprenez.', hide: true},
  {start: 40.67, end: 41.45, text: 'TutinGo…', ar: 'TutinGo…', highlight: ['TutinGo…'], arHighlight: ['TutinGo…']},
  {start: 41.6, end: 42.88, text: '9raya dyal wlidatkom,', ar: 'قراية ديال وليداتكم،'},
  {start: 42.95, end: 44.12, text: 'w ra7t balikom !', ar: 'وراحة بالكم!', highlight: ['ra7t', 'balikom', '!'], arHighlight: ['وراحة', 'بالكم!']},
];
