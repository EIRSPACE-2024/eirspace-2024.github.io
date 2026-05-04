# EIRSPACE — Modernisation v2

## 🔧 Ce qui a été corrigé depuis v1

### 1. Photos visibles immédiatement (anciennes équipes + partenaires)
Le `bundle.css` avait des règles `image-reveal-pending` qui mettaient toutes les images à `transform: scale(0.04, 0.03)` (microscopique) et `opacity: 0.55` jusqu'à ce qu'un script JS les "révèle". Sur les nouvelles cards, ce script JS ne s'appliquait pas, donc les photos restaient invisibles.

**Fix appliqué** :
- `eirspace_modern.css` force `opacity: 1`, `transform: none`, `filter: none` avec `!important` sur toutes les images des nouveaux conteneurs
- `modern.js` retire activement les classes `image-reveal-pending` / `box-reveal-pending` au chargement et toutes les 200ms / 800ms / 2000ms (sécurité)
- Idem pour les anciennes équipes dans `former_teams.html`

### 2. Scroll fluide (Lenis-style)
**Avant** :
- `scroll-behavior: smooth` natif (lent)
- `loading.js` ajoutait un délai de **240ms** sur chaque clic interne (transition page-leave)
- Pas de smooth réel sur la roulette de la souris

**Maintenant** :
- Smooth scroll **interpolé** dans `modern.js` (style Lenis) : la roulette pousse une cible, et le scroll réel s'interpole vers cette cible avec un easing (`ease = 0.085`)
- Délai page-leave passé de 240ms à **0ms** (instantané)
- Anchor links (`#section`) interceptés et animés avec le même easing
- Désactivé sur mobile (l'inertie tactile native est meilleure)
- Désactivé si `prefers-reduced-motion`

### 3. Modèles 3D Samsung-style (au lieu d'enfantin)

**Avant** : modèles ultra-simples (cylindre + cône + ailerons triangulaires), tournaient juste sur eux-mêmes.

**Maintenant** :
- **Fusée style Falcon 9** : corps cylindrique avec **panel seams horizontales et verticales**, **bande EIRSPACE verte** glow, **interstage**, **étage supérieur**, **coiffe ogive** (LatheGeometry), **porthole bleu lumineux**, **4 grid fins chrome**, **4 landing legs**, **moteur Merlin** avec tuyère détaillée et **plumbing rings copper**, **flamme animée double couche** (outer orange + inner blanc).
- **Drone style DJI** : **fuselage aérodynamique** (sphère semi-transparente top + bottom), **dôme GPS vert**, **gimbal chrome avec caméra noir + lentille bleue glow**, **4 bras X-config** avec moteurs chrome + **caps rouges**, **rotors 2-pales** qui spinnent, **navigation lights vertes/rouges** clignotantes (port/starboard), **landing skids** en chrome avec uprights.
- **Astro** : **2000 étoiles** colorées (blanc, bleu, ambre, orange, vert) sur sphère, **double core glow** (bleu + violet) avec pulsation, rotation lente.

Matériaux **PBR métalliques** partout (`metalness: 0.55-0.95`, `roughness: 0.18-0.45`) + lighting key/rim/fill pour le rendu pro.

### 4. Layout pinned scroll Samsung pur

Sur les pages **rocket / drone / astronomy**, la 3D est maintenant **`position: sticky`** au centre du viewport. À mesure que tu scrolls, des **cards de description** défilent à côté en s'animant, et la 3D **interpole** entre des **keyframes** (rotation, position, caméra) ancrés sur chaque section.

**Comment ça marche** :
- Chaque `<article class="pinned-section">` porte ses keyframes en `data-*` :
  - `data-rot-x`, `data-rot-y` : rotation du modèle (radians)
  - `data-pos-x/y/z` : translation
  - `data-cam-z`, `data-cam-y` : position caméra
- Le script `pinned_3d.js` calcule la position de scroll dans l'expérience, fait une interpolation smoothstep entre keyframes adjacents, et applique l'état au modèle/caméra à chaque frame
- Un **indicateur de progression** (dots verticaux) à droite de l'écran montre l'avancement
- Mobile : layout fallback (3D au-dessus, contenu en dessous, pas de sticky)

**Sur rocket.html** : 4 keyframes — vue d'ensemble, zoom coiffe, zoom moteur, vue C'Space tournante.

**Sur drone.html** : 4 keyframes — overview, zoom caméra/gimbal, vue de dessus (architecture X), tilted final.

**Sur astronomy.html** : 3 keyframes — sphère étoilée vue large, rotation, plongée vue de bas.

## 📁 Fichiers modifiés / ajoutés

| Fichier | Statut | Rôle |
|---|---|---|
| `resources/assets/eirspace_modern.css` | **Réécrit** | Overrides + composants modernes |
| `resources/js/modern.js` | **Réécrit** | Smooth scroll Lenis + reveal + lightbox + force-visible |
| `resources/js/pinned_3d.js` | **Nouveau** (remplace three_heroes.js) | Pinned scroll 3D Samsung-style |
| `resources/js/loading.js` | **Patché** | Délai page-leave 240ms → 0ms |
| `rocket.html` | **Réécrit** | Pinned scroll experience 4 keyframes |
| `drone.html` | **Réécrit** | Pinned scroll experience 4 keyframes |
| `astronomy.html` | **Réécrit** | Pinned scroll experience 3 keyframes |
| `team.html` | Inchangé v1 | 2026-2027 placeholders + 2025-2026 modernisée + 2024-2025 supprimée |
| `partnership.html` | Inchangé v1 | Plaque "Devenir partenaire" + bouton dossier |
| `rocket_history.html`, `drone_history.html`, `astronomy_pictures.html` | Inchangé v1 | Templates timeline / galerie |

## 🎬 Pour tester localement

```bash
cd eirspace-2024.github.io
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

Va sur `/rocket.html`, scroll lentement avec la molette : tu vois la fusée tourner/zoomer en suivant tes keyframes, les cards de texte apparaître au bon moment, et le scroll lui-même est buttery smooth.

## 📝 À remplir

Inchangé par rapport à v1 :
1. Photos équipe 2026-2027 → remplacer les 14 placeholders dans `team.html`
2. PDF dossier partenariat → `static/partnership/dossier-partenariat-eirspace.pdf`
3. Photos historique fusées/drones → 4 entrées de chaque page history
4. Photos astro → remplacer les 6 placeholders de `astronomy_pictures.html`

## ⚙️ Comment ajouter / modifier des keyframes

Sur les pages pinned (rocket/drone/astronomy), pour ajouter une étape dans l'expérience scrollée :

```html
<article class="pinned-section pinned-section--left"
         data-rot-x="0.2" data-rot-y="0.5"
         data-pos-x="0" data-pos-y="0" data-pos-z="0"
         data-cam-z="6" data-cam-y="1">
    <div class="pinned-section-card">
        <span class="pin-eyebrow">/ ma section</span>
        <h2>Mon titre</h2>
        <p>Mon texte.</p>
    </div>
</article>
```

- `--left` / `--right` / `--center` : alignement horizontal de la card
- Plus de sections = scroll plus long mais expérience plus riche
- Les keyframes interpolent linéairement (smoothstep) entre eux
