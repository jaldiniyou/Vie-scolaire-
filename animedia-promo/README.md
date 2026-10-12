# Animedia Studio – Promo Reel (9:16)

`animedia-studio-promo-9x16.mp4` — 1080×1920, 30 fps, H.264/AAC, 44.6 s.

## Pipeline (`src/`)
1. `audio.py` – takes the supplied voice-over (48.1 s), keeps every word but tightens the pauses so it fits under 45 s. Adds a synthesized ambient pad, a soft pulse, paper/whoosh SFX, a riser and an impact on the logo reveal, with the music ducked under the voice. Writes `mix.wav` and `timeline.json` (phrase timings).
2. `assets.py` – procedural cut-out collage assets: torn paper with fibre rims, halftone, sticker outlines, pseudo-photos, camera, monitor, phone, film strip, product, clapperboard, silhouette, and the logo keyed from the supplied image.
3. `render.py` – a 2.5D parallax compositor with kinetic typography, nine scenes timed to the narration, and torn-paper transitions. It pipes frames to ffmpeg.

Run: `python3 audio.py && python3 render.py` (needs Pillow, numpy, soundfile, ffmpeg). Before running, set the voice-over path in `audio.py` (`SRC`) and the logo path in `render.py` (`LOGO`).
