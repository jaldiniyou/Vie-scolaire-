import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLORS} from '../data/config';
import {CTA_BEATS} from '../data/scenes';
import {LogoCard, Pin} from './Brand';
import {clamp, fontFamily} from './utils';

// Scène 6 : carte de fin premium. `sceneStart` = début de la scène (secondes),
// les temps forts CTA_BEATS sont absolus et convertis ici en temps relatifs.
export const BrandEndCard: React.FC<{sceneStart: number; durationInFrames: number}> = ({sceneStart, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (abs: number) => Math.round((abs - sceneStart) * fps);
  const sp = (at: number, config = {damping: 15}) => spring({frame: frame - at, fps, config});

  const bgIn = interpolate(frame, [0, 10], [0, 1], clamp);

  // 1) « Ma tdi3och lwe9t ! » -------------------------------------------
  const urgIn = sp(f(CTA_BEATS.urgency), {damping: 11});
  const urgOut = interpolate(frame, [f(CTA_BEATS.logo) - 8, f(CTA_BEATS.logo)], [1, 0], clamp);

  // 2) Logo + site ------------------------------------------------------
  const logoIn = sp(f(CTA_BEATS.logo), {damping: 13});
  const urlIn = sp(f(CTA_BEATS.logo) + 12);
  const tagIn = sp(f(CTA_BEATS.tagline));
  const tap = interpolate(
    frame,
    [f(CTA_BEATS.tagline) + 20, f(CTA_BEATS.tagline) + 26, f(CTA_BEATS.tagline) + 34],
    [1, 0.92, 1],
    clamp,
  );
  const brandPulse =
    1 +
    0.06 *
      interpolate(frame, [f(CTA_BEATS.brandCall), f(CTA_BEATS.brandCall) + 6, f(CTA_BEATS.brandCall) + 18], [0, 1, 0], clamp) +
    0.06 * interpolate(frame, [f(CTA_BEATS.final), f(CTA_BEATS.final) + 6, f(CTA_BEATS.final) + 18], [0, 1, 0], clamp);

  // 3) Slogan : la mise en page glisse pour lui faire de la place -------
  const shift = sp(f(CTA_BEATS.slogan[0]) - 10, {damping: 200});
  const sloganWords = BRAND.slogan.map((w, i) => ({w, e: sp(f(CTA_BEATS.slogan[i]), {damping: 12})}));

  // Légère respiration du fond + sortie très courte sur la dernière image.
  const t = frame / fps;
  const finalFade = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0.92], clamp);

  return (
    <AbsoluteFill style={{fontFamily, opacity: bgIn * finalFade, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${COLORS.violetDeep} 0%, ${COLORS.violet} 45%, ${COLORS.violetPin} 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          left: -300 + Math.sin(t * 0.6) * 60,
          top: -200 + Math.cos(t * 0.5) * 50,
          background: COLORS.lavender,
          opacity: 0.35,
          filter: 'blur(140px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          right: -320 + Math.cos(t * 0.5) * 60,
          bottom: 100 + Math.sin(t * 0.4) * 50,
          background: '#FFFFFF',
          opacity: 0.18,
          filter: 'blur(140px)',
        }}
      />

      {/* 1) urgence */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: -160, opacity: urgIn * urgOut}}>
        <div style={{transform: `scale(${0.7 + 0.3 * urgIn})`, textAlign: 'center'}}>
          <svg width={150} height={150} viewBox="0 0 120 120" fill="none" stroke={COLORS.white} strokeWidth={7} strokeLinecap="round">
            <circle cx="60" cy="60" r="48" />
            <path d={`M60 60 L60 ${30} M60 60 L${60 + 22 * Math.cos(frame / 6)} ${60 + 22 * Math.sin(frame / 6)}`} />
          </svg>
          <div style={{marginTop: 30, fontSize: 104, fontWeight: 800, color: COLORS.white, letterSpacing: -2, lineHeight: 1.05}}>
            Ma tdi3och
            <br />
            <span style={{color: COLORS.lavender}}>lwe9t !</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* 2) + 3) logo, slogan, site */}
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: interpolate(shift, [0, 1], [550, 380]),
            opacity: logoIn,
            transform: `translateY(${(1 - logoIn) * 60}px) scale(${(0.85 + 0.15 * logoIn) * brandPulse})`,
          }}
        >
          <LogoCard width={640} radius={44} padding={44} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 670,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: shift,
          }}
        >
          {sloganWords.map(({w, e}) => (
            <div
              key={w}
              style={{
                opacity: e,
                transform: `translateY(${(1 - e) * 40}px) scale(${0.8 + 0.2 * e})`,
                fontSize: 104,
                fontWeight: 800,
                letterSpacing: -2,
                color: COLORS.white,
                lineHeight: 1.1,
              }}
            >
              {w.replace('.', '')}
              <span style={{color: COLORS.lavender}}>.</span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: interpolate(shift, [0, 1], [910, 1090]),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 34,
          }}
        >
          <div
            style={{
              opacity: tagIn,
              transform: `translateY(${(1 - tagIn) * 20}px)`,
              maxWidth: 860,
              textAlign: 'center',
              fontSize: 44,
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            {BRAND.tagline}
          </div>
          <div
            style={{
              opacity: urlIn,
              transform: `translateY(${(1 - urlIn) * 40}px) scale(${tap})`,
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
          </div>
        </div>
      </AbsoluteFill>

      {/* reflet qui traverse le bouton à l'arrivée du site */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: 0.35,
          background: `linear-gradient(100deg, transparent ${interpolate(frame, [f(CTA_BEATS.logo), f(CTA_BEATS.logo) + 30], [-40, 120], {...clamp, easing: Easing.inOut(Easing.cubic)})}%, rgba(255,255,255,0.6) ${interpolate(frame, [f(CTA_BEATS.logo), f(CTA_BEATS.logo) + 30], [-30, 130], {...clamp, easing: Easing.inOut(Easing.cubic)})}%, transparent ${interpolate(frame, [f(CTA_BEATS.logo), f(CTA_BEATS.logo) + 30], [-20, 140], {...clamp, easing: Easing.inOut(Easing.cubic)})}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
