# Plan d'implémentation — après la quatrième revue

Rédigé le 7 septembre 2026, à partir du document de synthèse
(https://claude.ai/code/artifact/29638c4b-f274-4c46-bf2e-7f8c4fb719b8) et des
réponses d'Antoine. **Statut : en attente du GO d'Antoine.** Rien de ce qui
suit n'est implémenté ; ce fichier est le contrat de ce qui sera fait, dans
quel ordre, avec quels textes. Il est mis à jour à chaque PR (case cochée,
numéro de PR, mesure) et retiré du dépôt une fois les six lots terminés. Il
n'est pas servi sur le domaine (`docs/` est dans `exclude` de `_config.yml`).

## Décisions d'Antoine (7 septembre)

| # | Sujet | Décision |
|---|-------|----------|
| 1 | Espace des expériences | OK, et « pas assez drastique » jusqu'ici : SNCF pèse peu face aux rôles récents. |
| 3 | Ordre des sections, études de cas, Fit-Checker | OK. Et, par conséquence, **les filtres de compétences disparaissent** (« gadget ») : compétences en bas, réduites au total et par rôle, sans filtrage. |
| 4 | Compétences réduites | OK, **résultat à voir avant validation**. |
| 7 | Scope AB Tasty | 50 M d'ARR, 5 000 utilisateurs actifs mensuels, 1 000+ organisations clientes. |
| 8 | Structure des études de cas | Question ouverte : la structure en dix sections de l'auditeur est-elle pertinente ? Réponse au lot 6. |
| 9 | Formation | OK : les deux stages Orsys sortent, la certification AB Tasty reste. |

Non tranché, proposé par défaut dans les lots : action 2 (quatrième chiffre),
action 5 (pastille « 15 ans dans le numérique · 10 en Product Management »),
action 6 (PDF court par défaut), action 10 (mention Claude Code hors de la
carte d'accueil).

## Règles qui s'appliquent à chaque lot

- Une branche `claude/...` par lot, PR, squash, CI verte (`pr-checks.yml`),
  puis vérification du workflow `generate-pdf.yml` sur main.
- Textes proposés ici = brouillons à corriger par Antoine avant merge. Rien
  d'inventé : chaque fait vient de `data.js` ou d'une réponse d'Antoine.
- Vérifications systématiques : site à 1 280 et 375 px en FR et EN, console
  vide (rendu JS identique au pré-rendu), `generate-static.js --check`, PDF
  complets à 5 pages, courts à 2, dernière page avec marge.
- Mesure de succès du plan : part de chaque entreprise dans la section
  Expériences (Playwright, 1 280 px, débuts dépliés). Aujourd'hui : AB Tasty
  28,8 %, Everysens 14,0 %, SNCF 46,0 %, ESN 11,2 %. Cible : AB Tasty ≥ 35 %,
  SNCF ≤ 30 %.
- CLAUDE.md est mis à jour à chaque lot (décisions), README quand une
  fonctionnalité disparaît (filtres, teaser).

## Ordre des lots

1. Expériences : SNCF fusionné, QA réduite, scope AB Tasty
2. Hero : quatrième chiffre, pastille 15/10, quatre ans techniques
3. Compétences : 30 chips sans outils, plus de filtres, tags par rôle réduits — **montré avant validation**
4. Structure : expériences avant compétences, section Études de cas, teaser retiré, recommandation en bas
5. PDF et formation : court par défaut, Orsys retirés, Claude Code hors de la carte
6. Contenu : études de cas (structure et quatrième étude), scope Everysens et SNCF

Les lots 1 et 2 sont indépendants. Le lot 3 précède le 4 (les tags par rôle
et la ligne d'outils doivent exister avant de déplacer la section). Le lot 5
est trivial et peut se glisser n'importe où après le 4.

---

## Lot 1 — Expériences

**Objectif mesurable** : SNCF de 46 % à 30 % ou moins de la section, AB Tasty
à 35 % ou plus. Mesure avant/après dans la description de la PR.

### Changements

`js/data.js`, `EXPERIENCES`, bloc SNCF Connect & Tech :

1. **Fusion des deux postes 2020–2022** (Prêt à Voyager 2021-10 → 2022-04 et
   boutiques en ligne 2020-09 → 2022-04) en un seul rôle `Product Manager`,
   `start: "2020-09"`, `end: "2022-04"`, méthodologie `Scrum, Kanban`, équipe
   « 3 développeurs, 1 Scrum Master, 1 Delivery Manager (boutiques) · 4
   développeurs, 1 Engineering Manager (Prêt à Voyager) ». `RESULT_DETAILS`
   (`sncf-ticket-retrieval`, période 2021 – 2022) ne change pas.
2. **QA réduite au titre et aux dates** : `context` et `achievements` retirés,
   `methodology` et `team` retirés (le rendu d'un rôle sans puces n'affiche
   pas le libellé « Accomplissements », `app.js` l. 318). Dates conservées,
   donc durée totale SNCF et rail chronologique inchangés. Le rôle reste
   replié sur téléphone derrière « Voir mes débuts ».
3. **Scope AB Tasty** : nouveau champ `scope: { fr, en }` au niveau entreprise,
   rendu sous la localisation dans `.company-header` (`app.js`, nouvelle
   classe `.company-scope`, 13 px, `--ink-soft`). Affiché dans les deux PDF
   (une ligne). Le champ est optionnel : Everysens et SNCF l'auront au lot 6.

### Textes à valider

Rôle fusionné, contexte :

> Mission : l'outil de génération de boutiques en ligne de titres de
> transport (Transilien, TER), puis en parallèle, d'octobre 2021 à avril
> 2022, la plateforme sanitaire Prêt à Voyager (jusqu'à **40 000 visiteurs
> par jour**), où les voyageurs vérifiaient eux-mêmes pass sanitaire et
> billet pendant le Covid-19.

Puces :

1. **+100 % sur le taux de conversion** de la première étape de récupération
   du billet sur Prêt à Voyager : parcours retravaillé à partir des retours
   des voyageurs collectés sur Twitter (extraction quotidienne via Zapier),
   plateforme redéveloppée en interne.
2. **Une mission et une vision produit communes** aux stakeholders et au
   service marketing des boutiques en ligne, formalisées et partagées.
3. **Stratégie 2021 tenue par des OKR** : roadmap de delivery, priorisation
   du backlog, discovery relancé (sondages utilisateurs, data disponible).

Scope AB Tasty (sous « Nantes, France ») :

> 1 000+ organisations clientes · 5 000 utilisateurs actifs mensuels ·
> 50 M€ d'ARR

À confirmer par Antoine : la devise (euros ?) et le fait que l'ARR soit
partageable publiquement (le site est public). Sans confirmation, la ligne
s'arrête aux organisations et aux utilisateurs.

Versions anglaises rédigées dans la PR, à relire.

### Vérifications propres au lot

- Rail chronologique : le segment SNCF garde ses dates (2015-01 → 2022-04).
- Rôle QA sans puces : pas de libellé orphelin, pas de ligne Méthodologie.
- Bloc « Animateur de la communauté » inchangé.
- PDF complet : la page 3 ou 4 ne laisse pas de trou (les règles de saut de
  page ont été assouplies le 6 septembre, à re-vérifier avec un bloc de
  moins).

---

## Lot 2 — Hero

### Changements

1. **Quatrième chiffre** dans `HERO_STATS`, en deuxième position :
   `{ value: "-20%", label: { fr: "Time-to-Value (AB Tasty)", en:
   "Time-to-Value (AB Tasty)" }, resultId: "ab-tasty-activation" }`. Il
   pointe vers la même étude de cas que le +15 %. Les libellés gardent leur
   périmètre (« première étape de récupération du billet » reste).
2. **CSS** : `.hero-stats` est un flex qui wrap ; à quatre, vérifier à 1 280 px
   qu'ils tiennent sur une ligne dans la colonne texte du hero (sinon
   grille 2 × 2 sur ordinateur, ce que fait déjà le mobile en colonne).
   Print : `.hero-stats{grid-template-columns:repeat(4,1fr)}` (aujourd'hui 3)
   dans le complet et le court.
3. **Pastille** : `PROFILE.yearsDigital = "15"` ajouté ; la pastille devient
   « 15 ans dans le numérique · 10 en Product Management » (EN « 15 years in
   digital · 10 in Product Management »). Le pitch et la meta description
   gardent « 10 ans ». Mise à jour de la décision « un seul nombre partout »
   dans CLAUDE.md : deux nombres, définis une seule fois chacun. La QA
   (dix-huit mois) n'est comptée ni comme technique ni comme produit.
4. **Pitch** : la première phrase devient « Senior Product Manager, **10 ans
   de produit** en **SaaS B2B** (AB Tasty, Everysens) et grands comptes
   (SNCF Connect & Tech), **ingénieur de formation** et quatre ans côté
   technique avant le produit. » (EN : « … **engineer by training**, with
   four years on the technical side before product. »). 83 → 91 mots.

### Vérifications propres au lot

- Hero à 1 280, 1 100 et 375 px ; PDF court : le pitch à 11,2 px tient
  toujours, le court reste à 2 pages.
- Les quatre chiffres sont cliquables et ancrés sur `results.html`.

---

## Lot 3 — Compétences (montré avant validation)

### Changements

1. **`SKILLS` : 38 → 30 chips.** Sortent (12 purs outils) : Jira,
   ProductBoard, Figma, Miro, Zapier, Flagship, Akeneo, Postman, Looker
   Studio, Matomo, Hotjar, Heap. Entrent (4 notions, chacune portée par un
   fait du site) : Stratégie produit / Product Strategy (business case et
   roadmap devant la direction), Priorisation / Prioritization (rôle SNCF
   2020), Rétention / Retention (rôle AB Tasty 2023), Product Analytics
   (tableaux de bord churn, rétention, activation, Time-to-Value).
   Groupes résultants : Growth & stratégie 9 (Product-Led Growth,
   Monétisation self-serve, Onboarding & activation, Rétention, A/B testing &
   expérimentation, Stratégie produit, OKR, Roadmapping, Priorisation) ·
   Discovery & data 7 (Discovery, User Research, Product Analytics, SQL,
   Metabase, Mixpanel, Segment) · Leadership 3 · Delivery 8 (inchangé) ·
   Technique 3 (API & intégrations, Intégration LLM, IA générative ; le
   groupe est renommé, `tools` → libellé « Technique » / « Technical »).
2. **Ligne « Outils du quotidien »** sous les groupes, en texte gris 13 px,
   dans la zone pré-rendue : « Outils du quotidien : Jira, ProductBoard,
   Figma, Miro, Zapier, Flagship, Akeneo, Postman, Looker Studio, Matomo,
   Hotjar, Heap. » Gardée dans le PDF complet (mots-clés), masquée dans le
   court.
3. **Filtres retirés** (`app.js` section 3 et `applyFilters`) : les chips
   deviennent des `<span>` (plus de `<button>`, d'`aria-pressed`, de
   `#filterStatus`, de bouton « Réinitialiser », de classe `body.has-filters`
   ni `.is-matched`) ; les débuts ne se déplient plus sur filtre ; le rail
   n'a plus à se rafraîchir sur filtre. `index.html` : consigne « Clique
   sur… » retirée, `#filterStatus` et bouton retirés. `i18n.js` :
   `skills.hint`, `skills.clearFilters`, `experiences.filterStatus*`
   retirés. `style.css` : `.chip` sans `cursor:pointer` ni état actif, règles
   `has-filters` retirées, `.role-skills` masqués sur téléphone sans
   condition. README §8 (événements) et CLAUDE.md (paragraphe accessibilité
   des filtres, décision « Page plus courte sur téléphone ») mis à jour.
4. **Tags par rôle réduits à 6 au plus**, choisis (aujourd'hui de 2 à 19) :
   - AB Tasty Senior : Product-Led Growth, Monétisation self-serve,
     Stratégie produit, Roadmapping, Stakeholder Management, Cross-functional
     Leadership
   - AB Tasty PM 2023 : Onboarding & activation, Rétention, A/B testing &
     expérimentation, Product Analytics, Discovery, Feature Flagging
   - Everysens : Discovery, User Research, Roadmapping, Priorisation,
     Stakeholder Management
   - SNCF PM 2020–2022 (fusionné) : User Research, OKR, Roadmapping,
     Priorisation, Stakeholder Management, Discovery
   - Animateur de la communauté : Mentoring & Coaching, Cross-functional
     Leadership
   - PM Junior : API & intégrations, User Stories & Backlog, Story Mapping,
     BDD, Agile / Scrum
   - QA : aucun ; ESN : Analyse fonctionnelle, Gestion de projet
   Les tags s'affichent sur ordinateur et **dans le PDF complet** (une ligne
   « Expertise » par rôle, la règle qui les masquait datait de 1,8 page de
   tags) ; masqués sur téléphone et dans le court.
5. Les identifiants retirés de `SKILLS` sont nettoyés de chaque tableau
   `skills` (sinon l'identifiant brut s'affiche, `app.js` l. 275).

### Ce qu'Antoine verra avant de valider

Captures à 1 280 et 375 px de la section et d'un bloc d'expérience avec ses
tags, page 2 du PDF complet, page 1 du court.

---

## Lot 4 — Structure

### Changements

1. **Ordre des sections** dans `index.html` : hero → Ce qui me définit →
   Expériences → **Études de cas** (nouvelle) → Compétences → Formation →
   Side projects → Recommandation → Fit-Checker → Contact. Les zones
   pré-rendues se déplacent avec leurs sections (le générateur les retrouve
   par leur identifiant). Le PDF suit le même ordre : compétences après les
   expériences dans le complet comme dans le court (page 2), soit exactement
   la structure 2 pages de l'auditeur.
2. **Navigation** : Profil · Expériences · Études de cas · Compétences ·
   Formation · Side projects · Fit-Checker · Contact (`nav.caseStudies`
   ajouté ; le scroll-spy suit les identifiants de section).
3. **Section « Études de cas »** (`#etudes-de-cas`, zone
   `static:caseStudies`, sélecteur `#caseStudiesGrid` ajouté à la liste des
   zones de `scripts/generate-static.js` l. 51) : trois cartes Problème →
   Approche → Résultat → « Lire l'étude de cas → » (ancre sur
   `results.html#id`), rendues depuis `RESULT_DETAILS` avec trois champs
   nouveaux par entrée : `cardTitle`, `problem`, `approach` (fr/en). Le
   lien « Voir les 3 études de cas → » sous les chiffres du hero reste.
4. **Bandeau Fit-Checker retiré** du hero (`div.fit-teaser`, CSS `.fit-teaser*`,
   chaînes `fitTeaser.*`). La section Fit-Checker reste, avant-dernière, avec
   son entrée de menu.
5. **Recommandation** déplacée sous Side projects.
6. **Tour de Growth** : la mention « conçu et construit avec Claude Code »
   quitte la description de la carte d'accueil (`SIDE_PROJECTS`), reste sur
   la page de détail.

### Textes à valider (cartes)

Brouillons tirés des études existantes ; à recouper avec `results.html`.

- **Repenser l'onboarding — AB Tasty.** Problème : churn précoce et support
  saturé, une activation sous le benchmark du marché. Approche : entretiens
  utilisateurs, benchmark externe, moteur de qualification, nouveau parcours
  d'activation. Résultat : +15 % d'activation, -20 % de Time-to-Value.
- **Réduire la friction de saisie — Everysens.** Problème : une saisie longue
  et peu fiable sur des trains de 30 wagons et plus. Approche : recherche
  utilisateur, plan de migration porté auprès de la direction, refonte
  incrémentale, MVP en moins de 2 mois. Résultat : -50 % de temps de saisie,
  +20 % de satisfaction.
- **Un parcours critique sans données produit — SNCF Connect.** Problème :
  des voyageurs bloqués à la première étape de récupération du billet, sans
  analytics disponibles. Approche : extraction quotidienne des tweets via
  Zapier, seconde méthode de récupération ajoutée. Résultat : +100 % de
  conversion sur la première étape.

Pas d'« expérimentation » dans la chaîne AB Tasty ni de « behavioral
analysis » dans la chaîne SNCF : les études ne les décrivent pas.

### Vérifications propres au lot

- Scroll-spy et rail après réordonnancement ; ancres du pied de page.
- Pré-rendu : nouvelle zone régénérée, `--check` propre.
- PDF complet : ordre, 5 pages ; court : compétences en page 2, 2 pages.
- Captures avant/après du premier écran et de la page à 375 px (nombre
  d'écrans : 21 aujourd'hui, ne doit pas augmenter).

---

## Lot 5 — PDF et formation

1. **Court par défaut** : `#printBtn` sert le court, `#printShortBtn` devient
   « complet » / « full » et sert les 5 pages ; libellés `nav.print*`,
   pied de page, `<noscript>`, README §5. Sitemap inchangé (les complets
   restent la version de référence pour la recherche sur le nom ; question
   ouverte : faut-il y mettre le court à la place ?).
2. **Orsys** : les deux entrées de `TRAININGS` retirées ; si la liste est
   vide, le sous-titre « Formations continues » n'est pas rendu ; la section
   Formation du PDF complet tient sur une rangée. Certification AB Tasty
   conservée.

---

## Lot 6 — Contenu

### Réponse à la question 8 (structure des études de cas)

La structure en dix sections de l'auditeur (Contexte, Signal, Hypothèses,
Discovery, Options, Arbitrages, Delivery, Expérimentation, Résultat,
Learnings) demande ce qui manque vraiment aujourd'hui, le raisonnement :
comment le problème a été repéré, quelle hypothèse, quelles options
écartées. Mais cinq de ses dix rubriques décrivent l'action sous des noms
différents, et une étude passerait de 300 à 800 mots ; trois ou quatre
études feraient 3 000 mots de lecture. L'auditeur dit lui-même que le
recruteur doit être convaincu en 30 secondes.

Proposition : le fond en six blocs, le format STAR actuel plus deux champs.

1. **En bref** : problème, ce que j'ai fait, résultat, en trois lignes (le
   texte de la carte du lot 4, répété en tête de l'étude).
2. **Contexte et signal** : le contexte actuel, complété par la façon dont le
   problème a été repéré (benchmark, tweets, entretiens).
3. **Hypothèse** (nouveau) : ce que je pensais devoir changer, en deux
   lignes.
4. **Ce que j'ai écarté** (nouveau) : les options non retenues et pourquoi.
5. **Ce que j'ai fait** : l'action actuelle.
6. **Résultat** : inchangé (seulement quand un chiffre existe).
7. **Ce que j'ai appris** : la leçon actuelle.

Budget : 450 mots par étude au plus. Les trois cartes de l'accueil donnent la
lecture en 30 secondes, `results.html` la lecture en trois minutes.

### Quatrième étude : Sales-Led → hybride chez AB Tasty

Sans chiffre d'impact (lancement suspendu), et c'est l'histoire la plus
senior du site : business case, arbitrages de périmètre entre trois PM,
tunnel livré derrière un feature flag, décision de la direction après la
fusion avec VWO. Reliée à la carte Leadership plutôt qu'à un chiffre du hero.
Méthode : brouillon préparé à partir des puces du rôle, puis une question à
la fois à Antoine (hypothèse, options écartées, ce qu'il en retient).

### Scope Everysens et SNCF

Une question par entreprise, dans cet ordre : Everysens (nombre de clients
ou d'opérateurs, volume de wagons ou de trains suivis), puis SNCF boutiques
(nombre de boutiques générées, commandes). Sans chiffre, pas de ligne.

---

## Après les six lots

- Retirer ce fichier et le pointeur dans CLAUDE.md ; consigner les décisions
  dans « Décisions déjà prises ».
- Mesure finale des parts et du nombre d'écrans à 375 px, dans la dernière PR.
- Demander une nouvelle indexation de l'accueil dans la Search Console.
