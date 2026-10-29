import type React from 'react';
import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, staticFile} from 'remotion';
import {FONT_FAMILY_ARABIC, FONT_FAMILY_FALLBACK, SCRIPT} from '../data/config';

// Polices chargées localement (SIL OFL, public/fonts/) : aucun accès réseau
// n'est nécessaire au rendu.
const WEIGHTS = ['400', '500', '600', '700', '800'] as const;
WEIGHTS.forEach((weight) => {
  loadFont({family: 'Poppins', url: staticFile(`fonts/Poppins-${weight}.woff2`), weight});
});
// Cairo est une police variable : un seul fichier couvre les graisses 200 à 1000.
loadFont({family: 'Cairo', url: staticFile('fonts/Cairo-arabic.woff2'), weight: '200 1000'});

export const fontFamily = FONT_FAMILY_FALLBACK;
export const fontFamilyArabic = FONT_FAMILY_ARABIC;

// Texte darija dans l'écriture choisie (config.SCRIPT).
export type Darija = {ar: string; latin: string};
export const isArabic = SCRIPT === 'arabic';
export const darija = (t: Darija) => (isArabic ? t.ar : t.latin);
// Style typographique adapté à l'écriture (sens de lecture, police, interligne).
export const darijaStyle = (): React.CSSProperties =>
  isArabic
    ? {direction: 'rtl', fontFamily: fontFamilyArabic, letterSpacing: 0}
    : {direction: 'ltr', fontFamily};

export const secToFrame = (sec: number, fps: number) => Math.round(sec * fps);

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// Fondu entrée/sortie (en images) autour d'une fenêtre [from, to].
export const fadeInOut = (frame: number, from: number, to: number, fade = 8) =>
  interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

// Courbe « motion design » : départ rapide, arrivée très douce.
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOutQuint = Easing.bezier(0.83, 0, 0.17, 1);
