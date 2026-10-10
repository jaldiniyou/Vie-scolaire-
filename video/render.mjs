// Renders the TutinGo Reel: 1080x1920, 30 fps, H.264 + AAC, synced to the master voice-over.
//
//   node render.mjs                     full render -> out/tutingo-reel.mp4
//   node render.mjs --preview 7.5 20    PNG stills at the given times -> build/preview/
//   VO=path/to/voice.wav node render.mjs
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { W, H } from './lib.mjs';
import { drawFrame, DURATION, ASSETS } from './scenes.mjs';
import { buildMusic, buildSfx } from './audio.mjs';

const FPS = 30;
const here = path.dirname(new URL(import.meta.url).pathname);
const VO = process.env.VO || path.join(here, 'assets', 'voiceover.wav');
const BUILD = path.join(here, 'build');
const OUT = path.join(here, 'out');
fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

for (const d of ['/usr/share/fonts/opentype/inter', '/usr/share/fonts/truetype/inter']) if (fs.existsSync(d)) GlobalFonts.loadFontsFromDir(d);
const fontDir = path.join(here, 'assets', 'fonts');
if (fs.existsSync(fontDir)) GlobalFonts.loadFontsFromDir(fontDir);

// optional brand assets
async function loadAssets() {
  const logo = path.join(here, 'assets', 'logo.png');
  if (fs.existsSync(logo)) ASSETS.logo = await loadImage(logo);
  const sdir = path.join(here, 'assets', 'screens');
  if (fs.existsSync(sdir)) {
    for (const f of fs.readdirSync(sdir)) {
      if (/\.(png|jpe?g)$/i.test(f)) ASSETS.screens[f.replace(/\.\w+$/, '')] = await loadImage(path.join(sdir, f));
    }
  }
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);
  drawFrame(ctx, t);
}

async function preview(times) {
  const dir = path.join(BUILD, 'preview');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of times) {
    render(t);
    const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(f, await canvas.encode('png'));
    console.log(f);
  }
}

async function full() {
  const frames = Math.round(DURATION * FPS);
  const silent = path.join(BUILD, 'video.mp4');
  const ff = spawn('ffmpeg', [
    '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(FPS), silent,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    render(f / FPS);
    const data = ctx.getImageData(0, 0, W, H).data;
    if (!ff.stdin.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength))) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }
    if (f % 150 === 0) console.log(`frame ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));

  // audio: voice-over (untouched) + subtle SFX + quiet music bed ducked under the voice
  const music = path.join(BUILD, 'music.wav');
  const sfx = path.join(BUILD, 'sfx.wav');
  buildMusic(music, DURATION);
  buildSfx(sfx, DURATION);
  const mix = (out, withMusic) => execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y',
    '-i', silent, '-i', VO, '-i', sfx, '-i', music,
    '-filter_complex', [
      `[1:a]aresample=48000,apad=whole_dur=${DURATION},asplit=2[vo][vok]`,
      `[2:a]volume=0.55[fx]`,
      withMusic
        ? `[3:a]volume=0.35[mu];[mu][vok]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=400[duck];[vo][fx][duck]amix=inputs=3:normalize=0:duration=first[mix]`
        : `[vok]anullsink;[vo][fx]amix=inputs=2:normalize=0:duration=first[mix]`,
      `[mix]loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
    ].join(';'),
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-movflags', '+faststart', '-t', String(DURATION), out,
  ], { stdio: 'inherit' });
  mix(path.join(OUT, 'tutingo-reel.mp4'), true);
  mix(path.join(OUT, 'tutingo-reel-voice-only.mp4'), false);
  console.log('done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}

await loadAssets();
const i = process.argv.indexOf('--preview');
if (i >= 0) {
  const times = process.argv.slice(i + 1).map(Number).filter((n) => !Number.isNaN(n));
  await preview(times.length ? times : [2, 5, 7.5, 9.5, 11.5, 14, 16, 18, 21, 25, 29.5, 33, 35.5, 39.8, 44, 46.5, 49, 52]);
} else {
  if (!fs.existsSync(VO)) throw new Error(`voice-over not found: ${VO}`);
  await full();
}
