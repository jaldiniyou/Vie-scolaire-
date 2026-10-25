import {
	AbsoluteFill,
	Img,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BRAND, FONT} from './theme';

// End card: a sign-up page mock-up that fills itself in, then the CTA is tapped.

const FIELDS = [
	{label: 'Nom complet', value: 'Salma Benali'},
	{label: 'Téléphone', value: '06 •• •• •• ••'},
	{label: 'Matière', value: '🇬🇧 Anglais'},
	{label: 'Ville', value: '📍 Casablanca'},
	{label: 'Format', value: '🏠 À domicile'},
];

const TYPE_START = 22;
const PER_FIELD = 12;
const CLICK_AT = TYPE_START + FIELDS.length * PER_FIELD + 8;

const Field: React.FC<{label: string; value: string; index: number}> = ({label, value, index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const appear = spring({frame: frame - 8 - index * 3, fps, config: {damping: 15}});
	const start = TYPE_START + index * PER_FIELD;
	const chars = Math.round(
		interpolate(frame, [start, start + PER_FIELD - 2], [0, value.length], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);
	const active = frame >= start && frame < start + PER_FIELD;

	return (
		<div style={{opacity: appear, transform: `translateX(${(1 - appear) * 40}px)`}}>
			<div style={{fontSize: 14, fontWeight: 700, color: '#666', marginBottom: 3}}>{label}</div>
			<div
				style={{
					height: 40,
					borderRadius: 10,
					border: `2px solid ${active ? BRAND.purple : '#E2DCF0'}`,
					background: active ? BRAND.soft : 'white',
					display: 'flex',
					alignItems: 'center',
					padding: '0 12px',
					fontSize: 18,
					fontWeight: 700,
					color: BRAND.ink,
				}}
			>
				{[...value].slice(0, chars).join('')}
				{active ? <span style={{color: BRAND.purple}}>|</span> : null}
			</div>
		</div>
	);
};

export const SignupCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({frame, fps, config: {damping: 16}});
	const press = interpolate(frame, [CLICK_AT, CLICK_AT + 4, CLICK_AT + 10], [1, 0.92, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const clicked = frame >= CLICK_AT + 4;
	const done = spring({frame: frame - CLICK_AT - 10, fps, config: {damping: 12}});

	// Animated tap cursor travelling to the button.
	const cursorX = interpolate(frame, [CLICK_AT - 14, CLICK_AT], [420, 290], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorY = interpolate(frame, [CLICK_AT - 14, CLICK_AT], [880, 742], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorOpacity = interpolate(frame, [CLICK_AT - 16, CLICK_AT - 12, CLICK_AT + 16, CLICK_AT + 20], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const glow = 0.5 + Math.sin(frame / 5) * 0.5;

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at 30% 10%, ${BRAND.violet}, ${BRAND.purple} 45%, #2A0F6B)`,
				fontFamily: FONT,
				alignItems: 'center',
				transform: `translateY(${(1 - enter) * 960}px)`,
			}}
		>
			{/* floating decorative dots */}
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: (i * 71) % 540,
						top: ((i * 137 + frame * (1 + (i % 3))) % 1000) - 40,
						width: 10 + (i % 4) * 6,
						height: 10 + (i % 4) * 6,
						borderRadius: '50%',
						background: 'rgba(255,255,255,0.12)',
					}}
				/>
			))}

			<div
				style={{
					marginTop: 46,
					background: 'white',
					borderRadius: 22,
					padding: '10px 26px',
					boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
				}}
			>
				<Img src={staticFile('logo.png')} style={{height: 64, display: 'block'}} />
			</div>

			<div style={{marginTop: 18, color: 'white', fontSize: 34, fontWeight: 800, textAlign: 'center', lineHeight: 1.15}}>
				Trouve ton prof idéal
			</div>
			<div dir="rtl" style={{color: '#E6DAFF', fontSize: 24, fontWeight: 800, marginTop: 2}}>
				سجّل دابا!
			</div>

			<div
				style={{
					marginTop: 16,
					width: 420,
					background: 'white',
					borderRadius: 24,
					padding: '18px 22px 22px',
					boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
					display: 'flex',
					flexDirection: 'column',
					gap: 9,
				}}
			>
				<div style={{fontSize: 22, fontWeight: 800, color: BRAND.ink}}>Inscription</div>
				{FIELDS.map((f, i) => (
					<Field key={f.label} label={f.label} value={f.value} index={i} />
				))}
				<div
					style={{
						marginTop: 8,
						height: 52,
						borderRadius: 14,
						background: clicked ? '#1FAF5B' : `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.violet})`,
						color: 'white',
						fontSize: 21,
						fontWeight: 800,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transform: `scale(${press})`,
						boxShadow: `0 0 ${10 + glow * 18}px rgba(139,44,245,${clicked ? 0 : 0.6})`,
					}}
				>
					{clicked ? '✅ Demande envoyée !' : 'Réserver un cours'}
				</div>
			</div>

			<div
				style={{
					marginTop: 22,
					transform: `scale(${done})`,
					background: 'white',
					color: BRAND.purple,
					borderRadius: 999,
					padding: '10px 26px',
					fontSize: 26,
					fontWeight: 800,
				}}
			>
				🌐 www.tutingo.com
			</div>

			<div
				style={{
					position: 'absolute',
					left: cursorX,
					top: cursorY,
					fontSize: 44,
					opacity: cursorOpacity,
					transform: `scale(${frame >= CLICK_AT && frame < CLICK_AT + 6 ? 0.85 : 1})`,
				}}
			>
				👆
			</div>
		</AbsoluteFill>
	);
};
