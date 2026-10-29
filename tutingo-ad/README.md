# TutinGo — publicité vidéo (Remotion)

Pub verticale 9:16, 1080 × 1920, 30 fps, pour TikTok, Instagram Reels et Facebook Reels.
La piste audio principale est la voix off en darija (`public/audio/tutingo-voiceover.wav`, **44,12 s**).
La composition dure **1324 images (44,13 s)**. Cette durée est recalculée à partir de l'audio dans `calculateMetadata()`, donc la fin de la voix off n'est jamais coupée.

## Commandes

```bash
cd tutingo-ad
npm install
npm run dev        # Remotion Studio : prévisualisation + timeline
npm run render     # → out/tutingo-ad.mp4 (H.264, CRF 18, AAC)
npm run still      # image fixe de contrôle (out/preview.png)
npm run typecheck
```

Si Remotion ne parvient pas à télécharger son navigateur (réseau restreint), ajoutez `--browser-executable=/chemin/vers/chrome` à la commande.

## Structure

```
src/
  index.ts               registerRoot
  Root.tsx               <Composition>, durée = durée de l'audio
  TutinGoAd.tsx          timeline : audio, scènes, transitions, sous-titres
  components/
    Scene.tsx            plans (image / vidéo / placeholder) + mouvement de caméra + fondus
    Placeholder.tsx      visuels temporaires propres (pictogramme + fichier attendu)
    SolutionScene.tsx    smartphone avec recherche de professeurs
    Overlays.tsx         étalonnage, chip « À domicile », mots-clés, titres
    BrandEndCard.tsx     appel à l'action final (logo, slogan, tutingo.com)
    Brand.tsx            logo officiel, badge, transition lumineuse, pictogramme de localisation
    Subtitle.tsx         sous-titres mot par mot (zone sûre mobile)
  data/
    config.ts            couleurs, format, audio, textes de marque, options
    scenes.ts            storyboard : timings, plans, médias, prompts Higgsfield
    subtitles.ts         sous-titres (modifiables sans toucher au code)
public/
  audio/tutingo-voiceover.wav
  images/tutingo-logo.png   logo officiel fourni
  fonts/Poppins-*.woff2     police embarquée (SIL OFL, voir OFL.txt)
```

## Découpage temporel (calé sur les pauses mesurées dans l'audio)

| Scène | Temps | Voix off |
|---|---|---|
| 1. Le problème | 0,00 – 9,55 s | Katkhdmo nhar kamel … ma kayse3fkomch ? |
| 2. La solution (smartphone) | 9,55 – 15,75 s | M3a TutinGo, l7ell wlla sahal ! Kanwafro … vérifiés |
| 3. Le prof à domicile | 15,75 – 19,40 s | wajdin yjiw 7ta ldarkom, w y3awnou … |
| 4. La qualité des révisions | 19,40 – 22,45 s | fhemt doross, w listi3dad lforod w limti7anat |
| 5. Les parents tranquilles | 22,45 – 29,38 s | Ntomma rkzo … f ra7a dyal darkom |
| 6. Appel à l'action | 29,38 – fin | Ma tdi3och lwe9t ! … w ra7t balikom ! |

Les frontières entre phrases viennent de `ffmpeg silencedetect`. Aucun outil de transcription n'était disponible, donc les coupures **à l'intérieur** d'une longue phrase sont des estimations.
Pour les affiner, écoutez la vidéo dans le Studio et modifiez `start`/`end` dans `src/data/subtitles.ts` (et `CTA_BEATS` / `QUALITY_KEYWORDS` dans `scenes.ts`).
`SUBTITLE_OFFSET_SEC` dans `config.ts` décale tous les sous-titres d'un coup.

## Remplacer les placeholders par des visuels Higgsfield

Chaque plan de `src/data/scenes.ts` a un champ `placeholder.file` (le nom de fichier attendu) et un champ `prompt` (prêt à coller dans Higgsfield).

1. Générez l'image dans Higgsfield en **9:16** (au moins 1080 × 1920) avec le `prompt` du plan. Pour un plan animé, générez une vidéo image-to-video de 3 à 5 s à partir de cette image.
2. Gardez **les mêmes personnages** d'un plan à l'autre (mère, enfant, professeur). Utilisez la même image de référence ou le même personnage Higgsfield (Soul ID / référence) pour toutes les générations.
3. Déposez le fichier dans `public/images/` (ou `public/videos/` pour une vidéo).
4. Dans `scenes.ts`, remplacez `media: null` par :
   ```ts
   media: {type: 'image', src: 'images/s1-mere.jpg'}
   // ou
   media: {type: 'video', src: 'videos/s1-mere.mp4'}   // le son de la vidéo est coupé
   ```
5. Une fois tous les visuels en place, mettez `SHOW_PLACEHOLDER_HINTS = false` dans `config.ts`.

Fichiers attendus : `s1-mere`, `s1-cahier`, `s1-fatigue`, `s3-arrivee`, `s3-explication`, `s4-tableau`, `s4-exercice`, `s4-bravo`, `s5-mere-sourit`, `s5-famille` (en `.jpg` ou `.mp4`).
Placez les visages dans le tiers central de l'image : les sous-titres occupent la bande basse (400 à 560 px du bas) et les titres la bande haute.

## Notes de conformité

- Le logo est le fichier officiel fourni, sans retouche. Il est posé sur une carte blanche, et la bande vide sous le texte est rognée à l'affichage.
- Les profils du smartphone sont des **données d'interface fictives** (`DEMO_TEACHERS`). Ils n'affichent ni note, ni avis, ni certification.
