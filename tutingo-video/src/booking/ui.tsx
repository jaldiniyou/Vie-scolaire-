import {
	AbsoluteFill,
	Audio,
	Img,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BRAND, FONT} from '../theme';

// Shared building blocks for the booking tutorial (1080x1920).

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useEnter = (delay = 0, damping = 14) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay, fps, config: {damping}});
};

// Returns the visible part of `text` being typed from `start`, 2 frames per char.
export const useTyped = (text: string, start: number, speed = 2) => {
	const frame = useCurrentFrame();
	const n = Math.max(0, Math.floor((frame - start) / speed));
	return [...text].slice(0, n).join('');
};

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{background: `linear-gradient(160deg, ${BRAND.soft} 0%, #E4D8FF 55%, #CDB8FF 100%)`}}
		>
			{[...Array(6)].map((_, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: ((i * 263) % 1080) - 120 + Math.sin((frame + i * 40) / 50) * 40,
						top: ((i * 389) % 1920) - 120 + Math.cos((frame + i * 30) / 60) * 50,
						width: 260 + (i % 3) * 120,
						height: 260 + (i % 3) * 120,
						borderRadius: '50%',
						background: i % 2 ? 'rgba(103,46,223,0.10)' : 'rgba(139,44,245,0.08)',
						filter: 'blur(10px)',
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const StepHeader: React.FC<{n?: number; title: string; darija: string}> = ({
	n,
	title,
	darija,
}) => {
	const e = useEnter(0, 12);
	const e2 = useEnter(6, 14);
	return (
		<div
			style={{
				position: 'absolute',
				top: 150,
				left: 0,
				right: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				fontFamily: FONT,
			}}
		>
			{n ? (
				<div
					style={{
						transform: `scale(${e}) rotate(${(1 - e) * -90}deg)`,
						width: 110,
						height: 110,
						borderRadius: '50%',
						background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.violet})`,
						color: 'white',
						fontSize: 60,
						fontWeight: 800,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 14px 30px rgba(103,46,223,0.4)',
					}}
				>
					{n}
				</div>
			) : null}
			<div
				style={{
					marginTop: 22,
					fontSize: 70,
					fontWeight: 800,
					color: BRAND.ink,
					opacity: e2,
					transform: `translateY(${(1 - e2) * 40}px)`,
					textAlign: 'center',
					lineHeight: 1.1,
				}}
			>
				{title}
			</div>
			<div
				dir="rtl"
				style={{
					marginTop: 6,
					fontSize: 44,
					fontWeight: 800,
					color: BRAND.purple,
					opacity: e2,
				}}
			>
				{darija}
			</div>
		</div>
	);
};

export const StepDots: React.FC<{active: number}> = ({active}) => (
	<div
		style={{
			position: 'absolute',
			top: 70,
			left: 0,
			right: 0,
			display: 'flex',
			justifyContent: 'center',
			gap: 14,
		}}
	>
		{[1, 2, 3, 4, 5].map((i) => (
			<div
				key={i}
				style={{
					width: i === active ? 90 : 26,
					height: 14,
					borderRadius: 7,
					background: i <= active ? BRAND.purple : 'rgba(103,46,223,0.2)',
				}}
			/>
		))}
	</div>
);

export const SCREEN = {left: 258, top: 560, width: 564, height: 1204};

export const Phone: React.FC<{children: React.ReactNode}> = ({children}) => {
	const e = useEnter(4, 16);
	return (
		<div
			style={{
				position: 'absolute',
				left: SCREEN.left - 18,
				top: SCREEN.top - 18,
				width: SCREEN.width + 36,
				height: SCREEN.height + 36,
				borderRadius: 72,
				background: '#14112B',
				padding: 18,
				boxShadow: '0 50px 90px rgba(42,15,107,0.45)',
				transform: `translateY(${(1 - e) * 500}px) rotate(${(1 - e) * 6}deg)`,
				fontFamily: FONT,
			}}
		>
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					borderRadius: 56,
					background: '#F8F6FF',
					overflow: 'hidden',
				}}
			>
				<div style={{height: 46, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
					<div style={{width: 150, height: 30, borderRadius: 15, background: '#14112B'}} />
				</div>
				<div
					style={{
						margin: '4px 22px',
						height: 44,
						borderRadius: 22,
						background: '#ECE8F7',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 22,
						fontWeight: 700,
						color: '#555',
					}}
				>
					🔒 tutingo.com
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '14px 26px',
						borderBottom: '2px solid #ECE8F7',
						background: 'white',
					}}
				>
					<Img src={staticFile('logo.png')} style={{height: 40}} />
					<div style={{fontSize: 34, color: BRAND.ink}}>☰</div>
				</div>
				<div style={{position: 'relative', padding: 26}}>{children}</div>
			</div>
		</div>
	);
};

export const Field: React.FC<{
	label: string;
	value: string;
	active?: boolean;
	icon: string;
}> = ({label, value, active, icon}) => (
	<div style={{marginBottom: 18}}>
		<div style={{fontSize: 20, fontWeight: 700, color: '#6B6680', marginBottom: 6}}>{label}</div>
		<div
			style={{
				height: 66,
				borderRadius: 16,
				border: `3px solid ${active ? BRAND.purple : '#E2DCF0'}`,
				background: active ? '#F1EAFF' : 'white',
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '0 18px',
				fontSize: 26,
				fontWeight: 700,
				color: BRAND.ink,
			}}
		>
			<span>{icon}</span>
			<span>
				{value}
				{active ? <span style={{color: BRAND.purple}}>|</span> : null}
			</span>
		</div>
	</div>
);

export const Button: React.FC<{
	label: string;
	pressAt?: number;
	done?: string;
	color?: string;
}> = ({label, pressAt = 1e9, done, color}) => {
	const frame = useCurrentFrame();
	const press = interpolate(frame, [pressAt, pressAt + 4, pressAt + 10], [1, 0.92, 1], clamp);
	const glow = 0.5 + Math.sin(frame / 6) * 0.5;
	const isDone = done && frame >= pressAt + 4;
	return (
		<div
			style={{
				height: 80,
				borderRadius: 20,
				background: isDone
					? '#1FAF5B'
					: color ?? `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.violet})`,
				color: 'white',
				fontSize: 30,
				fontWeight: 800,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				transform: `scale(${press})`,
				boxShadow: `0 0 ${12 + glow * 20}px rgba(139,44,245,0.5)`,
			}}
		>
			{isDone ? done : label}
		</div>
	);
};

export const Chip: React.FC<{label: string; on?: boolean; size?: number}> = ({label, on, size = 22}) => (
	<div
		style={{
			padding: '8px 16px',
			borderRadius: 999,
			fontSize: size,
			fontWeight: 800,
			background: on ? BRAND.purple : '#EFE9FF',
			color: on ? 'white' : BRAND.purple,
			whiteSpace: 'nowrap',
		}}
	>
		{label}
	</div>
);

// Animated finger: moves through `points` (screen coordinates) and taps at each point's frame.
export const Finger: React.FC<{points: {f: number; x: number; y: number}[]}> = ({points}) => {
	const frame = useCurrentFrame();
	const fs = points.map((p) => p.f);
	const x = interpolate(frame, fs.length > 1 ? fs : [fs[0], fs[0] + 1], points.length > 1 ? points.map((p) => p.x) : [points[0].x, points[0].x], clamp);
	const y = interpolate(frame, fs.length > 1 ? fs : [fs[0], fs[0] + 1], points.length > 1 ? points.map((p) => p.y) : [points[0].y, points[0].y], clamp);
	const first = fs[0];
	const last = fs[fs.length - 1];
	const opacity = interpolate(frame, [first - 20, first - 8, last + 18, last + 26], [0, 1, 1, 0], clamp);
	const tapping = points.some((p) => frame >= p.f && frame < p.f + 6);
	return (
		<>
			{points.map((p) => {
				const r = interpolate(frame, [p.f, p.f + 16], [0, 90], clamp);
				const o = interpolate(frame, [p.f, p.f + 16], [0.5, 0], clamp);
				return frame >= p.f ? (
					<div
						key={p.f}
						style={{
							position: 'absolute',
							left: p.x - r / 2,
							top: p.y - r / 2,
							width: r,
							height: r,
							borderRadius: '50%',
							background: BRAND.violet,
							opacity: o,
						}}
					/>
				) : null;
			})}
			<div
				style={{
					position: 'absolute',
					left: x - 22,
					top: y - 8,
					fontSize: 76,
					opacity,
					transform: `scale(${tapping ? 0.85 : 1})`,
					filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.3))',
				}}
			>
				👆
			</div>
			{points.map((p) => (
				<Sequence key={`s${p.f}`} from={p.f} durationInFrames={10}>
					<Audio src={staticFile('sfx/tap.wav')} />
				</Sequence>
			))}
		</>
	);
};

export const Avatar: React.FC<{initials: string; hue: number; size?: number}> = ({initials, hue, size = 86}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			background: `linear-gradient(135deg, hsl(${hue},75%,60%), hsl(${hue + 40},75%,45%))`,
			color: 'white',
			fontSize: size * 0.4,
			fontWeight: 800,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		}}
	>
		{initials}
	</div>
);
