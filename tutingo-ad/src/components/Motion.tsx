import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, GRAIN_OPACITY} from '../data/config';
import {clamp, easeInOutQuint, easeOutExpo} from './utils';

// Boîte à outils motion design : formes, éclats, tracés, grain, curseur,
// transitions. Tous les temps sont en images, relatifs à la séquence parente.

// Anneaux concentriques qui s'élargissent (impact visuel sur un temps fort).
export const BurstRings: React.FC<{
  at: number;
  x: number;
  y: number;
  color?: string;
  count?: number;
  maxRadius?: number;
}> = ({at, x, y, color = COLORS.white, count = 3, maxRadius = 420}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const local = frame - at - i * 4;
        if (local < 0 || local > 34) return null;
        const p = interpolate(local, [0, 30], [0, 1], {...clamp, easing: easeOutExpo});
        const r = 40 + p * (maxRadius - i * 60);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `${Math.max(1, 10 * (1 - p))}px solid ${color}`,
              opacity: (1 - p) * 0.9,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

// Petites étincelles qui jaillissent autour d'un point.
export const Sparkles: React.FC<{at: number; x: number; y: number; color?: string; count?: number; spread?: number; seed?: string}> = ({
  at,
  x,
  y,
  color = COLORS.white,
  count = 10,
  spread = 260,
  seed = 's',
}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 32) return null;
  const p = interpolate(local, [0, 28], [0, 1], {...clamp, easing: easeOutExpo});
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5;
        const dist = spread * (0.6 + random(`${seed}d${i}`) * 0.4) * p;
        const size = 10 + random(`${seed}s${i}`) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(angle) * dist - size / 2,
              top: y + Math.sin(angle) * dist - size / 2,
              width: size,
              height: size,
              transform: `rotate(45deg) scale(${1 - p * 0.8})`,
              background: i % 3 === 0 ? COLORS.lavender : color,
              borderRadius: i % 2 === 0 ? '50%' : 3,
              opacity: 1 - p * 0.7,
            }}
          />
        );
      })}
    </>
  );
};

type ShapeKind = 'ring' | 'dot' | 'plus' | 'squiggle' | 'triangle';

const ShapeSvg: React.FC<{kind: ShapeKind; size: number; color: string}> = ({kind, size, color}) => {
  const common = {fill: 'none', stroke: color, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {kind === 'ring' && <circle cx="30" cy="30" r="22" {...common} />}
      {kind === 'dot' && <circle cx="30" cy="30" r="16" fill={color} />}
      {kind === 'plus' && <path d="M30 10v40M10 30h40" {...common} />}
      {kind === 'squiggle' && <path d="M6 36c8-14 14-14 20 0s12 14 20 0 10-10 10-10" {...common} />}
      {kind === 'triangle' && <path d="M30 10l20 36H10z" {...common} />}
    </svg>
  );
};

