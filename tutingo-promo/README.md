# TutinGo — promo vidéo « cut-out collage » (9:16)

A 68-second vertical ad (1080×1920, 30 fps, H.264 + AAC). It is cut to the supplied French voice-over (`assets/voiceover.wav`).

- `kit.py`: the collage toolkit. It draws paper grain and fibres, hand-cut and torn cards with white fibrous edges, sticker cut-outs, halftone-printed clothing, faceless editorial figures, and icons, devices and school objects.
- `render.py`: the seven storyboard scenes, the torn-paper and sliding-card transitions, and parallel H.264 encoding.
- `audio.py`: keeps the original voice-over intact (resampled to 48 kHz, no processing). It adds a soft synthesized music bed ducked under the voice (about 16 dB below it) and subtle paper whooshes and rips at the transitions.

## Build

```bash
python3 audio.py                 # out/soundtrack.wav
python3 render.py video          # out/video_silent.mp4 (≈ 4 CPU processes)
ffmpeg -i out/video_silent.mp4 -i out/soundtrack.wav -map 0:v -map 1:a \
       -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/tutingo_promo_9x16.mp4
python3 render.py preview 12.5 41.8   # PNG stills for quick checks
```

## Timeline (synced to the voice-over pauses)

| Time | Scene | On-screen text |
|---|---|---|
| 0.0 – 10.0 | 1. The teacher's ambition | « Vous êtes professeur ? » → « Comment toucher plus d’élèves ? » |
| 10.0 – 19.5 | 2. TutinGo (rip transition, chalkboard → laptop) | Logo · « Enseignants et élèves, connectés. » |
| 19.5 – 30.2 | 3. Profile built from paper cards | « Mettez en valeur votre expertise » · Matières / Diplômes / Expérience / Méthode pédagogique |
| 30.2 – 42.5 | 4. Visibility network | « Plus de visibilité » · « Plus d’opportunités » |
| 42.5 – 52.3 | 5. Online and in person | « En ligne » · « ou » · « En présentiel » |
| 52.3 – 59.2 | 6. Sharing | « Partagez votre profil » · « avec vos contacts et anciens élèves » |
| 59.2 – 68.16 | 7. Call to action, paper-fold reveal | « Créez et partagez votre profil » · logo · « Learn Anywhere You Go » · www.tutingo.com |

## Notes

- The interface screens are **stylized illustrations**, not captures of the website: tutingo.com could not be reached from the build environment. Text lines are neutral placeholder bars. There are no names, ratings, prices, student counts or testimonials.
- The messaging and social icons are generic (no third-party logos).
- The logo is the supplied official file, used as-is with its white background removed.
