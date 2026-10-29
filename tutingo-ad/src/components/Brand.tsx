import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../data/config';
import {clamp} from './utils';

// Logo officiel (PNG fond blanc) posé sur une carte blanche arrondie,
// pour rester fidèle au fichier fourni sur n'importe quel fond.
export const LogoCard: React.FC<{width: number; radius?: number; padding?: number; shadow?: boolean}> = ({
  width,
  radius = 32,
  padding = 24,
  shadow = true,
}) => (
  <div
    style={{
      background: COLORS.white,
      borderRadius: radius,
      padding: `${padding * 0.6}px ${padding}px`,
      boxShadow: shadow ? '0 24px 60px rgba(40, 14, 110, 0.35)' : undefined,
      display: 'inline-flex',
    }}
  >
    {/* Le fichier contient une bande vide sous le texte : on la masque. */}
    <div style={{width, height: width * 0.3, overflow: 'hidden'}}>
      <Img src={staticFile(BRAND.logo)} style={{width, height: width * 0.376, display: 'block', marginTop: -width * 0.035}} />
    </div>
  </div>
);

// Petit logo en haut de l'écran pendant les scènes de solution.
export const LogoBadge: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 96, opacity: enter * exit}}>
      <div style={{transform: `translateY(${(1 - enter) * -30}px)`}}>
        <LogoCard width={250} radius={999} padding={30} />
      </div>
    </AbsoluteFill>
  );
};

// Transition lumineuse : un disque blanc/lavande s'ouvre puis se dissipe.
export const LightWipe: React.FC<{durationInFrames: number; color?: string}> = ({
  durationInFrames,
  color = COLORS.lavenderLight,
}) => {
  const frame = useCurrentFrame();
  const mid = durationInFrames / 2;
  const radius = interpolate(frame, [0, mid], [0, 1500], clamp);
  const opacity = interpolate(frame, [0, mid * 0.6, mid, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, #FFFFFF 0px, ${color} ${radius * 0.6}px, ${COLORS.lavender}00 ${radius}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Pictogramme de localisation, repris de la forme du logo.
export const Pin: React.FC<{size: number; color?: string}> = ({size, color = COLORS.violetPin}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50">
    <path
      d="M20 0C9 0 0 9 0 20c0 14 20 30 20 30s20-16 20-30C40 9 31 0 20 0zm0 29a9 9 0 110-18 9 9 0 010 18z"
      fill={color}
    />
  </svg>
);
