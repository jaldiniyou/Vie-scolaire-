# Vidéo motion design TutinGo

`tutingo-motion.mp4` : 14 s, 1080×1080, 30 i/s, musique originale libre de droits (`music.wav`, générée par `make-music.py`) + bruitages.

Déroulé : l'élève (Yasmine) demande un cours de Maths depuis chez elle → un radar cherche un prof → deux profs apparaissent sur le cercle → la prof de Maths accepte et se déplace jusqu'à la maison → dézoom sur l'appli TutinGo → le téléphone glisse à gauche : logo, accroche, matières, tutingo.com.

Avatars : `avatars/` (eleve.jpg, prof-femme.jpg, prof-homme.jpg).

## Modifier / régénérer
- Logo : `logo.png` (logo officiel détouré, fond transparent). Un `logo.svg` déposé à côté serait prioritaire.
- Couleurs du logo : violet `#6433DD` (G), violet `#751AE4` (repère), noir. Variables en haut de `scene.html`.
- Textes, timing : `scene.html` (fonction `render(t)`, temps en secondes).

```sh
npm i playwright-core            # Chromium requis
python3 make-music.py            # musique -> music.wav (numpy + scipy)
./make-sfx.sh                    # bruitages -> sfx.wav (optionnel)
node render.mjs                  # -> tutingo-motion.mp4
node render.mjs --preview 1,5,9  # images fixes pour vérifier
```
