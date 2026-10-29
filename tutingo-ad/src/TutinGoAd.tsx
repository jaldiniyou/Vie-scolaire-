import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BrandEndCard} from './components/BrandEndCard';
import {LightWipe, LogoBadge} from './components/Brand';
import {BarsWipe, CircleWipe, FloatingShapes, Grain} from './components/Motion';
import {BrightGrade, EveningGrade, HomeArrival, KeywordStack, KineticAccent, TopTitle} from './components/Overlays';
import {Scene} from './components/Scene';
import {SolutionScene} from './components/SolutionScene';
import {Subtitles} from './components/Subtitle';
import {secToFrame} from './components/utils';
import {AUDIO_SRC, COLORS} from './data/config';
import {PARENTS_TITLES, PROBLEM_ACCENTS, QUALITY_KEYWORDS, SCENES, type SceneId} from './data/scenes';
import {SUBTITLES} from './data/subtitles';

const WIPE = 16; // durée des transitions lumineuses (images)
const IRIS = 22; // iris scène 1 → 2
const BARS = 18; // bandes diagonales

export const TutinGoAd: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const sec = (s: number) => secToFrame(s, fps);
  const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;

  // Bornes d'une scène en images ; la dernière s'étire jusqu'à la fin de l'audio.
  const range = (id: SceneId) => {
    const s = scene(id);
    const from = sec(s.start);
    const to = id === 'cta' ? durationInFrames : sec(s.end);
    return {from, durationInFrames: to - from};
  };

  const solution = range('solution');
  const cta = range('cta');

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.night}}>
      <Audio src={staticFile(AUDIO_SRC)} />

      {/* SCÈNE 1 — Le problème */}
      <Sequence {...range('problem')} name="1 · Problème">
        <Scene scene={scene('problem')}>
          <EveningGrade />
          {PROBLEM_ACCENTS.map((a) => (
            <Sequence key={a.latin} from={sec(a.start)} durationInFrames={sec(a.end) - sec(a.start)}>
              <KineticAccent text={a} icon={a.icon} durationInFrames={sec(a.end) - sec(a.start)} />
            </Sequence>
          ))}
        </Scene>
      </Sequence>

      {/* SCÈNE 2 — La solution TutinGo */}
      <Sequence {...solution} name="2 · Solution">
        <SolutionScene durationInFrames={solution.durationInFrames} />
      </Sequence>

      {/* SCÈNE 3 — Le professeur à domicile */}
      <Sequence {...range('teacher')} name="3 · Prof à domicile">
        <Scene scene={scene('teacher')}>
          <BrightGrade />
          <FloatingShapes seed="teacher" colors={[COLORS.violet, COLORS.lavender]} opacity={0.4} />
          <HomeArrival text="À domicile" />
        </Scene>
      </Sequence>

      {/* SCÈNE 4 — La qualité des révisions */}
      <Sequence {...range('quality')} name="4 · Qualité">
        <Scene scene={scene('quality')}>
          <BrightGrade />
          <FloatingShapes seed="quality" colors={[COLORS.violet, COLORS.violetPin]} opacity={0.35} />
          <KeywordStack
            words={QUALITY_KEYWORDS.map((k) => ({text: k.text, atFrame: sec(k.at) - sec(scene('quality').start)}))}
          />
        </Scene>
      </Sequence>

      {/* SCÈNE 5 — La tranquillité des parents */}
      <Sequence {...range('parents')} name="5 · Parents">
        <Scene scene={scene('parents')}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(40,12,110,0.55) 0%, rgba(40,12,110,0) 40%)'}} />
          <FloatingShapes seed="parents" colors={[COLORS.white, COLORS.lavender]} opacity={0.55} />
          {PARENTS_TITLES.map((t) => (
            <Sequence
              key={t.latin}
              from={sec(t.start) - sec(scene('parents').start)}
              durationInFrames={sec(t.end) - sec(t.start)}
            >
              <TopTitle text={t} durationInFrames={sec(t.end) - sec(t.start)} />
            </Sequence>
          ))}
        </Scene>
      </Sequence>

      {/* SCÈNE 6 — Appel à l'action */}
      <Sequence {...cta} name="6 · CTA">
        <BrandEndCard sceneStart={scene('cta').start} durationInFrames={cta.durationInFrames} />
      </Sequence>

      {/* Logo discret pendant les scènes 3 à 5 */}
      <Sequence from={sec(scene('teacher').start)} durationInFrames={sec(scene('parents').end) - sec(scene('teacher').start)} name="Logo">
        <LogoBadge durationInFrames={sec(scene('parents').end) - sec(scene('teacher').start)} />
      </Sequence>

      {/* Transitions lumineuses aux changements d'univers */}
      <Sequence from={solution.from - IRIS / 2} durationInFrames={IRIS} name="Iris → solution">
        <CircleWipe durationInFrames={IRIS} />
      </Sequence>
      <Sequence from={sec(scene('teacher').start) - BARS / 2} durationInFrames={BARS} name="Bandes → prof">
        <BarsWipe durationInFrames={BARS} />
      </Sequence>
      <Sequence from={sec(scene('quality').start) - WIPE / 2} durationInFrames={WIPE} name="Flash → qualité">
        <LightWipe durationInFrames={WIPE} color="#FFFFFF" />
      </Sequence>
      <Sequence from={sec(scene('parents').start) - WIPE / 2} durationInFrames={WIPE} name="Flash → parents">
        <LightWipe durationInFrames={WIPE} />
      </Sequence>
      <Sequence from={cta.from - BARS / 2} durationInFrames={BARS} name="Bandes → CTA">
        <BarsWipe durationInFrames={BARS} direction={-1} />
      </Sequence>

      {/* Sous-titres au-dessus de tout, puis grain filmique */}
      <Subtitles cues={SUBTITLES} />
      <Grain />
    </AbsoluteFill>
  );
};
