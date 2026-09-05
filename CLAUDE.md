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
  EXPERIENCES, SKILLS, HERO_STATS, RESULT_DETAILS, TESTIMONIALS,
  SIDE_PROJECTS, PROJECT_DETAILS, EDUCATION, LANGUAGES, CERTIFICATIONS.
  `PROFILE.seo` porte le `<title>` et la meta description de l'accueil par
  langue. **Exception à la règle "un seul fichier"** : `PROFILE.pitch.fr` et
  `PROFILE.seo` (FR) sont recopiés en dur dans `index.html` (`#heroPitch`,
  `<title>`, description, `og:`/`twitter:`) pour les robots qui n'exécutent
  pas JavaScript — toute modification de l'un se reporte dans l'autre
  (`app.js` avertit en console si le pitch diverge, rien de plus).
- `js/app.js` : rendu, filtres de compétences, scroll-spy, durées
  dynamiques, `richText()` (syntaxe `**gras**` → `<strong>`).
- `js/gemini.js` : logique du Fit-Checker (appelle une fonction Supabase,
  jamais Gemini directement depuis le navigateur).
- `js/project-detail.js` + `project-detail.html` : gabarit réutilisable
  pour les pages de détail ("étude de cas") des side projects, piloté par
  `?slug=`. Ajouter un nouveau side project avec sa page de détail ne
  touche que `data.js` (nouvelle entrée `SIDE_PROJECTS` + `PROJECT_DETAILS`
  liées par `detailSlug`) — jamais ces deux fichiers.
- `js/results.js` + `results.html` : page "Résultats", le détail (format
  STAR : Contexte/Défi/Action/Résultat optionnel/Leçon) derrière les
  chiffres cliquables du hero. Contrairement à `project-detail.js` (une
  entrée = une page via `?slug=`), affiche TOUTES les entrées de
  `RESULT_DETAILS` à la suite, dans l'ordre de `HERO_STATS`. Un chiffre du
  hero devient cliquable dès qu'on lui ajoute `resultId` (référence une
  clé de `RESULT_DETAILS`) ; sans `resultId` il reste un texte simple.
  Un clic amène directement au bon bloc via une ancre (`#resultId`).
- `richParagraphs()` / `richList()` (dupliquées dans `project-detail.js`
  ET `results.js`, comme `richText()`/`escapeHtml()`) : aèrent les blocs
  de texte denses — `richParagraphs()` découpe un champ sur les doubles
  sauts de ligne (`"\n\n"` dans `data.js`) en plusieurs `<p>` ; `richList()`
  rend un tableau de champs traduisibles en `<ul class="detail-list"><li>`.
  À utiliser quand un texte a un vrai découpage naturel (ex: plusieurs
  points parallèles) — jamais pour forcer un découpage artificiel.
- `scripts/generate-pdf.js` : génère les PDF FR/EN via Playwright à partir
  du site lui-même (pas un simple `window.print()`). Le workflow
  `.github/workflows/generate-pdf.yml` tourne aussi une fois par mois
  (1er, 4h UTC) indépendamment de tout push, pour rafraîchir les durées
  d'expérience affichées (calculées jusqu'à "aujourd'hui") — et ouvre une
  issue GitHub (label `pdf-generation-failure`) s'il échoue.
