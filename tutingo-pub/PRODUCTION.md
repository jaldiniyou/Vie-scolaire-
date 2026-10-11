# TutinGo — Publicité Instagram Reels (9:16, 38 s)

Dossier de production : storyboard, prompts Higgsfield, voix off, sous-titres et montage.

## 0. Contraintes constatées

- **Site officiel inaccessible depuis l'environnement de production** (tutingo.com bloqué par la politique réseau du conteneur ; aucune fiche publique trouvée par recherche web). Conséquence : le logo, les couleurs exactes et le parcours de réservation réel **n'ont pas pu être vérifiés**. Rien n'a été inventé :
  - les écrans du smartphone sont générés en **fond vert (#00FF00)** et doivent recevoir une **capture d'écran réelle / un enregistrement d'écran** du parcours sur tutingo.com ;
  - l'écran final utilise des **variables de couleur** à remplacer par celles du site, et le **logo officiel** (fichier fourni par TutinGo).
- **Crédits Higgsfield** : compte gratuit, 15 crédits au départ, **entièrement consommés** par les 10 images clés (Nano Banana 2). Les clips vidéo (Kling 3.0 std, 5 s, sans son = 6,25 crédits l'unité) demandent ≈ 50 crédits pour les 8 plans : il faut recharger le compte ou passer au plan Basic (le modèle GPT Image 2.5 est d'ailleurs réservé aux plans payants).

## 1. Personnages (verrouillés par images de référence)

| Rôle | Description fixe | Job Higgsfield |
|---|---|---|
| **Élève** (~17 ans) | Cheveux bruns courts bouclés, peau mate, sweat bleu marine sur t-shirt blanc | `264890fe-a859-4aea-9169-ca1bf0269abd` |
| **Professeure de maths** (~32 ans) | Cheveux bruns attachés, boucles d'oreilles dorées, blazer beige, chemisier blanc, sac cabas cuir marron | `5fe3f6ed-08c1-40cb-ad92-207722a8e6fd` |

Décor récurrent : chambre d'appartement marocain contemporain, murs blancs, mur d'accent en zellige turquoise et blanc, bureau en bois, lumière naturelle chaude.

## 2. Storyboard minuté (38 s)

| # | Temps | Plan | Image clé (job) | Voix off | Sous-titre à l'écran |
|---|---|---|---|---|---|
| 1 | 0,0–4,5 | Élève bloqué sur son exercice, léger push-in | `3eb2c027…` | « Bloqué dans tes études ? Tu as besoin d'un professeur pour t'aider ? » | Bloqué dans tes études ? |
| 2 | 4,5–10,5 | Par-dessus l'épaule, smartphone (écran vert → capture réelle de la recherche de profs sur tutingo.com) | `c0b41651…` | « Avec TutinGo, trouve facilement le professeur qui te correspond. » | Trouve le prof qui te correspond |
| 3 | 10,5–17,0 | Pouce qui tape sur l'écran (écran vert → profil prof de maths + étape réelle de réservation / demande de cours) | `c0909867…` | « Choisis ton professeur et réserve ton cours présentiel en quelques étapes. » | Réserve ton cours présentiel |
| 4a | 17,0–19,5 | Professeure range cahier et calculatrice dans son sac | `af8ddd6c…` | « Et le meilleur ? | Le prof vient chez toi 🏠 |
| 4b | 19,5–22,0 | Elle marche dans une rue ensoleillée | `bf517ceb…` | …Ton professeur vient… | (suite) |
| 4c | 22,0–25,0 | L'élève ouvre la porte, accueil chaleureux | `eeb7d5c2…` | …directement chez toi ! » | (suite) |
| 5a | 25,0–29,0 | Ensemble au bureau, elle explique la méthode | `8831f791…` | « Un accompagnement personnalisé, à ton rythme, | À ton rythme |
| 5b | 29,0–32,0 | Il écrit seul la dernière ligne et sourit | `0a019d04…` | …pour progresser avec confiance. » | Progresse avec confiance |
| 6 | 32,0–38,0 | Écran final animé (logo + slogan + URL), tenu ≥ 4 s | — (motion design) | « TutinGo. Apprends partout où tu vas… même depuis chez toi ! » | voir §5 |

Accroche (0–2 s) : ouverture directe sur le visage frustré + son de crayon qui tape + sous-titre gros et immédiat.

## 3. Prompts vidéo Higgsfield (image → vidéo)

Modèle conseillé : `kling3_0`, `mode: std` (ou `pro` pour la version finale), `aspect_ratio: 9:16`, `sound: off` (la musique et la voix off sont ajoutées au montage). `start_image` = job de l'image clé.

```
Plan 1 (5 s)  : Slow cinematic push-in on the frustrated teenager at his desk; he sighs, taps his pencil on the notebook and rubs his forehead. Subtle natural movement, realistic, no camera shake.
Plan 2 (6 s)  : Over-the-shoulder shot; he scrolls slowly with his thumb on the phone. The phone screen stays a flat uniform green for compositing. Gentle handheld drift, shallow depth of field.
Plan 3 (6 s)  : Close-up of his thumb tapping the phone twice; the screen stays a flat uniform green. Rack focus to his face as he smiles with relief.
Plan 4a (3 s) : She slides the notebook into her leather tote bag, closes it, shoulders it and turns toward the door, smiling.
Plan 4b (3 s) : Tracking shot following her as she walks along the sunny street, confident pace, hair moving slightly in the breeze.
Plan 4c (3 s) : He opens the front door, they both smile and greet each other warmly; she steps inside.
Plan 5a (4 s) : She points at the notebook with a pencil and explains; he nods, his expression shifts from concentration to understanding.
Plan 5b (3 s) : He writes the final line by himself, looks up and smiles proudly; she nods approvingly in soft focus.
```

Règles : ne jamais demander à l'IA de dessiner l'interface TutinGo ni du texte ; garder les écrans en vert.

## 4. Écrans smartphone (plans 2 et 3)

1. Sur un vrai téléphone, ouvrir tutingo.com et **enregistrer l'écran** (1080×1920) : recherche d'un prof → filtre Mathématiques → profil → bouton de réservation / demande de cours en présentiel.
2. Si une confirmation de réservation existe réellement, l'inclure à la fin du plan 3 ; sinon, terminer sur l'envoi de la demande de cours tel qu'il existe sur le site.
3. Incruster l'enregistrement sur le fond vert (keying + suivi 4 points dans CapCut / Premiere / After Effects / DaVinci Resolve).

## 5. Écran final (32–38 s)

- Fond : couleur principale du site (`--tg-primary`, à relever sur tutingo.com), dégradé léger vers `--tg-secondary`.
- 32,0 s : logo officiel TutinGo (fichier fourni) en scale-in doux 0,9→1.
- 33,0 s : texte principal, 3 mots apparaissant en cascade :
  **Le bon professeur. Chez toi. À ton rythme.**
- 34,5 s : bouton/pastille : **Trouve ton professeur sur www.tutingo.com** (URL en gras, ≥ 64 px de haut, contraste AA).
- Tenue fixe jusqu'à 38 s (≥ 3,5 s de lecture de l'URL).
- Zone de sécurité Reels : aucun texte dans les 250 px du haut ni les 400 px du bas.

