import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../data/config';
import {Pin} from './Brand';
import {BurstRings, DrawUnderline, MaskReveal, Sparkles} from './Motion';
import {clamp, darija, darijaStyle, easeOutExpo, fadeInOut, fontFamily, isArabic, type Darija} from './utils';

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

// Scène 1 : mot-clé en très grand (typographie cinétique) + pictogramme animé.
export const KineticAccent: React.FC<{text: Darija; durationInFrames: number; icon: 'none' | 'question' | 'clock'}> = ({
  text,
  durationInFrames,
  icon,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: easeOutExpo});
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  const drift = interpolate(frame, [0, durationInFrames], [0, -24]);
  const iconIn = spring({frame: frame - 4, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill style={{top: 250, alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${drift}px)`}}>
        {icon === 'clock' ? (
          <svg width={130} height={130} viewBox="0 0 120 120" style={{transform: `scale(${iconIn})`, marginBottom: 6}}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={9} />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={COLORS.warm}
              strokeWidth={9}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={interpolate(frame, [0, durationInFrames], [0, 1], clamp)}
              transform="rotate(-90 60 60)"
            />
            <path d={`M60 60 L${60 + 30 * Math.sin(frame / 3)} ${60 - 30 * Math.cos(frame / 3)}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          </svg>
        ) : null}
        {icon === 'question' ? (
          <div style={{position: 'relative', width: 0, height: 0}}>
            {[-260, 250].map((x, i) => (
              <div
                key={x}
                style={{
                  position: 'absolute',
                  left: x - 40,
                  top: 20 + i * 60,
                  fontFamily,
                  fontSize: 110,
                  fontWeight: 800,
                  color: COLORS.warm,
                  opacity: 0.85,
                  transform: `scale(${spring({frame: frame - 6 - i * 5, fps, config: {damping: 8}})}) rotate(${Math.sin((frame + i * 20) / 8) * 14}deg)`,
                }}
              >
                ?
              </div>
            ))}
          </div>
        ) : null}
        <MaskReveal progress={reveal} rtl={isArabic}>
          <div
            style={{
              ...darijaStyle(),
              fontSize: isArabic ? 150 : 120,
              fontWeight: 900,
              lineHeight: 1.25,
              color: COLORS.white,
              textShadow: `0 0 60px rgba(242,166,90,0.55), 0 10px 30px rgba(0,0,0,0.45)`,
              letterSpacing: isArabic ? 0 : -3,
            }}
          >
            {darija(text)}
          </div>
        </MaskReveal>
        <DrawUnderline
          progress={interpolate(frame, [6, 20], [0, 1], {...clamp, easing: easeOutExpo})}
          width={360}
          color={COLORS.warm}
          rtl={isArabic}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scène 3 : épingle qui tombe sur la maison + trajet pointillé qui se trace
// (« yjiw 7ta ldarkom ») + chip « À domicile ».
export const HomeArrival: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const route = interpolate(frame, [0, 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const drop = spring({frame: frame - 22, fps, config: {damping: 9, stiffness: 140}});
  const chip = spring({frame: frame - 30, fps, config: {damping: 13}});
  const pinX = 540;
  const pinY = 420;
  const path = `M -40 980 C 160 860, 120 600, 330 560 S 470 470, ${pinX} ${pinY + 40}`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <mask id="route-mask">
            <path d={path} fill="none" stroke="#fff" strokeWidth={30} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - route} />
          </mask>
        </defs>
        <path d={path} fill="none" stroke={COLORS.violet} strokeWidth={12} strokeLinecap="round" strokeDasharray="4 30" mask="url(#route-mask)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: pinX - 45,
          top: pinY - 112 + (1 - drop) * -500,
          opacity: drop > 0.01 ? 1 : 0,
          transform: `scaleY(${0.85 + 0.15 * drop})`,
          transformOrigin: 'bottom',
          filter: 'drop-shadow(0 18px 20px rgba(74,31,176,0.35))',
        }}
      >
        <Pin size={90} />
      </div>
      <BurstRings at={30} x={pinX} y={pinY + 40} color={COLORS.violet} maxRadius={260} />
      <div
        style={{
          position: 'absolute',
          top: pinY + 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily,
            padding: '16px 36px',
            borderRadius: 999,
            background: COLORS.white,
            color: COLORS.violet,
            fontWeight: 800,
            fontSize: 46,
            boxShadow: '0 20px 50px rgba(74,31,176,0.35)',
            opacity: chip,
            transform: `scale(${0.6 + 0.4 * chip})`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const KeywordIcon: React.FC<{i: number; progress: number}> = ({i, progress}) => {
  const d = ['M14 26l9 9 17-19', 'M10 32l9-9 7 7 14-14M32 16h8v8', 'M12 38h8V28h8V20h8v-8'][i % 3];
  return (
    <svg width={56} height={56} viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="25" fill="rgba(255,255,255,0.22)" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
    </svg>
  );
};

// Scène 4 : mots-clés empilés, pictogramme qui se dessine, barre de progression.
export const KeywordStack: React.FC<{words: {text: string; atFrame: number}[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lastAt = words[words.length - 1].atFrame;
  const bar = interpolate(frame, [lastAt, lastAt + 22], [0, 1], {...clamp, easing: easeOutExpo});
  return (
    <AbsoluteFill style={{top: 250, alignItems: 'center', gap: 20, fontFamily}}>
      {words.map((w, i) => {
        const e = spring({frame: frame - w.atFrame, fps, config: {damping: 11, stiffness: 160}});
        const draw = interpolate(frame, [w.atFrame + 4, w.atFrame + 16], [0, 1], {...clamp, easing: easeOutExpo});
        const isLatest = words.filter((x) => x.atFrame <= frame).length - 1 === i;
        return (
          <div key={w.text} style={{position: 'relative'}}>
            <div
              style={{
                opacity: Math.min(1, e * 1.4),
                transform: `translateX(${(1 - e) * (i % 2 === 0 ? -400 : 400)}px) rotate(${(1 - e) * (i % 2 === 0 ? -8 : 8)}deg) scale(${isLatest ? 1.06 : 0.92})`,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '14px 40px 14px 18px',
                borderRadius: 999,
                fontSize: 62,
                fontWeight: 800,
                letterSpacing: -1,
                color: isLatest ? COLORS.white : COLORS.violet,
                background: isLatest ? `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.violetPin})` : 'rgba(255,255,255,0.94)',
                boxShadow: isLatest ? '0 22px 50px rgba(74,31,176,0.5)' : '0 12px 30px rgba(74,31,176,0.2)',
              }}
            >
              <KeywordIcon i={i} progress={draw} />
              {w.text}
            </div>
            <div style={{position: 'absolute', left: '50%', top: '50%'}}>
              <Sparkles at={w.atFrame + 3} x={0} y={0} color={COLORS.violetPin} seed={w.text} spread={300} />
            </div>
          </div>
        );
      })}
      {/* barre « Progresser » */}
      <div style={{width: 560, height: 22, borderRadius: 22, background: 'rgba(255,255,255,0.7)', marginTop: 10, overflow: 'hidden', opacity: bar > 0 ? 1 : 0}}>
        <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 22, background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.violetPin})`}} />
      </div>
    </AbsoluteFill>
  );
};

// Scène 5 : grand titre darija, révélé par masque, souligné qui se dessine.
export const TopTitle: React.FC<{text: Darija; durationInFrames: number}> = ({text, durationInFrames}) => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, 0, durationInFrames, 8);
  const reveal = interpolate(frame, [0, 16], [0, 1], {...clamp, easing: easeOutExpo});
  const underline = interpolate(frame, [10, 28], [0, 1], {...clamp, easing: easeOutExpo});
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  return (
    <AbsoluteFill style={{top: 280, alignItems: 'center', opacity}}>
      <div style={{maxWidth: 940, textAlign: 'center', transform: `scale(${scale})`}}>
        <MaskReveal progress={reveal} rtl={isArabic}>
          <div
            style={{
              ...darijaStyle(),
              fontSize: isArabic ? 84 : 70,
              fontWeight: 900,
              lineHeight: isArabic ? 1.4 : 1.12,
              color: COLORS.white,
              textShadow: '0 6px 30px rgba(40,10,110,0.55)',
            }}
          >
            {darija(text)}
          </div>
        </MaskReveal>
        <div style={{marginTop: 6}}>
          <DrawUnderline progress={underline} width={340} rtl={isArabic} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
