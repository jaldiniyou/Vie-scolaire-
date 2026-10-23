// Rend scene.html image par image puis encode la vidéo avec ffmpeg.
// Usage : node render.mjs [sortie.mp4] [--preview t1,t2,...]
// Nécessite playwright-core (npm i playwright-core) et ffmpeg.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const previewIdx = args.indexOf('--preview');
const preview = previewIdx >= 0 ? args.splice(previewIdx, 2)[1].split(',').map(Number) : null;
const out = resolve(args[0] || join(here, 'tutingo-motion.mp4'));
const framesDir = process.env.FRAMES_DIR || join(tmpdir(), 'tutingo-frames');
const FPS = 30, DURATION = 14;

// Logo officiel (fond transparent) : logo.svg s'il existe, sinon logo.png
const logo = existsSync(join(here, 'logo.svg'))
  ? readFileSync(join(here, 'logo.svg'), 'utf8')
  : '<img src="logo.png" alt="TutinGo">';
const built = join(here, '.scene.built.html');
writeFileSync(built, readFileSync(join(here, 'scene.html'), 'utf8').replaceAll('<!--LOGO-->', logo));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
await page.goto('file://' + built);
await page.evaluate(() => document.fonts.ready);

rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
const times = preview || Array.from({ length: FPS * DURATION }, (_, i) => i / FPS);
for (let i = 0; i < times.length; i++) {
  await page.evaluate(t => window.render(t), times[i]);
  await page.screenshot({ path: join(framesDir, `f${String(i).padStart(4, '0')}.png`) });
}
await browser.close();
rmSync(built);

if (preview) {
  console.log(`Aperçus : ${framesDir}`);
} else {
  // Audio : music.wav (musique originale, make-music.py) + sfx.wav (bruitages, plus discrets), fondu de sortie
  const audio = ['music.wav', 'sfx.wav'].map(f => join(here, f)).filter(existsSync);
  const vol = audio.map(f => f.endsWith('sfx.wav') && audio.length > 1 ? 0.45 : 1);
  const mix = audio.map((_, i) => `[${i + 1}:a]volume=${vol[i]}[a${i}]`).join(';') + ';'
    + audio.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${audio.length}:normalize=0,apad,atrim=0:${DURATION},`
    + `afade=t=out:st=${DURATION - 1}:d=1,alimiter=limit=0.95[a]`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', join(framesDir, 'f%04d.png'),
    ...audio.flatMap(f => ['-i', f]),
    ...(audio.length ? ['-filter_complex', mix, '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '192k'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`Vidéo : ${out}`);
}
