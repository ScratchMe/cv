# Mission SEO de septembre 2026 — état des lieux et plan (lot 0)

Document de travail (exclu du domaine par `_config.yml`), à retirer une fois
la mission terminée, comme le plan de la quatrième revue.

## 1. Le constat, point par point

Mesuré le 24/09/2026 sur la production et dans le code.

| Point du constat | Verdict | Où |
|---|---|---|
| `/?lang=en` = même HTML que `/` (49 746 octets, même empreinte), `lang="fr"`, canonical `/` | ✅ confirmé | `curl` des deux URL : 49 746 octets, md5 identique |
| `app.js` passe `lang` en `en`, réécrit titre, description, og:/twitter:, canonical `/?lang=en` | ✅ confirmé | `js/app.js` 500-530 (`applyStaticTranslations`) |
| Script `lang-pending` qui masque la page sur `?lang=en` | ✅ confirmé | `<head>` des trois pages + `css/style.css` |
| `results.html?lang=en` : anglais par JS, canonical `results.html`, pas de hreflang | ✅ confirmé | voulu jusqu'ici (CLAUDE.md, « seule l'accueil a une version EN indexable ») : **la mission revient sur cette décision** |
| Liens internes via `window.i18n.langSuffix()`, y compris `project-detail.html?slug=…` | ✅ confirmé | `app.js`, `results.js`, `project-detail.js` |
| Page projet : HTML pré-rendu de Tour de Growth quel que soit le slug, canonical statique `?slug=tour-de-growth` | ✅ confirmé | `generate-static.js` (`PAGES[2]`), `project-detail.html` |
| Slug inconnu : « Projet introuvable » + `noindex` posé par JS | ✅ confirmé | `project-detail.js` (`renderNotFound`) |
| Description de la page projet : 97 caractères, sans Antoine ni l'outil ; pas de JSON-LD | ✅ confirmé | description = `tagline` de `PROJECT_DETAILS` |
| Accueil : `ProfilePage` → `Person` `#person`, `sameAs` avec tourdegrowth.com, pas de `dateModified` | ✅ confirmé | **écrit à la main** dans `index.html` (pas généré) |
| `results.html` et page projet sans JSON-LD | ✅ confirmé | |
| Titre de l'accueil 66 car. (FR), 65 (EN) | ✅ confirmé | `PROFILE.seo.title` |
| Description de `results.html` 174 caractères | ✅ confirmé | `results.metaDescription` (`i18n.js`) |
| `/favicon.ico` en 404 | ✅ confirmé | |
| Ce qui est bien fait (robots, sitemap, HTTPS, OG, h1, alt, logos, PDF, mobile, noindex, GoatCounter) | ✅ confirmé | `scripts/check-seo.mjs --lot 0` : 26/26 |

**Où se décide quoi aujourd'hui**

- Langue au chargement : `initLangFromUrl()` (`app.js`), `initLang()` (`results.js`,
  `project-detail.js`) — `?lang=en` sinon français ; jamais le navigateur.
- `?lang=en` produit par `langSuffix()` et `syncUrl()` (`i18n.js`), lu par les trois
  scripts de page, par le script `lang-pending` et par la fonction GoatCounter du `<head>`.
- Canonical réécrit par `app.js` (accueil) et `project-detail.js` (slug) ; titre,
  description, og:/twitter: réécrits par les trois scripts.
- JSON-LD : écrit à la main dans `index.html`.
- `<lastmod>` : le workflow `generate-pdf.yml` les met à la date du jour pour chaque
  fichier **que la CI elle-même a modifié** ; les pages générées sont committées
  (par la CI sur `main`, ou dans la PR quand on régénère en local).

## 2. Écarts et points à trancher (aucun ne contredit le constat)

1. **`lastmod` figés** : `/` et `/results.html` sont au 06/09 alors que `index.html`
   et `results.html` ont changé le 07/09. Quand une PR arrive avec ses pages déjà
   régénérées, la CI ne voit aucun écart et ne touche pas au sitemap. Conséquence
   pour le lot 3 : `dateModified` = `lastmod` hériterait d'une date fausse.
   Proposition (lot 3) : c'est le générateur qui pose `lastmod` et `dateModified`,
   à la date du jour quand la page générée change, idempotent sinon.
