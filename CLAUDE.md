# CV Antoine Berthaud — Contexte pour Claude Code

Ce fichier est lu automatiquement par Claude Code au démarrage d'une session dans ce dossier. Il résume ce qui a déjà été construit (via Claude.ai, en conversation) pour qu'une nouvelle session ne reparte pas de zéro.

## Ce que c'est

Site CV statique bilingue (FR/EN) pour Antoine Berthaud, Product Manager. HTML/CSS/JS vanilla, pensé pour GitHub Pages. Détails complets dans `README.md` — le lire en premier.

## Pièges déjà rencontrés (ne pas reproduire)

1. **`js/gemini.js` ≠ `supabase/functions/gemini-fit/index.ts`.** Le premier tourne dans le navigateur (utilise `window`), le second sur Supabase (Deno, pas de `window`). Ils ont été confondus une fois lors d'un déploiement manuel → erreur `Cannot destructure property 't' of 'window.i18n' as it is undefined`. Ne jamais coller le contenu de l'un dans l'autre.

2. **Les noms de modèles Gemini changent vite.** `gemini-2.0-flash` a été trouvé arrêté (arrêt définitif le 1er juin 2026) alors qu'il venait d'être utilisé. Avant de toucher au modèle dans `index.ts`, vérifier sur https://ai.google.dev/gemini-api/docs/models qu'il est toujours valide.

3. **La largeur A4/Letter (~794px) tombe pile dans le breakpoint "mobile" du site (≤800px).** Le CSS `@media print` doit forcer les layouts desktop (grilles en colonnes), sinon tout s'empile et le PDF gonfle inutilement en nombre de pages. Vu en vrai : 9 pages au lieu de 7 avant correctif.

4. **Ne pas laisser les halos de fond (`.blob`, `position:fixed`) actifs à l'impression** : ils sont ré-encodés en image sur chaque page PDF, ce qui a fait passer un export de 4,7 Mo à 379 Ko une fois retirés (remplacés par un dégradé CSS léger).

5. **Toujours vérifier visuellement un changement CSS/layout avant de le considérer terminé.** Tout au long de ce projet, les vérifications par lecture de code seule ont laissé passer des bugs (ordre du menu, retour à la ligne du menu, pagination PDF) qu'une vraie capture d'écran (Playwright + `view`) ou une conversion PDF→PNG (`pdftoppm`) a immédiatement révélés. Ne pas se fier au code seul pour du visuel.

## Conventions du modèle de données (`js/data.js`)

- Un champ traduisible s'écrit `{ fr: "...", en: "..." }` ; un champ simple (nom propre, date, id) reste en texte brut — les deux sont gérés par `tc()` dans `app.js`/`gemini.js`.
- Les rôles au sein d'une même entreprise sont triés **du plus récent au plus ancien**.
- Chaque rôle se décompose en `context` (1-2 phrases), `achievements` (liste), `methodology` (optionnel), `team` (optionnel) — pas de gros pavé de texte unique.
- Mise en avant : syntaxe `**gras**` supportée dans `context`/`achievements`/`pitch`, convertie en `<strong>` par `richText()` dans `app.js`.

## Statut actuel / reste à faire

Voir la checklist à la fin de `README.md`. En résumé au moment de la reprise :
- Contenu réel rempli (expériences, formation, citation LinkedIn d'Alix Paoli, pitch, piliers)
- Side projects désactivé (`CONFIG.showSideProjects = false`) — projet en cours, à réactiver plus tard
- Fit-Checker (Gemini) : identifiants Supabase déjà renseignés dans `data.js`, fonction serveur prête mais pas encore déployée (voir README section 2)
- Génération PDF automatisée (Playwright + GitHub Actions), testée en local, **pas encore vérifiée en conditions réelles sur GitHub Actions** (le repo n'existe pas encore au moment de la rédaction de ce fichier)
- Le site n'a pas encore été déployé sur GitHub Pages

## Méthode de travail à privilégier

Pour tout changement visuel ou fonctionnel : lancer un serveur local (`python3 -m http.server` ou équivalent), vérifier avec un navigateur réel (Playwright si disponible) plutôt que de se fier à la seule relecture du code, et regarder le résultat (capture d'écran ou PDF converti en image) avant de considérer une tâche terminée.
