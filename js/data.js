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
  showSideProjects: false,

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
  age: "37",
  location: "Nantes, France",
  yearsExperience: "10+", // repris de ton résumé LinkedIn ("plus de 10 ans d'expérience")
  photo: "assets/photo/antoine.jpg", // recadrée en carré, légers ajustements de contraste/netteté
  pitch: {
    fr: "Product Manager avec plus de **10 ans d'expérience** en environnements SaaS et grands comptes (AB Tasty, Everysens, SNCF Connect & Tech). Je pilote la découverte, la priorisation et la livraison de fonctionnalités à impact mesurable, en m'appuyant autant sur les entretiens utilisateurs que sur la donnée — **SQL, Metabase, Mixpanel** — pour transformer des intuitions en décisions validées et scalables.",
    en: "Product Manager with **10+ years of experience** across SaaS and enterprise environments (AB Tasty, Everysens, SNCF Connect & Tech). I drive discovery, prioritization, and delivery of features with measurable impact, relying as much on user interviews as on data — **SQL, Metabase, Mixpanel** — to turn intuitions into validated, scalable decisions.",
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
const HERO_STATS = [
  { value: "+15%", label: { fr: "Taux d'activation (AB Tasty)", en: "Activation rate (AB Tasty)" } },
  { value: "-50%", label: { fr: "Temps de saisie (Everysens)", en: "Entry time (Everysens)" } },
  { value: "+100%", label: { fr: "Récupération billet, plateforme santé Covid (SNCF Connect)", en: "Ticket retrieval, Covid health-check platform (SNCF Connect)" } },
];

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
        skills: ["plg", "discovery", "roadmapping", "stakeholder", "cross-functional-leadership", "user-stories", "jira", "metabase", "mixpanel", "segment", "chatgpt", "okr", "user-research"],
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
        skills: ["roadmapping", "sql", "metabase", "mixpanel", "jira", "zapier", "looker-studio", "segment", "chatgpt", "okr", "user-research", "flagship", "feature-flagging"],
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
        skills: ["okr", "roadmapping", "user-stories", "agile", "discovery", "stakeholder", "jira", "miro", "akeneo"],
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
        skills: ["roadmapping", "story-mapping", "user-stories", "agile", "bdd", "jira", "miro", "postman"],
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
        skills: ["user-stories", "stakeholder", "jira", "miro"],
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
// ---------------------------------------------------------------------------
const SIDE_PROJECTS = [
  {
    title: { fr: "[À COMPLÉTER] Nom du projet", en: "[TO COMPLETE] Project name" },
    description: {
      fr: "[À COMPLÉTER] Ton export LinkedIn ne mentionne pas de side project — dis-moi ce que tu veux mettre ici, ou passe CONFIG.showSideProjects à false pour masquer la section.",
      en: "[TO COMPLETE] Your LinkedIn export doesn't mention any side project — tell me what to put here, or set CONFIG.showSideProjects to false to hide the section.",
    },
    link: "",
    skills: [],
  },
];
