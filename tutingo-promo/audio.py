#!/usr/bin/env python3
"""Soundtrack: original voice-over (untouched) + soft synthesized music bed ducked
under the voice + subtle paper whooshes at the scene transitions."""
import os
import subprocess
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
SR = 48000
DUR = 68.16
ST = [10.0, 19.45, 30.2, 42.45, 52.3, 59.2]  # transition starts (see render.py)
RIPS = {10.0, 30.2, 52.3}


def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return x.reshape(-1, w.getnchannels()).mean(1), w.getframerate()


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc):
    """Zero-phase FFT low-pass (smooth roll-off)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def hp(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def music(n):
    rng = np.random.default_rng(4)
    t = np.arange(n) / SR
    beat = 60 / 96
    bar = beat * 4
    chords = [[48, 55, 59, 62, 64], [45, 52, 55, 60, 64], [41, 48, 52, 57, 60], [43, 50, 55, 59, 62]]
    pad = np.zeros(n, np.float32)
    pl = np.zeros(n, np.float32)
    kick = np.zeros(n, np.float32)
    shk = np.zeros(n, np.float32)
    nbars = int(np.ceil(DUR / bar)) + 1
    for b in range(nbars):
        t0 = b * bar
        ch = chords[b % 4] if t0 < DUR - 2.2 else chords[0]
        i0 = int(t0 * SR)
        L = int((bar + 1.2) * SR)
        if i0 >= n:
            break
        L = min(L, n - i0)
        tt = np.arange(L) / SR
        env = np.minimum(tt / 0.6, 1) * np.clip((bar + 1.2 - tt) / 1.2, 0, 1)
        sig = np.zeros(L, np.float32)
        for k, m in enumerate(ch):
            for det in (-0.12, 0.12):
                f = midi(m) * 2 ** (det / 12)
                for h, amp in ((1, 1.0), (2, 0.35), (3, 0.15)):
                    sig += amp * np.sin(2 * np.pi * f * h * tt + k + h).astype(np.float32)
        pad[i0:i0 + L] += sig * env * 0.05
        # marimba-like arpeggio on 8ths
        tones = [m + 24 for m in ch[1:]] + [ch[2] + 36]
        for s in range(8):
            if t0 + s * beat / 2 >= DUR - 1.0:
                break
            if s in (3, 7) and rng.random() < 0.5:
                continue
            m = tones[(s * 3 + b) % len(tones)]
            j0 = int((t0 + s * beat / 2) * SR)
            Ln = min(int(0.9 * SR), n - j0)
            if Ln <= 0:
                continue
            tn = np.arange(Ln) / SR
            f = midi(m)
            v = 0.7 + 0.3 * rng.random()
            note = (np.sin(2 * np.pi * f * tn) * np.exp(-tn / 0.32) +
                    0.25 * np.sin(2 * np.pi * f * 4 * tn) * np.exp(-tn / 0.05)) * v
            pl[j0:j0 + Ln] += note.astype(np.float32) * np.minimum(tn / 0.004, 1)
        if b >= 1 and t0 < DUR - 2.5:
            for q in (0, 2):
                j0 = int((t0 + q * beat) * SR)
                Ln = min(int(0.35 * SR), n - j0)
                tn = np.arange(Ln) / SR
                ph = 2 * np.pi * (45 * tn + (90 - 45) * 0.06 * (1 - np.exp(-tn / 0.06)))
                kick[j0:j0 + Ln] += (np.sin(ph) * np.exp(-tn / 0.18)).astype(np.float32)
            for s in range(8):
                j0 = int((t0 + s * beat / 2 + beat / 4) * SR)
                Ln = min(int(0.08 * SR), n - j0)
                if Ln <= 0:
                    continue
                tn = np.arange(Ln) / SR
                shk[j0:j0 + Ln] += (rng.normal(0, 1, Ln) * np.exp(-tn / 0.025) * (0.6 if s % 2 else 1)).astype(np.float32)
    pad = lp(pad, 1800)
    pl = lp(pl, 4000)
    shk = hp(shk, 6000)
    mix = pad * 1.0 + pl * 0.10 + kick * 0.16 + shk * 0.022
    fade_in = np.clip(t / 1.5, 0, 1)
    fade_out = np.clip((DUR - t) / 2.2, 0, 1) ** 1.5
    return (mix * fade_in * fade_out).astype(np.float32)


def sfx(n):
    rng = np.random.default_rng(9)
    out = np.zeros(n, np.float32)
    for s in ST:
        L = int(0.75 * SR)
        j0 = int((s - 0.05) * SR)
        tn = np.arange(L) / SR
        env = np.sin(np.pi * np.clip(tn / 0.75, 0, 1)) ** 2
        nz = rng.normal(0, 1, L).astype(np.float32)
        wh = lp(hp(nz, 500), 3500) * env
        if s in RIPS:  # paper tearing crackle
            crack = hp(nz * (rng.random(L) < 0.05), 1800) * np.clip(tn / 0.5, 0, 1) * (tn < 0.55)
            wh = wh + crack * 0.8
        out[j0:j0 + L] += wh.astype(np.float32)
    return out


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def main():
    os.makedirs(OUT, exist_ok=True)
    vo48 = os.path.join(OUT, "vo48.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(HERE, "assets", "voiceover.wav"),
                    "-af", "aresample=48000:filter_size=64:cutoff=0.97", "-ac", "1", "-c:a", "pcm_s16le", vo48],
                   check=True)
    v, sr = read_wav(vo48)
    assert sr == SR
    n = int(DUR * SR)
    v = np.pad(v, (0, max(0, n - len(v))))[:n]
    m = music(n)
    m *= 10 ** ((-27 - rms_db(m[int(2 * SR):int(60 * SR)])) / 20)
    # duck the music under the voice (voice level itself is never touched)
    hop = 480
    e = np.sqrt(np.convolve(v ** 2, np.ones(2400) / 2400, "same"))[::hop]
    act = np.clip((20 * np.log10(e + 1e-9) + 42) / 12, 0, 1)
    sm = np.zeros_like(act)
    s = 0.0
    for i, a in enumerate(act):
        k = 0.35 if a > s else 0.04  # fast attack, slow release
        s += (a - s) * k
        sm[i] = s
    g = 1 - 0.55 * sm
    g = np.interp(np.arange(n), np.arange(len(g)) * hop, g).astype(np.float32)
    fx = sfx(n)
    fx *= 10 ** ((-34 - rms_db(fx[fx != 0])) / 20)
    mix = v + m * g + fx * (0.6 + 0.4 * (1 - g))
    peak = np.abs(mix).max()
    gain = min(1.0, 10 ** (-1 / 20) / peak)  # uniform gain only -> -1 dBFS peak, no limiting
    mix *= gain
    print(f"voice rms {rms_db(v):.1f} dB | music rms {rms_db(m * g):.1f} dB | global gain {20 * np.log10(gain):.2f} dB")
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    st = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(os.path.join(OUT, "soundtrack.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(st.tobytes())


if __name__ == "__main__":
    main()
