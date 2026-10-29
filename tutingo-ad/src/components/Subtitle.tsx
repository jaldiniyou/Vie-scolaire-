import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, SUBTITLE_OFFSET_SEC} from '../data/config';
import type {SubtitleCue} from '../data/subtitles';
import {clamp, fontFamily} from './utils';

// Zone sûre Reels/TikTok : on reste au-dessus des boutons et de la légende
// (≈ 380 px du bas) et dans une largeur de 920 px (80 px de marge par côté).
const BOTTOM = 400;
const MAX_WIDTH = 920;

const fontSizeFor = (text: string) => (text.length > 34 ? 52 : 58);

const Cue: React.FC<{cue: SubtitleCue; startFrame: number; endFrame: number}> = ({cue, startFrame, endFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;
  const duration = endFrame - startFrame;

  const enter = spring({frame: local, fps, config: {damping: 200, mass: 0.6}, durationInFrames: 10});
  const exit = interpolate(frame, [endFrame - 5, endFrame], [1, 0], clamp);

  const words = cue.text.split(' ');
  // Révélation mot par mot sur la première moitié de la réplique.
  const revealSpan = Math.max(6, Math.min(duration * 0.55, words.length * 5));
  const highlight = new Set(cue.highlight ?? []);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: BOTTOM,
        display: 'flex',
        justifyContent: 'center',
        opacity: exit,
        transform: `translateY(${(1 - enter) * 24}px) scale(${0.96 + 0.04 * enter})`,
      }}
    >
      <div
        style={{
          maxWidth: MAX_WIDTH,
          padding: '20px 34px 24px',
          borderRadius: 28,
          background: 'rgba(18, 11, 42, 0.62)',
          boxShadow: '0 12px 40px rgba(18, 11, 42, 0.35)',
          borderBottom: `5px solid ${COLORS.violetPin}`,
          textAlign: 'center',
          fontFamily,
          fontWeight: 700,
          fontSize: fontSizeFor(cue.text),
          lineHeight: 1.22,
          color: COLORS.white,
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
          // 2 lignes max garanties par la longueur des répliques (≤ ~40 car.)
          overflowWrap: 'break-word',
        }}
      >
        {words.map((w, i) => {
          const t = (i / Math.max(1, words.length)) * revealSpan;
          const o = interpolate(local, [t, t + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const y = interpolate(local, [t, t + 6], [10, 0], clamp);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: o,
                transform: `translateY(${y}px)`,
                color: highlight.has(w) ? COLORS.lavender : undefined,
                marginRight: i < words.length - 1 ? '0.26em' : 0,
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
