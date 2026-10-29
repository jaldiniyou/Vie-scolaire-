import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../data/config';
import {DEMO_TEACHERS} from '../data/scenes';
import {Pin} from './Brand';
import {BurstRings, FloatingShapes, Sparkles, TapCursor} from './Motion';
import {clamp, fontFamily} from './utils';

// Scène 2 : univers lumineux violet/blanc + smartphone avec recherche de
// professeurs. Les temps (`at`) sont en secondes RELATIVES au début de scène.
const T = {
  pin: 0.05, // « M3a TutinGo »
  phoneIn: 0.1,
  typing: [1.2, 2.6] as const, // pendant « l7ell wlla sahal ! »
  cards: 2.8, // « Kanwafro likom asatida mkhtarin »
  select: 5.0, // « w vérifiés »
};

const SUBJECT_BUBBLES = [
  {label: 'Maths', x: 30, y: 560, color: '#6531DC'},
  {label: 'Français', x: 790, y: 440, color: '#F2A65A'},
  {label: 'Physique', x: 40, y: 930, color: '#22B07D'},
  {label: 'Anglais', x: 800, y: 1040, color: '#E0457B'},
];

const SEARCH_TEXT = 'Mathématiques · Casablanca';

const PHONE_W = 600;
const PHONE_H = 1080;

const TeacherCard: React.FC<{t: (typeof DEMO_TEACHERS)[number]; appear: number; selected: number}> = ({
  t,
  appear,
  selected,
}) => (
  <div
    style={{
      opacity: appear,
      transform: `translateX(${(1 - appear) * 120}px) scale(${1 + selected * 0.04})`,
      background: COLORS.white,
      borderRadius: 26,
      padding: 22,
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      boxShadow: `0 10px 30px rgba(101, 49, 220, ${0.12 + selected * 0.25})`,
      border: `3px solid rgba(101, 49, 220, ${selected})`,
    }}
  >
    {/* Emplacement photo : remplacer par <Img> si des photos de profs sont fournies */}
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        flexShrink: 0,
        background: `linear-gradient(135deg, ${COLORS.lavender}, ${COLORS.violet})`,
        color: COLORS.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34,
        fontWeight: 700,
      }}
    >
      {t.initials}
    </div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: 30, fontWeight: 700, color: COLORS.ink}}>{t.name}</div>
      <div style={{fontSize: 24, fontWeight: 600, color: COLORS.violet, marginTop: 2}}>{t.subject}</div>
      <div style={{fontSize: 21, color: '#6B6489', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6}}>
        <Pin size={16} /> {t.city} · {t.level}
      </div>
    </div>
  </div>
);

