import React from 'react';
import {Composition, staticFile, type CalculateMetadataFunction} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {TutinGoAd} from './TutinGoAd';
import {AUDIO_DURATION_FALLBACK_SEC, AUDIO_SRC, VIDEO} from './data/config';

// La durée de la composition = durée réelle de la voix off, arrondie à
// l'image supérieure pour ne jamais couper les dernières paroles.
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  let seconds = AUDIO_DURATION_FALLBACK_SEC;
  try {
    seconds = await getAudioDurationInSeconds(staticFile(AUDIO_SRC));
  } catch (e) {
    console.warn('Durée audio illisible, valeur de secours utilisée :', e);
  }
  return {durationInFrames: Math.ceil(seconds * VIDEO.fps)};
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TutinGoAd"
    component={TutinGoAd}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={Math.ceil(AUDIO_DURATION_FALLBACK_SEC * VIDEO.fps)}
    defaultProps={{}}
    calculateMetadata={calculateMetadata}
  />
);
