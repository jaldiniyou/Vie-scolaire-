import {
	AbsoluteFill,
	Audio,
	Img,
	OffthreadVideo,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/700.css';
import {captions} from './captions';
import {FLASH_FRAMES, Overlays, ProgressBar} from './Overlays';
import {SignupCard} from './SignupCard';
import {FONT} from './theme';

// Timeline (frames @30fps). The source clip is 567 frames but its audio runs to
// 19.1s, so the voice track plays to the end and fades out under the end card.
export const VIDEO_FRAMES = 567;
export const AUDIO_FRAMES = 573;
export const CARD_FROM = 555;
export const CARD_FRAMES = 165;
export const TOTAL_FRAMES = CARD_FROM + CARD_FRAMES;

// Bounding box of the old purple "TutinGo" banner in the source video.
const OLD_LOGO = {left: 82, top: 832, width: 360, height: 86};
const PAD = 10;

const Logo: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: OLD_LOGO.left - PAD,
			top: OLD_LOGO.top - PAD,
			width: OLD_LOGO.width + PAD * 2,
			height: OLD_LOGO.height + PAD * 2,
			background: 'white',
			borderRadius: 18,
			boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<Img src={staticFile('logo.png')} style={{height: 76}} />
	</div>
);

const CaptionLine: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 14, stiffness: 180}});
	const scale = interpolate(pop, [0, 1], [0.85, 1]);

	return (
		<AbsoluteFill
			style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 190}}
		>
			<div
				dir="rtl"
				style={{
					transform: `scale(${scale})`,
					opacity: pop,
					maxWidth: 480,
					padding: '8px 18px',
					borderRadius: 14,
					background: 'rgba(0,0,0,0.55)',
					color: 'white',
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 34,
					lineHeight: 1.35,
					textAlign: 'center',
					textShadow: '0 2px 6px rgba(0,0,0,0.6)',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

// Small zoom "punch" on each key moment, on top of a slow push-in.
const useCameraScale = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const push = interpolate(frame, [0, VIDEO_FRAMES], [1, 1.06]);
	const punch = FLASH_FRAMES.reduce((acc, f) => {
		const s = spring({frame: frame - f, fps, config: {damping: 10, stiffness: 200}});
		const back = interpolate(frame - f, [6, 24], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		return acc + 0.04 * s * back;
	}, 0);
	return push + punch;
};

const MainClip: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = useCameraScale();
	// Shrink and fade the clip as the sign-up card slides in.
	const out = interpolate(frame, [CARD_FROM, CARD_FROM + 12], [1, 0.85], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{transform: `scale(${out})`, borderRadius: (1 - out) * 200, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${scale})`}}>
				<OffthreadVideo src={staticFile('source.mp4')} muted />
			</AbsoluteFill>
			<Logo />
			{captions.map((c) => (
				<Sequence
					key={c.start}
					from={Math.round(c.start * fps)}
					durationInFrames={Math.round((c.end - c.start) * fps)}
				>
					<CaptionLine text={c.text} />
				</Sequence>
			))}
			<Overlays />
		</AbsoluteFill>
	);
};

export const TutinGoPromo: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Sequence durationInFrames={VIDEO_FRAMES}>
				<MainClip />
			</Sequence>
			{/* Loudness-normalised voice track (ffmpeg loudnorm, -14 LUFS), played in full with a short fade-out. */}
			<Sequence durationInFrames={AUDIO_FRAMES}>
				<Audio
					src={staticFile('voice.m4a')}
					volume={(f) =>
						interpolate(f, [AUDIO_FRAMES - 8, AUDIO_FRAMES], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			</Sequence>
			<Sequence from={CARD_FROM} durationInFrames={CARD_FRAMES}>
				<SignupCard />
			</Sequence>
			<ProgressBar total={TOTAL_FRAMES} />
		</AbsoluteFill>
	);
};
