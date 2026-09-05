/**
 * ============================================================================
 *  DONNÉES DU CV — c'est ce fichier que tu dois éditer, rien d'autre.
 *
 *  BILINGUE : un champ traduisible s'écrit { fr: "...", en: "..." }.
 *  Un champ laissé en texte simple (ex: "AB Tasty") s'affiche à l'identique
 *  dans les deux langues (pratique pour les noms propres, dates, etc.).
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 0. RÉGLAGES GÉNÉRAUX
// ---------------------------------------------------------------------------
const CONFIG = {
  // Passe à false pour masquer complètement la section "Side Projects"
  // (et son lien dans le menu) sans avoir à supprimer le contenu.
  showSideProjects: true,

  // URL de ta fonction Supabase Edge Function (voir README.md, partie Gemini).
  supabaseFunctionUrl: "https://tpreesulucfsyalaipcj.supabase.co/functions/v1/gemini-fit",

  // Clé "anon public" de ton projet Supabase (PAS ta clé Gemini, jamais ici !)
  // C'est une clé conçue pour être publique/côté client par Supabase (protégée
  // par tes policies RLS côté serveur) — pas un secret à cacher.
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcmVlc3VsdWNmc3lhbGFpcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg4MDgsImV4cCI6MjEwMjczNDgwOH0.Fl3dn5f8ef43IjkHwM2GKrE1qK1PIyO6REh4kk28M7g",
};

// ---------------------------------------------------------------------------
// 1. PROFIL / HERO
// ---------------------------------------------------------------------------
const PROFILE = {
  firstName: "Antoine",
  lastName: "Berthaud",
  role: {
    fr: "Senior Growth Product Manager — AB Tasty",
    en: "Senior Growth Product Manager at AB Tasty",
  },
  location: "Nantes, France",
  yearsExperience: "10+", // repris de ton résumé LinkedIn ("plus de 10 ans d'expérience")
  photo: "assets/photo/antoine.jpg", // recadrée en carré, légers ajustements de contraste/netteté
  // ⚠️ Le pitch FR est aussi recopié en dur dans index.html (#heroPitch) pour
  // les robots qui n'exécutent pas JavaScript (moteurs IA, aperçus...). Si tu
  // le modifies ici, reporte la modification là-bas : app.js signale l'écart
  // dans la console du navigateur, mais ne le corrige pas tout seul.
  pitch: {
    fr: "Product Manager avec plus de **10 ans d'expérience** en environnements SaaS et grands comptes (AB Tasty, Everysens, SNCF Connect & Tech). Je pilote la découverte, la priorisation et la livraison de fonctionnalités à impact mesurable, en m'appuyant autant sur les entretiens utilisateurs que sur la donnée — **SQL, Metabase, Mixpanel** — pour transformer des intuitions en décisions validées et scalables. Dans plusieurs équipes, j'ai aussi tenu le rôle de **Product Owner** au quotidien : backlog, user stories, sprints.",
    en: "Product Manager with **10+ years of experience** across SaaS and enterprise environments (AB Tasty, Everysens, SNCF Connect & Tech). I drive discovery, prioritization, and delivery of features with measurable impact, relying as much on user interviews as on data — **SQL, Metabase, Mixpanel** — to turn intuitions into validated, scalable decisions. In several teams I've also held the day-to-day **Product Owner** role: backlog, user stories, sprints.",
  },
  // Balises <title> et <meta name="description"> de la page d'accueil, par
  // langue. C'est ce que Google affiche dans ses résultats : le lieu (Nantes)
  // et le métier y figurent explicitement pour les requêtes du type
  // "product manager Nantes". La version FR est aussi recopiée en dur dans
  // le <head> de index.html (pour les robots sans JavaScript) : garder les
  // deux synchronisées.
  seo: {
    title: {
      fr: "Antoine Berthaud — Senior Product Manager à Nantes · Growth & SaaS",
      en: "Antoine Berthaud — Senior Growth Product Manager · Nantes, France",
    },
    description: {
      fr: "CV d'Antoine Berthaud, Senior Product Manager à Nantes : 10 ans de produit en SaaS B2B (AB Tasty, Everysens, SNCF Connect). Growth, PLG, discovery, data.",
      en: "Antoine Berthaud's CV, Senior Product Manager in Nantes, France: 10+ years in B2B SaaS product (AB Tasty, Everysens, SNCF Connect). Growth, PLG, discovery, data.",
    },
  },
  contact: {
    email: "antoine.berthaud@gmail.com",
    linkedin: "https://www.linkedin.com/in/antoine-berthaud-pm/",
    location: "Nantes, France",
  },
};

// Petit "scorecard" chiffré affiché sous le pitch, dans le Hero — donne un
// aperçu de l'impact avant même de lire les expériences. Laisse le tableau
// vide ([]) pour le masquer entièrement. 3-4 chiffres maximum recommandés,
// au-delà ça devient indigeste et perd son effet "scan rapide".
// `resultId` (optionnel) relie un chiffre à son étude de cas détaillée dans
// RESULT_DETAILS ci-dessous (page results.html) — le chiffre devient alors
// cliquable. Un chiffre sans `resultId` reste un simple texte, non cliquable.
const HERO_STATS = [
  { value: "+15%", label: { fr: "Taux d'activation (AB Tasty)", en: "Activation rate (AB Tasty)" }, resultId: "ab-tasty-activation" },
  { value: "-50%", label: { fr: "Temps de saisie (Everysens)", en: "Entry time (Everysens)" }, resultId: "everysens-entry-time" },
  { value: "+100%", label: { fr: "Récupération billet, plateforme santé Covid (SNCF Connect)", en: "Ticket retrieval, Covid health-check platform (SNCF Connect)" }, resultId: "sncf-ticket-retrieval" },
];

// ---------------------------------------------------------------------------
// 1bis. RESULT_DETAILS — le détail (format STAR) derrière chaque chiffre du
//    hero, affiché sur results.html. Un chiffre du hero devient cliquable dès
//    qu'il porte un `resultId` correspondant à une clé ci-dessous.
//
//    `result` (optionnel) : un chiffre d'impact SUPPLÉMENTAIRE à celui déjà
//    affiché dans le hero — à ne renseigner que s'il y en a vraiment un
//    (sinon laisser le champ absent, la section ne s'affiche simplement pas).
// ---------------------------------------------------------------------------
// Champs `*Points` (optionnels) : liste à puces rendue après les paragraphes
// du champ correspondant (ex: `actionPoints` après `action`) — à ne
// renseigner que quand le contenu s'y prête vraiment (points parallèles),
// jamais pour forcer un découpage artificiel.
const RESULT_DETAILS = {
  "ab-tasty-activation": {
    company: "AB Tasty",
    companyLogo: "assets/logos/ab-tasty.png",
    role: "Product Manager",
    period: "2023 – 2025",
    value: "+15%",
    label: { fr: "Taux d'activation", en: "Activation rate" },
    context: {
      fr: "AB Tasty, plateforme SaaS d'**Experience Optimization** (A/B Testing, Personnalisation). PM responsable de la « Product eXperience », au sein d'une équipe de 3 développeurs, 1 tech lead, 1 QA et 1 Product Designer.",
      en: "AB Tasty, an **Experience Optimization** SaaS platform (A/B Testing, Personalization). PM in charge of \"Product eXperience\", within a team of 3 developers, 1 tech lead, 1 QA and 1 Product Designer.",
    },
    challenge: {
      fr: "Un churn à **15%** et une sur-sollicitation du support CSM, alors que le produit n'offrait aucun accompagnement à l'onboarding. Mon hypothèse : un problème d'activation plutôt que de fit produit — confirmée en comparant nos chiffres au benchmark **Userpilot**, nettement en dessous.\n\nPlutôt que d'attaquer tout le sujet du churn (ICP à revoir, accessibilité des outils...), j'ai choisi de me concentrer sur ce trou en tout début de funnel, là où le gain potentiel était le plus important.",
      en: "A **15%** churn rate and CSM support overloaded with requests, while the product offered no in-app onboarding help. My hypothesis: an activation problem rather than a product-fit one — confirmed by comparing our numbers to the **Userpilot** benchmark, where we were clearly below par.\n\nRather than tackling churn as a whole (ICP to revisit, tool accessibility...), I chose to focus on this gap right at the start of the funnel, where the potential gain was highest.",
    },
    action: {
      fr: "J'ai mené des entretiens avec des utilisateurs fraîchement arrivés : la peur de se lancer malgré l'accompagnement CSM, et une installation trop longue, revenaient systématiquement. En creusant, j'ai remarqué que nos utilisateurs recouvraient des profils très différents (développeurs, marketing, analystes, product), avec des compétences et des attentes différentes.\n\nPlutôt qu'un simple correctif, j'ai conçu un **moteur de qualification à l'inscription** (rôle, niveau en A/B testing, compétences techniques, objectif principal), présenté comme un service rendu à l'utilisateur plutôt qu'un simple formulaire pour maximiser les réponses — avec un double usage :",
      en: "I ran interviews with freshly onboarded users: fear of getting started despite CSM support, and a setup that took too long, came up again and again. Digging further, I noticed our users covered very different profiles (developers, marketers, analysts, product people), with different skills and expectations.\n\nRather than a quick fix, I designed a **qualification engine at sign-up** (role, A/B testing level, technical skills, main goal), framed as a service to the user rather than a plain form to maximize response rates — serving a double purpose:",
    },
    actionPoints: [
      { fr: "Adapter l'onboarding à chaque profil utilisateur.", en: "Tailor onboarding to each user profile." },
      { fr: "Alimenter la segmentation utilisateur pour d'autres besoins produit.", en: "Feed user segmentation for other product needs." },
    ],
    result: {
      fr: "En plus des +15% d'activation déjà affichés : **-20% de Time-to-Value** (délai avant qu'un utilisateur tire une première valeur concrète du produit).",
      en: "On top of the +15% activation already shown above: **-20% Time-to-Value** (the delay before a user gets first real value from the product).",
    },
    lesson: {
      fr: "Le moteur de qualification était une évidence a posteriori. Ce que je ferais plus tôt la prochaine fois : **cartographier dès le départ les cohortes/segmentations disponibles** (et celles qui manquent) — plus ce découpage arrive tôt, plus l'amélioration continue du produit devient facile ensuite.",
      en: "The qualification engine was an obvious move in hindsight. What I'd do earlier next time: **map out available cohorts/segmentations from day one** (and spot the gaps) — the sooner that breakdown exists, the easier continuous product improvement becomes afterward.",
    },
  },

  "everysens-entry-time": {
    company: "Everysens",
    companyLogo: "assets/logos/everysens.png",
    role: "Product Manager",
    period: "2022 – 2023",
    value: "-50%",
    label: { fr: "Temps de saisie", en: "Entry time" },
    context: {
      fr: "Everysens, SaaS de gestion et suivi du transport de fret ferroviaire, avec pour objectif de favoriser le report modal des camions vers le rail. PM responsable de la **factory « Exécution »** (saisie des transports, validation des lettres de voiture, suivi temps réel), au sein d'une équipe de 4 développeurs et 1 QA, rejointe plus tard par 1 Product Designer.",
      en: "Everysens, a SaaS platform for managing and tracking rail freight transport, aimed at shifting freight from road to rail. PM in charge of the **\"Execution\" factory** (transport entry, waybill validation, real-time tracking), within a team of 4 developers and 1 QA, later joined by 1 Product Designer.",
    },
    challenge: {
      fr: "Le module « Exécution », historique et vieillissant, ne dialoguait pas avec le nouveau module « Planification », qui contenait pourtant déjà une partie des informations nécessaires (trajet, wagons, marchandises).\n\nCôté saisie, il fallait renseigner le détail complet d'un train (numéro, marchandise, poids, scellés de chaque wagon) pour établir les lettres de voiture et assurer le suivi — un calvaire dès **30 wagons**, sur une UI clairement pas à la hauteur :",
      en: "The legacy, aging \"Execution\" module didn't talk to the newer \"Planning\" module either, even though it already held part of the information needed (route, wagons, goods).\n\nOn the entry side, filling in the full detail of a train (number, goods, weight, seals for every wagon) to produce waybills and enable tracking was a nightmare from **30 wagons** up, on a UI clearly not up to the task:",
    },
    challengePoints: [
      { fr: "Seulement 6 wagons affichés à la fois.", en: "Only 6 wagons shown at a time." },
      { fr: "Aucune navigation rapide entre les champs.", en: "No quick navigation between fields." },
      { fr: "Pas d'import de tableur.", en: "No spreadsheet import." },
    ],
    action: {
      fr: "J'ai construit et porté auprès de la direction un **plan de migration** du module Exécution vers une nouvelle architecture, livré en approche incrémentale avec un premier MVP en moins de 2 mois. Cette nouvelle architecture m'a permis de faire dialoguer le module avec « Planification » pour **pré-remplir automatiquement le formulaire** à partir d'informations déjà saisies ailleurs (trajet, nombre de wagons, marchandises).\n\nEn parallèle, j'ai mené moi-même la recherche utilisateur et le maquettage UI/UX (Hotjar, Heap) — avant l'arrivée d'une Product Designer — pour repenser un formulaire cette fois pensé pour des trains de 30 wagons et plus.",
      en: "I built and pitched a **migration plan** for the Execution module toward a new architecture to leadership, delivered incrementally with a first MVP shipped in under 2 months. This new architecture let the module talk to \"Planning\" to **auto-fill the form** from information already entered elsewhere (route, wagon count, goods).\n\nIn parallel, I personally led user research and UI/UX design (Hotjar, Heap) — before a Product Designer joined — to redesign a form this time built for trains of 30+ wagons.",
    },
    result: {
      fr: "En plus des -50% de temps de saisie déjà affichés : **+20% de satisfaction utilisateur** mesurée après la refonte.",
      en: "On top of the -50% entry time already shown above: **+20% user satisfaction** measured after the overhaul.",
    },
    lesson: {
      fr: "Un plan de migration bien ficelé rassure autant qu'il structure. L'approche incrémentale a permis de **migrer les clients fonction par fonction** selon ce qui était déjà prêt — un suivi à la volée aurait été bien plus difficile à tenir, et bien moins rassurant pour la direction.",
      en: "A well-structured migration plan reassures as much as it organizes. The incremental approach let us **migrate clients feature by feature**, based on what was already ready — tracking that on the fly would have been far harder to keep up with, and far less reassuring for leadership.",
    },
  },

  "sncf-ticket-retrieval": {
    company: "SNCF Connect & Tech",
    companyLogo: "assets/logos/sncf-connect-tech.png",
    role: "Product Manager",
    period: "2021 – 2022",
    value: "+100%",
    label: { fr: "Récupération billet", en: "Ticket retrieval" },
    context: {
      fr: "SNCF Connect & Tech, plateforme sanitaire Prêt à Voyager (pretavoyager.sncf.com, aujourd'hui décommissionnée) — jusqu'à **40 000 visiteurs par jour** en pleine crise Covid-19, pour s'auto-contrôler vis-à-vis de son pass sanitaire et de son billet. PM au sein d'une équipe de 4 développeurs et 1 Engineering Manager, méthode Kanban, sur une plateforme initialement développée en externe.",
      en: "SNCF Connect & Tech, the Prêt à Voyager health-pass platform (pretavoyager.sncf.com, now decommissioned) — up to **40,000 visitors a day** in the middle of the Covid-19 crisis, letting travelers self-check their health pass and ticket. PM within a team of 4 developers and 1 Engineering Manager, Kanban methodology, on a platform initially built externally.",
    },
    challenge: {
      fr: "Sur cette plateforme, je partais avec deux contraintes fortes :",
      en: "On this platform, I was working with two hard constraints:",
    },
    challengePoints: [
      {
        fr: "Aucune donnée produit disponible — la plateforme ayant été développée à l'extérieur, on n'avait que le nombre de visiteurs et le taux de validation du pass sanitaire.",
        en: "No product data available at all — the platform had been built externally, so all we had were visitor counts and the health-pass validation rate.",
      },
      {
        fr: "Les interviews utilisateurs classiques étaient à exclure : en gare, en pleine épidémie, elles auraient créé un risque d'attroupement évitable.",
        en: "Classic user interviews were off the table: in a station, in the middle of an epidemic, they'd have created an avoidable crowding risk.",
      },
    ],
    action: {
      fr: "J'ai mis en place une **extraction quotidienne automatique des tweets** mentionnant le projet, le Covid et la SNCF, pour obtenir un signal utilisateur sans contact physique.\n\nÇa a confirmé un point noir que je soupçonnais déjà : l'outil imposait de **scanner le QR code du billet**, alors qu'une grande partie des utilisateurs avaient leur billet uniquement sur mobile — donc rien à scanner. J'ai ajouté une **deuxième méthode de récupération**, par nom et numéro de dossier, en alternative au QR code.",
      en: "I set up a **daily automated extraction of tweets** mentioning the project, Covid, and SNCF, to get a user signal without physical contact.\n\nIt confirmed a pain point I already suspected: the tool required **scanning the ticket's QR code**, while a large share of users only had their ticket on mobile — nothing to scan. I added a **second retrieval method**, by name and booking reference, as an alternative to the QR code.",
    },
    lesson: {
      fr: "Regarder toute la chaîne, pas seulement son périmètre produit : seuls **10% des voyageurs** arrivaient jusqu'à l'outil, un frein bien plus grand que ce qu'on pouvait gagner côté produit. L'acquisition était ici hors de notre contrôle (contraintes légales entre transporteur et distributeur) — mais ça reste un rappel que ce sont les premières étapes d'un funnel qui pèsent le plus sur le résultat global.",
      en: "Look at the whole chain, not just your own product scope: only **10% of travelers** ever made it to the tool, a far bigger bottleneck than anything achievable on the product side. Acquisition was outside our control here (legal constraints between carrier and distributor) — but it's a reminder that the earliest steps of a funnel weigh the most on its overall outcome.",
    },
  },
};

// Les 3 piliers qui définissent ton approche produit.
// Les titres (User First / Data Informed / Iterative) restent en anglais
// dans les deux langues : ce sont des noms de principe, pas du contenu à traduire.
const PILLARS = [
  {
    id: "user-first",
    title: "User First",
    subtitle: {
      fr: "Pas de feature sans un problème utilisateur quantifié.",
      en: "No feature without a quantified user problem.",
    },
    points: [
      {
        fr: "Focus Discovery, Interviews & Tests Utilisateurs hebdomadaires.",
        en: "Weekly focus on discovery, interviews & user testing.",
      },
      {
        fr: "Chaque priorité adossée à une preuve terrain, pas une supposition.",
        en: "Every priority backed by field evidence, not assumption.",
      },
    ],
  },
  {
    id: "data-informed",
    title: "Data Informed",
    subtitle: {
      fr: "Les intuitions lancent les tests, les données valident.",
      en: "Intuition starts the test, data validates it.",
    },
    points: [
      {
        fr: "Maîtrise de SQL, Metabase et Mixpanel pour piloter la performance réelle.",
        en: "Fluent in SQL, Metabase and Mixpanel to track real performance.",
      },
      {
        fr: "Décisions arbitrées par la mesure, pas par la conviction seule.",
        en: "Decisions settled by measurement, not conviction alone.",
      },
    ],
  },
  {
    id: "iterative",
    title: "Iterative",
    subtitle: {
      fr: "L'apprentissage continu vers le Product-Market Fit.",
      en: "Continuous learning on the way to Product-Market Fit.",
    },
    points: [
      {
        fr: "Culture du 'Fail Fast' et cycles de livraison courts (Agile).",
        en: "A 'Fail Fast' culture with short delivery cycles (Agile).",
      },
      {
        fr: "Chaque itération resserre l'écart entre hypothèse et réalité.",
        en: "Every iteration narrows the gap between hypothesis and reality.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. COMPÉTENCES & OUTILS — liste maîtresse utilisée pour les filtres.
//    Les labels (SQL, Metabase, Agile...) restent identiques en FR/EN — ce
//    sont déjà des termes anglais utilisés tels quels en français. Seule la
//    catégorie est traduite (via UI_STRINGS "skills.cat.*" dans i18n.js) :
//    garde les valeurs de `category` exactement comme ci-dessous (Produit,
//    Méthode, Data, Outils), elles servent de clé de traduction.
// ---------------------------------------------------------------------------
const SKILLS = [
  { id: "discovery", label: "Discovery", category: "Produit" },
  { id: "user-research", label: "User Research", category: "Produit" },
  { id: "roadmapping", label: "Roadmapping", category: "Produit" },
  { id: "user-stories", label: "User Stories & Backlog", category: "Produit" },
  { id: "product-ownership", label: "Product Ownership", category: "Produit" },
  { id: "plg", label: "Product-Led Growth", category: "Produit" },
  { id: "stakeholder", label: "Stakeholder Management", category: "Produit" },
  { id: "cross-functional-leadership", label: "Cross-functional Leadership", category: "Produit" },
  { id: "mentoring", label: "Mentoring & Coaching", category: "Produit" },
  { id: "project-management", label: { fr: "Gestion de projet", en: "Project Management" }, category: "Produit" },
  { id: "functional-analysis", label: { fr: "Analyse fonctionnelle", en: "Functional Analysis" }, category: "Produit" },
  { id: "agile", label: "Agile / Scrum", category: "Méthode" },
  { id: "okr", label: "OKR", category: "Méthode" },
  { id: "story-mapping", label: "Story Mapping", category: "Méthode" },
  { id: "bdd", label: "BDD", category: "Méthode" },
  { id: "feature-flagging", label: "Feature Flagging / Progressive Rollout", category: "Méthode" },
  { id: "sql", label: "SQL", category: "Data" },
  { id: "metabase", label: "Metabase", category: "Data" },
  { id: "mixpanel", label: "Mixpanel", category: "Data" },
  { id: "segment", label: "Segment", category: "Data" },
  { id: "looker-studio", label: "Looker Studio", category: "Data" },
  { id: "matomo", label: "Matomo", category: "Data" },
  { id: "hotjar", label: "Hotjar", category: "Data" },
  { id: "heap", label: "Heap", category: "Data" },
  { id: "zapier", label: "Zapier", category: "Outils" },
  { id: "jira", label: "Jira", category: "Outils" },
  { id: "chatgpt", label: "ChatGPT", category: "Outils" },
  { id: "flagship", label: "Flagship", category: "Outils" },
  { id: "productboard", label: "ProductBoard", category: "Outils" },
  { id: "figma", label: "Figma", category: "Outils" },
  { id: "miro", label: "Miro", category: "Outils" },
  { id: "akeneo", label: "Akeneo", category: "Outils" },
  { id: "postman", label: "Postman", category: "Outils" },
];

// ---------------------------------------------------------------------------
// 3. EXPÉRIENCES — groupées par entreprise. La durée totale par entreprise
//    et par rôle est calculée automatiquement (voir app.js).
//
//    Rôles triés du plus RÉCENT au plus ANCIEN (celui du haut = le poste
//    actuel ou le plus récent chez cette entreprise). Format de date :
//    "AAAA-MM". `end: null` = poste actuel. `company` et `location` sont des
//    noms propres : laisse-les en texte simple, pas besoin de les traduire.
//
//    Chaque rôle se décompose en 4 blocs pour rester lisible :
//      - context      : 1-2 phrases de mise en contexte (produit, marché, périmètre)
//      - achievements : liste à puces des réalisations concrètes (idéalement chiffrées)
//      - methodology  : méthodo utilisée (optionnel — omets le champ si tu ne veux rien afficher)
//      - team         : taille/composition de l'équipe (optionnel — idem)
// ---------------------------------------------------------------------------
const EXPERIENCES = [
  {
    company: "AB Tasty",
    location: "Nantes, France",
    logo: "assets/logos/ab-tasty.png",
    roles: [
      {
        title: "Senior Growth Product Manager",
        start: "2025-05",
        end: null,
        context: {
          fr: "Product Manager senior au sein du pilier Growth d'AB Tasty, plateforme SaaS d'Experience Optimization (A/B Testing, Personnalisation).",
          en: "Senior Product Manager within AB Tasty's Growth pillar, on the Experience Optimization SaaS platform (A/B Testing, Personalization).",
        },
        achievements: [
          {
            fr: "Pilotage de la transition stratégique du modèle Sales-Led vers un **modèle hybride** (Sales-Led pour les grands comptes, Product-Led pour le reste).",
            en: "Led the strategic shift from a Sales-Led model to a **hybrid model** (Sales-Led for large accounts, Product-Led for the rest).",
          },
          {
            fr: "Conception et lancement d'un **tunnel d'acquisition autonome** : inscription publique, offre freemium limitée, monétisation self-service avec paiement intégré.",
            en: "Designed and launched a **self-serve acquisition funnel**: public sign-up, limited freemium offer, self-service monetization with integrated payment.",
          },
          {
            fr: "Coordination de 2 autres Product Managers sur un périmètre, chacun pilotant une partie déléguée de la stratégie.",
            en: "Coordinated 2 other Product Managers across a scope, each steering a delegated part of the strategy.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "4 développeurs, 1 tech lead, 1 QA, 1 Product Designer",
          en: "4 developers, 1 tech lead, 1 QA, 1 Product Designer",
        },
        skills: ["plg", "discovery", "roadmapping", "stakeholder", "cross-functional-leadership", "user-stories", "mentoring", "jira", "metabase", "mixpanel", "segment", "chatgpt", "okr", "user-research"],
      },
      {
        title: "Product Manager",
        start: "2023-09",
        end: "2025-05",
        context: {
          fr: "PM responsable de la « Product eXperience » sur la plateforme SaaS d'Experience Optimization (A/B Testing, Personnalisation).",
          en: "PM responsible for \"Product eXperience\" on the Experience Optimization SaaS platform (A/B Testing, Personalization).",
        },
        achievements: [
          {
            fr: "Déploiement de l'authentification 2FA obligatoire sur **100% de la base utilisateur**, avec un impact support quasi nul et aucune perte d'activité.",
            en: "Rolled out mandatory 2FA authentication across **100% of the user base**, with near-zero support impact and no activity loss.",
          },
          {
            fr: "Redéfinition de la vision produit autour de la rétention et de l'engagement (« Make our users fall in love with our product, repeatedly »).",
            en: "Redefined the product vision around retention and engagement (\"Make our users fall in love with our product, repeatedly\").",
          },
          {
            fr: "Mise en place d'une infrastructure de données automatisant le suivi des **KPIs clés (churn, rétention, activation, TTV)**.",
            en: "Built a product data infrastructure automating tracking of **key KPIs (churn, retention, activation, TTV)**.",
          },
          {
            fr: "Refonte de l'onboarding via un moteur de qualification utilisateur et un nouveau parcours d'activation : **-20% de Time-to-Value, +15% de taux d'activation**.",
            en: "Reworked onboarding through a user qualification engine and a new activation journey: **-20% Time-to-Value, +15% activation rate**.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "3 développeurs, 1 tech lead, 1 QA, 1 Product Designer",
          en: "3 developers, 1 tech lead, 1 QA, 1 Product Designer",
        },
        skills: ["discovery", "roadmapping", "stakeholder", "user-stories", "sql", "metabase", "mixpanel", "jira", "zapier", "looker-studio", "segment", "chatgpt", "okr", "user-research", "flagship", "feature-flagging"],
      },
    ],
  },
  {
    company: "Everysens",
    location: "Nantes, France",
    logo: "assets/logos/everysens.png",
    roles: [
      {
        title: "Product Manager",
        start: "2022-04",
        end: "2023-09",
        context: {
          fr: "Responsable de la factory « Exécution » au sein d'un SaaS de gestion et suivi du transport de fret ferroviaire, avec pour objectif de favoriser le report modal des camions vers le rail.",
          en: "Owned the \"Execution\" factory within a SaaS platform for rail freight transport management and tracking, aimed at shifting freight from road to rail to decarbonize transport.",
        },
        achievements: [
          {
            fr: "Pilotage de la roadmap du module de saisie des transports, validation des lettres de voiture et suivi en temps réel, avec un focus sur l'adoption utilisateur et la fiabilité des données.",
            en: "Drove the roadmap for the transport entry module, waybill validation, and real-time tracking, with a strong focus on user adoption and transport data reliability.",
          },
          {
            fr: "Stakeholder management auprès de la direction pour lancer une refonte technique et fonctionnelle en approche incrémentale (**MVP livré en moins de 2 mois**).",
            en: "Stakeholder management work to bring leadership on board with a technical and functional overhaul, delivered incrementally (**MVP delivered in under 2 months**).",
          },
          {
            fr: "Résultat de la refonte : **-50% de temps de saisie, +20% de satisfaction utilisateur**.",
            en: "Result of the overhaul: **-50% entry time, +20% user satisfaction**.",
          },
          {
            fr: "Recherche utilisateur et maquettage UI/UX réalisés en autonomie (Hotjar, Heap) avant l'arrivée d'une Product Designer.",
            en: "Conducted user research and UI/UX design independently (Hotjar, Heap) before a Product Designer joined the team.",
          },
        ],
        methodology: "Scrum",
        team: { fr: "4 développeurs, 1 QA, puis 1 Product Designer", en: "4 developers, 1 QA, later 1 Product Designer" },
        skills: ["discovery", "user-research", "roadmapping", "hotjar", "heap", "stakeholder", "jira", "metabase", "productboard", "figma", "miro"],
      },
    ],
  },
  {
    company: "SNCF Connect & Tech",
    location: "Nantes, France",
    logo: "assets/logos/sncf-connect-tech.png",
    roles: [
      {
        title: "Product Manager",
        start: "2021-10",
        end: "2022-04",
        context: {
          fr: "PM sur la plateforme sanitaire Prêt à Voyager (pretavoyager.sncf.com, aujourd'hui décommissionnée), permettant aux voyageurs de s'auto-contrôler vis-à-vis de leur pass sanitaire et de leur billet dans le contexte Covid-19.",
          en: "PM on the Prêt à Voyager health-pass platform (pretavoyager.sncf.com, now decommissioned), letting travelers self-check their health pass and train ticket in the context of Covid-19.",
        },
        achievements: [
          {
            fr: "Redéveloppement d'une plateforme initialement développée en externe, avec un objectif business de fluidifier l'embarquement en gare.",
            en: "Redeveloped a platform initially built externally, with a business goal of smoothing station boarding.",
          },
          {
            fr: "Récupération d'insights utilisateurs (Twitter, Zapier) et amélioration du parcours utilisateur : **+100% sur le taux de conversion** de la première étape de récupération du billet.",
            en: "Gathered user insights (Twitter, Zapier) and improved the user journey: **+100% conversion rate** on the first step of ticket retrieval.",
          },
        ],
        methodology: "Kanban",
        team: {
          fr: "4 développeurs, 1 Engineering Manager",
          en: "4 developers, 1 Engineering Manager",
        },
        skills: ["user-research", "zapier", "discovery", "jira", "matomo"],
      },
      {
        title: "Product Manager",
        start: "2020-09",
        end: "2022-04",
        context: {
          fr: "PM sur l'outil de génération de boutique en ligne pour la vente de titres de transport, avec deux clients : Transilien (boutique.transilien.com) et TER (boutiques de commande de cartes billettique).",
          en: "PM on the online store generation tool for transport ticket sales, serving two clients: Transilien (boutique.transilien.com) and TER (smart-card ordering stores).",
        },
        achievements: [
          {
            fr: "Définition d'une mission et d'une vision produit communes aux stakeholders et au service marketing.",
            en: "Defined a shared product mission and vision for stakeholders and the marketing team.",
          },
          {
            fr: "Stratégie 2021 appuyée par des OKR, roadmap de delivery, priorisation du backlog et rédaction des User Stories.",
            en: "Set the 2021 strategy backed by OKRs, defined the delivery roadmap, prioritized the backlog and wrote User Stories.",
          },
          {
            fr: "Relance du discovery (sondages utilisateurs, exploitation de la data disponible) et lead de la veille agilité/product management au sein de la communauté de pratiques.",
            en: "Relaunched discovery (user surveys, mining available data) and led agility/product management watch within the community of practice.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "3 développeurs, 1 Scrum Master, 1 Delivery Manager",
          en: "3 developers, 1 Scrum Master, 1 Delivery Manager",
        },
        skills: ["okr", "roadmapping", "user-stories", "product-ownership", "agile", "discovery", "stakeholder", "jira", "miro", "akeneo"],
      },
      {
        title: { fr: "Responsable de cercle", en: "Community Lead (rotating role)" },
        start: "2019-04",
        end: "2020-02",
        context: {
          fr: "Rôle tournant d'animation de la communauté de pratiques dédiée à la gestion de produit agile chez Evoyageurs Technologies.",
          en: "Rotating role leading the agile product management community of practice at Evoyageurs Technologies.",
        },
        achievements: [
          { fr: "Partage de veille sur les pratiques Product Management au sein d'une communauté d'échange dédiée de **plus de 100 personnes**.", en: "Shared Product Management practice insights within a dedicated peer community of **100+ people**." },
          { fr: "Animation d'ateliers et d'exercices pour faire progresser la communauté.", en: "Ran workshops and exercises to help the community grow." },
          { fr: "Mentorat de 2 à 3 personnes tout au long du mandat.", en: "Mentored 2 to 3 people throughout the term." },
        ],
        skills: ["agile", "mentoring"],
      },
      {
        title: { fr: "Product Manager Junior", en: "Junior Product Manager" },
        start: "2017-11",
        end: "2020-09",
        context: {
          fr: "En charge de l'asset de web services de distribution pour la vente de titres TER et urbains.",
          en: "Owned the web services distribution asset for regional and urban ticket sales (TER).",
        },
        achievements: [
          {
            fr: "Ateliers d'étude et macro-chiffrage des problématiques portées par la MOA, tenue de roadmap et Story Mapping.",
            en: "Ran scoping workshops and rough estimation of issues raised by the business owner, maintained the roadmap and Story Mapping.",
          },
          {
            fr: "Rédaction des User Stories et scénarios BDD associés, animation des Sprint Planning.",
            en: "Wrote User Stories and associated BDD scenarios, ran Sprint Plannings.",
          },
          {
            fr: "Support fonctionnel à l'équipe de développement et validation des fonctionnalités livrées.",
            en: "Provided functional support to the development team and validated delivered features.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "15 développeurs, 2 Product Managers, 1 QA, 1 Scrum Master, 1 Delivery Manager",
          en: "15 developers, 2 Product Managers, 1 QA, 1 Scrum Master, 1 Delivery Manager",
        },
        skills: ["roadmapping", "story-mapping", "user-stories", "product-ownership", "agile", "bdd", "jira", "miro", "postman"],
      },
      {
        title: { fr: "Product Manager Junior", en: "Junior Product Manager" },
        start: "2016-08",
        end: "2017-11",
        context: {
          fr: "PM Junior sur le lot 2 du projet de digitalisation de la vente de billets groupes (MBG) à destination des vendeurs SNCF et des agences de voyage (B2B).",
          en: "Junior PM on lot 2 of the group-ticket sales digitalization project (MBG) for SNCF sales staff and travel agencies (B2B).",
        },
        achievements: [
          {
            fr: "Ateliers d'étude du besoin avec le client, définition de la solution en synchronisation avec les projets partenaires (WDI, FERIA, Viva Groupes).",
            en: "Ran needs-gathering workshops with the client, defined the solution in sync with partner projects (WDI, FERIA, Viva Groupes).",
          },
          {
            fr: "Rédaction des User Stories et présentation de la solution à l'équipe de développement, suivi et support fonctionnel jusqu'à la réalisation.",
            en: "Wrote User Stories and presented the solution to the development team, then provided follow-up and functional support through delivery.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "5 développeurs, 1 Scrum Master",
          en: "5 developers, 1 Scrum Master",
        },
        skills: ["user-stories", "product-ownership", "stakeholder", "jira", "miro"],
      },
      {
        title: "QA",
        start: "2015-01",
        end: "2016-08",
        context: {
          fr: "Exécution et rédaction de campagnes de tests sur les applications web et mobiles de réservation de billets Thalys et sur un portail entreprises B2B.",
          en: "Ran and wrote test campaigns for Thalys web and mobile ticket-booking applications and a B2B enterprise portal.",
        },
        achievements: [
          {
            fr: "Lead test sur le lot 1 du projet de digitalisation de la vente de billets groupes (MBG) côté grand public (B2C).",
            en: "Led testing on lot 1 of the group-ticket sales digitalization project (MBG) for consumers (B2C).",
          },
          {
            fr: "Participation aux cérémonies agiles et appui fonctionnel sur certaines User Stories.",
            en: "Took part in agile ceremonies and provided functional support on select User Stories.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "4 développeurs, 1 Product Manager",
          en: "4 developers, 1 Product Manager",
        },
        skills: ["agile", "user-stories"],
      },
    ],
  },

  // Condensé volontairement : ton export liste plusieurs missions distinctes
  // (SSII) entre 2011 et 2015, avant ta bascule vers le Product Management.
  // Regroupées en un seul bloc pour rester lisible sur un CV senior PM.
  {
    company: "Parcours technique avant le Product (SSII)",
    location: "Nantes, France",
    logo: "",
    roles: [
      {
        title: {
          fr: "Développeur & Analyste fonctionnel — missions SSII (Eurogiciel, Sigma Informatique, Virage Group)",
          en: "Developer & Functional Analyst — IT consulting engagements (Eurogiciel, Sigma Informatique, Virage Group)",
        },
        start: "2011-02",
        end: "2015-01",
        context: {
          fr: "Avant de rejoindre le Product Management : missions en SSII pour Eurogiciel, Sigma Informatique et Virage Group.",
          en: "Before moving into Product Management: IT consulting engagements for Eurogiciel, Sigma Informatique and Virage Group.",
        },
        achievements: [
          {
            fr: "Développement (Java), analyse fonctionnelle et rédaction de spécifications pour des clients comme Thales Alenia Space et plusieurs enseignes de la grande distribution (groupement Gileco / E.Leclerc).",
            en: "Development (Java), functional analysis and specification writing for clients such as Thales Alenia Space and several major retail chains (Gileco / E.Leclerc group).",
          },
          {
            fr: "Gestion de projet (planning, tableaux de bord) et tests/QA.",
            en: "Project management (planning, dashboards) and QA/testing.",
          },
        ],
        team: { fr: "Jusqu'à 5 personnes selon les missions", en: "Up to 5 people depending on the engagement" },
        methodology: { fr: "Cycle en V, Scrum", en: "V-Model, Scrum" },
        skills: ["project-management", "functional-analysis"],
      },
    ],
  },
  // [À COMPLÉTER] ajoute d'autres entreprises ici si besoin, même format.
];

// ---------------------------------------------------------------------------
// 4bis. RECOMMANDATION — citation mise en avant. Laisse le tableau vide ([])
//    pour masquer entièrement la section. Le texte original complet de la
//    recommandation d'Alix est gardé en commentaire ci-dessous si tu préfères
//    revenir dessus ou en changer.
// ---------------------------------------------------------------------------
// Texte original complet (LinkedIn) :
// "J'ai collaboré dans le même scope qu'Antoine, en particulier sur l'évolution
// de la plateforme AB Tasty vers une approche PLG (Product-Led Growth). Antoine
// est un product manager humain, impliqué et exigeant, le tout porté par
// beaucoup d'enthousiasme et une bonne dose d'humour. Il sait structurer
// intelligemment les temps de partage de son équipe, notamment à travers des
// sprints bien organisés. Il aime impliquer chaque membre dans ses réflexions
// et valoriser les talents de chacun. Antoine a travaillé sur l'expérience
// globale du SaaS AB Tasty, en étroite collaboration avec les autres scopes,
// au service d'une vision produit unifiée et de l'engagement des utilisateurs.
// Je ne peux que recommander Antoine pour renforcer une équipe ambitieuse et
// collaborative."
const TESTIMONIALS = [
  {
    quote: {
      fr: "Antoine est un product manager humain, impliqué et exigeant, porté par beaucoup d'enthousiasme. Il sait structurer intelligemment les temps de partage de son équipe et aime valoriser les talents de chacun. Je ne peux que le recommander pour renforcer une équipe ambitieuse et collaborative.",
      en: "Antoine is a human, engaged and demanding product manager, driven by real enthusiasm. He knows how to structure his team's collaboration time intelligently and loves bringing out the best in each person. I can only recommend him to strengthen an ambitious, collaborative team.",
    },
    name: "Alix Paoli",
    role: { fr: "CX Designer chez Decathlon", en: "CX Designer at Decathlon" },
    context: { fr: "Ancienne collègue chez AB Tasty", en: "Former colleague at AB Tasty" },
    // [À COMPLÉTER] si tu obtiens son accord explicite pour utiliser sa photo,
    // dépose-la dans assets/photo/ et renseigne le chemin ici. Vide = avatar
    // à initiales généré automatiquement (recommandé par défaut).
    photo: "",
  },
];

// ---------------------------------------------------------------------------
// 5. FORMATION, LANGUES & CERTIFICATIONS
// ---------------------------------------------------------------------------
const EDUCATION = [
  {
    title: {
      fr: "Ingénieur Systèmes Informatiques, Logiciels et Réseaux",
      en: "Engineering Degree, Computer Systems, Software & Networks",
    },
    institution: "Polytech'Nantes",
    period: "2006 – 2011",
  },
];

const TRAININGS = [
  {
    title: {
      fr: "Réussir la conduite du changement, donner du sens à vos équipes",
      en: "Leading change management, giving meaning to your teams",
    },
    institution: "Orsys",
    period: { fr: "Sept. 2020 · 2 jours", en: "Sept. 2020 · 2 days" },
  },
  {
    title: {
      fr: "Big Data et stratégie marketing, usages et mise en œuvre",
      en: "Big Data and marketing strategy: uses and implementation",
    },
    institution: "Orsys",
    period: { fr: "Sept. 2021 · 2 jours", en: "Sept. 2021 · 2 days" },
  },
];

const LANGUAGES = [
  { label: { fr: "Français", en: "French" }, level: { fr: "Langue maternelle", en: "Native" } },
  { label: { fr: "Anglais", en: "English" }, level: { fr: "Professionnel complet (TOEIC 925/990)", en: "Full professional (TOEIC 925/990)" } },
];

const CERTIFICATIONS = [
  {
    title: "AB Tasty — Fundamentals Certificate",
    note: {
      fr: "Certification interne sur la maîtrise de la plateforme AB Tasty (Experience Optimization : A/B Testing, Personnalisation).",
      en: "Internal certification on mastering the AB Tasty platform (Experience Optimization: A/B Testing, Personalization).",
    },
  },
];

// ---------------------------------------------------------------------------
// 5. SIDE PROJECTS — masquable via CONFIG.showSideProjects ci-dessus.
//    Chaque entrée peut pointer vers un lien externe (`link`) et/ou une
//    page de détail interne (`detailSlug`, à renseigner dans
//    PROJECT_DETAILS ci-dessous). Les deux sont optionnels indépendamment.
// ---------------------------------------------------------------------------
const SIDE_PROJECTS = [
  {
    title: "Tour de Growth",
    description: {
      fr: "Un outil public de growth check-up (framework AARRR), conçu et lancé pour servir de miroir rapide. En mots clairs plutôt qu'en jargon, on voit où une stratégie growth tient déjà la route et où elle ne tient pas encore.",
      en: "A free growth check-up tool (AARRR framework), designed and launched to provide a quick assessment. In plain language rather than jargon, it shows where a growth strategy is already on the right track and where it isn’t yet.",
    },
    link: "https://tourdegrowth.com",
    detailSlug: "tour-de-growth",
    skills: ["plg", "user-research"],
  },
];

// ---------------------------------------------------------------------------
// 5bis. PROJECT_DETAILS — contenu des pages de détail ("étude de cas") des
//    side projects, affichées via project-detail.html?slug=<clé>. Structure
//    pensée pour être dupliquée telle quelle à chaque nouveau projet :
//    ajoute une nouvelle clé ici, référence-la via `detailSlug` ci-dessus,
//    c'est tout — aucune autre modification de code nécessaire.
//
//    `metrics`: laisse le tableau vide ([]) tant qu'il n'y a pas assez de
//    recul pour des chiffres significatifs — `metricsFallback` s'affiche
//    automatiquement à la place. Remplis `metrics` dès que tu as de vrais
//    chiffres à montrer (visites, taux de partage, coefficient viral...).
// ---------------------------------------------------------------------------
const PROJECT_DETAILS = {
  "tour-de-growth": {
    title: "Tour de Growth",
    tagline: {
      fr: "Un miroir rapide pour situer sa stratégie growth — expliqué avec des mots simples, pas du jargon.",
      en: "A quick mirror to see where your growth strategy really stands — explained in plain words, not jargon.",
    },
    liveUrl: "https://tourdegrowth.com",

    problem: {
      fr: "Beaucoup de gens qui pilotent un produit savent qu'ils devraient \"faire de la croissance\", sans trop savoir dire où ils en sont vraiment. Le vrai trou, c'est l'acquisition ou plutôt la rétention ? Ce qu'on appelle \"growth\" chez nous ressemble à ce que font les autres, ou est-ce qu'on a inventé sa propre définition au fur et à mesure ?\n\nTour de Growth part de cette question toute simple : un **miroir rapide**, en mots clairs plutôt qu'en jargon, pour voir où une stratégie growth tient déjà la route et où elle ne tient pas encore.",
      en: "A lot of people running a product know they're supposed to \"do growth\", without quite being able to say where they actually stand. Is the real gap acquisition, or is it retention? Does what we call \"growth\" here look anything like what other companies do, or have we just been making up our own definition as we go?\n\nTour de Growth starts from that simple question: a **quick mirror**, in plain words instead of jargon, to see where a growth strategy already holds up and where it doesn't yet.",
    },

    whatItIs: {
      fr: "**Quinze questions**, réparties sur cinq zones classiques de la croissance :",
      en: "**Fifteen questions**, spread across five classic areas of growth:",
    },
    whatItIsPoints: [
      { fr: "Comment les gens vous trouvent.", en: "How people find you." },
      { fr: "Comment ils comprennent ce que vous apportez.", en: "How they get what you actually offer." },
      { fr: "S'ils reviennent.", en: "Whether they come back." },
      { fr: "S'ils vous recommandent.", en: "Whether they recommend you." },
      { fr: "Comment vous gagnez de l'argent.", en: "How you make money." },
    ],
    whatItIsClosing: {
      fr: "Trois minutes, un score par zone, et surtout une explication de ce que ça veut dire concrètement — pas juste un chiffre jeté là. Un mode plus poussé permet ensuite de préciser son contexte et d'obtenir des pistes plus concrètes à explorer.",
      en: "Three minutes, a score per area, and above all an explanation of what it actually means — not just a number thrown at you. A deeper mode then lets you add context and get more concrete directions to explore.",
    },

    teachingMoment: {
      title: { fr: "Un exemple qu'on préfère montrer qu'expliquer : la boucle de croissance", en: "An example better shown than explained: the growth loop" },
      body: {
        fr: "La plupart des produits pensent leur croissance comme un entonnoir : on fait de la pub, des gens arrivent, certains restent, fin de l'histoire. Une **boucle de croissance** (growth loop) fonctionne autrement — l'usage du produit crée lui-même de nouveaux utilisateurs, sans qu'il faille remettre de l'argent ou de l'énergie à chaque tour.\n\nUn exemple concret vaut mieux qu'une définition : sur Tour de Growth, chaque personne qui partage son score amène potentiellement de nouvelles personnes, qui font le test à leur tour, qui repartagent. Si ce mécanisme fonctionne vraiment, ça se mesure — c'est ce qu'on appelle le **coefficient viral**, le nombre moyen de nouvelles visites qu'apporte chaque partage. En dessous de 1, la boucle s'essouffle toute seule ; au-dessus, elle s'auto-alimente. C'est exactement le genre de chose que Tour de Growth essaie de vous aider à repérer sur votre propre produit.",
        en: "Most products think about growth as a funnel: run some ads, people show up, some of them stick around, end of story. A **growth loop** works differently — using the product itself creates new users, without needing fresh money or effort every round.\n\nA concrete example beats a definition: on Tour de Growth, everyone who shares their score potentially brings in new people, who take the test themselves, who share it again. If that mechanism actually works, it's measurable — that's what a **viral coefficient** is: the average number of new visits each share brings in. Below 1, the loop runs out of steam on its own; above 1, it feeds itself. That's exactly the kind of thing Tour de Growth is trying to help you spot in your own product too.",
      },
    },

    process: {
      fr: "Construit en grande partie avec l'aide de **Claude Code et Claude Design** — pour cadrer le produit, pour les maquettes, pour la partie technique. Ça m'a semblé la façon la plus honnête de vérifier, en pratique et pas seulement sur un CV, si je sais vraiment structurer un problème growth de bout en bout : poser la bonne question, choisir ce qui compte, et rester honnête sur ce qu'un score rapide peut dire et ce qu'il ne peut pas dire.",
      en: "Most of it has been built with **Claude Code and Claude Design's** help — for the product framing, the mockups, and the engineering. It felt like the most honest way to test, in practice and not just on a CV, whether I can actually structure a growth problem end to end: ask the right question, decide what matters, and stay honest about what a quick score can and can't tell you.",
    },

    metrics: [], // [À COMPLÉTER] ajoute { label: {fr,en}, value: "..." } dès qu'il y a des chiffres significatifs
    metricsFallback: {
      fr: "Encore tôt après le lancement — les premiers chiffres d'usage (visites, taux de partage, coefficient viral) seront ajoutés ici dès qu'il y aura assez de recul pour les rendre significatifs.",
      en: "Still early days since launch — the first usage numbers (visits, share rate, viral coefficient) will be added here once there's enough data for them to be meaningful.",
    },

    techStack: {
      frontend: ["Next.js 16", "TypeScript", "React 19", "Vercel", "CSS Modules", { fr: "i18n maison", en: "Custom i18n" }],
      backend: ["Firebase", "Firestore", "Gemini API", { fr: "Route Handlers Next.js", en: "Next.js Route Handlers" }],
      analytics: ["GoatCounter", { fr: "Dashboard interne", en: "Internal dashboard" }],
      testing: ["Vitest", "Playwright"],
      seo: [{ fr: "SEO natif Next.js", en: "Native Next.js SEO" }, "JSON-LD", "next/og"],
      ops: ["GitHub", { fr: "Déploiement continu Vercel", en: "Vercel CI/CD" }, "Google Search Console"],
    },
  },
};