- `supabase/functions/gemini-fit/index.ts` : fonction serveur du
  Fit-Checker — **ne jamais confondre avec `js/gemini.js`** (l'un tourne
  dans le navigateur, l'autre sur Supabase/Deno). Le code déployé sur
  Supabase peut diverger du repo si quelqu'un le modifie directement dans
  le dashboard (vécu : rate limit changé à 3/min en prod, resté à 5/min
  dans `index.ts`) — avant de redéployer depuis le repo, comparer avec
  `mcp__Supabase__get_edge_function` pour ne pas écraser un réglage prod.

## Design

Direction "Moderne & Colorée" : violet `#6C3CE9`, corail `#FF6B57`, menthe
`#0FB88A`, fond `#F5F2FB`. Typo : Space Grotesk (titres) + Work Sans
(corps). Signature : blobs dégradés en fond, photo en anneau
conic-gradient, piliers colorés par thème.

Pour un effet "flou diffus" (halo discret autour d'un élément interactif,
par ex. le survol des chiffres cliquables du hero) : reprendre la
technique des blobs déco (`filter:blur()` sur un élément dédié), jamais
un `box-shadow`, même flouté — un `box-shadow` garde toujours une arête
nette qui lit comme une carte, pas comme un halo. Rester très léger en
opacité (~0.09 validé) : un `box-shadow` flouté et un aplat de couleur
plein ont tous les deux été essayés et jugés trop nets avant ça.

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
- **Chiffres du hero (`HERO_STATS`)** : un chiffre peut pointer vers une
  étude de cas détaillée (`resultId` → `RESULT_DETAILS`) sur `results.html`.
  Le champ `result` d'une entrée `RESULT_DETAILS` (section "Résultat" du
  format STAR) reste **absent** tant qu'il n'y a pas un vrai chiffre
  d'impact *en plus* de celui déjà affiché dans le hero — ne pas le
  remplir juste pour compléter le format.
- **Français par défaut, anglais sur `?lang=en`, pas de détection de la
  langue du navigateur** (sept. 2026, décision SEO) : Googlebot rend la page
  avec un navigateur en anglais et indexait la version anglaise à l'URL
  canonique. `/` = FR (canonical `/`), `/?lang=en` = EN (canonical
  `/?lang=en`, posé par `app.js`), hreflang fr/en/x-default statiques dans
  le `<head>` et dans `sitemap.xml`. Le bouton FR/EN retire le paramètre en
  FR. Même règle sur `project-detail.js` et `results.js`. Ne pas remettre de
  détection navigateur "pour les recruteurs anglophones" : on leur partage
  le lien `?lang=en`.
- **Objectif SEO réaliste** : premier sur le nom et ses variantes, longue
  traîne localisée ("senior growth product manager Nantes"), lisible par les
  moteurs IA. Pas de course à "product manager Nantes" (page de résultats
  tenue par les job boards). Ce qui pèse le plus est hors code : liens
  depuis `antoine.berthaud.me` et `tourdegrowth.com`, LinkedIn, demandes
  d'indexation dans Search Console (propriété existante, accessible via le
  MCP SEO Gets). Mettre à jour `lastmod` dans `sitemap.xml` quand une page
  change. Les PDF portent des métadonnées (titre, auteur, langue) posées par
  `scripts/generate-pdf.js` via `pdf-lib`.
