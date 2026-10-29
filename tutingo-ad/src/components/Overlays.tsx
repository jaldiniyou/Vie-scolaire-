import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../data/config';
import {Pin} from './Brand';
import {clamp, fadeInOut, fontFamily} from './utils';

// Étalonnage « lumière du soir » + vignette pour la scène 1.
export const EveningGrade: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(242,166,90,0.16) 0%, rgba(18,11,42,0) 45%)', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,5,25,0.6) 100%)'}} />
  </AbsoluteFill>
);

// Vignette lumineuse douce pour les scènes « solution ».
export const BrightGrade: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(100% 70% at 50% 40%, rgba(255,255,255,0) 60%, rgba(74,31,176,0.28) 100%)',
    }}
  />
);

// Chip « À domicile » (scène 3).
export const HomeChip: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <div
        style={{
          fontFamily,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 36px',
          borderRadius: 999,
          background: COLORS.white,
          color: COLORS.violet,
          fontWeight: 700,
          fontSize: 46,
          boxShadow: '0 20px 50px rgba(74,31,176,0.35)',
          opacity: enter,
          transform: `translateY(${(1 - enter) * -40}px) scale(${0.8 + 0.2 * enter})`,
        }}
      >
        <Pin size={38} />
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Mots-clés animés de la scène 4 (empilés en haut, loin des visages au centre).
export const KeywordStack: React.FC<{words: {text: string; atFrame: number}[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{top: 280, alignItems: 'center', gap: 22, fontFamily}}>
      {words.map((w, i) => {
        const e = spring({frame: frame - w.atFrame, fps, config: {damping: 12, stiffness: 140}});
        const isLatest = words.filter((x) => x.atFrame <= frame).length - 1 === i;
        return (
          <div
            key={w.text}
            style={{
              opacity: e,
              transform: `translateX(${(1 - e) * (i % 2 === 0 ? -260 : 260)}px) scale(${isLatest ? 1.06 : 0.94})`,
              padding: '18px 44px',
              borderRadius: 999,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1,
              color: isLatest ? COLORS.white : COLORS.violet,
              background: isLatest ? `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.violetPin})` : 'rgba(255,255,255,0.92)',
              boxShadow: '0 18px 44px rgba(74,31,176,0.35)',
            }}
          >
            {w.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Grand titre en haut d'écran (scène 5).
export const TopTitle: React.FC<{text: string; durationInFrames: number}> = ({text, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 16});
  const opacity = fadeInOut(frame, 0, durationInFrames, 8);
  const underline = interpolate(frame, [8, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{top: 300, alignItems: 'center', opacity}}>
      <div
        style={{
          maxWidth: 900,
          textAlign: 'center',
          fontFamily,
          fontSize: 70,
          fontWeight: 800,
          lineHeight: 1.12,
          color: COLORS.white,
          textShadow: '0 6px 30px rgba(40,10,110,0.55)',
          transform: `translateY(${(1 - enter) * 30}px)`,
        }}
      >
        {text}
        <div
          style={{
            margin: '22px auto 0',
            height: 10,
            width: 260 * underline,
            borderRadius: 10,
            background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.violetPin})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
