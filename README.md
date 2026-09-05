# CV — Antoine Berthaud

Site CV statique en HTML/CSS/JS vanilla. Aucun build nécessaire pour le site lui-même : tu peux l'ouvrir en local ou le déployer tel quel sur GitHub Pages. Une seule brique optionnelle a besoin de Node.js : la génération automatique des PDF (section 5).

## Arborescence

```
index.html               → structure de la page + copies statiques du pitch FR et des balises SEO (voir section 10)
css/style.css             → tous les styles (tokens de couleur en haut du fichier)
js/i18n.js                  → dictionnaire des textes fixes de l'interface (FR/EN) + logique de bascule de langue
js/data.js                 → ⭐ LE FICHIER À ÉDITER : ton contenu (profil, expériences, compétences, side projects)
js/app.js                  → génère le HTML à partir de data.js, gère les filtres, durées, focus mode, impression, langue
js/gemini.js                → logique du Fit-Checker (appelle la fonction Supabase, jamais Gemini directement)
supabase/functions/gemini-fit/index.ts  → code de la fonction serveur à déployer sur Supabase
scripts/generate-pdf.js      → génère les PDF FR/EN à partir du site (voir section 5)
package.json                → déclare la dépendance Playwright utilisée par generate-pdf.js
.github/workflows/generate-pdf.yml → régénère les PDF automatiquement à chaque changement (GitHub Actions)
assets/cv-antoine-berthaud-fr.pdf, -en.pdf → PDF générés (ne pas éditer à la main, ils sont régénérés à chaque fois)
assets/photo/               → dépose ta photo ici
assets/logos/               → dépose les logos des entreprises ici (PNG/SVG, fond transparent de préférence)
robots.txt / sitemap.xml     → référencement (voir section 10)
CNAME                        → domaine personnalisé pour GitHub Pages (cv.antoine.berthaud.me)
```

## 0. Le site est bilingue FR/EN

Un bouton **FR/EN** dans le menu bascule toute l'interface, y compris le résultat du Fit-Checker (Gemini reçoit une instruction pour répondre dans la langue affichée).

- Les **textes fixes de l'interface** (menu, boutons, libellés...) sont dans `js/i18n.js`, sous forme de dictionnaire `UI_STRINGS`.
- Le **contenu** (`js/data.js`) utilise le même principe partout : un champ traduisible s'écrit `{ fr: "...", en: "..." }`. Un champ laissé en texte simple (ex: `"AB Tasty"`, une date, un id) s'affiche à l'identique dans les deux langues — pas besoin de dupliquer les noms propres.

  ```js
  // Traduit :
  pitch: { fr: "Product Manager avec...", en: "Product Manager with..." }

  // Pas besoin de traduire (identique dans les deux langues) :
  company: "AB Tasty"
  ```

  Si tu ajoutes une expérience ou modifies un texte, respecte ce même format pour que la bascule de langue continue de fonctionner. Si tu ne fournis qu'une seule langue sur un champ qui devrait être bilingue, ce texte s'affichera tel quel des deux côtés — ce n'est pas une erreur bloquante, juste un oubli de traduction à combler.

## 1. Remplir ton contenu

Ouvre **`js/data.js`** : tout ce qui est marqué `[À REMPLACER]` ou `EXEMPLE` doit être remplacé. C'est le seul fichier que tu dois éditer pour le contenu.

- **Photo** : dépose le fichier dans `assets/photo/`, puis renseigne `PROFILE.photo = "assets/photo/tonfichier.jpg"`. Si tu laisses vide, un avatar avec tes initiales s'affiche à la place.
- **Logos d'entreprise** : même principe avec `assets/logos/` et le champ `logo` de chaque entreprise dans `EXPERIENCES`. Vide = pastille avec les 2 premières lettres du nom de l'entreprise, générée automatiquement.
- **Plusieurs rôles chez une même entreprise** : ajoute plusieurs objets dans le tableau `roles` de cette entreprise, **du plus RÉCENT au plus ANCIEN** (celui du haut = poste actuel ou le plus récent). Le site calcule automatiquement la durée de chaque rôle *et* la durée totale chez l'entreprise (de la date de début la plus ancienne à la date de fin la plus récente parmi tous les rôles).
- **Contenu d'un rôle** : chaque rôle se décompose en 4 blocs pour rester lisible (fini le pavé de texte unique) :
  - `context` — 1 à 2 phrases de mise en situation (produit, marché, périmètre)
  - `achievements` — tableau de réalisations concrètes, idéalement chiffrées, affichées en liste à puces
  - `methodology` *(optionnel)* — méthodo utilisée (ex: `"Scrum, OKR"`). Omets le champ si tu ne veux rien afficher.
  - `team` *(optionnel)* — taille/composition de l'équipe (ex: `{ fr: "4 développeurs, 1 QA", en: "4 developers, 1 QA" }`). Idem, omets si non pertinent.