2. **Clone superficiel en CI** : `actions/checkout@v5` récupère un seul commit, donc
   `git log --reverse -- index.html` y rendrait la date du dernier commit. Pour
   `dateCreated` (lot 3), passer `fetch-depth: 0` dans `generate-pdf.yml` et
   `pr-checks.yml`, et faire échouer le générateur sur un clone superficiel plutôt
   que d'écrire une date fausse. Premier commit de `index.html` : 22/08/2026.
3. **Liens vers Tour de Growth au lot 1** : « garde leur fonctionnement actuel »
   (donc `&lang=en` sur les pages anglaises) et le critère 3 (« plus aucun
   `lang=en` ») se contredisent pour ces liens-là. Je garde le fonctionnement
   (un visiteur anglais arrive sur la page projet en anglais) et `check-seo.mjs`
   tolère ces liens jusqu'au lot 2, comme au critère 8.
4. **JSON-LD de `/en/results.html`** : le critère 2 renvoie aux vérifications du
   critère 1, dont le JSON-LD ; le JSON-LD des études de cas n'est défini qu'au
   lot 3. Vérifié au lot 3.
5. **`<noscript>` de `results.html`** : son texte n'est pas celui de l'accueil
   (« cette page s'affiche en français, sans la version anglaise », qui devient
   faux, et il n'y a pas de Fit-Checker sur cette page). Je retire la phrase sans
   en écrire d'autre ; les liens PDF et « Retour au CV » restent.
6. **`project-detail.html` au lot 1** : elle garde `?lang=en`, donc son script
   `lang-pending` reste jusqu'au lot 2 (sinon flash du français). Ses liens vers
   l'accueil et les études de cas pointent directement vers `/en/…` en anglais.
7. **Générateur de PDF** : il ouvre `index.html?lang=en` et réécrit les liens
   relatifs depuis la racine du site. À passer sur `/en/` (sinon les liens du PDF
   anglais mèneraient aux pages françaises). Non cité par la mission, nécessaire.
8. **Serveur local du générateur** (`scripts/lib/site-server.js`) : il ne sert pas
   `/en/` (répertoire). À corriger (index de répertoire).
9. **Fichier parasite publié** : `undefined/formation-finale.png` (capture d'écran
   committée par erreur dans la PR #67) est servi en 200 sur le domaine. À retirer
   (proposé au lot 4, hors mission).
10. **Branche** : la session impose `claude/cv-repo-seo-gb9joz` ; la mission demande
    `seo-audit-2026-09`. Je travaille sur la première (un commit par lot, rien sur
    `main` sans accord), c'est le seul écart.
11. **`og-image.png`** : texte en anglais (« Product Manager · Growth », « Senior
    Growth Product Manager — AB Tasty »), rien en français : utilisable pour `/en/`.

## 3. Plan fichier par fichier

### Lot 1 — `/en/` et `/en/results.html`

Principe : `index.html` et `results.html` restent les gabarits édités à la main.
Le générateur en tire la version anglaise (même gabarit, `lang="en"`, zones
rendues en anglais, textes `data-i18n` traduits), servie à `/en/` pendant le rendu.
Les chemins d'assets passent en absolu depuis la racine ; les liens entre pages
restent relatifs, ce qui les garde dans la langue de la page sans rien calculer.

- `scripts/generate-static.js` : deux langues par page ; coquille EN tirée de la
  page FR (sans script de redirection), rendue à `/en/…` via une route Playwright ;
  zones générées nouvelles dans le `<head>` (`langLinks` : canonical, hreflang,
  og:url, og:locale ; `jsonLd`) et pour le lien de langue ; traduction des
  `data-i18n`, `data-i18n-placeholder`, `data-i18n-aria`, `data-i18n-alt` ;
  sentinelles et mots minimum par langue.
- `scripts/lib/structured-data.js` (nouveau) : le JSON-LD `ProfilePage` sorti de
  `index.html`, en deux langues (`url`, `name`, `inLanguage`, `Person.description`).
- `scripts/lib/site-server.js` : index de répertoire (`/en/` → `en/index.html`).
- `index.html`, `results.html` : script de redirection `?lang=en` en tête du
  `<head>` ; marqueurs des nouvelles zones ; bouton FR/EN → `<a>` ; assets en
  absolu ; `<noscript>` ; commentaires ; GoatCounter sans `lang=en` ; plus de
  `lang-pending`.
- `en/index.html`, `en/results.html` (nouveaux, générés).
- `js/i18n.js` : langue lue dans le chemin ; clé `noscript.fit` ; `langSuffix`/
  `syncUrl` gardés pour `project-detail.js` jusqu'au lot 2.
- `js/app.js`, `js/results.js` : langue par le chemin ; plus de réécriture du
  canonical ; titre/description/og: seulement s'ils diffèrent (avec avertissement
  console) ; contrôle statique/i18n dans les deux langues ; lien de langue qui
  garde l'ancre ; liens sans `langSuffix()` ; PDF en `/assets/…`.
- `js/data.js` : chemins d'images en `/assets/…` (aucun texte touché).
- `js/project-detail.js` : liens vers `/en/…` en anglais (le reste au lot 2).
- `project-detail.html` : assets en absolu, GoatCounter sans `lang=en`.
- `404.html` : lien anglais vers `/en/`, langue déduite aussi du chemin `/en/`.
- `scripts/generate-pdf.js` : PDF anglais depuis `/en/`, liens résolus depuis `/en/`.
- `sitemap.xml` : `/en/` et `/en/results.html` avec hreflang, plus de `?lang=en`.
- `.github/workflows/generate-pdf.yml`, `pr-checks.yml` : fichiers `en/` ajoutés
  (commit, diff, correspondance fichier → URL pour `lastmod`).
- `css/style.css` : `a#langToggle` identique au bouton.
- `scripts/check-seo.mjs` : déjà prêt pour les critères du lot 1.
- `README.md` (§0, §5, §8, §10), `CLAUDE.md` (décisions langue et pré-rendu).

### Lot 2 — Tour de Growth en URL statique

- `js/data.js` : `metaDescription` FR/EN dans `PROJECT_DETAILS` (textes de la mission).
- `scripts/generate-static.js` : une page FR `projets/<slug>.html` et EN
  `en/projects/<slug>.html` par entrée de `PROJECT_DETAILS`, à partir du gabarit
  `project-detail.html` ; `data-slug` sur `<body>` ; JSON-LD `WebPage` +
  `BreadcrumbList` + `WebApplication` (`structured-data.js`).
- `project-detail.html` : page de redirection (slug connu → `location.replace`),
  coquille « Projet introuvable » sans contenu pré-rendu, `<noscript>` avec un lien
  par projet, ni canonical, ni GoatCounter, ni `noindex` en dur.
- `js/project-detail.js` : slug lu dans `data-slug` ; liens et lien de langue vers
  les URL statiques ; `langSuffix`/`syncUrl`/`lang-pending` supprimés.
- `js/app.js`, `js/results.js` : liens vers l'étude de cas en URL statique.
- `sitemap.xml`, workflows, `README.md` (date du changement d'URL dans GoatCounter).
- `scripts/check-seo.mjs` : critères du lot 2, exception du lot 1 levée.

### Lot 3 — données structurées

- `scripts/lib/structured-data.js` : `sameAs` sans tourdegrowth.com ;
  `dateModified`, `dateCreated` ; `CollectionPage` + `BreadcrumbList` des études
  de cas (FR/EN).
- `scripts/generate-static.js` : date du premier commit (`git log --reverse`,
  échec sur clone superficiel) ; `lastmod` des pages et `dateModified` posés
  ensemble par le générateur (voir écart 1).
- `.github/workflows/generate-pdf.yml`, `pr-checks.yml` : `fetch-depth: 0` ; la
  mise à jour des `lastmod` ne garde que les PDF.
- `scripts/check-seo.mjs` : critères du lot 3.

### Lot 4 — finitions

- `js/data.js` : `PROFILE.seo.title` FR/EN (textes de la mission).
- `js/i18n.js` : `results.metaDescription` FR/EN (textes de la mission).
- `favicon.ico` (nouveau, 16/32/48 px, depuis `assets/favicon.svg`).
- `undefined/formation-finale.png` : suppression (écart 9, si Antoine est d'accord).
- `scripts/check-seo.mjs` : longueurs (60 / 160), favicon.
