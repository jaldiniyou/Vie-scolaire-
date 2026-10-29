// Storyboard : scènes et plans, timings en SECONDES sur la voix off.
//
// Pour remplacer un placeholder par un vrai visuel :
//   1. Déposer le fichier dans public/images/ (ou public/videos/).
//   2. Renseigner `media` du plan, ex. {type: 'image', src: 'images/s1-mere.jpg'}.
// Le mouvement de caméra (`camera`) s'applique automatiquement.

export type Camera = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'still';

export type Media = {type: 'image' | 'video'; src: string} | null;

export type Mood = 'evening' | 'bright' | 'warm';

export type Shot = {
  id: string;
  start: number;
  end: number;
  camera: Camera;
  media: Media;
  mood: Mood;
  icon: 'mother' | 'notebook' | 'tired' | 'door' | 'explain' | 'board' | 'exercise' | 'success' | 'family';
  // Description affichée sur le placeholder + nom de fichier suggéré.
  placeholder: {label: string; file: string};
  // Prompt suggéré pour générer ce plan avec Higgsfield (image ou vidéo 9:16).
  prompt: string;
};

export type SceneId = 'problem' | 'solution' | 'teacher' | 'quality' | 'parents' | 'cta';

export type Scene = {
  id: SceneId;
  title: string;
  start: number;
  end: number; // 'end' de la dernière scène = durée de l'audio (voir TutinGoAd)
  shots: Shot[];
};

const STYLE =
  'cinematic photo, vertical 9:16, Moroccan family, modern Moroccan apartment, shallow depth of field, natural skin tones, 35mm, high detail';

export const SCENES: Scene[] = [
  {
    id: 'problem',
    title: 'Le problème',
    start: 0,
    end: 9.55,
    shots: [
      {
        id: 's1-mere',
        start: 0,
        end: 3.4,
        camera: 'zoomIn',
        media: null,
        mood: 'evening',
        icon: 'mother',
        placeholder: {label: 'Mère qui rentre du travail, fatiguée', file: 'images/s1-mere.jpg'},
        prompt: `Moroccan working mother in her 30s opening the front door of her apartment at dusk, carrying a handbag, tired expression, warm orange evening light, ${STYLE}`,
      },
      {
        id: 's1-cahier',
        start: 3.4,
        end: 6.55,
        camera: 'zoomIn',
        media: null,
        mood: 'evening',
        icon: 'notebook',
        placeholder: {label: "Enfant en difficulté devant ses cahiers", file: 'images/s1-cahier.jpg'},
        prompt: `Moroccan schoolboy around 11 years old sitting at a dining table with open notebooks, head in hand, struggling with homework, evening lamp light, close-up on the notebook, ${STYLE}`,
      },
      {
        id: 's1-fatigue',
        start: 6.55,
        end: 9.55,
        camera: 'panLeft',
        media: null,
        mood: 'evening',
        icon: 'tired',
        placeholder: {label: 'La mère veut aider mais manque de temps', file: 'images/s1-fatigue.jpg'},
        prompt: `Moroccan mother sitting next to her son at the table, rubbing her eyes, exhausted, wants to help with homework, wall clock showing late evening, warm dim light, ${STYLE}`,
      },
    ],
  },
  {
    id: 'solution',
    title: 'La solution TutinGo',
    start: 9.55,
    end: 15.75,
    shots: [], // scène 100 % motion design (smartphone + profils), voir SolutionScene
  },
  {
    id: 'teacher',
    title: 'Le professeur à domicile',
    start: 15.75,
    end: 19.4,
    shots: [
      {
        id: 's3-arrivee',
        start: 15.75,
        end: 17.45,
        camera: 'zoomOut',
        media: null,
        mood: 'bright',
        icon: 'door',
        placeholder: {label: 'Le professeur arrive à la maison', file: 'images/s3-arrivee.jpg'},
        prompt: `Friendly Moroccan male tutor in his late 20s, smart casual, holding a notebook, being welcomed at the door of a bright modern Moroccan home, daylight, ${STYLE}`,
      },
      {
        id: 's3-explication',
        start: 17.45,
        end: 19.4,
        camera: 'zoomIn',
        media: null,
        mood: 'bright',
        icon: 'explain',
        placeholder: {label: 'Il explique un exercice sur le cahier', file: 'images/s3-explication.jpg'},
        prompt: `Moroccan tutor sitting beside a schoolboy at a table, pointing at an exercise in the notebook, the child listening attentively and starting to understand, soft daylight, close-up, ${STYLE}`,
      },
    ],
  },
  {
    id: 'quality',
    title: 'La qualité des révisions',
    start: 19.4,
    end: 22.45,
    shots: [
      {
        id: 's4-tableau',
        start: 19.4,
        end: 20.45,
        camera: 'panRight',
        media: null,
        mood: 'bright',
        icon: 'board',
        placeholder: {label: 'Explication au tableau blanc', file: 'images/s4-tableau.jpg'},
        prompt: `Moroccan tutor explaining a math formula on a small whiteboard at home, child watching, bright room, dynamic angle, ${STYLE}`,
      },
      {
        id: 's4-exercice',
        start: 20.45,
        end: 21.45,
        camera: 'zoomIn',
        media: null,
        mood: 'bright',
        icon: 'exercise',
        placeholder: {label: "Résolution d'un exercice", file: 'images/s4-exercice.jpg'},
        prompt: `Close-up of a child's hand writing the correct answer in a notebook with a pencil, tutor's hand pointing nearby, bright light, macro detail, ${STYLE}`,
      },
      {
        id: 's4-bravo',
        start: 21.45,
        end: 22.45,
        camera: 'zoomOut',
        media: null,
        mood: 'bright',
        icon: 'success',
        placeholder: {label: "Le professeur encourage l'enfant", file: 'images/s4-bravo.jpg'},
        prompt: `Moroccan tutor giving a high five to a smiling schoolboy at a study table, proud and confident, bright warm daylight, ${STYLE}`,
      },
    ],
  },
  {
    id: 'parents',
    title: 'La tranquillité des parents',
    start: 22.45,
    end: 29.38,
    shots: [
      {
        id: 's5-mere-sourit',
        start: 22.45,
        end: 26.3,
        camera: 'zoomIn',
        media: null,
        mood: 'warm',
        icon: 'mother',
        placeholder: {label: 'La mère observe et sourit, rassurée', file: 'images/s5-mere-sourit.jpg'},
        prompt: `Moroccan mother standing in the living room doorway with a cup of tea, smiling with relief while watching her son study with a tutor in the background, warm bright light, ${STYLE}`,
      },
      {
        id: 's5-famille',
        start: 26.3,
        end: 29.38,
        camera: 'panUp',
        media: null,
        mood: 'warm',
        icon: 'family',
        placeholder: {label: 'Ambiance familiale, chaleureuse et sereine', file: 'images/s5-famille.jpg'},
        prompt: `Bright modern Moroccan home, child working happily with a tutor at a table, mother working on her laptop peacefully nearby, warm and serene family atmosphere, ${STYLE}`,
      },
    ],
  },
  {
    id: 'cta',
    title: "Appel à l'action",
    start: 29.38,
    end: 44.12,
    shots: [], // carte de fin, voir BrandEndCard
  },
];