- **Compétences/outils** : la liste maîtresse est dans `SKILLS`. Chaque rôle et chaque side project référence des compétences par leur `id`. Ajoute/retire librement des entrées.
- **Side projects** : mets `CONFIG.showSideProjects = false` en haut de `data.js` pour masquer entièrement la section (et le lien de menu) sans supprimer le contenu. **Actuellement activé**, avec Tour de Growth et sa page de détail (section 11).

**Note sur le filtre compétences** : par défaut, sélectionner plusieurs compétences affiche les expériences qui correspondent à *au moins une* d'entre elles (logique "OU"), ce qui est généralement plus utile pour parcourir un CV. Si tu préfères une logique "ET" (afficher seulement les expériences qui ont *toutes* les compétences cochées), dis-le-moi et je modifie `applyFilters()` dans `app.js`.

**Français par défaut, anglais sur `?lang=en`** : l'URL nue (`https://cv.antoine.berthaud.me/`) affiche toujours le français ; ajoute `?lang=en` pour ouvrir directement la version anglaise — c'est ce lien qu'il faut partager à un recruteur anglophone. Le bouton FR/EN met aussi l'URL à jour quand on clique dessus (`?lang=en` en anglais, URL nue en français), donc l'URL affichée reste copiable telle quelle.

**Pas de détection de la langue du navigateur**, et c'est volontaire : Googlebot rend la page avec un navigateur en anglais, et indexait donc la version anglaise à l'URL canonique — à contre-sens d'un CV qui vise des requêtes françaises (voir section 10). Un anglophone qui tombe sur le lien brut voit le français, avec le bouton EN bien visible dans le menu.

**Menu qui suit le scroll** : le lien correspondant à la section visible à l'écran est automatiquement surligné dans le menu (soulignement animé), que ce soit en scrollant ou en cliquant sur un lien du menu. C'est géré tout seul, rien à configurer.

## 2. Sécuriser l'appel à Gemini (Fit-Checker)

Le principe : ta clé Gemini ne doit **jamais** apparaître dans le code du site (visible par n'importe qui via l'inspecteur du navigateur). Elle vit uniquement côté serveur, dans une fonction Supabase.

### Étape A — Obtenir une clé API Gemini
1. Va sur **https://aistudio.google.com/apikey**
2. Connecte-toi avec un compte Google
3. Clique sur **"Create API key"**
4. Copie la clé générée — garde-la de côté, tu vas la mettre dans Supabase (jamais dans le code du site)

### Étape B — Créer un projet Supabase (gratuit)
1. Va sur **https://supabase.com** → crée un compte → **New project**
2. Une fois créé, note dans *Project Settings → API* :
   - l'**URL du projet**
   - la clé **`anon` / `public`**

### Étape C — Déployer la fonction qui appelle Gemini
Le code est déjà prêt dans `supabase/functions/gemini-fit/index.ts`. Il te reste à le déployer :

> ⚠️ **Piège classique à éviter** : il y a deux fichiers qui parlent de Gemini dans ce projet, et ils ne vont pas au même endroit :
> - `js/gemini.js` → reste **sur le site** (il tourne dans le navigateur)
> - `supabase/functions/gemini-fit/index.ts` → part **sur Supabase** (c'est lui qui doit être collé dans l'éditeur de fonction Supabase, ou déployé via la CLI ci-dessous)
>
> Si tu colles le mauvais fichier dans Supabase, tu obtiens une erreur du type `Cannot destructure property 't' of 'window.i18n' as it is undefined` — c'est le signe que `js/gemini.js` (qui a besoin du navigateur) a été déployé à la place de `index.ts`.