// Formes géométriques flottantes (parallaxe douce), entrée en cascade.
export const FloatingShapes: React.FC<{
  seed: string;
  count?: number;
  colors?: string[];
  opacity?: number;
  delay?: number;
  avoidCenter?: boolean;
}> = ({seed, count = 9, colors = [COLORS.white, COLORS.lavender], opacity = 0.7, delay = 0, avoidCenter = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kinds: ShapeKind[] = ['ring', 'dot', 'plus', 'squiggle', 'triangle'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        // Placement : bandes gauche/droite pour laisser le centre (visages) libre.
        const side = i % 2 === 0 ? 0 : 1;
        const xr = random(`${seed}x${i}`);
        const x = avoidCenter ? (side === 0 ? 30 + xr * 200 : 830 + xr * 200) : xr * 1040;
        const y = 180 + random(`${seed}y${i}`) * 1500;
        const size = 34 + random(`${seed}z${i}`) * 50;
        const depth = 0.4 + random(`${seed}p${i}`) * 0.8;
        const e = spring({frame: frame - delay - i * 3, fps, config: {damping: 12, stiffness: 120}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.sin((frame + i * 20) / (40 / depth)) * 18 * depth,
              top: y - frame * 0.6 * depth + Math.cos((frame + i * 13) / 35) * 10,
              transform: `scale(${e}) rotate(${frame * (i % 2 ? 0.8 : -0.6) * depth}deg)`,
              opacity: opacity * e,
            }}
          >
            <ShapeSvg kind={kinds[i % kinds.length]} size={size} color={colors[i % colors.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Trait souligné qui se dessine (courbe « coup de pinceau »).
export const DrawUnderline: React.FC<{progress: number; width: number; color?: string; thickness?: number; rtl?: boolean}> = ({
  progress,
  width,
  color = COLORS.lavender,
  thickness = 12,
  rtl = false,
}) => {
  const len = width * 1.05;
  return (
    <svg width={width} height={40} viewBox={`0 0 ${width} 40`} style={{display: 'block', margin: '0 auto', overflow: 'visible'}}>
      <path
        d={rtl ? `M${width - 6} 22 Q${width * 0.5} 6 6 26` : `M6 22 Q${width * 0.5} 6 ${width - 6} 26`}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
    </svg>
  );
};

// Révélation par masque (le texte « sort » d'une fente), sens LTR ou RTL.
export const MaskReveal: React.FC<{progress: number; rtl?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({
  progress,
  rtl = false,
  children,
  style,
}) => {
  const hidden = (1 - progress) * 100;
  return (
    <div
      style={{
        clipPath: rtl ? `inset(-20% 0 -20% ${hidden}%)` : `inset(-20% ${hidden}% -20% 0)`,
        transform: `translateY(${(1 - progress) * 30}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Grain filmique (bruit SVG, renouvelé toutes les 2 images).
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  if (GRAIN_OPACITY <= 0) return null;
  const seed = Math.floor(frame / 2) % 50;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: GRAIN_OPACITY,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: '240px 240px',
      }}
    />
  );
};

// Curseur « doigt » qui se déplace puis tape avec une onde.
export const TapCursor: React.FC<{
  from: {x: number; y: number};
  to: {x: number; y: number};
  moveAt: number;
  tapAt: number;
  hideAt?: number;
}> = ({from, to, moveAt, tapAt, hideAt}) => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [moveAt, tapAt - 2], [0, 1], {...clamp, easing: easeInOutQuint});
  const appear = interpolate(frame, [moveAt - 6, moveAt], [0, 1], clamp);
  const disappear = hideAt === undefined ? 1 : interpolate(frame, [hideAt - 6, hideAt], [1, 0], clamp);
  const press = interpolate(frame, [tapAt - 2, tapAt + 2, tapAt + 8], [1, 0.75, 1], clamp);
  const x = from.x + (to.x - from.x) * move;
  const y = from.y + (to.y - from.y) * move;
  const ripple = interpolate(frame, [tapAt, tapAt + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <>
      {frame >= tapAt && frame < tapAt + 18 ? (
        <div
          style={{
            position: 'absolute',
            left: x - 20 - ripple * 70,
            top: y - 20 - ripple * 70,
            width: 40 + ripple * 140,
            height: 40 + ripple * 140,
            borderRadius: '50%',
            border: `6px solid ${COLORS.violetPin}`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - 34,
          top: y - 34,
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: `6px solid ${COLORS.violet}`,
          boxShadow: '0 12px 30px rgba(40,10,110,0.4)',
          opacity: appear * disappear,
          transform: `scale(${press})`,
        }}
      />
    </>
  );
};

// ---------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------

// Iris : trois disques (lavande, violet, blanc) couvrent l'écran, puis un
// trou s'ouvre au centre pour révéler la scène suivante.
export const CircleWipe: React.FC<{durationInFrames: number; x?: number; y?: number}> = ({durationInFrames, x = 540, y = 860}) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;
  const R = 2300;
  const layers = [COLORS.lavender, COLORS.violet, '#FFFFFF'];
  const hole = interpolate(frame, [half, durationInFrames], [0, R], {...clamp, easing: Easing.in(Easing.cubic)});
  const mask = `radial-gradient(circle at ${x}px ${y}px, transparent ${hole}px, black ${hole + 1}px)`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', WebkitMaskImage: mask, maskImage: mask}}>
      {layers.map((c, i) => {
        const r = interpolate(frame, [i * 2, half], [0, R], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <AbsoluteFill
            key={c}
            style={{background: c, clipPath: `circle(${r}px at ${x}px ${y}px)`}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Bandes diagonales qui balaient l'écran (couvrent puis découvrent).
export const BarsWipe: React.FC<{durationInFrames: number; direction?: 1 | -1}> = ({durationInFrames, direction = 1}) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;
  const colors = [COLORS.violetDeep, COLORS.violet, COLORS.violetPin, COLORS.lavender, '#FFFFFF'];
  const barH = 2600 / colors.length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -700, top: -340, width: 2480, height: 2600, transform: 'rotate(-18deg)'}}>
        {colors.map((c, i) => {
          const d = i * 1.5;
          const inP = interpolate(frame, [d, half + d * 0.3], [0, 1], {...clamp, easing: easeInOutQuint});
          const outP = interpolate(frame, [half + d * 0.4, durationInFrames], [0, 1], {...clamp, easing: easeInOutQuint});
          const x = (-1 + inP + outP) * 2480 * direction;
          return (
            <div
              key={c}
              style={{position: 'absolute', left: 0, top: i * barH, width: 2480, height: barH + 2, background: c, transform: `translateX(${x}px)`}}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
