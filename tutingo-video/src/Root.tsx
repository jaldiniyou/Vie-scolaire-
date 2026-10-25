import {Composition} from 'remotion';
import {TOTAL_FRAMES, TutinGoPromo} from './TutinGoPromo';
import {BOOKING_FRAMES, BookingTutorial, DEFAULT_BOOKING_PROPS, calculateBookingMetadata} from './booking/BookingTutorial';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="TutinGoPromo"
			component={TutinGoPromo}
			durationInFrames={TOTAL_FRAMES}
			fps={30}
			width={540}
			height={960}
		/>
		<Composition
			id="BookingTutorial"
			component={BookingTutorial}
			durationInFrames={BOOKING_FRAMES}
			defaultProps={DEFAULT_BOOKING_PROPS}
			calculateMetadata={calculateBookingMetadata}
			fps={30}
			width={1080}
			height={1920}
		/>
	</>
);
