"""Musique originale (libre de droits) pour la vidéo TutinGo -> music.wav

Style « éducatif joyeux » : marimba, glockenspiel, claquements de doigts, basse ronde, 117 BPM.
Calée sur l'animation (1 mesure = 2,05 s) :
  mesures 0-1 : marimba seul + doigts (l'élève demande, le radar cherche)
  mesure 2    : la basse et la grosse caisse douce entrent (la prof accepte et se déplace)
  mesure 3    : refrain au glockenspiel (dézoom sur l'appli)
  mesure 4    : accord brillant à l'arrivée du logo (8,2 s)
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
rng = np.random.default_rng(5)
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N); VERB = np.zeros(N)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def filt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(sig, t, gain=1.0, pan=0.0, verb=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[:N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))
    VERB[i:i + len(sig)] += sig * verb


def marimba(m, d=.7):
    t, f = tt(d), hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + .3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)
    s += .15 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t * 80)            # « toc » de la mailloche
    return s * np.minimum(1, t / .002)


def glock(m, d=1.2):
    t, f = tt(d), hz(m)
    s = (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 4)
         + .2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 9))
    return s * np.exp(-t * 2.6) * np.minimum(1, t / .002)


def bass(m, d):
    t, f = tt(d), hz(m)
    s = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 8)
    return s * np.minimum(1, t / .006) * np.exp(-t * 3) * np.minimum(1, (d - t) / .03)


def kick():
    t = tt(.3)
    f = 50 + 70 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def snap():
    t = tt(.15)
    n = filt(rng.standard_normal(len(t)), 'band', [1800, 4200]) * np.exp(-t * 70)
    return n + .4 * np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 120)


def shaker():
    t = tt(.08)
    return filt(rng.standard_normal(len(t)), 'high', 6000) * np.minimum(1, t / .01) * np.exp(-t * 45)


def pad(notes, d):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * hz(m) * c * t + rng.uniform(0, 6)) for m in notes for c in (.997, 1.003)) / (2 * len(notes))
    return s * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .4)


#            C               Am              F               G               C               Am              C (fin)
CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62], [60, 64, 67], [57, 60, 64], [60, 64, 67]]
ROOTS = [36, 45, 41, 43, 36, 45, 36]
ARP = [0, 1, 2, 1, 0, 2, 1, 2]          # motif de marimba en croches (indices dans l'accord, +12 une fois sur deux)
HOOK = {                                 # refrain au glockenspiel : (double-croche, note, durée)
    3: [(0, 79, 2), (2, 81, 2), (4, 79, 2), (6, 76, 4), (10, 74, 2), (12, 74, 2), (14, 76, 2)],
    4: [(0, 79, 3), (4, 84, 4), (8, 83, 2), (10, 81, 2), (12, 79, 4)],
    5: [(0, 76, 2), (2, 77, 2), (4, 76, 2), (6, 72, 4), (10, 74, 2), (12, 76, 2), (14, 79, 2)],
    6: [(0, 84, 8)],
}
kicks = []
for b, (ch, root) in enumerate(zip(CHORDS, ROOTS)):
    t0 = b * BAR
    last = b == 6
    place(pad([n + 12 for n in ch], BAR * (1.2 if last else 1.02)), t0, .1 if b < 3 else .14, verb=.4)
    if last:
        for j, m in enumerate(ch + [ch[0] + 12]):
            place(marimba(m + 12, 1.6), t0 + j * .03, .3, pan=-.3 + .2 * j, verb=.3)
    else:
        for i, idx in enumerate(ARP):
            m = ch[idx] + (12 if i % 2 else 0) + 12
            place(marimba(m), t0 + i * 2 * STEP, .3 if i % 2 == 0 else .22, pan=-.35 + .1 * (i % 8), verb=.25)
        for st in (4, 12):
            place(snap(), t0 + st * STEP, .4, pan=.25, verb=.3)
        if b >= 2:
            for st in range(16):
                place(shaker(), t0 + st * STEP, .035 + .035 * (st % 4 == 2), pan=-.45)
    if b >= 2:
        steps = [0] if last else [0, 6, 8, 14] if b == 2 else [0, 4, 8, 12]
        for st in steps:
            place(kick(), t0 + st * STEP, .55); kicks.append(t0 + st * STEP)
        pat = [(0, 16)] if last else [(0, 3), (3, 3), (6, 2), (8, 4), (12, 2), (14, 2)]
        for st, ln in pat:
            place(bass(root + (7 if st == 12 else 12 if st == 6 else 0), ln * STEP * .9), t0 + st * STEP, .32)
    for st, m, ln in HOOK.get(b, []):
        place(glock(m, max(.6, ln * STEP * 2)), t0 + st * STEP, .17, pan=.2, verb=.4)

# accord brillant + cymbale douce à l'arrivée du logo
for j, m in enumerate([72, 76, 79, 84]):
    place(glock(m, 2.0), 4 * BAR + j * .02, .1, pan=-.2 + .13 * j, verb=.5)
ct = tt(1.6)
place(filt(rng.standard_normal(len(ct)), 'high', 7000) * np.minimum(1, ct / .25) * np.exp(-ct * 2.5), 4 * BAR - .2, .05, verb=.2)

# léger pompage sur la grosse caisse
duck = np.ones(N)
for k in kicks:
    i = int(k * SR); d = tt(.2)
    duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], 1 - .25 * np.exp(-d / .08))

# réverbe stéréo
it = tt(1.6)
ir = [filt(rng.standard_normal(len(it)) * np.exp(-it / .45), 'low', 7000) for _ in range(2)]
ir = [x / np.sqrt(np.sum(x ** 2)) for x in ir]
wl, wr = (fftconvolve(VERB, x)[:N] for x in ir)
out = np.stack([L * duck + .45 * wl, R * duck + .45 * wr], 1)
out = np.tanh(out / np.abs(out).max() * 1.05) * .89

path = Path(__file__).with_name('music.wav')
with wave.open(str(path), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print(path)
