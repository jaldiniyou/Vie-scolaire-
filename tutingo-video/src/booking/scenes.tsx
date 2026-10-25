import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, FONT} from '../theme';
import {
	Avatar,
	Background,
	Button,
	Chip,
	Field,
	Finger,
	Phone,
	StepDots,
	StepHeader,
	clamp,
	useEnter,
	useTyped,
} from './ui';

// Claims shown here come from tutingo.com: 900+ qualified teachers, online or at
// home, instant confirmation, vetted teachers, refund/new teacher guarantee, WhatsApp support.

const Title: React.FC<{children: React.ReactNode; size?: number; delay?: number; color?: string}> = ({
	children,
	size = 84,
	delay = 0,
	color = BRAND.ink,
}) => {
	const e = useEnter(delay, 13);
	return (
		<div
			style={{
				fontFamily: FONT,
				fontSize: size,
				fontWeight: 800,
				color,
				textAlign: 'center',
				lineHeight: 1.12,
				opacity: e,
				transform: `translateY(${(1 - e) * 50}px) scale(${0.9 + 0.1 * e})`,
			}}
		>
			{children}
		</div>
	);
};

export const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const logo = useEnter(0, 10);
	const ring = interpolate(frame, [0, 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Background />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
				<div
					style={{
						position: 'absolute',
						width: 900 * ring,
						height: 900 * ring,
						borderRadius: '50%',
						border: `6px solid rgba(103,46,223,${0.35 * (1 - ring)})`,
					}}
				/>
				<div
					style={{
						transform: `scale(${logo})`,
						background: 'white',
						borderRadius: 40,
						padding: '30px 50px',
						boxShadow: '0 30px 60px rgba(103,46,223,0.25)',
					}}
				>
					<Img src={staticFile('logo.png')} style={{height: 150, display: 'block'}} />
				</div>
				<Title delay={14}>
					Réserver un cours
					<br />
					<span style={{color: BRAND.purple}}>en 5 étapes</span>
				</Title>
				<div dir="rtl">
					<Title delay={22} size={56} color={BRAND.purple}>
						كيفاش تحجز كور بسهولة
					</Title>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Stat: React.FC<{big: React.ReactNode; label: string; delay: number}> = ({big, label, delay}) => {
	const e = useEnter(delay, 12);
	return (
		<div
			style={{
				width: 820,
				background: 'white',
				borderRadius: 36,
				padding: '34px 40px',
				display: 'flex',
				alignItems: 'center',
				gap: 34,
				boxShadow: '0 20px 40px rgba(103,46,223,0.18)',
				transform: `translateX(${(1 - e) * (delay % 2 ? 1 : -1) * 1100}px)`,
				fontFamily: FONT,
			}}
		>
			<div style={{fontSize: 84, fontWeight: 800, color: BRAND.purple, minWidth: 230, textAlign: 'center'}}>
				{big}
			</div>
			<div style={{fontSize: 42, fontWeight: 800, color: BRAND.ink, lineHeight: 1.15}}>{label}</div>
		</div>
	);
};

export const Stats: React.FC = () => {
	const frame = useCurrentFrame();
	const count = Math.round(interpolate(frame, [6, 40], [0, 900], {...clamp, easing: (t) => 1 - (1 - t) ** 3}));
	return (
		<AbsoluteFill>
			<Background />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40}}>
				<Title size={72}>Avec TutinGo</Title>
				<Stat delay={4} big={`+${count}`} label="profs qualifiés au Maroc" />
				<Stat delay={14} big="📚" label="Toutes les matières, tous les niveaux" />
				<Stat delay={24} big="💻🏠" label="En ligne ou à domicile" />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const StepSearch: React.FC = () => {
	const frame = useCurrentFrame();
	const matiere = useTyped('Mathématiques', 30);
	const niveau = useTyped('2ème année Bac', 62);
	const ville = useTyped('Casablanca', 94);
	const homeOn = frame >= 124;
	return (
		<AbsoluteFill>
			<Background />
			<StepDots active={1} />
			<StepHeader n={1} title="Cherche ton prof" darija="قلب على البروف ديالك" />
			<Phone>
				<div style={{fontSize: 34, fontWeight: 800, color: BRAND.ink, marginBottom: 6}}>Trouvez le prof idéal</div>
				<div style={{fontSize: 21, fontWeight: 700, color: '#6B6680', marginBottom: 22}}>
					Soutien scolaire partout au Maroc
				</div>
				<Field icon="📐" label="Matière" value={matiere} active={frame >= 28 && frame < 60} />
				<Field icon="🎓" label="Niveau" value={niveau} active={frame >= 60 && frame < 92} />
				<Field icon="📍" label="Ville" value={ville} active={frame >= 92 && frame < 120} />
				<div style={{fontSize: 20, fontWeight: 700, color: '#6B6680', marginBottom: 8}}>Format</div>
				<div style={{display: 'flex', gap: 12, marginBottom: 26}}>
					<Chip size={24} label="💻 En ligne" />
					<Chip size={24} label="🏠 À domicile" on={homeOn} />
				</div>
				<Button label="🔍 Rechercher" pressAt={150} />
			</Phone>
			<Finger
				points={[
					{f: 26, x: 600, y: 980},
					{f: 58, x: 600, y: 1108},
					{f: 90, x: 600, y: 1236},
					{f: 122, x: 532, y: 1360},
					{f: 150, x: 540, y: 1456},
				]}
			/>
		</AbsoluteFill>
	);
};

const TEACHERS = [
	{name: 'Prof. Yassine', avatar: 'yassine' as const, subjects: ['Maths', 'Physique']},
	{name: 'Prof. Salma', avatar: 'salma' as const, subjects: ['Maths', 'SVT']},
	{name: 'Prof. Karim', avatar: 'karim' as const, subjects: ['Maths', 'Informatique']},
];

const TeacherCard: React.FC<{t: (typeof TEACHERS)[number]; i: number; selectAt: number}> = ({t, i, selectAt}) => {
	const frame = useCurrentFrame();
	const e = useEnter(14 + i * 10, 14);
	const selected = i === 0 && frame >= selectAt;
	return (
		<div
			style={{
				background: 'white',
				borderRadius: 24,
				padding: 20,
				marginBottom: 18,
				border: `3px solid ${selected ? BRAND.purple : 'transparent'}`,
				boxShadow: selected ? '0 14px 30px rgba(103,46,223,0.3)' : '0 6px 16px rgba(0,0,0,0.06)',
				opacity: e,
				transform: `translateX(${(1 - e) * 600}px) scale(${selected ? 1.03 : 1})`,
			}}
		>
			<div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
				<Avatar name={t.avatar} />
				<div style={{flex: 1}}>
					<div style={{fontSize: 28, fontWeight: 800, color: BRAND.ink}}>{t.name}</div>
					<div style={{fontSize: 19, fontWeight: 700, color: '#1FAF5B'}}>✔ Diplômes & expérience vérifiés</div>
				</div>
			</div>
			<div style={{display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}>
				{t.subjects.map((s) => (
					<Chip key={s} label={s} size={19} />
				))}
				<Chip label="🏠 Domicile" size={19} />
				<Chip label="💻 En ligne" size={19} />
			</div>
			<div
				style={{
					marginTop: 14,
					height: 54,
					borderRadius: 14,
					border: `3px solid ${BRAND.purple}`,
					background: selected ? BRAND.purple : 'white',
					color: selected ? 'white' : BRAND.purple,
					fontSize: 23,
					fontWeight: 800,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				Voir le profil →
			</div>
		</div>
	);
};

export const StepCompare: React.FC = () => {
	const frame = useCurrentFrame();
	const scroll = interpolate(frame, [70, 100, 120, 140], [0, -180, -180, 0], clamp);
	return (
		<AbsoluteFill>
			<Background />
			<StepDots active={2} />
			<StepHeader n={2} title="Compare les profils" darija="شوف وقارن بين البروفات" />
			<Phone>
				<div style={{fontSize: 26, fontWeight: 800, color: BRAND.ink, marginBottom: 16}}>
					Profs de Maths · Casablanca
				</div>
				<div style={{transform: `translateY(${scroll}px)`}}>
					{TEACHERS.map((t, i) => (
						<TeacherCard key={t.name} t={t} i={i} selectAt={152} />
					))}
				</div>
			</Phone>
			<Finger
				points={[
					{f: 66, x: 560, y: 1400},
					{f: 100, x: 560, y: 1150},
					{f: 152, x: 540, y: 1066},
				]}
			/>
		</AbsoluteFill>
	);
};

const DAYS = [
	['Lun', '12'],
	['Mar', '13'],
	['Mer', '14'],
	['Jeu', '15'],
	['Ven', '16'],
];
const SLOTS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export const StepSchedule: React.FC = () => {
	const frame = useCurrentFrame();
	const day = frame >= 50 ? 2 : -1;
	const slot = frame >= 100 ? 3 : -1;
	const slotsIn = useEnter(56, 14);
	return (
		<AbsoluteFill>
			<Background />
			<StepDots active={3} />
			<StepHeader n={3} title="Choisis la date et l'heure" darija="ختار النهار والساعة" />
			<Phone>
				<div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22}}>
					<Avatar name="yassine" size={70} />
					<div>
						<div style={{fontSize: 26, fontWeight: 800, color: BRAND.ink}}>Prof. Yassine</div>
						<div style={{fontSize: 19, fontWeight: 700, color: '#6B6680'}}>Maths · Physique</div>
					</div>
				</div>
				<div style={{fontSize: 24, fontWeight: 800, color: BRAND.ink, marginBottom: 12}}>📅 Date</div>
				<div style={{display: 'flex', gap: 10, marginBottom: 26}}>
					{DAYS.map(([d, n], i) => (
						<div
							key={d}
							style={{
								flex: 1,
								borderRadius: 18,
								padding: '12px 0',
								textAlign: 'center',
								background: i === day ? BRAND.purple : 'white',
								color: i === day ? 'white' : BRAND.ink,
								boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
								transform: `scale(${i === day ? 1.08 : 1})`,
							}}
						>
							<div style={{fontSize: 18, fontWeight: 700, opacity: 0.8}}>{d}</div>
							<div style={{fontSize: 32, fontWeight: 800}}>{n}</div>
						</div>
					))}
				</div>
				<div style={{opacity: slotsIn, transform: `translateY(${(1 - slotsIn) * 30}px)`}}>
					<div style={{fontSize: 24, fontWeight: 800, color: BRAND.ink, marginBottom: 12}}>🕒 Heure</div>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28}}>
						{SLOTS.map((s, i) => (
							<div
								key={s}
								style={{
									height: 62,
									borderRadius: 16,
									border: `3px solid ${i === slot ? BRAND.purple : '#E2DCF0'}`,
									background: i === slot ? BRAND.purple : 'white',
									color: i === slot ? 'white' : BRAND.ink,
									fontSize: 26,
									fontWeight: 800,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{s}
							</div>
						))}
					</div>
				</div>
				<Button label="Continuer →" pressAt={150} />
			</Phone>
			<Finger
				points={[
					{f: 50, x: 540, y: 1000},
					{f: 100, x: 364, y: 1244},
					{f: 150, x: 540, y: 1344},
				]}
			/>
		</AbsoluteFill>
	);
};

export const Confetti: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			{[...Array(40)].map((_, i) => {
				const angle = (i / 40) * Math.PI * 2;
				const speed = 14 + (i % 5) * 4;
				const t = frame;
				const x = 540 + Math.cos(angle) * speed * t;
				const y = 1100 + Math.sin(angle) * speed * t + 0.6 * t * t;
				const colors = [BRAND.purple, BRAND.violet, '#FFC83D', '#1FAF5B', '#FF5C8A'];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: 18,
							height: 28,
							borderRadius: 4,
							background: colors[i % colors.length],
							transform: `rotate(${t * (8 + i)}deg)`,
							opacity: interpolate(t, [30, 50], [1, 0], clamp),
						}}
					/>
				);
			})}
		</>
	);
};


