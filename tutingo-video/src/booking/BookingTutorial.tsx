import {Audio, CalculateMetadataFunction, Sequence, getStaticFiles, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import {Intro, Outro, Perks, Stats, StepCompare, StepSchedule, StepSearch} from './scenes';
import {StepPayment, StepScheduled} from './payment';
import {VOICEOVER, VoManifest} from './voiceover';

// Motion-design tutorial: how a parent or student books a lesson on tutingo.com.

const FPS = 30;
const T = 12;
const VO_DELAY = 8;

// Minimum scene lengths (frames) needed by the on-screen animations.
const SCENES = [
	{id: 'intro', C: Intro, d: 90},
	{id: 'stats', C: Stats, d: 100},
	{id: 'search', C: StepSearch, d: 185},
	{id: 'compare', C: StepCompare, d: 185},
	{id: 'schedule', C: StepSchedule, d: 185},
	{id: 'payment', C: StepPayment, d: 270},
	{id: 'scheduled', C: StepScheduled, d: 200},
	{id: 'perks', C: Perks, d: 120},
	{id: 'outro', C: Outro, d: 120},
];

export type BookingProps = {durations: number[]; withVoice: boolean};

const totalFrames = (durations: number[]) => durations.reduce((a, d) => a + d, 0) - T * (durations.length - 1);

export const DEFAULT_BOOKING_PROPS: BookingProps = {durations: SCENES.map((s) => s.d), withVoice: false};
export const BOOKING_FRAMES = totalFrames(DEFAULT_BOOKING_PROPS.durations);

// When public/vo/manifest.json exists, stretch each scene to fit its voice-over line.
export const calculateBookingMetadata: CalculateMetadataFunction<BookingProps> = async () => {
	if (!getStaticFiles().some((f) => f.name === 'vo/manifest.json')) {
		return {props: DEFAULT_BOOKING_PROPS, durationInFrames: BOOKING_FRAMES};
	}
	const manifest: VoManifest = await (await fetch(staticFile('vo/manifest.json'))).json();
	const durations = SCENES.map((s) =>
		Math.max(s.d, Math.ceil((manifest[s.id] ?? 0) * FPS) + VO_DELAY + T + 10),
	);
	return {props: {durations, withVoice: true}, durationInFrames: totalFrames(durations)};
};

export const BookingTutorial: React.FC<BookingProps> = ({durations, withVoice}) => {
	const starts = durations.map((_, i) => durations.slice(0, i).reduce((a, d) => a + d - T, 0));
	return (
		<>
			<TransitionSeries>
				{SCENES.map(({C}, i) => [
					<TransitionSeries.Sequence key={`s${i}`} durationInFrames={durations[i]}>
						<C />
					</TransitionSeries.Sequence>,
					i < SCENES.length - 1 ? (
						<TransitionSeries.Transition
							key={`t${i}`}
							presentation={i === SCENES.length - 2 ? fade() : slide({direction: 'from-right'})}
							timing={linearTiming({durationInFrames: T})}
						/>
					) : null,
				])}
			</TransitionSeries>
			{starts.slice(1).map((f) => (
				<Sequence key={f} from={f} durationInFrames={15}>
					<Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
				</Sequence>
			))}
			{withVoice
				? VOICEOVER.map((v, i) => (
						<Sequence key={v.id} from={starts[i] + VO_DELAY}>
							<Audio src={staticFile(`vo/${v.id}.mp3`)} />
						</Sequence>
					))
				: null}
		</>
	);
};
