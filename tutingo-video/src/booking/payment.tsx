import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BRAND} from '../theme';
import {Confetti} from './scenes';
import {Avatar, Background, Button, Finger, Phone, StepDots, StepHeader, clamp, useEnter} from './ui';

// Step 4: choose a payment method (secure online payment, account top-up or cash
// with proof of payment). Step 5: payment validated + teacher accepts = lesson scheduled.

const METHODS = [
	{icon: '💳', title: 'Paiement sécurisé', sub: 'Par carte, au moment de la réservation', badge: '🔒'},
	{icon: '👛', title: 'Recharge du compte', sub: 'Payez avec le solde de votre compte', badge: ''},
	{icon: '💵', title: 'Cash', sub: 'Envoyez la preuve de paiement', badge: ''},
];

// Each method is highlighted in turn, then "Cash" is chosen to show the proof upload.
const HIGHLIGHT = [30, 62, 94];
const SELECT_CASH = 124;
const UPLOAD_TAP = 160;
const SEND_TAP = 222;

const Method: React.FC<{m: (typeof METHODS)[number]; i: number}> = ({m, i}) => {
	const frame = useCurrentFrame();
	const e = useEnter(10 + i * 7, 14);
	const hovered = frame >= HIGHLIGHT[i] && frame < HIGHLIGHT[i] + 30 && frame < SELECT_CASH;
	const selected = i === 2 && frame >= SELECT_CASH;
	const on = hovered || selected;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				background: on ? '#F1EAFF' : 'white',
				border: `3px solid ${on ? BRAND.purple : '#E2DCF0'}`,
				borderRadius: 20,
				padding: '16px 18px',
				marginBottom: 14,
				opacity: e,
				transform: `translateX(${(1 - e) * 500}px) scale(${on ? 1.03 : 1})`,
			}}
		>
			<div style={{fontSize: 44}}>{m.icon}</div>
			<div style={{flex: 1}}>
				<div style={{fontSize: 26, fontWeight: 800, color: BRAND.ink}}>
					{m.title} {m.badge}
				</div>
				<div style={{fontSize: 19, fontWeight: 700, color: '#6B6680'}}>{m.sub}</div>
			</div>
			<div
				style={{
					width: 34,
					height: 34,
					borderRadius: '50%',
					border: `4px solid ${on ? BRAND.purple : '#CFC6E6'}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{on ? <div style={{width: 16, height: 16, borderRadius: '50%', background: BRAND.purple}} /> : null}
			</div>
		</div>
	);
};

const ProofUpload: React.FC = () => {
	const frame = useCurrentFrame();
	const e = useEnter(SELECT_CASH + 4, 14);
	const progress = interpolate(frame, [UPLOAD_TAP + 6, UPLOAD_TAP + 40], [0, 1], clamp);
	const uploaded = progress >= 1;
	if (frame < SELECT_CASH + 2) return null;
	return (
		<div
			style={{
				border: `3px dashed ${uploaded ? '#1FAF5B' : BRAND.purple}`,
				background: uploaded ? '#E9F8EF' : 'white',
				borderRadius: 20,
				padding: '16px 18px',
				marginBottom: 18,
				opacity: e,
				transform: `scale(${0.9 + 0.1 * e})`,
			}}
		>
			{frame < UPLOAD_TAP + 6 ? (
				<div style={{fontSize: 25, fontWeight: 800, color: BRAND.purple, textAlign: 'center'}}>
					📎 Envoyer la preuve de paiement
				</div>
			) : (
				<div>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 800, color: BRAND.ink}}>
						<span style={{fontSize: 34}}>🧾</span>
						<span style={{flex: 1}}>recu_paiement.jpg</span>
						<span style={{color: uploaded ? '#1FAF5B' : BRAND.purple}}>
							{uploaded ? '✔ Envoyé' : `${Math.round(progress * 100)}%`}
						</span>
					</div>
					<div style={{height: 10, borderRadius: 5, background: '#E2DCF0', marginTop: 10, overflow: 'hidden'}}>
						<div
							style={{
								width: `${progress * 100}%`,
								height: '100%',
								background: uploaded ? '#1FAF5B' : BRAND.purple,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export const StepPayment: React.FC = () => (
	<AbsoluteFill>
		<Background />
		<StepDots active={4} />
		<StepHeader n={4} title="Choisis ton paiement" darija="ختار طريقة الخلاص" />
		<Phone>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					background: 'white',
					borderRadius: 18,
					padding: '12px 16px',
					marginBottom: 18,
				}}
			>
				<Avatar initials="Y" hue={260} size={56} />
				<div style={{fontSize: 21, fontWeight: 800, color: BRAND.ink, lineHeight: 1.25}}>
					Prof. Yassine · Maths
					<div style={{fontWeight: 700, color: '#6B6680'}}>Mer 14 · 18:00 · 🏠 À domicile</div>
				</div>
			</div>
			<div style={{fontSize: 26, fontWeight: 800, color: BRAND.ink, marginBottom: 12}}>Mode de paiement</div>
			{METHODS.map((m, i) => (
				<Method key={m.title} m={m} i={i} />
			))}
			<ProofUpload />
			<Button label="Envoyer la demande" pressAt={SEND_TAP} done="✔ Demande envoyée" />
		</Phone>
		<Finger
			points={[
				{f: HIGHLIGHT[0], x: 760, y: 1110},
				{f: HIGHLIGHT[1], x: 760, y: 1222},
				{f: HIGHLIGHT[2], x: 760, y: 1334},
				{f: SELECT_CASH, x: 760, y: 1334},
				{f: UPLOAD_TAP, x: 540, y: 1390},
				{f: SEND_TAP, x: 540, y: 1525},
			]}
		/>
	</AbsoluteFill>
);

const STATUS = [
	{icon: '📨', title: 'Demande envoyée', sub: 'Avec la preuve de paiement', at: 10},
	{icon: '💰', title: 'Paiement validé', sub: 'Vérifié par TutinGo', at: 40},
	{icon: '👨‍🏫', title: 'Le prof accepte', sub: 'Prof. Yassine a confirmé', at: 70},
	{icon: '📅', title: 'Cours programmé !', sub: 'Mer 14 · 18:00 · À domicile', at: 100},
];

const StatusRow: React.FC<{s: (typeof STATUS)[number]; i: number}> = ({s, i}) => {
	const frame = useCurrentFrame();
	const e = useEnter(s.at, 12);
	const done = frame >= s.at + 6;
	const last = i === STATUS.length - 1;
	const line = interpolate(frame, [s.at + 6, s.at + 30], [0, 1], clamp);
	return (
		<div style={{display: 'flex', gap: 18, position: 'relative', minHeight: 130}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div
					style={{
						width: 64,
						height: 64,
						borderRadius: '50%',
						background: done ? (last ? BRAND.purple : '#1FAF5B') : '#E2DCF0',
						color: 'white',
						fontSize: 32,
						fontWeight: 800,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transform: `scale(${0.6 + 0.4 * e})`,
					}}
				>
					{done ? (last ? '★' : '✓') : ''}
				</div>
				{last ? null : (
					<div style={{width: 6, flex: 1, background: '#E2DCF0', borderRadius: 3, overflow: 'hidden'}}>
						<div style={{width: '100%', height: `${line * 100}%`, background: '#1FAF5B'}} />
					</div>
				)}
			</div>
			<div style={{opacity: e, transform: `translateX(${(1 - e) * 60}px)`, paddingTop: 4}}>
				<div style={{fontSize: last ? 32 : 28, fontWeight: 800, color: last ? BRAND.purple : BRAND.ink}}>
					{s.icon} {s.title}
				</div>
				<div style={{fontSize: 20, fontWeight: 700, color: '#6B6680'}}>{s.sub}</div>
			</div>
		</div>
	);
};

export const StepScheduled: React.FC = () => {
	const frame = useCurrentFrame();
	const notif = useEnter(STATUS[3].at + 10, 12);
	return (
		<AbsoluteFill>
			<Background />
			<StepDots active={5} />
			<StepHeader n={5} title="Ton cours est programmé" darija="الكور ديالك تبرمج" />
			<Phone>
				<div style={{fontSize: 28, fontWeight: 800, color: BRAND.ink, marginBottom: 22}}>Suivi de la réservation</div>
				{STATUS.map((s, i) => (
					<StatusRow key={s.title} s={s} i={i} />
				))}
			</Phone>
			{/* Push notification dropping from the top of the phone */}
			<div
				style={{
					position: 'absolute',
					left: 280,
					width: 520,
					top: interpolate(notif, [0, 1], [500, 610]),
					opacity: notif,
					background: 'white',
					borderRadius: 26,
					padding: '18px 22px',
					display: 'flex',
					gap: 14,
					alignItems: 'center',
					boxShadow: '0 20px 40px rgba(42,15,107,0.35)',
					fontFamily: 'Cairo, sans-serif',
				}}
			>
				<div style={{fontSize: 40}}>🔔</div>
				<div>
					<div style={{fontSize: 22, fontWeight: 800, color: BRAND.ink}}>TutinGo</div>
					<div style={{fontSize: 20, fontWeight: 700, color: '#6B6680'}}>Votre cours de Maths est programmé ✅</div>
				</div>
			</div>
			<Sequence from={STATUS[3].at + 6}>
				<Confetti />
				<Audio src={staticFile('sfx/success.wav')} />
			</Sequence>
		</AbsoluteFill>
	);
};