const Perk: React.FC<{icon: string; title: string; sub: string; delay: number}> = ({icon, title, sub, delay}) => {
	const e = useEnter(delay, 12);
	return (
		<div
			style={{
				width: 860,
				background: 'white',
				borderRadius: 34,
				padding: '30px 36px',
				display: 'flex',
				alignItems: 'center',
				gap: 28,
				boxShadow: '0 20px 40px rgba(103,46,223,0.18)',
				transform: `scale(${e})`,
				fontFamily: FONT,
			}}
		>
			<div style={{fontSize: 80}}>{icon}</div>
			<div>
				<div style={{fontSize: 40, fontWeight: 800, color: BRAND.ink, lineHeight: 1.15}}>{title}</div>
				<div style={{fontSize: 28, fontWeight: 700, color: BRAND.purple, marginTop: 6}}>{sub}</div>
			</div>
		</div>
	);
};

export const Perks: React.FC = () => (
	<AbsoluteFill>
		<Background />
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 36}}>
			<Title size={70}>Réservez l'esprit tranquille</Title>
			<Perk delay={8} icon="🛡️" title="1er cours pas satisfait ?" sub="Remboursé ou nouveau prof offert" />
			<Perk delay={18} icon="✅" title="Profs vérifiés" sub="Diplômes, expérience, pédagogie" />
			<Perk delay={28} icon="🔒" title="Paiement sécurisé" sub="Carte, solde du compte ou cash" />
			<Perk delay={38} icon="💬" title="Support WhatsApp" sub="On vous répond rapidement" />
		</AbsoluteFill>
	</AbsoluteFill>
);

