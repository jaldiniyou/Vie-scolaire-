import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, SUBTITLE_OFFSET_SEC} from '../data/config';
import type {SubtitleCue} from '../data/subtitles';
import {clamp, darijaStyle, easeOutExpo, isArabic} from './utils';

// Zone sûre Reels/TikTok : on reste au-dessus des boutons et de la légende
// (≈ 380 px du bas) et dans une largeur de 920 px (80 px de marge par côté).
const BOTTOM = 400;
const MAX_WIDTH = 920;

const fontSizeFor = (text: string) => {
  if (isArabic) return text.length > 26 ? 56 : 64;
  return text.length > 34 ? 52 : 58;
};

// Style « karaoké » : la réplique entière apparaît en atténué, chaque mot
// s'illumine quand il est prononcé, le mot en cours est posé sur une pastille.
// Les instants de chaque mot sont répartis selon la longueur des mots.
const Cue: React.FC<{cue: SubtitleCue; startFrame: number; endFrame: number}> = ({cue, startFrame, endFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;
  const duration = endFrame - startFrame;

  const text = isArabic ? cue.ar : cue.text;
  const highlight = new Set((isArabic ? cue.arHighlight : cue.highlight) ?? []);
  const words = text.split(' ');

  const weights = words.map((w) => Math.max(2, w.length));
  const total = weights.reduce((a, b) => a + b, 0);
  const speechSpan = duration * 0.9;
  let acc = 0;
  const wordStart = weights.map((w) => {
    const t = (acc / total) * speechSpan;
    acc += w;
    return t;
  });

  const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 160}});
  const exit = interpolate(frame, [endFrame - 5, endFrame], [1, 0], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: BOTTOM,
        display: 'flex',
        justifyContent: 'center',
        opacity: exit * Math.min(1, enter * 1.5),
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.9 + 0.1 * enter})`,
      }}
    >
      <div
        style={{
          ...darijaStyle(),
          maxWidth: MAX_WIDTH,
          padding: isArabic ? '10px 30px 18px' : '20px 34px 24px',
          borderRadius: 30,
          background: 'rgba(18, 11, 42, 0.68)',
          boxShadow: '0 14px 44px rgba(18, 11, 42, 0.4)',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: fontSizeFor(text),
          lineHeight: isArabic ? 1.55 : 1.25,
          color: COLORS.white,
          overflowWrap: 'break-word',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* liseré violet qui se dessine à l'entrée */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            [isArabic ? 'right' : 'left']: 0,
            height: 6,
            width: `${interpolate(local, [0, 14], [0, 100], {...clamp, easing: easeOutExpo})}%`,
            background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.violetPin})`,
          }}
        />
        {words.map((w, i) => {
          const t = wordStart[i];
          const next = i < words.length - 1 ? wordStart[i + 1] : speechSpan;
          const lit = interpolate(local, [t - 1, t + 3], [0, 1], clamp);
          const active = local >= t && local < next;
          const pop = spring({frame: local - t, fps, config: {damping: 10, stiffness: 220}});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                position: 'relative',
                padding: '0 0.14em',
                margin: '0 0.04em',
                borderRadius: 14,
                color: highlight.has(w) ? COLORS.lavender : COLORS.white,
                opacity: 0.38 + 0.62 * lit,
                transform: `scale(${local >= t ? 1 + 0.08 * (1 - pop) + (active ? 0.04 : 0) : 1})`,
                background: active ? COLORS.violetPin : 'transparent',
                boxShadow: active ? '0 6px 18px rgba(114,25,227,0.55)' : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Subtitles: React.FC<{cues: SubtitleCue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cues.map((cue, i) => {
        if (cue.hide) return null;
        const startFrame = Math.round((cue.start + SUBTITLE_OFFSET_SEC) * fps);
        const endFrame = Math.round((cue.end + SUBTITLE_OFFSET_SEC) * fps);
        if (frame < startFrame || frame >= endFrame) return null;
        return <Cue key={i} cue={cue} startFrame={startFrame} endFrame={endFrame} />;
      })}
    </AbsoluteFill>
  );
};
