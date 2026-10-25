// Generates the voice-over with Google Cloud Text-to-Speech.
// Usage: GOOGLE_TTS_API_KEY=xxx node scripts/tts.mjs [voiceName]
// Default voice: fr-FR-Chirp3-HD-Leda (Google's most natural French voices).
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const key = process.env.GOOGLE_TTS_API_KEY;
if (!key) {
	console.error('Set GOOGLE_TTS_API_KEY (Google Cloud API key with Text-to-Speech enabled).');
	process.exit(1);
}
const voice = process.argv[2] ?? 'fr-FR-Chirp3-HD-Leda';

const src = readFileSync(new URL('../src/booking/voiceover.ts', import.meta.url), 'utf8');
const lines = [...src.matchAll(/id: '(\w+)',\s*text:\s*'([^']+)'/g)].map((m) => ({id: m[1], text: m[2]}));

const outDir = new URL('../public/vo/', import.meta.url);
mkdirSync(outDir, {recursive: true});
const manifest = {};

for (const {id, text} of lines) {
	const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			input: {text},
			voice: {languageCode: voice.slice(0, 5), name: voice},
			audioConfig: {audioEncoding: 'MP3', speakingRate: 1.05, sampleRateHertz: 44100},
		}),
	});
	if (!res.ok) {
		console.error(id, res.status, await res.text());
		process.exit(1);
	}
	const {audioContent} = await res.json();
	const file = new URL(`${id}.mp3`, outDir);
	writeFileSync(file, Buffer.from(audioContent, 'base64'));
	const dur = Number(
		execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file.pathname])
			.toString()
			.trim(),
	);
	manifest[id] = dur;
	console.log(`${id}: ${dur.toFixed(2)}s`);
}

writeFileSync(new URL('manifest.json', outDir), JSON.stringify(manifest, null, 2));
console.log('Voice-over written to public/vo/');
