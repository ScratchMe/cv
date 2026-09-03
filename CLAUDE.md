# CV Antoine Berthaud — Contexte pour Claude Code

Lu automatiquement par Claude Code au démarrage d'une session dans ce dossier.
**Document vivant** : complète-le au fil du projet plutôt que de repartir de zéro à chaque fois.

## Ce que c'est

Site CV statique bilingue (FR/EN), HTML/CSS/JS vanilla, hébergé sur GitHub
Pages avec domaine personnalisé `cv.antoine.berthaud.me`. Piloté par la
donnée : tout le contenu vit dans `js/data.js`, le rendu dans `js/app.js`.

## Architecture

- `js/i18n.js` : dictionnaire `UI_STRINGS` + fonctions `t()`/`tc()`.
  `tc()` accepte un champ `{fr, en}` OU une chaîne simple (proper noun,
  pas besoin de traduction) — les deux formats coexistent dans `data.js`.
- `js/data.js` : **seul fichier à éditer pour le contenu.** PROFILE,
  EXPERIENCES, SKILLS, HERO_STATS, TESTIMONIALS, SIDE_PROJECTS,
  PROJECT_DETAILS, EDUCATION, LANGUAGES, CERTIFICATIONS.
- `js/app.js` : rendu, filtres de compétences, scroll-spy, durées
  dynamiques, `richText()` (syntaxe `**gras**` → `<strong>`).
- `js/gemini.js` : logique du Fit-Checker (appelle une fonction Supabase,
  jamais Gemini directement depuis le navigateur).
- `js/project-detail.js` + `project-detail.html` : gabarit réutilisable
  pour les pages de détail ("étude de cas") des side projects, piloté par
  `?slug=`. Ajouter un nouveau side project avec sa page de détail ne
  touche que `data.js` (nouvelle entrée `SIDE_PROJECTS` + `PROJECT_DETAILS`
  liées par `detailSlug`) — jamais ces deux fichiers.
- `scripts/generate-pdf.js` : génère les PDF FR/EN via Playwright à partir
  du site lui-même (pas un simple `window.print()`).
- `supabase/functions/gemini-fit/index.ts` : fonction serveur du
  Fit-Checker — **ne jamais confondre avec `js/gemini.js`** (l'un tourne
  dans le navigateur, l'autre sur Supabase/Deno).

## Design

Direction "Moderne & Colorée" : violet `#6C3CE9`, corail `#FF6B57`, menthe
`#0FB88A`, fond `#F5F2FB`. Typo : Space Grotesk (titres) + Work Sans
(corps). Signature : blobs dégradés en fond, photo en anneau
conic-gradient, piliers colorés par thème.

## Décisions déjà prises (ne pas rouvrir sans raison)

- **Repli multi-modèles Gemini** partout où l'IA est appelée :
  `gemini-3.7-flash → 3.6 → 3.5 → gemini-flash-latest` (ce dernier est un
  alias maintenu par Google, toujours à jour — le filet de sécurité qui ne
  casse jamais). Jamais un seul modèle codé en dur.
- **Contenu jamais "IA-sonnant"** : pas de superposition de noms abstraits
  ("Coordination transverse de X avec délégation de Y"), pas de
  construction répétitive "X n'est pas Y, c'est Z". Antoine relit chaque
  texte et corrige systématiquement ce qui sonne artificiel — mieux vaut
  écrire simple et concret dès le départ.
- **Bilingue dès la conception**, jamais une couche ajoutée après coup.
- **Side projects** : `CONFIG.showSideProjects = true`, Tour de Growth en
  place avec sa page de détail. Le champ `metrics` de `PROJECT_DETAILS`
  reste vide (`[]`, avec `metricsFallback` affiché à la place) tant qu'il
  n'y a pas de vrais chiffres d'usage significatifs.
- **Domaine** : `cv.antoine.berthaud.me`, déjà configuré partout
  (canonical, OG, JSON-LD `Person`, `robots.txt`, `sitemap.xml`, `CNAME`).

## Pièges déjà rencontrés (vrais bugs, pas des principes génériques)

1. **`display` explicite + attribut `hidden`** : donner un `display:flex`
   (ou autre) à un élément qui utilise aussi `hidden` neutralise
   silencieusement le masquage natif du navigateur (même spécificité, la
   règle custom passe après dans la cascade). Symptôme : un élément censé
   disparaître reste affiché. Correctif : `.ma-classe[hidden]{display:none}`
   explicite. Repéré sur le statut de chargement du Fit-Checker.
2. **La largeur A4/Letter (~794px) tombe dans le breakpoint mobile**
   (≤800px) du CSS — le `@media print` doit forcer les layouts desktop
   (grilles en colonnes), sinon la pagination PDF explose (9 pages au
   lieu de 7 constaté une fois).
3. **Les halos de fond en `position:fixed` sont ré-encodés en image sur
   CHAQUE page PDF** — remplacés par un dégradé CSS léger en fond de
   `body` pour le print (a fait passer un export de 4,7 Mo à 379 Ko).
4. **Les labels de compétences doivent passer par `tc()`**, pas juste
   `.label` brut — sinon un label bilingue `{fr, en}` s'affiche identique
   dans les deux langues (bug réel trouvé sur "Gestion de projet"/"Project
   Management").
5. **La langue ne se propage pas automatiquement entre `index.html` et
   `project-detail.html`** si les liens ne portent pas explicitement
   `?lang=${langue courante}` — sinon ça retombe sur la détection
   navigateur et peut contredire un choix de langue déjà fait.
6. **Toujours tester les deux langues**, pas seulement le français —
   plusieurs bugs ne sont apparus qu'en testant la bascule explicitement.
7. **Vérifier le rendu visuel réel** (capture d'écran, PDF converti en
   image) avant de considérer une étape terminée — la relecture de code
   seule a laissé passer plusieurs bugs listés ci-dessus.

## Méthode de travail établie

Serveur local + Playwright pour vérifier tout changement visuel/fonctionnel
avant de le considérer fini. Antoine attend un retour direct et honnête,
pas de complaisance — il pousse activement si un texte ou un choix ne lui
convient pas, c'est normal et bienvenu.