## 6. Voix off

Français, voix chaleureuse et naturelle, légère intonation marocaine, débit ≈ 2,6 mots/s. Texte complet (≈ 80 mots, ≈ 30 s de parole) :

> Bloqué dans tes études ? Tu as besoin d'un professeur pour t'aider ?
> Avec TutinGo, trouve facilement le professeur qui te correspond.
> Choisis ton professeur et réserve ton cours présentiel en quelques étapes.
> Et le meilleur ? Ton professeur vient directement chez toi !
> Un accompagnement personnalisé, à ton rythme, pour progresser avec confiance.
> TutinGo. Apprends partout où tu vas… même depuis chez toi !

Génération possible via Higgsfield `generate_audio` (TTS) ou enregistrement par une vraie voix (recommandé pour l'accent).

## 7. Musique

Instrumental moderne, positif, 100–110 BPM (pop acoustique / lo-fi lumineux), sans paroles. Mixage : musique à −20 dB sous la voix, remontée à −12 dB sur l'écran final ; légère montée (riser) à 17 s pour la transition vers le professeur. Utiliser une piste libre de droits (bibliothèque audio Instagram ou CapCut).

## 8. Sous-titres

Fichier `sous-titres.srt` fourni. Style : police sans-serif grasse (Montserrat/Poppins Bold), 56–64 px, blanc avec contour/ombre sombre, centrés à ~65 % de la hauteur, 2 lignes max. Les mots clés (« TutinGo », « présentiel », « chez toi ») peuvent être surlignés avec `--tg-primary`.

## 9. Assemblage (CapCut / Premiere / DaVinci)

1. Projet 1080×1920, 30 i/s.
2. Placer les clips selon le §2 ; transitions : coupe sèche 1→2, *match cut* sur le geste du pouce 3→4a, *whip pan* 4a→4b, fondu court 4c→5a, *push* lumineux 5b→6.
3. Incruster les enregistrements d'écran (§4).
4. Ajouter voix off, musique, sous-titres (§6–8), puis l'écran final (§5).
5. Étalonnage commun : tons chauds, légère désaturation des verts, contraste doux.
6. Vérifier : durée ≤ 38 s, URL lisible, sous-titres dans la zone de sécurité.
7. Export H.264, 1080×1920, 30 i/s, 12–16 Mb/s, AAC 320 kb/s.

## 10. Images clés générées (Higgsfield, 9:16)

À valider visuellement (cohérence des visages, écran vert propre) avant l'animation.

- Réf. élève : [264890fe-a859-4aea-9169-ca1bf0269abd](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164127_264890fe-a859-4aea-9169-ca1bf0269abd.png)
- Réf. professeure : [5fe3f6ed-08c1-40cb-ad92-207722a8e6fd](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164128_5fe3f6ed-08c1-40cb-ad92-207722a8e6fd.png)
- Plan 1 : [3eb2c027-07b7-4c7a-bb8d-500717b07c9f](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164235_3eb2c027-07b7-4c7a-bb8d-500717b07c9f.png)
- Plan 2 (écran vert) : [c0b41651-3516-432d-b0dd-3e133339f71a](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164234_c0b41651-3516-432d-b0dd-3e133339f71a.png)
- Plan 3 (écran vert) : [c0909867-d21a-4ba6-90b4-339c3579a27c](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164234_c0909867-d21a-4ba6-90b4-339c3579a27c.png)
- Plan 4a : [af8ddd6c-09f3-41e3-a393-5feb7431543f](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164235_af8ddd6c-09f3-41e3-a393-5feb7431543f.png)
- Plan 4b : [bf517ceb-07ad-43f3-90af-cce0ce377286](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164235_bf517ceb-07ad-43f3-90af-cce0ce377286.png)
- Plan 4c : [eeb7d5c2-15bf-49f1-9a0c-09d4d318befb](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164234_eeb7d5c2-15bf-49f1-9a0c-09d4d318befb.png)
- Plan 5a : [8831f791-2dcf-4b91-806e-60bd5540c841](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164236_8831f791-2dcf-4b91-806e-60bd5540c841.png)
- Plan 5b : [0a019d04-455e-44b6-968c-8649a1087991](https://d8j0ntlcm91z4.cloudfront.net/user_2vzYoFk3TtVXg6X8T4WUXMaPXio/hf_20261011_164236_0a019d04-455e-44b6-968c-8649a1087991.png)
