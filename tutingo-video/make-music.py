"""Musique originale (libre de droits) pour la vidéo TutinGo -> music.wav

Pop entraînante à 117 BPM, calée sur l'animation :
  mesures 0-1 : intro (accords pluck + charleston)
  mesure 2    : grosse caisse + basse + montée (riser) pendant le dézoom
  mesure 3    : drop (6,15 s)
  mesure 4    : crash à l'arrivée du logo (8,2 s)
  mesure 6    : accord final
Usage : python3 make-music.py   (numpy + scipy)
"""
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 14.2
BPM = 117
STEP = 60 / BPM / 4          # double-croche
BAR = STEP * 16
rng = np.random.default_rng(3)
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N); VERB = np.zeros(N)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def filt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)


def place(sig, t, gain=1.0, pan=0.0, verb=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[:N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))
    VERB[i:i + len(sig)] += sig * verb


def tt(d):
    return np.arange(int(d * SR)) / SR


def pluck(m, d=0.6):
    t, f = tt(d), hz(m)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + .45 * np.sin(4 * np.pi * f * t) * np.exp(-t * 9)
         + .2 * np.sin(6 * np.pi * f * t) * np.exp(-t * 14))
    return s * np.minimum(1, t / .003)


def lead(m, d):
    t, f = tt(d + .25), hz(m)
    vib = 1 + .004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .3)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = sum(np.sin(k * ph) / k ** 2 * (-1) ** ((k - 1) // 2) for k in (1, 3, 5, 7))  # triangle
    s += .35 * np.sin(2 * ph) * np.exp(-t * 6)                                       # attaque type marimba
    env = np.minimum(1, t / .008) * np.where(t < d, np.exp(-t * 1.2), np.exp(-d * 1.2) * np.exp(-(t - d) * 18))
    return s * env


def bass(m, d):
    t, f = tt(d), hz(m)
    saw = sum(np.sin(2 * np.pi * k * f * t) / k for k in range(1, 9))
    s = filt(saw, 'low', 420) * .6 + np.sin(2 * np.pi * f * t)
    return s * np.minimum(1, t / .005) * np.exp(-t * 2.5) * np.minimum(1, (d - t) / .02)


def kick():
    t = tt(.4)
    f = 45 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + .3 * np.exp(-t * 300) * rng.standard_normal(len(t))


def clap():
    t = tt(.35)
    n = filt(rng.standard_normal(len(t)), 'band', [900, 3200])
    env = sum(np.exp(-np.maximum(0, t - o) * 60) * (t >= o) for o in (0, .012, .024)) + np.exp(-t * 14) * .6
    return n * env * .7


def hat(d=.05):
    t = tt(d * 4)
    return filt(rng.standard_normal(len(t)), 'high', 7500) * np.exp(-t / d * 2.2)


def pad(notes, d):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * np.cumsum(np.full(len(t), hz(m) * c)) / SR + rng.uniform(0, 6))
            for m in notes for c in (.996, 1, 1.004)) / (3 * len(notes))
    return s * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .3)


CHORDS = [[60, 64, 67, 72], [59, 62, 67, 71], [57, 60, 64, 69], [57, 60, 65, 69],
          [60, 64, 67, 72], [59, 62, 67, 71], [60, 64, 67, 72]]
ROOTS = [36, 43, 45, 41, 36, 43, 36]
MELODY = {
    3: [(0, 77, 2), (2, 76, 2), (4, 72, 3), (8, 69, 2), (10, 72, 2), (12, 74, 4)],
    4: [(0, 76, 2), (2, 74, 2), (4, 72, 2), (6, 74, 3), (10, 76, 2), (12, 79, 4)],
    5: [(0, 79, 2), (2, 77, 2), (4, 74, 3), (8, 71, 2), (10, 74, 2), (12, 76, 4)],
    6: [(0, 72, 10)],
}
kicks = []
for b, (ch, root) in enumerate(zip(CHORDS, ROOTS)):
    t0 = b * BAR
    last = b == 6
    # nappe
    place(pad(ch, BAR * (1.15 if last else 1.02)), t0, .5 if b >= 3 else .3, verb=.3)
    # accords pluck syncopés
    for st in ([0] if last else [0, 3, 6, 10, 12]):
        for j, m in enumerate(ch):
            place(pluck(m, 1.6 if last else .6), t0 + st * STEP, (.16 if b < 2 else .2), pan=-.3 + .2 * j, verb=.25)
    # charleston / shaker
    if 1 <= b and not last:
        for st in (2, 6, 10, 14):
            place(hat(), t0 + st * STEP, .35, pan=.4)
    if b >= 3 and not last:
        for st in range(16):
            place(hat(.02), t0 + st * STEP, .12 + .06 * (st % 2), pan=-.4)
    # grosse caisse
    if b == 2:
        steps = [0, 4, 8]
    elif b >= 3:
        steps = [0] if last else [0, 4, 8, 12]
    else:
        steps = []
    for st in steps:
        place(kick(), t0 + st * STEP, .9); kicks.append(t0 + st * STEP)
    # clap
    if 3 <= b < 6:
        for st in (4, 12):
            place(clap(), t0 + st * STEP, .55, verb=.35)
    # basse
    if b >= 2:
        pat = [(0, 16)] if last else [(0, 3), (3, 3), (6, 2), (8, 3), (11, 3), (14, 2)]
        for i, (st, ln) in enumerate(pat):
            place(bass(root + (12 if st in (6, 14) else 0), ln * STEP * .95), t0 + st * STEP, .38)
    # mélodie
    for st, m, ln in MELODY.get(b, []):
        place(lead(m, ln * STEP), t0 + st * STEP, .3, pan=.15, verb=.35)

# montée avant le drop + crash sur le logo
rise_t = tt(BAR * .9)
riser = filt(rng.standard_normal(len(rise_t)), 'high', 1500) * (rise_t / rise_t[-1]) ** 2
riser += .3 * np.sin(2 * np.pi * np.cumsum(300 + 900 * (rise_t / rise_t[-1]) ** 2) / SR) * (rise_t / rise_t[-1]) ** 2
place(riser, 3 * BAR - len(rise_t) / SR, .22, verb=.2)
for t0, g in ((3 * BAR, .12), (4 * BAR, .18)):
    ct = tt(2.2)
    place(filt(rng.standard_normal(len(ct)), 'high', 5000) * np.exp(-ct * 3.2), t0, g, verb=.15)

# pompage (sidechain) sur la grosse caisse
duck = np.ones(N)
for k in kicks:
    i = int(k * SR); d = tt(.25)
    duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], 1 - .45 * np.exp(-d / .09))

# réverbe (stéréo décorrélée)
it = tt(1.4)
ir = [rng.standard_normal(len(it)) * np.exp(-it / .35) for _ in range(2)]
ir = [filt(x, 'low', 6000) / np.sqrt(np.sum(x ** 2)) for x in ir]
wl, wr = (fftconvolve(VERB, x)[:N] for x in ir)
out = np.stack([L * duck + .5 * wl, R * duck + .5 * wr], 1)
out = np.tanh(out / np.abs(out).max() * 1.1) * .89

path = Path(__file__).with_name('music.wav')
with wave.open(str(path), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print(path)