- **Site considéré fonctionnellement complet** (sept. 2026) : bilingue,
  PDF, Fit-Checker IA, hero cliquable + études de cas STAR, side project
  avec étude de cas, CI de génération/surveillance des PDF. Ne pas
  proposer de nouvelles features par défaut en début de session — les
  prochaines améliorations utiles dépendent de contenu qu'Antoine n'a pas
  encore (plus de recommandations LinkedIn dans `TESTIMONIALS`, un seul
  témoignage actuellement ; vrais chiffres d'usage de Tour de Growth),
  pas de design ou d'ingénierie supplémentaire sur l'existant.

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
8. **`padding: TOP 0 BOTTOM` sur un élément qui a aussi la classe `.wrap`**
   écrase le padding horizontal de `.wrap` (même spécificité, mais la
   règle spécifique à la section arrive après dans la feuille de style) —
   tout le contenu touchait le bord de l'écran sur mobile. Corriger avec
   des déclarations séparées `padding-top`/`padding-bottom`, jamais le
   raccourci `padding`, dès qu'un élément combine une classe de section
   et `.wrap`.
9. **`scroll-margin-top` (pour compenser le header sticky) ne vise que les
   `<section>`** dans la règle globale (`section[id]{scroll-margin-top:88px}`)
   — un `<article id="...">` (ou tout autre tag) ciblé par une ancre ou un
   `scrollIntoView()` se retrouve à moitié caché sous le header. Donner sa
   propre règle `scroll-margin-top` à tout élément non-`<section>` utilisé
   comme cible de scroll.
10. **Sur les pages `?lang=`-driven (`project-detail.js`, `results.js`)**,
    bien séparer `init()` (lit `?lang=` dans l'URL + pose le listener du
    bouton de langue, une seule fois au chargement) de `render()`
    (uniquement du DOM, jamais la langue, rappelée à chaque clic) — sinon
    le clic sur le bouton de langue relit `?lang=` (qui n'a pas changé) et
    s'annule aussitôt lui-même, en plus d'empiler un nouveau listener à
    chaque clic. Bug réel trouvé sur `project-detail.js`.
11. **Un `throw` volontaire pour arrêter une boucle de retry** (ex : erreur
    HTTP non-retriable dans `callGeminiWithFallback`, `gemini-fit/index.ts`)
    **reste piégé par le `catch` qui englobe cette même boucle** s'il n'est
    pas distingué d'une vraie erreur réseau à retenter — la boucle
    continuait sur le modèle suivant au lieu de s'arrêter. Utiliser un
    type d'erreur dédié (`class NonRetriableError extends Error`) que le
    `catch` reconnaît via `instanceof` et relance immédiatement.
12. **Googlebot navigue en anglais (`navigator.language` = en-US)** : une
    détection de la langue du navigateur "fr sinon en" lui faisait rendre et
    indexer la version anglaise à l'URL canonique, avec une meta description
    restée en français (vérifié en rendu Playwright avec `locale: "en-US"`).
    Sur un site rendu en JS, la langue par défaut doit être décidée par l'URL,
    jamais par le navigateur.
13. **Un `<link rel="canonical">` statique sur une page gabarit pilotée par
    `?slug=`** (`project-detail.html`) pointait la page nue "Projet
    introuvable" comme version de référence de l'étude de cas — l'`id`
    `canonicalLink` existait mais n'était jamais mis à jour. Toute page dont
    l'URL porte un paramètre significatif doit poser son canonical en JS
    avec ce paramètre, et la variante sans paramètre doit être en `noindex`.

## Méthode de travail établie

Serveur local + Playwright pour vérifier tout changement visuel/fonctionnel
avant de le considérer fini. Antoine attend un retour direct et honnête,
pas de complaisance — il pousse activement si un texte ou un choix ne lui
convient pas, c'est normal et bienvenu (vécu sur plusieurs itérations de
l'effet de survol des chiffres du hero : aplat → box-shadow flouté → vrai
flou `filter:blur()`, avant d'arriver au bon rendu).

**Git** : une branche par changement (`claude/...`), commit, push, PR,
merge (squash) une fois les vérifications faites — jamais de commit
direct sur `main`. Si un changement touche `css/js/index.html`, le
workflow `generate-pdf.yml` se déclenche automatiquement : vérifier qu'il
passe avant de considérer la tâche terminée. **Si Antoine demande
explicitement de ne rien committer avant validation visuelle commune**
(cas des features nouvelles/designs pas encore vus), respecter ça même si
le stop-hook signale des changements non commités entre-temps — ce n'est
pas une erreur, c'est volontaire, tant que la validation n'est pas
arrivée.

**Contenu qu'Antoine fournit** (études de cas, témoignages, texte "à sa
voix") : préparer un brouillon à partir de ce qui existe déjà dans
`data.js` plutôt que de partir d'une page blanche — Antoine gère une
dépression avec des soucis de concentration, il l'a explicitement
mentionné. Poser une seule question ciblée à la fois plutôt qu'un
formulaire à remplir d'un coup, et proposer un texte à corriger plutôt que
de demander d'écrire depuis zéro.
