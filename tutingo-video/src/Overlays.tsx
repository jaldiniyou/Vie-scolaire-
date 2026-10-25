import {
	AbsoluteFill,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BRAND, FONT} from './theme';

// Marketing texts inspired by tutingo.com, timed to what is being said.

const usePop = (delay = 0) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 160}});
};

const useExit = (durationInFrames: number) => {
	const frame = useCurrentFrame();
	return interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

const Pill: React.FC<{children: React.ReactNode; delay?: number; dark?: boolean}> = ({
	children,
	delay = 0,
	dark,
}) => {
	const pop = usePop(delay);
	return (
		<div
			style={{
				transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])}) translateY(${interpolate(pop, [0, 1], [20, 0])}px)`,
				opacity: Math.min(1, pop * 1.5),
				background: dark ? BRAND.purple : 'white',
				color: dark ? 'white' : BRAND.ink,
				borderRadius: 999,
				padding: '8px 18px',
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 22,
				boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
				whiteSpace: 'nowrap',
			}}
		>
			{children}
		</div>
	);
};

const Top: React.FC<{children: React.ReactNode; durationInFrames: number}> = ({
	children,
	durationInFrames,
}) => {
	const exit = useExit(durationInFrames);
	return (
		<AbsoluteFill
			style={{
				top: 40,
				alignItems: 'center',
				justifyContent: 'flex-start',
				flexDirection: 'column',
				gap: 10,
				opacity: exit,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

const SUBJECTS = ['📐 Maths', '🧪 Physique', '🧬 SVT', '🇫🇷 Français', '🇬🇧 Anglais', '📖 Arabe'];
const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Kénitra', 'Oujda', 'Tétouan'];

const CityTicker: React.FC = () => {
	const frame = useCurrentFrame();
	const text = CITIES.map((c) => `📍 ${c}`).join('   •   ');
	return (
		<div
			style={{
				width: 540,
				overflow: 'hidden',
				background: 'rgba(103,46,223,0.92)',
				padding: '8px 0',
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 20,
				color: 'white',
				whiteSpace: 'nowrap',
			}}
		>
			<div style={{transform: `translateX(${-frame * 4}px)`}}>
				{text}   •   {text}
			</div>
		</div>
	);
};

const Badge: React.FC<{emoji: string; title: string; sub: string}> = ({emoji, title, sub}) => {
	const pop = usePop();
	const frame = useCurrentFrame();
	const wobble = Math.sin(frame / 6) * 2;
	return (
		<div
			style={{
				transform: `scale(${pop}) rotate(${wobble - 3}deg)`,
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				background: 'white',
				borderRadius: 20,
				padding: '10px 18px',
				borderLeft: `8px solid ${BRAND.purple}`,
				boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
				fontFamily: FONT,
			}}
		>
			<span style={{fontSize: 40}}>{emoji}</span>
			<div>
				<div style={{fontSize: 26, fontWeight: 800, color: BRAND.ink}}>{title}</div>
				<div style={{fontSize: 17, fontWeight: 700, color: BRAND.purple}}>{sub}</div>
			</div>
		</div>
	);
};

// Short white flash + punch-in, used on key moments.
export const Flash: React.FC = () => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [0, 2, 8], [0, 0.5, 0], {extrapolateRight: 'clamp'});
	return <AbsoluteFill style={{background: 'white', opacity: o}} />;
};

export const FLASH_FRAMES = [0, 124, 253, 368, 479];

export const Overlays: React.FC = () => {
	const {fps} = useVideoConfig();
	const s = (sec: number) => Math.round(sec * fps);

	return (
		<>
			<Sequence from={s(0.2)} durationInFrames={s(4)}>
				<Top durationInFrames={s(4)}>
					<Pill dark>🎓 Cours particuliers au Maroc</Pill>
					<Pill delay={6}>💻 En ligne  &  🏠 À domicile</Pill>
				</Top>
			</Sequence>
			<Sequence from={s(4.2)} durationInFrames={s(4.2)}>
				<Top durationInFrames={s(4.2)}>
					<Pill dark>Toutes les matières</Pill>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', width: 500}}>
						{SUBJECTS.map((sub, i) => (
							<Pill key={sub} delay={4 + i * 4}>
								{sub}
							</Pill>
						))}
					</div>
				</Top>
			</Sequence>
			<Sequence from={s(8.4)} durationInFrames={s(3.9)}>
				<Top durationInFrames={s(3.9)}>
					<Pill dark>✨ Nouvelle option</Pill>
					<CityTicker />
				</Top>
			</Sequence>
			<Sequence from={s(12.3)} durationInFrames={s(3.7)}>
				<Top durationInFrames={s(3.7)}>
					<Badge emoji="🏠" title="Cours de soutien à domicile" sub="Pour votre fils ou votre fille" />
				</Top>
			</Sequence>
			<Sequence from={s(16)} durationInFrames={s(2.6)}>
				<Top durationInFrames={s(2.6)}>
					<Badge emoji="📱" title="Réservez depuis votre téléphone" sub="Simple, rapide, partout au Maroc" />
				</Top>
			</Sequence>
			{FLASH_FRAMES.map((f) => (
				<Sequence key={f} from={f} durationInFrames={10}>
					<Flash />
				</Sequence>
			))}
		</>
	);
};

export const ProgressBar: React.FC<{total: number}> = ({total}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				height: 6,
				width: `${(frame / total) * 100}%`,
				background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.violet})`,
			}}
		/>
	);
};
