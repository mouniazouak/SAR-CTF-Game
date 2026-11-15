# Brief pour mon assistant IA : partie Data & AI (SAR CTF Game)

> **À l'assistant IA qui lit ce fichier :**
> Tu vas m'aider sur ma partie d'un projet de hackathon. Lis tout ce fichier, puis guide-moi **étape par étape** en suivant les règles ci-dessous.

---

## 0. Comment tu dois travailler avec moi

1. **Une seule étape à la fois.** Après chaque étape, **attends que je confirme** (« fait », une capture d'écran ou un message d'erreur) avant de passer à la suivante.
2. Pour chaque étape, explique en **français simple** :
   - **Pourquoi** on fait cette étape
   - **Quel problème** elle résout
   - **Comment ça marche** (en 2-3 phrases, avec une analogie si possible)
   - La **commande ou le code à copier-coller**
   - **Comment vérifier** que c'est réussi
3. Ne fais **rien à ma place** sans me le dire. Je veux comprendre et taper moi-même.
4. **Le code (variables, commentaires, noms de fichiers) doit être en anglais.** Seules tes explications sont en français.
5. Si je fais une erreur, explique **ce que l'erreur veut dire** avant de donner la correction.
6. Ne me demande **jamais** de coller une clé API, un mot de passe ou un token dans le chat.

---

## 1. Le projet en bref

- **Événement :** NASA Space Apps Challenge 2026, Ben Guerir (1337 / UM6P), 14-15 novembre 2026, 48 h.
- **Défi :** « Dancing with the SARs ». Construire une application interactive qui utilise les données radar du satellite **NISAR** (NASA + ISRO) pour suivre des **changements de surface** (inondations, incendies, séismes…) partout dans le monde.
- **Notre idée :** un **jeu CTF de formation**. Le joueur apprend à lire des images radar NISAR à travers des missions (ex. : trouver une inondation), puis utilise les mêmes outils en **Field Mode** sur de vrais lieux.
- **Site web :** Next.js (déjà fait par le dev web), dans le repo `https://github.com/mouniazouak/SAR-CTF-Game`.
- **Notre partie (Data & AI) :** fournir les **vraies données NISAR** et l'**analyse automatique** (« SARah », l'assistante IA du jeu).

### Équipe

| Rôle | Qui | Fait quoi |
|---|---|---|
| Web | dev web | Site, carte, API, flags, score |
| Cyber & contenu | coéquipier cyber | Missions, questions, indices, sécurité |
| **Data & AI : A** | mon coéquipier | **Pipeline NISAR** (le « cerveau ») |
| **Data & AI : B** | **moi** | **Contexte + SARah** (la « voix ») |

---

## 2. Les notions à connaître (explique-les-moi si je demande)