// Mots-clés animés de la scène 4 (secondes = apparition).
export const QUALITY_KEYWORDS = [
  {text: 'Comprendre', at: 19.55},
  {text: "S'entraîner", at: 20.75},
  {text: 'Progresser', at: 21.6},
];

// Textes darija à l'écran : `ar` (lettres arabes) et `latin` (arabizi),
// choisis selon config.SCRIPT.

// Titres de la scène 5.
export const PARENTS_TITLES = [
  {ar: 'نتوما ركزو على خدمتكم', latin: 'Ntomma rkzo 3la khedmtkom', start: 22.6, end: 26.25},
  {ar: 'المواكبة اللي كتناسب وليداتكم', latin: "L'accompagnement li kaynasb wlidatkom", start: 26.35, end: 29.38},
];

// Typographie cinétique de la scène 1 (mots-clés en grand, en haut d'écran).
export const PROBLEM_ACCENTS = [
  {ar: 'عيانين…', latin: '3yaneen…', start: 1.6, end: 3.35, icon: 'none' as const},
  {ar: 'دروسهم؟', latin: 'doross-hom ?', start: 4.75, end: 6.5, icon: 'question' as const},
  {ar: 'الوقت؟', latin: 'lwa9t ?', start: 7.95, end: 9.55, icon: 'clock' as const},
];

// Grand titre « urgence » de la carte de fin.
export const URGENCY_TEXT = {ar: 'ما تضيعوش الوقت!', latin: 'Ma tdi3och lwe9t !'};

// Profils de démonstration affichés dans le smartphone (scène 2).
// Données fictives d'interface : aucune note, aucun avis, aucune certification.
export const DEMO_TEACHERS = [
  {initials: 'YB', name: 'Prof. Yassine', subject: 'Mathématiques', level: 'Collège · Lycée', city: 'Casablanca'},
  {initials: 'SE', name: 'Prof. Salma', subject: 'Français', level: 'Primaire · Collège', city: 'Rabat'},
  {initials: 'HA', name: 'Prof. Hamza', subject: 'Physique-Chimie', level: 'Lycée · Bac', city: 'Marrakech'},
];

// Temps forts de la carte de fin (secondes absolues).
export const CTA_BEATS = {
  urgency: 29.42, // « Ma tdi3och lwe9t ! »
  logo: 31.0, // « Dkhlou daba l TutinGo.com »
  brandCall: 37.31, // « TutinGo… » (pulsation du logo)
  tagline: 34.77, // « w khtaro l'ostad li ynasb wlidatkom »
  slogan: [38.0, 38.85, 39.7], // « Trouvez. » « Réservez. » « Apprenez. »
  final: 40.67, // « TutinGo… 9raya dyal wlidatkom, w ra7t balikom ! »
};
