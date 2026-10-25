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
import {captions} from './captions';

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
					fontFamily: 'Cairo, sans-serif',
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

export const TutinGoPromo: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<OffthreadVideo src={staticFile('source.mp4')} muted />
			{/* Loudness-normalised voice track (ffmpeg loudnorm, -14 LUFS). */}
			<Audio src={staticFile('voice.m4a')} />
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
		</AbsoluteFill>
	);
};
