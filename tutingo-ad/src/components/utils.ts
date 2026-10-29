import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, staticFile} from 'remotion';
import {FONT_FAMILY_FALLBACK} from '../data/config';

// Poppins (SIL OFL, public/fonts/) chargée localement : aucun accès réseau
// n'est nécessaire au rendu.
const WEIGHTS = ['400', '500', '600', '700', '800'] as const;
WEIGHTS.forEach((weight) => {
  loadFont({family: 'Poppins', url: staticFile(`fonts/Poppins-${weight}.woff2`), weight});
});

export const fontFamily = FONT_FAMILY_FALLBACK;

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
