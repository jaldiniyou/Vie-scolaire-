// Synthesised music bed and UI sound effects (no third-party audio, so nothing to license).
import fs from 'node:fs';

const SR = 48000;

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32000), 44 + i * 2);
  fs.writeFileSync(file, buf);
}

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Light, positive pop bed: I–V–vi–IV in C at 108 BPM, soft plucks + warm pad + gentle kick.
export function buildMusic(file, dur) {
  const out = new Float32Array(Math.ceil(dur * SR));
  const bpm = 108, beat = 60 / bpm, bar = beat * 4;
  const chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
  const bass = [36, 43, 45, 41];
  const add = (t0, len, fn) => {
    const s0 = Math.floor(t0 * SR), s1 = Math.min(out.length, Math.floor((t0 + len) * SR));
    for (let s = Math.max(0, s0); s < s1; s++) out[s] += fn((s - s0) / SR);
  };
  for (let b = 0; b * bar < dur; b++) {
    const ch = chords[b % 4];
    const t = b * bar;
    // pad
    ch.forEach((m) => add(t, bar, (x) => {
      const env = Math.min(1, x / 0.4) * Math.min(1, (bar - x) / 0.4);
      const f = midi(m);
      return 0.035 * env * (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * x));
    }));
    // bass on beats 1 and 3
    [0, 2].forEach((k) => add(t + k * beat, beat * 1.8, (x) => 0.12 * Math.exp(-x * 2.5) * Math.sin(2 * Math.PI * midi(bass[b % 4]) * x)));
    // plucked arpeggio on 8th notes
    for (let k = 0; k < 8; k++) {
      const m = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12;
      add(t + k * beat / 2, 0.6, (x) => {
        const f = midi(m);
        return 0.05 * Math.exp(-x * 7) * (Math.sin(2 * Math.PI * f * x) + 0.4 * Math.sin(4 * Math.PI * f * x));
      });
    }
    // soft kick + shaker
    for (let k = 0; k < 4; k++) {
      add(t + k * beat, 0.25, (x) => 0.18 * Math.exp(-x * 18) * Math.sin(2 * Math.PI * (50 + 90 * Math.exp(-x * 30)) * x));
      add(t + k * beat + beat / 2, 0.06, (x) => 0.02 * Math.exp(-x * 60) * (Math.random() * 2 - 1));
    }
  }
  // fade in / out
  for (let s = 0; s < out.length; s++) {
    const x = s / SR;
    out[s] *= Math.min(1, x / 1.5) * Math.min(1, (dur - x) / 2.0);
  }
  writeWav(file, out);
}

// Cues line up with the visual beats in scenes.mjs
export const SFX_CUES = [
  ['pop', 0.92], ['pop', 1.6], ['pop', 2.42], ['pop', 2.94],
  ['whoosh', 3.4], ['tick', 4.0], ['pop', 4.4],
  ['whoosh', 5.95], ['chime', 6.5],
  ['whoosh', 7.95], ['click', 9.6], ['pop', 8.9], ['pop', 9.7],
  ['whoosh', 11.9], ['pop', 13.14], ['pop', 14.46], ['pop', 15.86],
  ['whoosh', 16.7], ['swish', 17.1], ['swish', 18.95], ['swish', 20.55],
  ['whoosh', 22.55], ['pop', 26.9], ['pop', 28.4], ['pop', 28.9],
  ['whoosh', 31.05], ['pop', 34.0], ['pop', 35.2], ['swish', 35.85], ['chime', 37.9],
  ['whoosh', 41.1], ['click', 41.9], ['click', 43.6], ['click', 44.6], ['click', 45.5],
  ['whoosh', 46.9], ['chime', 47.3], ['sparkle', 50.4],
];

export function buildSfx(file, dur) {
  const out = new Float32Array(Math.ceil(dur * SR));
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const add = (t0, len, fn) => {
    const s0 = Math.floor(t0 * SR);
    for (let s = 0; s < len * SR && s0 + s < out.length; s++) out[s0 + s] += fn(s / SR);
  };
  const kinds = {
    pop: (t) => add(t, 0.12, (x) => 0.35 * Math.exp(-x * 40) * Math.sin(2 * Math.PI * (500 + 700 * Math.exp(-x * 50)) * x)),
    click: (t) => add(t, 0.04, (x) => 0.3 * Math.exp(-x * 160) * rnd()),
    tick: (t) => { for (let k = 0; k < 6; k++) add(t + k * 0.18, 0.03, (x) => 0.2 * Math.exp(-x * 200) * Math.sin(2 * Math.PI * 2400 * x)); },
    whoosh: (t) => {
      let lp = 0;
      add(t - 0.15, 0.5, (x) => {
        const env = Math.sin(Math.PI * Math.min(1, x / 0.5));
        const a = 0.05 + 0.25 * env;
        lp += a * (rnd() - lp);
        return 0.22 * env * lp;
      });
    },
    swish: (t) => {
      let lp = 0;
      add(t, 0.3, (x) => {
        const env = Math.sin(Math.PI * Math.min(1, x / 0.3));
        lp += 0.3 * (rnd() - lp);
        return 0.14 * env * lp;
      });
    },
    chime: (t) => [72, 76, 79, 84].forEach((m, i) => add(t + i * 0.07, 1.2, (x) => 0.09 * Math.exp(-x * 3.5) * Math.sin(2 * Math.PI * midi(m) * x))),
    sparkle: (t) => [84, 88, 91, 96, 91, 96].forEach((m, i) => add(t + i * 0.06, 0.6, (x) => 0.06 * Math.exp(-x * 6) * Math.sin(2 * Math.PI * midi(m) * x))),
  };
  for (const [k, t] of SFX_CUES) kinds[k](t);
  writeWav(file, out);
}
