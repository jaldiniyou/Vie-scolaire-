import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {Camera, Scene as SceneData, Shot} from '../data/scenes';
import {Placeholder} from './Placeholder';
import {clamp, secToFrame} from './utils';

// Durée du fondu enchaîné entre deux plans d'une même scène (images).
export const SHOT_CROSSFADE = 8;

const cameraTransform = (camera: Camera, p: number) => {
  switch (camera) {
    case 'zoomIn':
      return `scale(${1.04 + 0.12 * p})`;
    case 'zoomOut':
      return `scale(${1.16 - 0.12 * p})`;
    case 'panLeft':
      return `scale(1.14) translateX(${30 - 60 * p}px)`;
    case 'panRight':
      return `scale(1.14) translateX(${-30 + 60 * p}px)`;
    case 'panUp':
      return `scale(1.14) translateY(${30 - 60 * p}px)`;
    default:
      return 'scale(1.04)';
  }
};

// Un plan : visuel (image/vidéo) ou placeholder, avec mouvement de caméra doux.
const ShotLayer: React.FC<{shot: Shot; durationInFrames: number}> = ({shot, durationInFrames}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const opacity = interpolate(frame, [0, SHOT_CROSSFADE], [0, 1], clamp);

  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: cameraTransform(shot.camera, p)}}>
        {shot.media === null ? (
          <Placeholder shot={shot} />
        ) : shot.media.type === 'image' ? (
          <Img src={staticFile(shot.media.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <OffthreadVideo
            src={staticFile(shot.media.src)}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scène composée de plans. Les temps des plans sont absolus (secondes) ;
// le composant doit être monté dans une <Sequence from={scene.start}>.
export const Scene: React.FC<{scene: SceneData; children?: React.ReactNode}> = ({scene, children}) => {
  const {fps} = useVideoConfig();
  const sceneStart = secToFrame(scene.start, fps);

  return (
    <AbsoluteFill>
      {scene.shots.map((shot, i) => {
        const from = secToFrame(shot.start, fps) - sceneStart;
        const isLast = i === scene.shots.length - 1;
        // Chaque plan déborde un peu sur le suivant pour permettre le fondu.
        const to = secToFrame(shot.end, fps) - sceneStart + (isLast ? 0 : SHOT_CROSSFADE);
        return (
          <Sequence key={shot.id} from={from} durationInFrames={to - from} name={shot.id}>
            <ShotLayer shot={shot} durationInFrames={to - from} />
          </Sequence>
        );
      })}
      {children}
    </AbsoluteFill>
  );
};
