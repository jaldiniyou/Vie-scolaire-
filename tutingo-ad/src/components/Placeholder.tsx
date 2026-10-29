import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, SHOW_PLACEHOLDER_HINTS} from '../data/config';
import type {Mood, Shot} from '../data/scenes';
import {fontFamily} from './utils';

// Placeholder « propre » affiché tant qu'aucun visuel n'est fourni pour un plan.
// Ambiance colorée selon la scène + pictogramme + bokeh animé.

const GRADIENTS: Record<Mood, string> = {
  evening: `radial-gradient(120% 80% at 70% 20%, #F2A65A 0%, #8A3F5F 38%, ${COLORS.night} 78%)`,
  bright: `radial-gradient(120% 90% at 30% 15%, #FFFFFF 0%, ${COLORS.lavenderLight} 40%, ${COLORS.lavender} 100%)`,
  warm: `radial-gradient(120% 90% at 50% 10%, #FFF4E6 0%, #F6DCEB 40%, ${COLORS.lavender} 100%)`,
};

const ICON_PATHS: Record<Shot['icon'], React.ReactNode> = {
  mother: (
    <>
      <circle cx="60" cy="38" r="18" />
      <path d="M28 108c0-22 14-40 32-40s32 18 32 40" />
      <path d="M44 34c0-14 8-22 16-22s16 8 16 22c0 10-2 20-6 26" />
    </>
  ),
  notebook: (
    <>
      <rect x="22" y="20" width="76" height="84" rx="6" />
      <path d="M38 20v84M50 44h36M50 60h36M50 76h22" />
    </>
  ),
  tired: (
    <>
      <circle cx="60" cy="60" r="40" />
      <path d="M60 36v24l16 10" />
      <path d="M96 22l8-8M24 22l-8-8" />
    </>
  ),
  door: (
    <>
      <path d="M22 106V54l38-32 38 32v52z" />
      <rect x="50" y="72" width="20" height="34" rx="2" />
    </>
  ),
  explain: (
    <>
      <rect x="18" y="62" width="84" height="44" rx="6" />
      <circle cx="42" cy="34" r="12" />
      <circle cx="80" cy="38" r="9" />
      <path d="M50 84h30M50 94h18" />
    </>
  ),
  board: (
    <>
      <rect x="16" y="18" width="88" height="62" rx="4" />
      <path d="M30 40h24M30 54h40M60 96l0-16M44 104l16-8 16 8" />
    </>
  ),
  exercise: (
    <>
      <path d="M26 98l58-58 12 12-58 58H26z" />
      <path d="M76 48l12 12" />
    </>
  ),
  success: (
    <>
      <circle cx="60" cy="60" r="40" />
      <path d="M40 62l14 14 28-30" />
    </>
  ),
  family: (
    <>
      <path d="M18 104V58l42-36 42 36v46z" />
      <path d="M46 92c0-10 6-16 14-16s14 6 14 16" />
      <path d="M52 64c0-6 4-10 8-10s8 4 8 10-4 10-8 10-8-4-8-10z" />
    </>
  ),
};

export const Placeholder: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const dark = shot.mood === 'evening';
  const stroke = dark ? 'rgba(255,255,255,0.85)' : COLORS.violet;

  const bokeh = [
    {x: 160, y: 300, r: 140, s: 0.6},
    {x: 880, y: 520, r: 220, s: 0.4},
    {x: 300, y: 1450, r: 180, s: 0.5},
    {x: 820, y: 1250, r: 120, s: 0.7},
  ];

  return (
    <AbsoluteFill style={{background: GRADIENTS[shot.mood]}}>
      {bokeh.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.r + Math.sin((frame + i * 40) / 45) * 30 * b.s,
            top: b.y - b.r + Math.cos((frame + i * 30) / 55) * 24 * b.s,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: dark ? 'rgba(255,190,120,0.18)' : 'rgba(255,255,255,0.55)',
            filter: 'blur(30px)',
          }}
        />
      ))}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: -120}}>
        <svg
          width={300}
          height={300}
          viewBox="0 0 120 120"
          fill="none"
          stroke={stroke}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{opacity: 0.9}}
        >
          {/* Le pictogramme se dessine trait par trait */}
          {React.Children.map(
            (ICON_PATHS[shot.icon] as React.ReactElement<{children: React.ReactNode}>).props.children,
            (child, i) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<React.SVGProps<SVGElement>>, {
                    pathLength: 1,
                    strokeDasharray: 1,
                    strokeDashoffset: interpolate(frame, [4 + i * 4, 26 + i * 4], [1, 0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                      easing: Easing.out(Easing.cubic),
                    }),
                  })
                : child,
          )}
        </svg>
        {SHOW_PLACEHOLDER_HINTS ? (
          <div
            style={{
              marginTop: 36,
              fontFamily,
              textAlign: 'center',
              color: dark ? 'rgba(255,255,255,0.8)' : COLORS.violetDeep,
              maxWidth: 820,
            }}
          >
            <div style={{fontSize: 40, fontWeight: 600}}>{shot.placeholder.label}</div>
            <div
              style={{
                marginTop: 14,
                fontSize: 28,
                fontWeight: 500,
                opacity: 0.7,
                fontFamily: 'monospace',
              }}
            >
              public/{shot.placeholder.file}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
