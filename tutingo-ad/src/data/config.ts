// Paramètres centralisés de la publicité TutinGo.
// Modifier ici les couleurs, le format, l'audio et les textes de marque.

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Fichier audio dans public/ (chargé avec staticFile()).
export const AUDIO_SRC = 'audio/tutingo-voiceover.wav';

// Durée mesurée avec ffprobe : 00:00:44.12. Utilisée seulement si la
// lecture de la durée réelle échoue dans calculateMetadata().
export const AUDIO_DURATION_FALLBACK_SEC = 44.12;

export const BRAND = {
  name: 'TutinGo',
  slogan: ['Trouvez.', 'Réservez.', 'Apprenez.'],
  tagline: "Trouvez l'enseignant adapté à votre enfant.",
  website: 'tutingo.com',
  logo: 'images/tutingo-logo.png', // logo officiel (fond blanc), 1000x376
} as const;

export const COLORS = {
  violet: '#6531DC', // violet du « G » du logo
  violetDeep: '#4A1FB0',
  violetPin: '#7219E3', // violet du pictogramme de localisation
  lavender: '#B9A4F5',
  lavenderLight: '#EEE8FF',
  white: '#FFFFFF',
  ink: '#16112B',
  night: '#120B2A',
  warm: '#F2A65A', // lumière du soir (scène 1)
} as const;

export const FONT_FAMILY_FALLBACK =
  'Poppins, Inter, "Helvetica Neue", Arial, sans-serif';

// Police des textes en arabe : Cairo pour l'arabe, Poppins pour les mots
// restés en lettres latines (TutinGo, vérifiés, qualité…).
export const FONT_FAMILY_ARABIC = 'Cairo, Poppins, "Noto Sans Arabic", sans-serif';

// Écriture des sous-titres et des textes darija à l'écran :
// 'arabic' (lettres arabes, de droite à gauche) ou 'latin' (arabizi).
export const SCRIPT: 'arabic' | 'latin' = 'arabic';

// Grain filmique léger sur toute la vidéo (0 = désactivé).
export const GRAIN_OPACITY = 0.07;

// Affiche sur les placeholders le nom du fichier à ajouter. Mettre à false
// pour un rendu final sans indications techniques.
export const SHOW_PLACEHOLDER_HINTS = true;

// Décalage global des sous-titres (secondes). Positif = sous-titres plus tard.
export const SUBTITLE_OFFSET_SEC = 0;