```bash
# Installer la CLI Supabase (une seule fois)
npm install -g supabase

# Te connecter et lier le projet
supabase login
supabase link --project-ref TON_PROJECT_REF

# Stocker ta clé Gemini en secret (jamais dans le code)
supabase secrets set GEMINI_API_KEY=colle_ta_cle_ici

# Déployer la fonction
supabase functions deploy gemini-fit --no-verify-jwt
```

`--no-verify-jwt` rend la fonction appelable sans compte utilisateur, ce qui est nécessaire ici puisque n'importe quel recruteur doit pouvoir l'utiliser sans se connecter. Pour éviter les abus (quelqu'un qui spam ta fonction et consomme ton quota Gemini), tu peux activer le **rate limiting** dans Supabase (Project Settings → API → Rate Limits), ce qui est recommandé mais optionnel pour démarrer.

Pense aussi à remplacer `ALLOWED_ORIGIN` dans `index.ts` par ton vrai domaine GitHub Pages une fois en ligne, plutôt que `"*"`.

Le modèle utilisé (`GEMINI_MODEL` en haut du fichier) a été vérifié au 20 août 2026. Google fait évoluer ses modèles assez vite : si tu obtiens une erreur 404 côté Gemini, va voir la liste à jour sur https://ai.google.dev/gemini-api/docs/models et ajuste cette constante.

### Étape D — Connecter le site à la fonction
✅ Déjà fait dans `js/data.js` avec les identifiants que tu m'as donnés :
```js
supabaseFunctionUrl: "https://tpreesulucfsyalaipcj.supabase.co/functions/v1/gemini-fit",
supabaseAnonKey: "eyJhbGc...", // clé "anon public" — conçue par Supabase pour être exposée côté client, ce n'est pas un secret
```
Le bouton "Analyser le fit" reste désactivé (avec un message clair) tant que `supabaseFunctionUrl` est vide — donc rien ne casse si tu déploies le site avant d'avoir fini cette partie.

### Étape E — Rate limiting avec Upstash (optionnel mais recommandé)
Une fois le lien public partagé à des recruteurs, n'importe qui peut aussi spammer ton endpoint et consommer ton quota Gemini. Le code est déjà prêt dans `index.ts` (basé sur [l'exemple officiel Supabase](https://supabase.com/docs/guides/functions/examples/rate-limiting)) : **5 analyses par minute et par adresse IP**. Il ne fait rien tant que tu n'as pas configuré Upstash — donc pas d'urgence à le faire avant de déployer.

1. Crée un compte gratuit sur https://upstash.com, puis une base **Redis** (type "Global" pour minimiser la latence).
2. Dans l'onglet **REST API** de ta base, copie `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`.
3. Stocke-les en secrets Supabase, comme pour la clé Gemini :
   ```bash
   supabase secrets set UPSTASH_REDIS_REST_URL=colle_l_url_ici
   supabase secrets set UPSTASH_REDIS_REST_TOKEN=colle_le_token_ici
   ```
4. Redéploie la fonction : `supabase functions deploy gemini-fit --no-verify-jwt`.

Si un recruteur dépasse la limite, il voit un message clair ("Trop de tentatives, réessaie dans une minute") plutôt qu'une erreur brute. Pour changer le seuil (5/minute par défaut), ajuste `Ratelimit.slidingWindow(5, "60 s")` dans `index.ts`.

## 3. Tester en local

Comme le site charge plusieurs fichiers JS séparés, ouvrir `index.html` directement en double-cliquant dessus ne fonctionne pas toujours (le navigateur bloque le chargement des fichiers via `file://`, en particulier sur Chrome). Le plus fiable est de lancer un petit serveur local.

### macOS / Linux
```bash
# Depuis le dossier du projet
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

### Windows
La commande diffère légèrement selon ce que tu as installé.

**Si Python est installé** (vérifie avec `python --version` dans PowerShell ou l'invite de commandes — sur Windows c'est `python`, pas `python3`) :
```powershell
cd chemin\vers\le\dossier\du\projet
python -m http.server 8000
```
Puis ouvre http://localhost:8000 dans ton navigateur.

**Si tu n'as pas Python mais que tu as Node.js** (utile de toute façon si tu déploies la fonction Supabase avec `npm`) :
```powershell
cd chemin\vers\le\dossier\du\projet
npx serve .
```
Le terminal affiche l'URL à ouvrir (en général http://localhost:3000).

**Si tu n'as ni l'un ni l'autre** : installe Python depuis https://python.org (coche bien "Add Python to PATH" pendant l'installation) ou Node.js depuis https://nodejs.org, puis utilise une des deux méthodes ci-dessus. Double-cliquer sur `index.html` peut fonctionner selon le navigateur, mais si la page reste blanche ou que rien ne s'affiche, c'est le signe qu'il faut passer par un serveur local.

## 4. Déployer sur GitHub Pages avec ton domaine personnalisé (cv.antoine.berthaud.me)

1. Crée un repo GitHub (public), pousse tout ce dossier dedans — le fichier `CNAME` à la racine (contenant `cv.antoine.berthaud.me`) est déjà prêt, ne le supprime pas.
2. Dans le repo : **Settings → Pages → Source : Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Toujours dans **Settings → Pages**, section **Custom domain** : renseigne `cv.antoine.berthaud.me` et valide (GitHub va lire le fichier `CNAME` automatiquement, ce champ devrait déjà le proposer).

### Configuration DNS (chez ton registrar/hébergeur de domaine)

Comme `cv.antoine.berthaud.me` est un sous-domaine, tu ajoutes un enregistrement **CNAME** (pas un enregistrement A) dans la zone DNS de `antoine.berthaud.me` (ou `berthaud.me` selon où ta zone est gérée) :

| Type  | Nom (host) | Valeur (target)         |
|-------|------------|--------------------------|
| CNAME | `cv`       | `TON_PSEUDO.github.io.`  |

Remplace `TON_PSEUDO` par ton nom d'utilisateur GitHub. Le point final après `.github.io.` est parfois requis selon le registrar (certains l'ajoutent automatiquement) — regarde comment tes autres enregistrements CNAME existants sont formatés si tu en as.

Selon l'interface de ton registrar, le champ "Nom/Host" peut attendre soit juste `cv`, soit `cv.antoine.berthaud.me` en entier — s'il te demande le nom complet et râle sur un sous-sous-domaine, essaie les deux formats.

### Vérification

- La propagation DNS prend de quelques minutes à 24h.
- Une fois propagé, GitHub Pages émet automatiquement un certificat HTTPS (Let's Encrypt) pour ton domaine — coche **"Enforce HTTPS"** dans Settings → Pages dès que l'option devient disponible (grisée tant que le certificat n'est pas prêt).
- Teste avec `dig cv.antoine.berthaud.me CNAME` (ou https://dnschecker.org) si le site ne répond pas après plusieurs heures.

**Alternative** si tu changes d'avis sur GitHub Pages : **Netlify** ou **Cloudflare Pages** gèrent aussi les domaines personnalisés, souvent avec une configuration DNS plus simple (Cloudflare en particulier, si ton domaine y est déjà géré).

## 5. PDF téléchargeable et Focus Lecture

Le bouton **"Télécharger PDF"** ne fait plus un simple `Ctrl/Cmd+P` navigateur (rendu peu maîtrisé, dépendant des réglages de chacun). Il télécharge un **vrai PDF pré-généré**, produit par Chromium piloté en script (Playwright) directement à partir du site : mêmes couleurs, mêmes polices, mise en page adaptée au format papier (A4 pour le français, Letter pour l'anglais). Si le PDF n'existe pas encore (avant la première génération), le bouton retombe automatiquement sur l'impression navigateur classique — rien ne peut casser.

### Comment ça marche

1. `scripts/generate-pdf.js` lance un mini-serveur local, ouvre le site dans Chromium, et exporte deux fichiers : `assets/cv-antoine-berthaud-fr.pdf` et `-en.pdf`.
2. Le CSS `@media print` (dans `style.css`) définit un rendu pensé spécifiquement pour le papier : les couleurs de marque sont conservées (bordures des piliers, dégradés d'avatar), les ombres portées sont retirées (elles ne rendent pas bien sur un support figé), et les sections interactives (navigation, Fit-Checker, bandeau teaser) sont masquées.
3. `.github/workflows/generate-pdf.yml` relance cette génération automatiquement à chaque `git push` qui touche le contenu ou le style, et recommit les PDF à jour — **tu n'as normalement jamais besoin de lancer ce script toi-même**. Le problème "CV à jour" est réglé une fois pour toutes : tu édites `data.js`, tu push, les PDF suivent.

### Régénérer en local (pour prévisualiser un changement avant de push)

**macOS / Linux :**
```bash
npm install
npx playwright install --with-deps chromium
npm run generate-pdf
```

**Windows (PowerShell) :**
```powershell
npm install
npx playwright install chromium
npm run generate-pdf
```
(`--with-deps` installe des paquets système Linux et n'a pas d'équivalent nécessaire sous Windows — Playwright embarque tout ce qu'il faut pour Chromium.)

Les fichiers sont écrits dans `assets/`. Ouvre-les pour vérifier avant de commiter, comme pour n'importe quel changement visuel.

### Point d'attention pour le déploiement automatique

Le workflow a besoin d'écrire sur ton dépôt (pour committer les PDF régénérés) : la permission `contents: write` est déjà configurée dans le fichier, mais vérifie que **Settings → Actions → General → Workflow permissions** de ton repo autorise bien "Read and write permissions" (c'est le réglage par défaut sur les nouveaux dépôts, mais certains comptes/organisations le restreignent). Si ta branche principale s'appelle `master` plutôt que `main`, ajuste la ligne `branches: [main]` dans `.github/workflows/generate-pdf.yml`.

### Focus Lecture

Le bouton **"Focus lecture"** ajoute une classe `focus-mode` sur `<body>` qui neutralise les dégradés/ombres pour une lecture plus sobre à l'écran. L'état n'est pas mémorisé entre deux visites (pas de `localStorage`) — dis-moi si tu veux que je l'ajoute, c'est une modification mineure.

## 6. Mettre en avant des mots ou chiffres (gras)

Dans `js/data.js`, entoure un mot, un chiffre ou une phrase de `**deux astérisques**` pour l'afficher en gras — ça marche dans `pitch`, `context` et chaque ligne d'`achievements` :

```js
achievements: [
  { fr: "Refonte de l'onboarding : **-20% de Time-to-Value, +15% de taux d'activation**.",
    en: "Reworked onboarding: **-20% Time-to-Value, +15% activation rate**." },
]
```

Je l'ai déjà appliqué sur tes expériences les plus récentes (AB Tasty, Everysens, SNCF — Prêt à Voyager) : chiffres clés (`-20%`, `+15%`, `100%`...) et 2-3 formulations qui méritent de ressortir à la lecture rapide (`modèle hybride`, `tunnel d'acquisition autonome`...). Je suis resté volontairement sobre — pas de gras sur les rôles juniors/anciens, pour ne pas noyer l'effet. Libre à toi d'ajuster : ajoute `**...**` où tu veux dans n'importe quel `context`/`achievement`/`pitch`, retire-en si tu trouves que j'en ai trop mis.

## 7. Favicon et aperçu de partage (Open Graph)

- **Favicon** : icône violette avec tes initiales "AB", déjà en place (`assets/favicon.svg` + fallbacks PNG pour les navigateurs/appareils plus anciens). Rien à faire.
- **Image de partage** (ce qui s'affiche quand tu partages le lien du CV sur LinkedIn, Slack, etc.) : déjà générée dans `assets/og-image.png` à partir de ta photo et de tes infos actuelles.
- **⚠️ À faire une fois déployé** : dans `index.html`, remplace les deux occurrences de `https://REMPLACE-PAR-TON-DOMAINE.example` (balises `og:image`, `og:url`, `twitter:image`) par ta vraie URL, ex. `https://tonpseudo.github.io/cv`. Sans ça, l'aperçu ne s'affichera pas correctement quand tu partageras le lien.
- Si tu changes significativement ton nom/rôle/photo plus tard, dis-le-moi et je régénère `og-image.png` en conséquence (c'est une image statique, pas générée dynamiquement).
- Ces balises restent toujours en français : les robots des réseaux sociaux n'exécutent pas le JavaScript, donc ils ne voient jamais la bascule EN. C'est normal et sans conséquence pour le site lui-même.

## 8. Analytics respectueux de la vie privée (GoatCounter)

Pas de cookies, pas de données personnelles collectées, pas de bannière de consentement nécessaire. **Gratuit indéfiniment** pour un usage personnel (contrairement à Plausible, qui n'a plus de forfait gratuit permanent depuis 2026 — je suis parti sur GoatCounter pour cette raison).

1. Crée un compte gratuit sur https://www.goatcounter.com ("Sign up" → "I want to sign up" → choisis un code de site, ex. `antoineberthaud`).
2. Dans `index.html`, remplace `TON-CODE` par ce code dans la balise `<script data-goatcounter="https://TON-CODE.goatcounter.com/count" ...>`.
3. C'est tout. Le tableau de bord (visites, pages vues, provenance) est visible sur `https://TON-CODE.goatcounter.com`.

**Événement suivi en plus des visites** : chaque analyse Fit-Checker réussie envoie un événement `fit-checker-used`, visible dans l'onglet "Campaigns" du tableau de bord GoatCounter — de quoi savoir combien de recruteurs utilisent réellement l'outil, pas seulement combien visitent la page.

## 9. Scorecard chiffré dans le Hero

Trois métriques clés (`HERO_STATS` dans `data.js`) affichées sous le pitch, pour donner un aperçu de l'impact avant même de lire les expériences. Modifie les valeurs/labels directement dans `data.js`, ou vide le tableau (`HERO_STATS = []`) pour le masquer entièrement — même logique que `SIDE_PROJECTS`/`TESTIMONIALS`.

## 10. SEO — être trouvé sur ton nom, et sur « product manager Nantes »

Soyons lucides sur l'objectif : sur une requête générique comme « product manager Nantes », la page de résultats appartient aux job boards (Indeed, HelloWork, Glassdoor…), et les recruteurs qui cherchent des candidats le font dans LinkedIn Recruiter, pas dans Google. Ce qui est atteignable, et ce que le site est équipé pour faire :

1. sortir **premier sur ton nom** et ses variantes (« Antoine Berthaud product manager ») ;
2. capter la **longue traîne** localisée (« senior growth product manager Nantes », « product manager PLG SaaS Nantes ») ;
3. être **lu par les moteurs IA** (ChatGPT, Perplexity, Claude…), qui citent volontiers les sites perso mais n'exécutent souvent pas le JavaScript.

Ce qui est en place dans le code :
- **Français par défaut, anglais sur `?lang=en`**, sans détection de la langue du navigateur (voir section 0) : Googlebot navigue en anglais et indexait la version anglaise à l'URL canonique. Balises `hreflang` fr/en dans le `<head>` et dans le sitemap ; le canonical suit la langue affichée (`/` en FR, `/?lang=en` en EN).
- **`<title>`, `<meta description>`, Open Graph et eyebrow du hero** qui citent Nantes, le métier et le secteur — textes dans `PROFILE.seo` (`js/data.js`), recopiés en dur dans le `<head>` de `index.html` pour les robots sans JavaScript. **Si tu modifies `PROFILE.seo`, reporte le changement dans `index.html`** (title, description, `og:`/`twitter:`).
- **Copie statique du pitch FR** dans `index.html` (`#heroPitch`), pour la même raison. `app.js` prévient dans la console du navigateur si cette copie diverge de `PROFILE.pitch.fr`.
- **Données structurées `ProfilePage` → `Person`** (JSON-LD dans `index.html`) : métier, lieu (Nantes), formation, sujets maîtrisés, et `sameAs` vers LinkedIn, le portfolio photo et Tour de Growth, pour que Google relie le tout à la même personne.
- **`sitemap.xml`** avec toutes les pages indexables (accueil FR et EN, Résultats, étude de cas) et une date `lastmod` **à mettre à jour quand une page change** ; `robots.txt` ; `CNAME`.
- **Pages secondaires** : `results.html` et `project-detail.html?slug=…` ont leur propre `<title>`/description par langue. L'étude de cas déclare son propre canonical (avec le `?slug=`) et la page gabarit sans slug (« Projet introuvable ») est en `noindex`.
- **PDF** avec titre, auteur, sujet, mots-clés et langue dans leurs métadonnées (écrites par `scripts/generate-pdf.js` via `pdf-lib`) — les PDF sont indexables eux aussi, autant qu'ils se présentent bien.
- Repli `<noscript>` avec lien direct vers les PDF.

Ce qui reste hors code, et qui pèse plus lourd que tout le reste :
1. **Des liens depuis tes propres sites** — la seule source de backlinks qui ne dépend de personne :
   - portfolio photo `antoine.berthaud.me` (Adobe Portfolio) : un lien « CV » dans le menu ou sur la page Contact, et idéalement une phrase « Product Manager à Nantes » quelque part dans le texte ;
   - `tourdegrowth.com` : un pied de page du type « Un side project d'Antoine Berthaud, Product Manager à Nantes » avec le lien vers le CV.
2. **LinkedIn** : l'URL du CV dans le champ « Site web », dans « En vedette » et dans « Infos ». Vérifier aussi qu'il n'existe qu'un seul profil à ton nom chez AB Tasty — un ancien profil en doublon dilue la recherche sur ton nom et envoie les recruteurs au mauvais endroit.
3. **Google Search Console** (propriété déjà créée) : après chaque mise en ligne importante, demander l'indexation des URLs via « Inspection de l'URL » plutôt que d'attendre le prochain crawl.

## 11. Side projects — carte + page de détail ("étude de cas")

Chaque side project affiché (`CONFIG.showSideProjects = true`) peut avoir,
en plus de sa carte sur la page d'accueil, une **page de détail dédiée**
façon mini-étude de cas — problème identifié, mécanismes de croissance mis
en place, démarche produit, chiffres d'usage. Le tout pensé comme un
gabarit réutilisable : ajouter un nouveau side project avec sa page de
détail ne demande de toucher qu'à `data.js`, jamais à `project-detail.html`
ni à `project-detail.js`.

**Pour ajouter un nouveau side project avec sa page de détail :**

1. Ajoute une entrée dans `SIDE_PROJECTS` (titre, description, `link` vers
   le projet en ligne) comme d'habitude.
2. Ajoute une clé correspondante dans `PROJECT_DETAILS` (juste après
   `SIDE_PROJECTS` dans `data.js`) : `problem`, `whatItIs`, `mechanisms`
   (liste), `process`, `metrics` (laisse `[]` tant que tu n'as pas de
   vrais chiffres significatifs — un texte de repli s'affiche
   automatiquement à la place via `metricsFallback`), `techStack`.
3. Relie les deux en renseignant `detailSlug` sur l'entrée `SIDE_PROJECTS`
   avec la même clé que dans `PROJECT_DETAILS`.
4. C'est tout — `project-detail.html?slug=ta-clé` fonctionne
   immédiatement, dans les deux langues, avec le lien retour vers le CV
   qui préserve la langue courante.

**Pourquoi une page séparée plutôt qu'une section de plus sur la page
d'accueil :** ça permet de documenter un side project en profondeur (la
démarche produit, pas juste le résultat) sans alourdir la page d'accueil,
qui reste un CV scannable rapidement. Le lien "Voir l'étude de cas" sur la
carte est optionnel — une entrée `SIDE_PROJECTS` sans `detailSlug` n'a
tout simplement pas ce second lien.

- [ ] Ajouter les logos d'entreprise (`assets/logos/`)
- [ ] Créer la clé Gemini + déployer la fonction Supabase (identifiants déjà renseignés côté site)
- [ ] Configurer Upstash si tu veux le rate limiting (optionnel)
- [ ] ~~Créer un compte GoatCounter gratuit et remplacer `TON-CODE` dans `index.html`~~ — fait (site `antoineberthaud`)
- [ ] Configurer le CNAME chez ton registrar DNS (voir section 4) + activer le domaine personnalisé dans Settings → Pages
- [ ] ~~Inscrire le site sur Google Search Console et soumettre le sitemap~~ — fait ; demander l'indexation des URLs après chaque mise en ligne importante (section 10)
- [ ] Ajouter le lien du CV sur LinkedIn (« Site web », « En vedette », « Infos ») et supprimer l'éventuel ancien profil en doublon
- [ ] Ajouter un lien vers le CV depuis `antoine.berthaud.me` (Adobe Portfolio) et depuis `tourdegrowth.com` (section 10)
- [ ] Vérifier les permissions du workflow GitHub Actions (Settings → Actions → General → "Read and write permissions")
- [ ] ~~Repasser `CONFIG.showSideProjects` à `true`~~ — fait, Tour de Growth est en place
- [ ] Remplir `metrics` dans `PROJECT_DETAILS` (Tour de Growth) dès qu'il y a de vrais chiffres d'usage (visites, taux de partage, coefficient viral) — le texte de repli actuel est temporaire, pas un oubli
- [ ] Quand le projet climat sera prêt à être montré : lui ajouter aussi sa carte + page de détail en suivant le même pattern (section 11)
- [ ] Déployer sur GitHub Pages (ou autre) — les PDF se maintiendront à jour tout seuls ensuite
