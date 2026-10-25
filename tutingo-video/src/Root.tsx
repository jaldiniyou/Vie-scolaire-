import {Composition} from 'remotion';
import {TOTAL_FRAMES, TutinGoPromo} from './TutinGoPromo';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="TutinGoPromo"
		component={TutinGoPromo}
		durationInFrames={TOTAL_FRAMES}
		fps={30}
		width={540}
		height={960}
	/>
);
