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

// Logo : logo.png s'il existe, sinon logo.svg
const logo = existsSync(join(here, 'logo.png'))
  ? '<img src="logo.png" alt="TutinGo">'
  : readFileSync(join(here, 'logo.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const built = join(here, '.scene.built.html');
writeFileSync(built, readFileSync(join(here, 'scene.html'), 'utf8').replace('<!--LOGO-->', logo));

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
  const sfx = join(here, 'sfx.wav');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', join(framesDir, 'f%04d.png'),
    ...(existsSync(sfx) ? ['-i', sfx, '-af', 'apad', '-c:a', 'aac', '-b:a', '160k', '-shortest'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`Vidéo : ${out}`);
}
