# Vidéo motion design TutinGo

`tutingo-motion.mp4` : 14 s, 1080×1080, 30 i/s, avec bruitages.

Déroulé : une prof apparaît sur le plan → elle devient une épingle → l'itinéraire se trace jusqu'à « Chez vous » → elle arrive (✓) → dézoom sur l'appli TutinGo → le téléphone glisse à gauche, logo + accroche + tutingo.com.

## Modifier / régénérer
- Logo : remplacez `logo.svg`, ou déposez un `logo.png` (il est prioritaire).
- Couleurs : variables `--primary`, `--accent`… en haut de `scene.html`.
- Textes, timing : `scene.html` (fonction `render(t)`, temps en secondes).

```sh
npm i playwright-core            # Chromium requis
./make-sfx.sh                    # bruitages -> sfx.wav (optionnel)
node render.mjs                  # -> tutingo-motion.mp4
node render.mjs --preview 1,5,9  # images fixes pour vérifier
```
