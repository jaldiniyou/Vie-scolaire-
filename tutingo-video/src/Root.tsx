import {Composition} from 'remotion';
import {TutinGoPromo} from './TutinGoPromo';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="TutinGoPromo"
		component={TutinGoPromo}
		durationInFrames={567}
		fps={30}
		width={540}
		height={960}
	/>
);