export const SolutionScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = (sec: number) => sec * fps;

  const phone = spring({frame: frame - s(T.phoneIn), fps, config: {damping: 18, mass: 0.9, stiffness: 90}});
  const typed = Math.round(
    interpolate(frame, [s(T.typing[0]), s(T.typing[1])], [0, SEARCH_TEXT.length], clamp),
  );
  const selected = spring({frame: frame - s(T.select), fps, config: {damping: 14}});
  // Zoom final vers la carte choisie, qui prépare la scène suivante.
  const outZoom = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 1.25], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const floatY = Math.sin(frame / 28) * 8;
  // Arrivée en 3D : le téléphone pivote puis se pose face caméra.
  const rotY = interpolate(phone, [0, 1], [38, -4]) + Math.sin(frame / 40) * 3;
  const rotX = interpolate(phone, [0, 1], [18, 4]);
  const pinDrop = spring({frame: frame - s(T.pin), fps, config: {damping: 9, stiffness: 150}});

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        background: `radial-gradient(110% 70% at 50% 25%, #FFFFFF 0%, ${COLORS.lavenderLight} 45%, ${COLORS.lavender} 100%)`,
      }}
    >
      {/* halos violets */}
      <div style={{position: 'absolute', width: 700, height: 700, borderRadius: '50%', left: -260, top: 1080, background: COLORS.violet, opacity: 0.25, filter: 'blur(120px)'}} />
      <div style={{position: 'absolute', width: 600, height: 600, borderRadius: '50%', right: -240, top: 160, background: COLORS.violetPin, opacity: 0.2, filter: 'blur(120px)'}} />

      <FloatingShapes seed="solution" colors={[COLORS.violet, COLORS.lavender, COLORS.violetPin]} opacity={0.45} delay={6} />

      <AbsoluteFill style={{alignItems: 'center', top: 250, perspective: 1800}}>
        <div
          style={{
            width: PHONE_W,
            height: PHONE_H,
            borderRadius: 72,
            background: COLORS.ink,
            padding: 16,
            boxShadow: '0 50px 120px rgba(60, 20, 150, 0.45)',
            transform: `translateY(${(1 - phone) * 900 + floatY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${outZoom})`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: 58,
              background: '#F7F4FF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '64px 26px 26px',
              gap: 22,
            }}
          >
            {/* encoche */}
            <div style={{position: 'absolute', left: '50%', top: 34, width: 150, height: 34, marginLeft: -75, borderRadius: 20, background: COLORS.ink}} />

            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div style={{width: 300, height: 90, overflow: 'hidden'}}>
                <Img src={staticFile(BRAND.logo)} style={{width: 300, display: 'block', marginTop: -10}} />
              </div>
            </div>

            <div style={{fontSize: 34, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2}}>
              Trouvez le prof idéal,
              <br />
              <span style={{color: COLORS.violet}}>à domicile.</span>
            </div>

            {/* barre de recherche */}
            <div
              style={{
                background: COLORS.white,
                borderRadius: 999,
                padding: '20px 26px',
                fontSize: 25,
                color: typed > 0 ? COLORS.ink : '#9A93B8',
                boxShadow: '0 6px 20px rgba(101,49,220,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={COLORS.violet} strokeWidth={2.6} strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <span>
                {typed > 0 ? SEARCH_TEXT.slice(0, typed) : 'Matière, niveau, ville…'}
                {typed > 0 && typed < SEARCH_TEXT.length ? <span style={{color: COLORS.violet}}>|</span> : null}
              </span>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
              {DEMO_TEACHERS.map((t, i) => {
                const appear = spring({frame: frame - s(T.cards) - i * 6, fps, config: {damping: 16}});
                return <TeacherCard key={t.name} t={t} appear={appear} selected={i === 0 ? selected : 0} />;
              })}
            </div>

            <div
              style={{
                marginTop: 'auto',
                background: COLORS.violet,
                color: COLORS.white,
                borderRadius: 999,
                textAlign: 'center',
                padding: '22px 0',
                fontSize: 28,
                fontWeight: 700,
                opacity: selected,
                transform: `scale(${0.9 + 0.1 * selected})`,
              }}
            >
              Réserver un cours
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* bulles de matières flottantes */}
      {SUBJECT_BUBBLES.map((b, i) => {
        const e = spring({frame: frame - s(T.cards) - 8 - i * 5, fps, config: {damping: 10, stiffness: 140}});
        return (
          <div
            key={b.label}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y + Math.sin((frame + i * 25) / 22) * 14,
              opacity: e,
              transform: `scale(${e * outZoom}) rotate(${Math.sin((frame + i * 30) / 30) * 4}deg)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 26px',
              borderRadius: 999,
              background: COLORS.white,
              boxShadow: '0 16px 40px rgba(74,31,176,0.3)',
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.ink,
            }}
          >
            <span style={{width: 18, height: 18, borderRadius: '50%', background: b.color}} />
            {b.label}
          </div>
        );
      })}

      {/* épingle TutinGo qui tombe au moment de « M3a TutinGo » */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 48,
          top: 92 + (1 - pinDrop) * -400,
          transform: `scaleY(${0.8 + 0.2 * pinDrop})`,
          transformOrigin: 'bottom',
          filter: 'drop-shadow(0 16px 18px rgba(74,31,176,0.4))',
        }}
      >
        <Pin size={96} />
      </div>
      <BurstRings at={s(T.pin) + 8} x={540} y={200} color={COLORS.violetPin} maxRadius={360} />
      <Sparkles at={s(T.pin) + 8} x={540} y={170} color={COLORS.violet} seed="pin" spread={240} />

      {/* le doigt choisit le premier professeur */}
      <TapCursor from={{x: 900, y: 1250}} to={{x: 560, y: 720}} moveAt={s(T.select) - 16} tapAt={s(T.select)} hideAt={durationInFrames - 10} />
    </AbsoluteFill>
  );
};
