# TutinGo — Reel explainer (9:16)

60-second-class explainer for Instagram Reels, synchronised to the Darija voice-over in
`assets/voiceover.wav` (51.5 s; the voice is used untouched as the master timeline, and the
final frame is held ~2.5 s so the URL can be read → 54 s total).

| | |
|---|---|
| Format | 1080 × 1920, 30 fps, H.264 High / AAC 48 kHz, `+faststart` |
| Files | `out/tutingo-reel.mp4` (voice + SFX + music bed), `out/tutingo-reel-voice-only.mp4` (voice + SFX) |
| Loudness | ≈ −14/−15 LUFS integrated (Instagram-friendly), music ducked under the voice |
| Safe area | Logo, headlines, labels and URL kept between y≈270 and y≈1520 (clear of Reels UI) |

## Render

```bash
npm install
node render.mjs                       # full render → out/
node render.mjs --preview 7.5 20 44   # PNG stills → build/preview/
```

Everything is drawn in code (`lib.mjs` = shapes/characters/props, `scenes.mjs` = timeline,
`audio.mjs` = synthesised SFX + music — no third-party media, nothing to license).

## ⚠️ Brand assets to plug in

`tutingo.com` could not be reached from the build environment, so:

- **Logo** — the TutinGo mark shown is a placeholder. Drop the real logo at `assets/logo.png`
  (transparent PNG) and re-render; it replaces the placeholder everywhere.
- **Colours** — edit `BRAND` at the top of `lib.mjs` with the colours sampled from the site.
- **Website screens** — the devices show a schematic UI (shapes/icons only, no invented
  interface text). Add real screenshots to `assets/screens/` and they are used automatically:
  `search.png` (laptop, scene 2), `mobile.png` (phone, scenes 2 & 7), `lesson.png` (video-call screen).

## Sync map (voice-over cue → visual)

| Time | Voice-over (transcribed) | Visual |
|---|---|---|
| 0.0 | Bghiti tt3allem l-anglais (0.9), l-français (1.6), l-espagnol (2.4) w l-allemand (2.9)? | Learner with phone; English / Français / Español / Deutsch chips pop on each word |
| 3.6 | Walakin ma 3endekch l-weqt, z-z7am kay3ayyik (5.2) | Traffic jam, frustrated driver, fast clock, calendar filling up |
| 6.2 | M3a TutinGo (7.2), khtar (8.0) cours online (8.9) wla présentiel (9.7), w l-prof yji 7tal darek (10.5) | Logo reveal → laptop + phone with the platform → Online / Présentiel → tutor walks to the learner's door |
| 12.1 | T3allem m3a assatida mou2ahhalin (13.1), b programme mlaa2em l-niveau (15.4) w l-objectifs dyalek (15.9) | Tutor at the board, student on laptop, "Diplômés · expérimentés", level bars, target |
| 16.9 | Bghiti t7assen l-anglais dyalek, tewjed l-examen international (19.0), wla l-parcours professionnel (20.6) | Three learner profiles slide in on each phrase |
| 22.8 | TutinGo katwjjed lik l-formation li katnasbek … préparation l-examen (26.5) … TESOL w CELTA (~28.5) … selon les programmes disponibles (29.8) | Level staircase A1→C2; **exam prep (TOEFL)** shown separately from **teacher training (TESOL · CELTA)** |
| 31.3 | Qra f l-mkan w f l-weqt li kaynasbek, online (34.0) wla présentiel (35.2) | Split screen: online lesson at a desk / tutor at home; calendar, clock, pin, check |
| 36.0 | W m3a ba3d l-formations … certificat (38.3) délivré mn l-organisme (39.5) | Generic certificate + "Délivré par l'organisme concerné" (no claim that TutinGo awards it) |
| 41.4 | Dkhol l tutingo.com, khtar l-formation dyalek (43.6), w bda t7aqqaq l-ahdaf dyalek (44.9) | URL typed in a browser bar + 4 steps: account → subject & tutor → book a slot → online or at home |
| 47.1 | TutinGo: t3allem fin ma bghiti (47.9), w 7tta l-prof yji 3endek l-dar (49.4) | Final composition, logo, slogan, **www.tutingo.com** held to the end |

Transcript timings come from a local Whisper run (Arabic + French passes) and are approximate
for the 26–31 s passage, where the acronyms were not transcribed cleanly.