- **Radar (SAR) :** le satellite envoie une onde et mesure l'**écho** qui revient. Ça marche **de nuit et à travers les nuages**.
- **NISAR :** satellite NASA-ISRO lancé le 30 juillet 2025. Radar **bande L** (longueur d'onde ≈ 24 cm). Repasse au **même endroit tous les 12 jours**.
- **Backscatter en dB :** chaque pixel = la force de l'écho.
  - **Eau calme ≈ −20 à −25 dB → noir** (l'eau agit comme un miroir, l'écho part ailleurs)
  - Sol nu ≈ −12 à −18 dB → gris foncé
  - Forêt ≈ −8 à −12 dB → gris
  - Ville ≈ 0 à +5 dB → blanc
- **Polarisation :** **HH** est bon pour l'eau, **HV** pour la végétation.
- **Produit GCOV :** image de backscatter déjà placée sur la carte. **C'est celui qu'on utilise.** Fichiers `.h5` (HDF5), ≈ 1,8 GB chacun.
- **Avant / après :** deux images du **même endroit**, avec le **même angle de vue**, prises à deux dates (avant et après l'événement). La comparaison montre **ce qui a changé**. Une seule image ne suffit pas : on ne sait pas si l'eau était déjà là.
- **Même angle de vue = même Track + même Frame + même direction** (Ascending/Descending).
- **Lire un nom de fichier :** `NISAR_L2_PR_GCOV_034_058_A_...` → cycle `034`, **track `058`**, direction **`A`** (ascending), puis frame et dates.
- **Disponibilité des données NISAR :**
  - BETA : 17 oct 2025 → 20 jan 2026 (pré-calibration)
  - PROVISIONAL : 17 juin 2026 → 23 oct 2026 (calibré)
  - VALIDATED : 21 oct 2026 → aujourd'hui (le meilleur)
  - **Rien entre le 20 janvier et le 17 juin 2026.**

### Notre « IA » (simple et explicable, pas de deep learning)

1. **Détection de l'eau :** seuil automatique **Otsu** (sépare les pixels sombres = eau des pixels gris = sol). Exemple : seuil ≈ −18 dB.
2. **Détection du changement :** `after_db - before_db`. Si < −3 dB, la zone est devenue beaucoup plus sombre → probablement de l'eau nouvelle.
3. **Classification par règles** autour du point cliqué par le joueur :
   - eau après **et** pas eau avant → **inondation**
   - eau avant **et** après → **eau permanente** (rivière, lac)
   - sinon → **pas de changement**
4. **Confiance** = pourcentage des pixels de la zone qui sont d'accord avec la conclusion.
5. **Gemini (LLM)** sert **uniquement à reformuler** l'explication en phrase claire. Les chiffres viennent des règles. Si l'API ne répond pas → **phrase modèle (template)**.

---

## 3. Répartition du travail

### A (mon coéquipier) : pipeline NISAR

Pour info, pour que je sache ce qu'il fait et ce qu'il va me donner :

1. ✅ Espace de travail prêt (branche `data-ai`, dossiers, `.gitignore`, environnement Python)
2. 🔄 Notebook météo (`scripts/weather.ipynb`, API Open-Meteo)
3. Ouvrir les `.h5` NISAR, lire HH, convertir en dB, découper la zone
4. Comparer avant/après, détecter l'eau (Otsu)
5. Exporter `before.png`, `after.png`, `change.png`, `metadata.json` pour le site
6. Exporter `grid.json` (valeurs dB pour SARah) et `truth.geojson` (la vraie zone, secrète)

### B (moi) : contexte + SARah

**Étape 0 : Préparer mon PC**
- Créer un compte NASA Earthdata : https://urs.earthdata.nasa.gov
- Cloner le repo, récupérer la branche `data-ai` (A doit d'abord l'avoir poussée sur GitHub)
- Créer l'environnement Python : `python3 -m venv .venv`, l'activer, puis `pip install -r scripts/requirements.txt`

**Étape 1 : Trouver la paire de données NISAR (maintenant)**
- Sur **ASF Vertex** (https://search.asf.alaska.edu/) : Dataset **NISAR**, produit **GCOV**, zone + dates de l'événement choisi avec l'équipe.
- Trouver **deux images avec le même Track + même Frame + même direction** : une **avant**, une **après**.
- Astuce : cliquer sur un résultat GCOV puis **« More Like This »** ou **« Baseline »** pour voir toutes les dates du même track/frame.
- Noter pour chaque image : date, track, frame, direction, nom du fichier.
- Télécharger, mettre dans `data/raw/` (ce dossier n'est **pas** envoyé sur GitHub car trop gros), et partager avec A par clé USB ou Drive.

**Étape 2 : SARah (après l'étape 1)**
- Écrire en Python une fonction `sarah_analyze(grid, lat, lon)` qui applique les règles de la section 2 et renvoie le format de sortie de la section 4.
- Commencer avec un **faux `grid.json`** (même format, valeurs inventées) pour ne pas attendre A.
- Écrire les **phrases modèles** (templates), une par classe, en anglais.
- Préparer le **prompt Gemini** : on lui envoie **seulement les chiffres**, il renvoie 2 phrases simples pour un débutant.
- Le dev web traduira ensuite la fonction en TypeScript pour le site.

**Étape 3 : Field Mode (si le temps le permet)**
- Choisir un deuxième lieu, refaire le pipeline de A dessus, et récupérer la météo de ce lieu.

---

## 4. Le « contrat » entre A et moi (formats de fichiers)

**Règle :** tant qu'on respecte ces noms et formats, chacun peut avancer sans attendre l'autre.

### `scripts/zones.json` (écrit **seulement par A**, lu par tout le monde)

```json
{
  "valencia": {
    "name": "Valencia, Spain",
    "bbox": [-0.55, 39.30, -0.25, 39.55],
    "before_date": "2026-10-23",
    "after_date": "2026-10-28",
    "track": 167,
    "frame": null
  }
}
```

### Fichiers produits dans `public/data/<zone>/`

| Fichier | Produit par | Utilisé par |
|---|---|---|
| `before.png`, `after.png`, `change.png`, `metadata.json` | A | Dev web (carte) |
| `grid.json` | A | **Moi** (SARah) |
| `weather.json` | A (puis moi pour le Field Mode) | SARah + contenu |
| règles + templates SARah | **Moi** | Dev web |

### Format de `grid.json`

```json
{
  "zone": "valencia",
  "bounds": [[39.30, -0.55], [39.55, -0.25]],
  "shape": [256, 256],
  "threshold_db": -18.3,
  "before_db": [[-12.1, -11.8, "..."], ["..."]],
  "after_db":  [[-22.4, -21.9, "..."], ["..."]]
}
```

`bounds` = [[sud, ouest], [nord, est]]. Chaque ligne de `before_db` / `after_db` est une rangée de pixels (du nord au sud).

### Format de sortie de SARah

```json
{
  "class": "flood",
  "confidence": 0.87,
  "stats": { "before_db": -11.8, "after_db": -22.4, "diff_db": -10.6, "water_pct": 0.87 },
  "explanation": "This area became much darker on radar. Calm water reflects the signal away from the satellite, like a mirror."
}
```

Classes possibles : `flood`, `permanent_water`, `water_receded`, `no_change`.

---

## 5. Règles Git (on est deux sur la même branche `data-ai`)

1. **Ne jamais modifier le notebook de l'autre.** Les `.ipynb` sont de gros fichiers JSON : deux personnes qui modifient le même = conflit très difficile à réparer.
   - A : `scripts/nisar_*.ipynb`, `scripts/weather.ipynb`
   - Moi : `scripts/sarah_*`
2. **Avant de commencer à travailler :** `git pull`
3. **Pour envoyer mon travail :** `git add <mes fichiers>` → `git commit -m "..."` → `git pull` → `git push`
4. **Petits commits souvent**, pas un énorme à la fin.
5. Ne jamais faire `git add` sur `data/raw/`, `.venv/` ou `.env.local` (normalement le `.gitignore` les bloque déjà).

---

## 6. Règles de sécurité et d'honnêteté

- **Clé Gemini :** uniquement dans `.env.local` (`GEMINI_API_KEY=...`). Jamais dans le code, jamais dans le chat, jamais sur GitHub.
- **Gemini ne reçoit jamais** les bonnes réponses ni les flags du jeu. Seulement les chiffres de l'analyse.
- **Honnêteté des données :** chaque image affichée doit être étiquetée **« real NISAR data »**, **« demo data »** ou **« AI prediction »**. Ne jamais présenter des données Sentinel-1 ou inventées comme du NISAR.
- Citer la source : *NISAR data courtesy of NASA/JPL-Caltech and ISRO, distributed by ASF DAAC.*

---

## 7. Synchronisation

- **Toutes les 2 heures, 5 minutes avec A :** qu'est-ce que j'ai fini ? qu'est-ce que je fais ensuite ? qu'est-ce qui me bloque ?
- Checklist commune dans `docs/PROGRESS.md` : chacun coche uniquement ses propres tâches.

---

**Assistant : commence par me résumer ce plan en 5 lignes, puis guide-moi pour l'Étape 0, première action seulement.**
