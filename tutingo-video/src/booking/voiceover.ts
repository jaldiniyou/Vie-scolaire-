// Voice-over lines, one per scene (French). Generated with Google Cloud
// Text-to-Speech by scripts/tts.mjs into public/vo/<id>.mp3 + manifest.json.
export const VOICEOVER: {id: string; text: string}[] = [
	{id: 'intro', text: 'Réserver un cours sur TutinGo, c’est simple ! Suis le guide.'},
	{id: 'stats', text: 'Plus de neuf cents profs qualifiés, dans toutes les matières, en ligne ou à domicile.'},
	{id: 'search', text: 'Étape un : cherche ton prof. Choisis la matière, le niveau, ta ville, et le format du cours.'},
	{id: 'compare', text: 'Étape deux : compare les profils, et choisis le prof qui te convient.'},
	{id: 'schedule', text: 'Étape trois : choisis la date et l’heure de ton cours.'},
	{
		id: 'payment',
		text: 'Étape quatre : le paiement. Paie en ligne de façon sécurisée au moment de la réservation, avec le solde de ton compte, ou en cash, en envoyant la preuve de paiement.',
	},
	{
		id: 'scheduled',
		text: 'Étape cinq : après validation du paiement et acceptation du prof, ton cours est programmé !',
	},
	{id: 'perks', text: 'Paiement sécurisé, profs vérifiés, et un support WhatsApp à ton écoute.'},
	{id: 'outro', text: 'Réserve ton prochain cours dès maintenant, sur tutingo point com.'},
];

export type VoManifest = Record<string, number>; // id -> duration in seconds
