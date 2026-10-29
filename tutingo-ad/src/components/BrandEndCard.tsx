import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../data/config';
import {CTA_BEATS, URGENCY_TEXT} from '../data/scenes';
import {LogoCard, Pin} from './Brand';
import {BurstRings, DrawUnderline, FloatingShapes, Sparkles, TapCursor} from './Motion';
import {clamp, darija, darijaStyle, easeOutExpo, fontFamily, isArabic} from './utils';

const LOGO_W = 640;
// Hauteur de la carte logo : image (largeur × 0,3) + 2 × marge verticale (44 × 0,6).
const LOGO_H = LOGO_W * 0.3 + 2 * 44 * 0.6;

// Scène 6 : carte de fin premium. `sceneStart` = début de la scène (secondes),
// les temps forts CTA_BEATS sont absolus et convertis ici en temps relatifs.
export const BrandEndCard: React.FC<{sceneStart: number; durationInFrames: number}> = ({sceneStart, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (abs: number) => Math.round((abs - sceneStart) * fps);
  const sp = (at: number, config: Parameters<typeof spring>[0]['config'] = {damping: 15}) => spring({frame: frame - at, fps, config});

  const bgIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const t = frame / fps;

  // 1) « Ma tdi3och lwe9t ! » -------------------------------------------
  const urg = f(CTA_BEATS.urgency);
  const urgIn = sp(urg, {damping: 9, stiffness: 180});
  const urgOut = interpolate(frame, [f(CTA_BEATS.logo) - 8, f(CTA_BEATS.logo)], [1, 0], clamp);
  const shake = frame >= urg && frame - urg < 10 ? Math.sin((frame - urg) * 2.4) * (10 - (frame - urg)) * 1.6 : 0;
  const clockSweep = interpolate(frame, [urg, f(CTA_BEATS.logo)], [0, 1], clamp);

  // 2) Logo (révélé en iris depuis l'épingle) + site ---------------------
  const logoAt = f(CTA_BEATS.logo);
  const logoIn = sp(logoAt, {damping: 12, stiffness: 120});
  const iris = interpolate(frame, [logoAt, logoAt + 16], [0, 130], {...clamp, easing: easeOutExpo});
  const urlIn = sp(logoAt + 12, {damping: 12});
  const tagAt = f(CTA_BEATS.tagline);
  const tagReveal = interpolate(frame, [tagAt, tagAt + 16], [0, 1], {...clamp, easing: easeOutExpo});
  const tapAt = tagAt + 24;
  const tap = interpolate(frame, [tapAt - 2, tapAt + 2, tapAt + 10], [1, 0.9, 1], clamp);
  const pulse = (at: number) => interpolate(frame, [at, at + 5, at + 18], [0, 1, 0], clamp);
  const brandPulse = 1 + 0.07 * pulse(f(CTA_BEATS.brandCall)) + 0.07 * pulse(f(CTA_BEATS.final));

  // 3) Slogan : la mise en page glisse pour lui faire de la place -------
  const shiftAt = f(CTA_BEATS.slogan[0]) - 10;
  const shift = interpolate(frame, [shiftAt, shiftAt + 14], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const logoTop = interpolate(shift, [0, 1], [550, 380]);
  const groupTop = interpolate(shift, [0, 1], [910, 1090]);
  const logoCenterY = logoTop + LOGO_H / 2;

  const finalFade = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0.92], clamp);

  return (
    <AbsoluteFill style={{fontFamily, opacity: bgIn * finalFade, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${COLORS.violetDeep} 0%, ${COLORS.violet} 45%, ${COLORS.violetPin} 100%)`}} />
      <div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -300 + Math.sin(t * 0.6) * 60, top: -200 + Math.cos(t * 0.5) * 50, background: COLORS.lavender, opacity: 0.35, filter: 'blur(140px)'}} />
      <div style={{position: 'absolute', width: 800, height: 800, borderRadius: '50%', right: -320 + Math.cos(t * 0.5) * 60, bottom: 100 + Math.sin(t * 0.4) * 50, background: '#FFFFFF', opacity: 0.18, filter: 'blur(140px)'}} />

      {/* anneau pointillé qui tourne derrière le logo */}
      <svg
        width={1000}
        height={1000}
        viewBox="0 0 1000 1000"
        style={{position: 'absolute', left: 40, top: logoCenterY - 500, opacity: 0.25 * logoIn, transform: `rotate(${frame * 0.4}deg) scale(${0.6 + 0.4 * logoIn})`}}
      >
        <circle cx="500" cy="500" r="440" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="6 26" strokeLinecap="round" />
        <circle cx="500" cy="500" r="360" fill="none" stroke={COLORS.lavender} strokeWidth={2} />
      </svg>

      <FloatingShapes seed="cta" count={10} opacity={0.5} delay={6} />

      {/* 1) urgence */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: -160, opacity: urgIn * urgOut}}>
        <BurstRings at={urg + 2} x={540} y={760} maxRadius={520} />
        <div style={{transform: `translateX(${shake}px) scale(${0.6 + 0.4 * urgIn})`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <svg width={170} height={170} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={8} />
            <circle cx="60" cy="60" r="48" fill="none" stroke={COLORS.white} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={clockSweep} transform="rotate(-90 60 60)" />
            <path d={`M60 60 L60 32 M60 60 L${60 + 24 * Math.cos(frame / 4)} ${60 + 24 * Math.sin(frame / 4)}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          </svg>
          <div
            style={{
              ...darijaStyle(),
              marginTop: 24,
              maxWidth: 980,
              fontSize: isArabic ? 128 : 104,
              fontWeight: 900,
              color: COLORS.white,
              lineHeight: isArabic ? 1.35 : 1.05,
              textShadow: '0 12px 40px rgba(20,6,70,0.45)',
            }}
          >
            {darija(URGENCY_TEXT)}
          </div>
          <DrawUnderline progress={interpolate(frame, [urg + 6, urg + 20], [0, 1], {...clamp, easing: easeOutExpo})} width={460} rtl={isArabic} thickness={14} />
        </div>
      </AbsoluteFill>

      {/* 2) + 3) logo, slogan, site */}
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: logoTop,
            clipPath: `circle(${iris}% at 88% 40%)`,
            transform: `translateY(${(1 - logoIn) * 50}px) scale(${(0.8 + 0.2 * logoIn) * brandPulse})`,
          }}
        >
          <LogoCard width={LOGO_W} radius={44} padding={44} />
        </div>
        <BurstRings at={logoAt + 4} x={540} y={logoCenterY} maxRadius={560} />
        <Sparkles at={logoAt + 6} x={540} y={logoCenterY} count={14} spread={420} seed="logo" />
        <BurstRings at={f(CTA_BEATS.brandCall)} x={540} y={logoCenterY} count={2} color={COLORS.lavender} maxRadius={480} />
        <BurstRings at={f(CTA_BEATS.final)} x={540} y={logoCenterY} count={2} color={COLORS.lavender} maxRadius={480} />

        {/* slogan officiel, mot par mot sur la voix */}
        <div style={{position: 'absolute', top: 670, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: shift}}>
          {BRAND.slogan.map((w, i) => {
            const at = f(CTA_BEATS.slogan[i]);
            const rise = interpolate(frame, [at, at + 12], [0, 1], {...clamp, easing: easeOutExpo});
            const dot = sp(at + 6, {damping: 7, stiffness: 220});
            return (
              <div key={w} style={{overflow: 'hidden', padding: '0 10px'}}>
                <div
                  style={{
                    transform: `translateY(${(1 - rise) * 110}%) skewY(${(1 - rise) * 6}deg)`,
                    fontSize: 104,
                    fontWeight: 800,
                    letterSpacing: -2,
                    color: COLORS.white,
                    lineHeight: 1.12,
                  }}
                >
                  {w.replace('.', '')}
                  <span style={{display: 'inline-block', color: COLORS.lavender, transform: `scale(${dot * 1.3})`}}>.</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position: 'absolute', top: groupTop, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
          <div
            style={{
              clipPath: `inset(-20% ${(1 - tagReveal) * 100}% -20% 0)`,
              maxWidth: 860,
              textAlign: 'center',
              fontSize: 44,
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'rgba(255,255,255,0.94)',
            }}
          >
            {BRAND.tagline}
          </div>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              opacity: Math.min(1, urlIn * 1.3),
              transform: `translateY(${(1 - urlIn) * 60}px) scale(${(0.7 + 0.3 * urlIn) * tap})`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '26px 56px',
              borderRadius: 999,
              background: COLORS.white,
              color: COLORS.violet,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1,
              boxShadow: '0 24px 60px rgba(20, 6, 70, 0.4)',
            }}
          >
            <Pin size={46} />
            {BRAND.website}
            {/* reflet qui traverse le bouton, rejoué sur les temps forts */}
            {[logoAt + 14, f(CTA_BEATS.final)].map((at) => {
              const x = interpolate(frame, [at, at + 22], [-30, 130], {...clamp, easing: Easing.inOut(Easing.cubic)});
              return (
                <div
                  key={at}
                  style={{position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 90, transform: 'skewX(-20deg)', background: 'linear-gradient(90deg, transparent, rgba(185,164,245,0.6), transparent)'}}
                />
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      <TapCursor from={{x: 920, y: 1560}} to={{x: 600, y: 1120}} moveAt={tapAt - 16} tapAt={tapAt} hideAt={tapAt + 34} />
    </AbsoluteFill>
  );
};