export const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const logo = useEnter(0, 10);
	const pulse = 1 + Math.sin(frame / 5) * 0.04;
	const cta = useEnter(20, 12);
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at 30% 15%, ${BRAND.violet}, ${BRAND.purple} 45%, #2A0F6B)`,
				alignItems: 'center',
				justifyContent: 'center',
				gap: 46,
				fontFamily: FONT,
			}}
		>
			<div
				style={{
					transform: `scale(${logo})`,
					background: 'white',
					borderRadius: 40,
					padding: '28px 48px',
					boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
				}}
			>
				<Img src={staticFile('logo.png')} style={{height: 140, display: 'block'}} />
			</div>
			<Title size={76} color="white" delay={8}>
				Ton prochain cours
				<br />
				en quelques clics
			</Title>
			<div dir="rtl">
				<Title size={54} color="#E6DAFF" delay={14}>
					احجز دابا!
				</Title>
			</div>
			<div
				style={{
					transform: `scale(${cta * pulse})`,
					background: 'white',
					color: BRAND.purple,
					borderRadius: 999,
					padding: '26px 60px',
					fontSize: 48,
					fontWeight: 800,
					boxShadow: '0 0 40px rgba(255,255,255,0.4)',
				}}
			>
				🌐 www.tutingo.com
			</div>
		</AbsoluteFill>
	);
};
