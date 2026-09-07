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

  // Les rôles terminés à cette date ou avant (format "AAAA-MM") sont repliés
  // derrière un bouton « Voir mes débuts (2011 – 2016) » sur le site — le
  // PDF, lui, montre toujours tout. Un filtre de compétence les déplie
  // automatiquement. Mets null pour tout afficher.
  collapseRolesEndingBefore: "2016-08",

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
    fr: "Senior Product Manager · Growth, PLG & SaaS B2B",
    en: "Senior Product Manager · Growth, PLG & B2B SaaS",
  },
  location: "Nantes, France",
  // Deux compteurs, chacun défini une seule fois ici (7 sept. 2026, quatrième
  // revue) : `yearsExperience` (Product Management, depuis août 2016) est repris
  // mot pour mot dans le pitch et la meta description ; `yearsDigital` (depuis
  // février 2011) valorise les années techniques au lieu de les taire. Les
  // dix-huit mois de QA ne sont comptés ni comme technique ni comme produit.
  yearsExperience: "10",
  yearsDigital: "15",
  // Ce que tu cherches : affiché en pastille dans le hero (🎯) et transmis au
  // Fit-Checker (ligne « Recherche »). Vide ("") = rien ne s'affiche.
  lookingFor: {
    fr: "Ouvert aux opportunités Senior / Lead PM · SaaS B2B · Nantes, hybride ou remote",
    en: "Open to Senior / Lead PM roles · B2B SaaS · Nantes, hybrid or remote",
  },
  photo: "assets/photo/antoine.jpg", // recadrée en carré, légers ajustements de contraste/netteté
  // ⚠️ Le pitch FR est aussi recopié en dur dans index.html (#heroPitch) pour
  // les robots qui n'exécutent pas JavaScript (moteurs IA, aperçus...). Si tu
  // le modifies ici, reporte la modification là-bas : app.js signale l'écart
  // dans la console du navigateur, mais ne le corrige pas tout seul.
  pitch: {
    fr: "Senior Product Manager, **10 ans de produit** en **SaaS B2B** (AB Tasty, Everysens) et grands comptes (SNCF Connect & Tech), **ingénieur de formation** et quatre ans côté technique avant le produit. Ma spécialité : le **growth** des produits SaaS, de l'onboarding à la monétisation self-serve. Chez AB Tasty, je porte le passage d'un modèle Sales-Led à un **modèle hybride** : business case et roadmap avec la direction, deux PM animés, un tunnel self-serve livré derrière un feature flag. Je tranche avec la donnée (**SQL, Metabase, Mixpanel**) autant qu'avec les entretiens utilisateurs.",
    en: "Senior Product Manager, **10 years in product**, in **B2B SaaS** (AB Tasty, Everysens) and enterprise settings (SNCF Connect & Tech), **engineer by training**, with four years on the technical side before product. My specialty: **growth** for SaaS products, from onboarding to self-serve monetization. At AB Tasty, I lead the shift from a Sales-Led to a **hybrid model**: business case and roadmap with leadership, two PMs led, a self-serve funnel shipped behind a feature flag. I decide with data (**SQL, Metabase, Mixpanel**) as much as with user interviews.",
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
      fr: "CV d'Antoine Berthaud, Senior Product Manager à Nantes : 10 ans de produit en SaaS B2B et grands comptes (AB Tasty, Everysens, SNCF). Growth, PLG, discovery, data.",
      en: "Antoine Berthaud's CV, Senior Product Manager in Nantes: 10 years in B2B SaaS and enterprise product (AB Tasty, Everysens, SNCF). Growth, PLG, discovery, data.",
    },
  },
  contact: {
    email: "antoine.berthaud@gmail.com",
    linkedin: "https://www.linkedin.com/in/antoine-berthaud-pm/",
    site: "https://cv.antoine.berthaud.me/", // affichée en toutes lettres en page 1 du PDF
    // Galerie photos (portfolio perso) : lien affiché dans le pied de page,
    // à côté de l'e-mail et de LinkedIn. Vide = pas de lien.
    photos: "https://antoine.berthaud.me/",
    location: "Nantes, France",
    // Phrase de disponibilité affichée sous le rôle dans le pied de page
    // (ex : { fr: "Je réponds sous 48 h.", en: "I reply within 48 hours." }).
    // Vide = rien ne s'affiche. N'écris que ce que tu tiendras vraiment.
    availability: { fr: "", en: "" },
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
  // Deuxième chiffre de la même étude de cas (elle en porte deux) : le lien
  // « Voir les N études de cas » compte les études distinctes, pas les chiffres.
  { value: "-20%", label: { fr: "Time-to-Value (AB Tasty)", en: "Time-to-Value (AB Tasty)" }, resultId: "ab-tasty-activation" },
  { value: "-50%", label: { fr: "Temps de saisie (Everysens)", en: "Entry time (Everysens)" }, resultId: "everysens-entry-time" },
  { value: "+100%", label: { fr: "Taux de conversion, récupération du billet (SNCF Connect)", en: "Conversion rate, ticket retrieval (SNCF Connect)" }, resultId: "sncf-ticket-retrieval" },
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
    // cardTitle / problem / approach : la carte de la section « Études de cas »
    // de l'accueil (7 sept. 2026). Le reste de l'entrée alimente results.html.
    // Une entrée sans cardTitle n'a pas de carte : le champ est le contrat.
    cardTitle: { fr: "Repenser l'onboarding", en: "Rethinking onboarding" },
    problem: {
      fr: "Churn précoce et support saturé, une activation sous le benchmark du marché.",
      en: "Early churn and an overloaded support team, activation below the market benchmark.",
    },
    approach: {
      fr: "Entretiens utilisateurs, benchmark externe, moteur de qualification à l'inscription, puis un onboarding personnalisé par profil.",
      en: "User interviews, external benchmark, a qualification engine at sign-up, then a personalized onboarding for each profile.",
    },
    company: "AB Tasty",
    companyLogo: "assets/logos/ab-tasty.webp",
    role: "Product Manager",
    period: "2023 – 2025",
    value: "+15%",
    label: { fr: "Taux d'activation", en: "Activation rate" },
    context: {
      fr: "AB Tasty, plateforme SaaS d'**Experience Optimization** (A/B Testing, Personnalisation). PM responsable de la « Product eXperience », au sein d'une équipe de 3 développeurs, 1 tech lead, 1 QA et 1 Product Designer.",
      en: "AB Tasty, an **Experience Optimization** SaaS platform (A/B Testing, Personalization). PM in charge of \"Product eXperience\", within a team of 3 developers, 1 tech lead, 1 QA and 1 Product Designer.",
    },
    challenge: {
      fr: "Un churn à **15%** et une sur-sollicitation du support CSM, alors que le produit n'offrait aucun accompagnement à l'onboarding.",
      en: "A **15%** churn rate and CSM support overloaded with requests, while the product offered no in-app onboarding help.",
    },
    hypothesis: {
      fr: "Un problème d'**activation** plutôt que de fit produit. Vérifié avant d'investir, en comparant nos chiffres au benchmark **Userpilot** : nettement en dessous.",
      en: "An **activation** problem rather than a product-fit one. Checked before investing, by comparing our numbers to the **Userpilot** benchmark: clearly below par.",
    },
    discarded: {
      fr: "**Attaquer le churn dans son ensemble** (ICP à revoir, accessibilité des outils...) : j'ai préféré le trou en tout début de funnel, là où le gain potentiel était le plus important.\n\n**Un simple correctif d'onboarding** : il aurait traité le symptôme sans rien laisser derrière lui pour la suite.",
      en: "**Tackling churn as a whole** (ICP to revisit, tool accessibility...): I went for the gap right at the start of the funnel instead, where the potential gain was highest.\n\n**A quick onboarding fix**: it would have treated the symptom and left nothing behind for what came next.",
    },
    action: {
      fr: "J'ai mené des entretiens avec des utilisateurs fraîchement arrivés : la peur de se lancer malgré l'accompagnement CSM, et une installation trop longue, revenaient systématiquement. En creusant, j'ai remarqué que nos utilisateurs recouvraient des profils très différents (développeurs, marketing, analystes, product), avec des compétences et des attentes différentes.\n\nJ'ai donc conçu un **moteur de qualification à l'inscription** (rôle, niveau en A/B testing, compétences techniques, objectif principal), présenté comme un service rendu à l'utilisateur plutôt qu'un simple formulaire pour maximiser les réponses — avec un double usage :",
      en: "I ran interviews with freshly onboarded users: fear of getting started despite CSM support, and a setup that took too long, came up again and again. Digging further, I noticed our users covered very different profiles (developers, marketers, analysts, product people), with different skills and expectations.\n\nSo I designed a **qualification engine at sign-up** (role, A/B testing level, technical skills, main goal), framed as a service to the user rather than a plain form to maximize response rates — serving a double purpose:",
    },
    actionPoints: [
      { fr: "**Livrer un onboarding personnalisé** : un parcours différent selon le profil, plutôt qu'une visite guidée unique.", en: "**Ship a personalized onboarding**: a different journey per profile, rather than one guided tour for everyone." },
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

  // Quatrième étude (7 sept. 2026, matière donnée par Antoine). Pas de champ
  // `value` : le chantier a été livré mais jamais lancé, il n'y a donc aucun
  // chiffre d'impact — `status` prend la place du chiffre, sur la carte de
  // l'accueil comme en tête de l'étude. Ne jamais inventer un résultat ici.
  "ab-tasty-hybride": {
    company: "AB Tasty",
    companyLogo: "assets/logos/ab-tasty.webp",
    role: "Senior Growth Product Manager",
    period: { fr: "2025 – aujourd'hui", en: "2025 – present" },
    status: {
      fr: "Livré en production derrière un feature flag, prêt au lancement — suspendu à la suite de la fusion d'AB Tasty avec VWO.",
      en: "Shipped to production behind a feature flag, ready to launch — put on hold after AB Tasty's merger with VWO.",
    },
    label: { fr: "Du Sales-Led au modèle hybride", en: "From Sales-Led to a hybrid model" },
    cardTitle: { fr: "Ouvrir le produit au self-serve", en: "Opening the product to self-serve" },
    problem: {
      fr: "Le marché des grands comptes sature, et le modèle 100 % Sales-Led ne sait pas servir les petites structures de façon rentable.",
      en: "The enterprise market is saturating, and a 100% Sales-Led model cannot serve small companies profitably.",
    },
    approach: {
      fr: "Business case et roadmap devant la direction, tunnel self-serve construit de bout en bout, deux Product Managers animés.",
      en: "Business case and roadmap to leadership, a self-serve funnel built end to end, two Product Managers led.",
    },
    context: {
      fr: "AB Tasty, plateforme SaaS d'**Experience Optimization**, vendue historiquement en **100 % Sales-Led**. Senior Growth Product Manager au sein du pilier Growth, avec 4 développeurs, 1 tech lead, 1 QA et 1 Product Designer.",
      en: "AB Tasty, a SaaS **Experience Optimization** platform, historically sold **100% Sales-Led**. Senior Growth Product Manager within the Growth pillar, with 4 developers, 1 tech lead, 1 QA and 1 Product Designer.",
    },
    challenge: {
      fr: "Le marché des grands comptes commence à saturer, et la croissance qui reste se trouve chez les petites structures — celles que l'offre ne sait pas servir en restant rentable.\n\nEn vente accompagnée, un client coûte cher à acquérir, et il faut plus d'un an pour que ce coût soit amorti. Cela fixe un prix plancher, qui reste trop haut pour une petite structure.",
      en: "The enterprise market is starting to saturate. What growth is left sits with small companies — the ones the offer cannot serve while staying profitable.\n\nIn a sales-led motion, a customer is expensive to acquire, and it takes over a year to earn that cost back. It sets a price floor, and the floor stays too high for a small company.",
    },
    challengePoints: [
      {
        fr: "Les rares petites structures signées n'avaient pas les moyens de financer l'accompagnement qui fait la valeur du produit — et churnaient d'autant plus.",
        en: "The few small companies that did sign could not afford the support that makes the product valuable — and churned all the more.",
      },
      {
        fr: "L'ICP écartait donc ce segment de lui-même, sans que personne ait eu à en décider.",
        en: "So the ICP ruled that segment out on its own, without anyone having to decide it.",
      },
    ],
    hypothesis: {
      fr: "Pour ouvrir ce segment, il fallait s'attaquer au **coût de servir** avant le prix affiché. Sans sales ni CSM sur ces clients, un abonnement abordable redevient rentable.",
      en: "To open that segment, the **cost to serve** had to come down before the list price. With no sales and no CSM on those customers, an affordable subscription becomes profitable again.",
    },
    discarded: {
      fr: "**Baisser les prix dans le modèle existant** : le plancher venait du coût d'acquisition, pas de la grille tarifaire. Descendre en dessous revenait à vendre à perte.\n\n**Pousser encore sur les grands comptes** : c'est précisément le segment qui sature.",
      en: "**Cutting prices within the existing model**: the floor came from the cost of acquisition, not from the price list. Going below it meant selling at a loss.\n\n**Pushing harder on enterprise**: that is exactly the segment that is saturating.",
    },
    action: {
      fr: "J'ai construit le **business case et la roadmap du modèle hybride** et je les ai portés devant la direction : garder la vente accompagnée pour les grands comptes, qui ont un département achats et instruisent l'abonnement comme une dépense, et ouvrir un parcours **self-serve** pour les autres.\n\nJ'ai conçu et construit ce tunnel de bout en bout : inscription publique, freemium limité, facturation Hyperline cadrée de bout en bout (paiement, abonnements, accès aux fonctionnalités selon l'offre). J'ai animé **2 autres Product Managers** : répartition du plan, arbitrages de périmètre, cohérence d'ensemble.\n\nDeux passerelles étaient prévues dès le cadrage :",
      en: "I built the **business case and roadmap for the hybrid model** and carried them to leadership: keep the sales-led motion for enterprise accounts, which have a procurement department and review the subscription as a spend anyway, and open a **self-serve** path for everyone else.\n\nI designed and built that funnel end to end: public sign-up, limited freemium, and the integration of the Hyperline billing platform, which I scoped (payments, subscriptions, feature access by plan). I led **2 other Product Managers** on the workstream: splitting the plan, scoping trade-offs, overall consistency.\n\nTwo bridges were planned from the start:",
    },
    actionPoints: [
      {
        fr: "**Du self-serve vers la vente accompagnée**, quand le volume d'usage ou le besoin de fonctionnalités avancées le justifie.",
        en: "**From self-serve to sales-led**, when usage volume or the need for advanced features justifies it.",
      },
      {
        fr: "**Le mois offert sert aussi de compte de démonstration** aux grands prospects — ce que le modèle historique rendait lourd à mettre en place.",
        en: "**The free month doubles as a demo account** for enterprise prospects — something the historical model made cumbersome to set up.",
      },
    ],
    lesson: {
      fr: "Le plancher tarifaire venait du coût de servir, pas de la grille : tant qu'un client demandait un cycle de vente et un accompagnement, aucun abonnement ne pouvait descendre au niveau d'une petite structure. Le business case a convaincu en montrant ce que devient ce coût quand on retire les sales et les CSM d'un segment — la taille du marché, elle, était déjà connue.",
      en: "The price floor came from the cost to serve, not from the price list: as long as a customer required a sales cycle and hands-on support, no subscription could come down to a small company's level. The business case convinced leadership by showing what that cost becomes once sales and CSMs are taken out of a segment — not by restating the size of the market, which they already knew.",
    },
  },

  "everysens-entry-time": {
    cardTitle: { fr: "Réduire la friction de saisie", en: "Cutting data-entry friction" },
    problem: {
      fr: "Une saisie longue et peu fiable sur des trains de 30 wagons et plus.",
      en: "Slow, error-prone data entry on trains of 30 wagons and more.",
    },
    approach: {
      fr: "Recherche utilisateur, plan de migration porté auprès de la direction, refonte incrémentale, MVP en moins de 2 mois.",
      en: "User research, a migration plan carried to leadership, incremental rework, MVP in under 2 months.",
    },
    company: "Everysens",
    companyLogo: "assets/logos/everysens.webp",
    role: "Product Manager",
    period: "2022 – 2023",
    value: "-50%",
    label: { fr: "Temps de saisie", en: "Entry time" },
    context: {
      fr: "Everysens, SaaS de gestion et suivi du transport de fret ferroviaire, avec pour objectif de favoriser le report modal des camions vers le rail et de décarboner le transport. PM responsable du **module « Exécution »** (saisie des transports, validation des lettres de voiture, suivi temps réel), au sein d'une équipe de 4 développeurs et 1 QA, rejointe plus tard par 1 Product Designer.",
      en: "Everysens, a SaaS platform for managing and tracking rail freight transport, aimed at shifting freight from road to rail and decarbonizing transport. PM in charge of the **\"Execution\" module** (transport entry, waybill validation, real-time tracking), within a team of 4 developers and 1 QA, later joined by 1 Product Designer.",
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
    hypothesis: {
      fr: "Le temps de saisie ne venait pas que de l'interface : une partie des informations demandées existait déjà dans le module « Planification ». En faisant dialoguer les deux, une bonne part du formulaire pouvait se remplir toute seule.",
      en: "Entry time wasn't only about the interface: part of the information being asked for already lived in the \"Planning\" module. Make the two talk to each other and a good share of the form could fill itself in.",
    },
    discarded: {
      fr: "**Retoucher l'interface existante au fil de l'eau**, sans plan de migration : plus rapide à lancer, mais impossible à tenir sur la durée et bien moins rassurant pour la direction, qui devait engager une refonte d'architecture.",
      en: "**Patching the existing interface as we went**, with no migration plan: faster to start, impossible to sustain, and far less reassuring for a leadership team that had to commit to an architecture rework.",
    },
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
    cardTitle: { fr: "Un parcours critique sans données produit", en: "A critical journey with no product data" },
    problem: {
      fr: "Des voyageurs bloqués à la première étape de récupération du billet, sans analytics disponibles.",
      en: "Travelers stuck on the first step of ticket retrieval, with no analytics available.",
    },
    approach: {
      fr: "Extraction quotidienne des retours sur Twitter via Zapier, seconde méthode de récupération ajoutée.",
      en: "Daily extraction of Twitter feedback via Zapier, a second retrieval method added.",
    },
    company: "SNCF Connect & Tech",
    companyLogo: "assets/logos/sncf-connect-tech.webp",
    role: "Product Manager",
    period: "2021 – 2022",
    value: "+100%",
    label: { fr: "Taux de conversion, récupération du billet", en: "Conversion rate, ticket retrieval" },
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
    hypothesis: {
      fr: "Le blocage venait de la première étape elle-même : l'outil imposait de **scanner le QR code du billet**, alors qu'une grande partie des voyageurs n'avaient leur billet que sur mobile — donc rien à scanner.",
      en: "The blocker was the first step itself: the tool required **scanning the ticket's QR code**, while a large share of travelers only had their ticket on mobile — nothing to scan.",
    },
    discarded: {
      fr: "**Les entretiens utilisateurs classiques** : en gare, en pleine épidémie, ils auraient créé un risque sanitaire. Il fallait un signal sans contact — d'où les tweets.",
      en: "**Classic user interviews**: in a station, in the middle of an epidemic, they would have created a health risk. The signal had to be contact-free — hence the tweets.",
    },
    action: {
      fr: "J'ai mis en place une **extraction quotidienne automatique des tweets** mentionnant le projet, le Covid et la SNCF, pour obtenir un signal utilisateur sans contact physique.\n\nÇa a confirmé l'hypothèse. J'ai ajouté une **deuxième méthode de récupération**, par nom et numéro de dossier, en alternative au QR code.\n\nLe taux de conversion de cette première étape a doublé.",
      en: "I set up a **daily automated extraction of tweets** mentioning the project, Covid, and SNCF, to get a user signal without physical contact.\n\nIt confirmed the hypothesis. I added a **second retrieval method**, by name and booking reference, as an alternative to the QR code.\n\nThe conversion rate of that first step doubled.",
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
    title: { fr: "Le problème d'abord", en: "Problem first" },
    subtitle: {
      fr: "Pas de feature sans un problème utilisateur quantifié.",
      en: "No feature without a quantified user problem.",
    },
    points: [
      {
        fr: "Discovery chaque semaine : entretiens et tests utilisateurs.",
        en: "Discovery every week: interviews and user tests.",
      },
      {
        fr: "Quand l'entretien est impossible, en gare en pleine épidémie, je vais chercher le signal ailleurs : extraction quotidienne des tweets.",
        en: "When interviews are impossible, in a station in the middle of an epidemic, I go get the signal elsewhere: a daily extraction of tweets.",
      },
    ],
  },
  {
    id: "data-informed",
    title: { fr: "Les données tranchent", en: "Data decides" },
    subtitle: {
      fr: "Les intuitions lancent les tests, les données valident.",
      en: "Intuition starts the test, data validates it.",
    },
    points: [
      {
        fr: "Je construis mes propres tableaux de bord : churn, rétention, activation, Time-to-Value.",
        en: "I build my own dashboards: churn, retention, activation, Time-to-Value.",
      },
      {
        fr: "Un benchmark externe avant d'investir : c'est lui qui a montré que notre activation décrochait.",
        en: "An external benchmark before investing: that's what showed our activation was falling behind.",
      },
    ],
  },
  {
    id: "iterative",
    title: { fr: "Petit d'abord, grand ensuite", en: "Small first, then big" },
    subtitle: {
      fr: "L'apprentissage continu vers le Product-Market Fit.",
      en: "Continuous learning on the way to Product-Market Fit.",
    },
    points: [
      {
        fr: "Culture du « Fail Fast » et cycles de livraison courts.",
        en: "A \"Fail Fast\" culture with short delivery cycles.",
      },
      {
        fr: "Livraison par étapes plutôt qu'un big bang, et déploiement progressif quand le risque est élevé.",
        en: "Delivery in steps rather than a big bang, and progressive rollout when the risk is high.",
      },
    ],
  },
  {
    // Carte Leadership (sept. 2026, second retour d'expert) : ces faits
    // existaient tous dans les puces des rôles, mais aucun n'était visible au
    // niveau où un recruteur scanne. Uniquement des faits déjà sur le site.
    id: "leadership",
    title: { fr: "Leadership", en: "Leadership" },
    subtitle: {
      fr: "Des PM et des équipes à faire avancer, un cap tenu avec la direction.",
      en: "PMs and teams to move forward, a course held with leadership.",
    },
    points: [
      {
        fr: "Deux PM animés sur le chantier self-serve d'AB Tasty : répartition du plan, arbitrages de périmètre.",
        en: "Two PMs led on AB Tasty's self-serve workstream: splitting the plan, scoping trade-offs.",
      },
      {
        fr: "Élu responsable de la communauté de pratiques PM de SNCF, plus de 100 personnes, reconduit pour un second mandat ; mentorat de 2 à 3 personnes.",
        en: "Elected lead of SNCF's 100+ people Product Management community, re-elected for a second term; mentoring 2 to 3 people.",
      },
      {
        fr: "Business case et roadmap portés auprès de la direction ; squads jusqu'à 15 développeurs.",
        en: "Business case and roadmap carried to leadership; squads of up to 15 developers.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. COMPÉTENCES — ce qu'un recruteur cherche, pas la liste des logiciels
//    ouverts dans la journée. Trente entrées, toutes des pratiques, en cinq
//    groupes rendus dans l'ordre d'apparition ici : growth et stratégie
//    d'abord, delivery et technique ensuite (sept. 2026, second retour
//    d'expert). Les douze outils purs (Jira, Figma, Miro...) sont sortis des
//    pastilles le 7 sept. 2026 (quatrième revue, trois auditeurs sur quatre) :
//    ils ne trient pas un Senior PM et diluaient la lecture. Ils restent
//    lisibles par les outils de tri dans EVERYDAY_TOOLS ci-dessous.
//    Les labels identiques en FR et EN restent des chaînes simples ; seuls
//    ceux qui se traduisent sont des objets { fr, en }. La catégorie est
//    traduite via UI_STRINGS "skills.cat.*" (i18n.js) : garder les valeurs de
//    `category` exactement comme ci-dessous, ce sont des clés de traduction.
//    Les API et intégrations restent listées : 4 offres nantaises sur 10 les
//    citent, et un PM qui construit des tunnels et des paiements doit pouvoir
//    les montrer.
// ---------------------------------------------------------------------------
const SKILLS = [
  { id: "plg", label: "Product-Led Growth", category: "growth" },
  { id: "monetization", label: { fr: "Monétisation self-serve", en: "Self-serve monetization" }, category: "growth" },
  { id: "activation", label: { fr: "Onboarding & activation", en: "Onboarding & activation" }, category: "growth" },
  { id: "retention", label: { fr: "Rétention", en: "Retention" }, category: "growth" },
  { id: "ab-testing", label: { fr: "A/B testing & expérimentation", en: "A/B testing & experimentation" }, category: "growth" },
  { id: "product-strategy", label: { fr: "Stratégie produit", en: "Product Strategy" }, category: "growth" },
  { id: "okr", label: "OKR", category: "growth" },
  { id: "roadmapping", label: "Roadmapping", category: "growth" },
  { id: "prioritization", label: { fr: "Priorisation", en: "Prioritization" }, category: "growth" },
  { id: "discovery", label: "Discovery", category: "discovery" },
  { id: "user-research", label: "User Research", category: "discovery" },
  { id: "product-analytics", label: "Product Analytics", category: "discovery" },
  { id: "sql", label: "SQL", category: "discovery" },
  { id: "metabase", label: "Metabase", category: "discovery" },
  { id: "mixpanel", label: "Mixpanel", category: "discovery" },
  { id: "segment", label: "Segment", category: "discovery" },
  { id: "stakeholder", label: "Stakeholder Management", category: "leadership" },
  { id: "cross-functional-leadership", label: "Cross-functional Leadership", category: "leadership" },
  { id: "mentoring", label: "Mentoring & Coaching", category: "leadership" },
  { id: "agile", label: "Agile / Scrum", category: "delivery" },
  { id: "user-stories", label: "User Stories & Backlog", category: "delivery" },
  { id: "story-mapping", label: "Story Mapping", category: "delivery" },
  { id: "bdd", label: "BDD", category: "delivery" },
  { id: "feature-flagging", label: "Feature Flagging / Progressive Rollout", category: "delivery" },
  { id: "product-ownership", label: "Product Ownership", category: "delivery" },
  { id: "project-management", label: { fr: "Gestion de projet", en: "Project Management" }, category: "delivery" },
  { id: "functional-analysis", label: { fr: "Analyse fonctionnelle", en: "Functional Analysis" }, category: "delivery" },
  { id: "api", label: { fr: "API & intégrations", en: "APIs & integrations" }, category: "tech" },
  { id: "llm-integration", label: { fr: "Intégration LLM (API Gemini)", en: "LLM integration (Gemini API)" }, category: "tech" },
  { id: "genai", label: { fr: "IA générative", en: "Generative AI" }, category: "tech" },
];

// Outils du quotidien : une ligne de texte sous les compétences, pas des
// pastilles. Ils gardent leur valeur de mots-clés pour les outils de tri de
// candidatures sans occuper le regard d'un lecteur humain. Vide ([]) = la
// ligne disparaît.
const EVERYDAY_TOOLS = ["Jira", "ProductBoard", "Figma", "Miro", "Zapier", "Flagship", "Akeneo", "Postman", "Looker Studio", "Matomo", "Hotjar", "Heap"];

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
    // Ordre de grandeur du produit (chiffres publics, donnés par Antoine le
    // 7 sept. 2026) : sans lui, un « +15 % d'activation » ne se situe pas.
    // Champ optionnel : une entreprise sans `scope` n'affiche pas la ligne.
    scope: {
      fr: "1 000+ organisations clientes · 5 000 utilisateurs actifs mensuels · 50 M€ d'ARR",
      en: "1,000+ client organizations · 5,000 monthly active users · €50M ARR",
    },
    logo: "assets/logos/ab-tasty.webp",
    roles: [
      {
        title: "Senior Growth Product Manager",
        start: "2025-05",
        end: null,
        context: {
          fr: "Mission : ouvrir la plateforme au self-serve en complément de la vente grands comptes, au sein du pilier Growth d'AB Tasty (SaaS d'Experience Optimization : A/B Testing, Personnalisation). Équipe internationale, anglais au quotidien.",
          en: "Mission: open the platform to self-serve alongside enterprise sales, within AB Tasty's Growth pillar (Experience Optimization SaaS: A/B Testing, Personalization). International team, English as the working language.",
        },
        achievements: [
          {
            fr: "**Tunnel self-serve livré en production derrière un feature flag**, prêt au lancement : inscription publique, freemium limité, facturation Hyperline cadrée de bout en bout (paiement, abonnements, accès aux fonctionnalités selon l'offre). Lancement suspendu à la suite de la fusion d'AB Tasty avec VWO.",
            en: "**Self-serve funnel shipped to production behind a feature flag**, ready to launch: public sign-up, limited freemium, Hyperline billing scoped end to end (payments, subscriptions, feature access by plan). Launch put on hold after AB Tasty's merger with VWO.",
          },
          {
            fr: "**Business case et roadmap du modèle hybride portés devant la direction** : passage d'un modèle 100 % Sales-Led à un modèle où les grands comptes restent suivis par les sales et les autres s'inscrivent et paient en autonomie.",
            en: "**Business case and roadmap for the hybrid model carried to leadership**: moving from a 100% Sales-Led model to one where large accounts stay with Sales and everyone else signs up and pays on their own.",
          },
          {
            fr: "**2 Product Managers animés** sur le chantier : répartition du plan, arbitrages de périmètre, cohérence d'ensemble.",
            en: "**Led 2 Product Managers** on the workstream: splitting the plan, scoping trade-offs, overall consistency.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "4 développeurs, 1 tech lead, 1 QA, 1 Product Designer",
          en: "4 developers, 1 tech lead, 1 QA, 1 Product Designer",
        },
        skills: ["plg", "monetization", "product-strategy", "roadmapping", "stakeholder", "cross-functional-leadership"],
      },
      {
        title: "Product Manager",
        start: "2023-09",
        end: "2025-05",
        context: {
          fr: "Mission : la « Product eXperience » de la plateforme d'Experience Optimization (A/B Testing, Personnalisation) : onboarding, activation, rétention.",
          en: "Mission: the \"Product eXperience\" of the Experience Optimization platform (A/B Testing, Personalization): onboarding, activation, retention.",
        },
        achievements: [
          {
            fr: "**+15 % de taux d'activation, -20 % de Time-to-Value** : un moteur de qualification à l'inscription, puis un **onboarding personnalisé** par profil utilisateur.",
            en: "**+15% activation rate, -20% Time-to-Value**: a qualification engine at sign-up, then a **personalized onboarding** for each user profile.",
          },
          {
            fr: "**2FA obligatoire déployée sur 100 % de la base utilisateur** par vagues successives, calées sur la capacité des Customer Success Managers à accompagner leurs clients : aucune perte d'activité, impact support quasi nul.",
            en: "**Mandatory 2FA rolled out to 100% of the user base** in successive waves, paced so Customer Success Managers could support their clients: no activity loss, near-zero support impact.",
          },
          {
            fr: "**Churn, rétention, activation et Time-to-Value suivis automatiquement** : mise en place de l'infrastructure de données produit (SQL, Metabase, Mixpanel).",
            en: "**Churn, retention, activation and Time-to-Value tracked automatically**: built the product data infrastructure (SQL, Metabase, Mixpanel).",
          },
          {
            fr: "**Vision produit recentrée sur la rétention et l'engagement** : « Make our users fall in love with our product, repeatedly ».",
            en: "**Product vision refocused on retention and engagement**: \"Make our users fall in love with our product, repeatedly\".",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "3 développeurs, 1 tech lead, 1 QA, 1 Product Designer",
          en: "3 developers, 1 tech lead, 1 QA, 1 Product Designer",
        },
        skills: ["activation", "retention", "ab-testing", "product-analytics", "discovery", "feature-flagging"],
      },
    ],
  },
  {
    company: "Everysens",
    location: "Nantes, France",
    logo: "assets/logos/everysens.webp",
    roles: [
      {
        title: "Product Manager",
        start: "2022-04",
        end: "2023-09",
        context: {
          fr: "Mission : le module « Exécution » (lettres de voiture, trains de 30 wagons et plus) d'un SaaS de gestion et de suivi du fret ferroviaire, au service du report modal de la route vers le rail. Anglais au quotidien avec l'équipe.",
          en: "Mission: the \"Execution\" module (waybills, trains of 30+ wagons) of a SaaS platform for managing and tracking rail freight, serving the modal shift from road to rail. English as the working language with the team.",
        },
        achievements: [
          {
            fr: "**-50 % de temps de saisie, +20 % de satisfaction utilisateur** : refonte technique et fonctionnelle du module de saisie, obtenue auprès de la direction et menée en incrémental, **MVP livré en moins de 2 mois**.",
            en: "**-50% entry time, +20% user satisfaction**: technical and functional rework of the entry module, secured with leadership and delivered incrementally, **MVP shipped in under 2 months**.",
          },
          {
            fr: "**Adoption utilisateur et fiabilité des données comme priorités de la roadmap** du module : saisie des transports, validation des lettres de voiture, suivi en temps réel.",
            en: "**User adoption and data reliability as the module roadmap's priorities**: transport entry, waybill validation, real-time tracking.",
          },
          {
            fr: "**Recherche utilisateur et maquettes UI/UX menées en autonomie** (Hotjar, Heap) avant l'arrivée d'une Product Designer.",
            en: "**User research and UI/UX mockups done on my own** (Hotjar, Heap) before a Product Designer joined the team.",
          },
        ],
        methodology: "Scrum",
        team: { fr: "4 développeurs, 1 QA, puis 1 Product Designer", en: "4 developers, 1 QA, later 1 Product Designer" },
        skills: ["discovery", "user-research", "roadmapping", "prioritization", "stakeholder"],
      },
    ],
  },
  {
    company: "SNCF Connect & Tech",
    location: "Nantes, France",
    logo: "assets/logos/sncf-connect-tech.webp",
    roles: [
      // Les deux postes 2020-2022 (boutiques en ligne, puis Prêt à Voyager en
      // parallèle d'octobre 2021 à avril 2022) tenaient deux blocs et faisaient
      // peser SNCF 46 % de la section Expériences contre 29 % à AB Tasty
      // (mesuré le 7 sept. 2026). Fusionnés en un bloc, quatrième revue externe,
      // choix d'Antoine : « elles ont peu de valeur face aux plus récentes ».
      {
        title: "Product Manager",
        start: "2020-09",
        end: "2022-04",
        context: {
          fr: "Mission : l'outil de génération de boutiques en ligne de titres de transport (Transilien, TER), puis en parallèle, d'octobre 2021 à avril 2022, la plateforme sanitaire Prêt à Voyager (jusqu'à **40 000 visiteurs par jour**), où les voyageurs vérifiaient eux-mêmes pass sanitaire et billet pendant le Covid-19.",
          en: "Mission: the online store generator for transport tickets (Transilien, TER), then in parallel, from October 2021 to April 2022, the Prêt à Voyager health-pass platform (up to **40,000 visitors a day**), where travelers self-checked their health pass and ticket during Covid-19.",
        },
        achievements: [
          {
            fr: "**+100 % sur le taux de conversion** de la première étape de récupération du billet sur Prêt à Voyager : parcours retravaillé à partir des retours des voyageurs collectés sur Twitter (extraction quotidienne via Zapier), plateforme redéveloppée en interne.",
            en: "**+100% conversion rate** on the first step of ticket retrieval on Prêt à Voyager: journey reworked from traveler feedback collected on Twitter (daily extraction via Zapier), platform rebuilt in-house.",
          },
          {
            fr: "**Une mission et une vision produit communes** aux stakeholders et au service marketing des boutiques en ligne, formalisées et partagées.",
            en: "**A shared product mission and vision** for the online-store stakeholders and the marketing team, formalized and communicated.",
          },
          {
            fr: "**Stratégie 2021 tenue par des OKR** : roadmap de delivery, priorisation du backlog, discovery relancé (sondages utilisateurs, exploitation de la data disponible).",
            en: "**2021 strategy held by OKRs**: delivery roadmap, backlog prioritization, discovery relaunched (user surveys, mining the available data).",
          },
        ],
        methodology: { fr: "Scrum, Kanban", en: "Scrum, Kanban" },
        team: {
          fr: "3 développeurs, 1 Scrum Master, 1 Delivery Manager (boutiques) · 4 développeurs, 1 Engineering Manager (Prêt à Voyager)",
          en: "3 developers, 1 Scrum Master, 1 Delivery Manager (stores) · 4 developers, 1 Engineering Manager (Prêt à Voyager)",
        },
        skills: ["user-research", "okr", "roadmapping", "prioritization", "stakeholder", "discovery"],
      },
      {
        title: { fr: "Product Manager Junior", en: "Junior Product Manager" },
        start: "2016-08",
        end: "2020-09",
        context: {
          fr: "Mission : la digitalisation de la vente de billets groupes en B2B (vendeurs SNCF, agences de voyage), dont j'avais été lead test côté grand public, puis les web services (API) de distribution des titres TER et urbains utilisés par les canaux de vente.",
          en: "Mission: digitizing B2B group-ticket sales (SNCF sales staff, travel agencies), where I had been test lead on the consumer side, then the web services (APIs) distributing regional (TER) and urban tickets to the sales channels.",
        },
        // Condensé à une mission et une puce (sept. 2026, second retour
        // d'expert, choix d'Antoine) : le bloc SNCF pesait plus que les rôles
        // qui comptent (AB Tasty). Le delivery retiré est couvert par les
        // compétences ; la ligne Équipe garde les 15 développeurs et 2 PM.
        achievements: [
          {
            fr: "**Du besoin métier à la livraison** : ateliers et macro-chiffrage avec les équipes métier, roadmap et Story Mapping, User Stories et scénarios BDD, validation des fonctionnalités livrées.",
            en: "**From business need to delivery**: workshops and high-level sizing with business teams, roadmap and Story Mapping, User Stories and BDD scenarios, acceptance of delivered features.",
          },
          // Ce rôle avait son propre bloc (avr. 2019 – févr. 2020), supprimé
          // le 7 sept. 2026 : dix mois en parallèle d'un poste junior ne
          // valaient pas un bloc entier sur un CV senior. Le titre interne
          // était « responsable du cercle » ; « cercle » est du jargon SNCF
          // Connect, « communauté de pratiques » se comprend de l'extérieur,
          // mais le mot « responsable », lui, est le titre exact — élu par ses
          // pairs à la création, premier titulaire, reconduit alors qu'un seul
          // mandat était prévu.
          {
            fr: "**Élu responsable de la communauté de pratiques Product Management** de l'entreprise, **plus de 100 personnes** : premier titulaire du poste, reconduit pour un second mandat (2 × 5 mois). Veille, ateliers, mentorat de 2 à 3 personnes.",
            en: "**Elected lead of the company's Product Management community of practice**, **100+ people**: first to hold the role, re-elected for a second term (2 × 5 months). Practice insights, workshops, mentoring 2 to 3 people.",
          },
        ],
        methodology: "Scrum",
        team: {
          fr: "Jusqu'à 15 développeurs, 2 Product Managers, 1 QA, 1 Scrum Master, 1 Delivery Manager",
          en: "Up to 15 developers, 2 Product Managers, 1 QA, 1 Scrum Master, 1 Delivery Manager",
        },
        skills: ["api", "user-stories", "story-mapping", "bdd", "agile", "mentoring"],
      },
      // Réduit au titre et aux dates (7 sept. 2026, quatrième revue) : dix-huit
      // mois de QA il y a dix ans n'ont plus à occuper un bloc entier. Le fait
      // est repris dans la mission du poste Junior juste au-dessus. Les dates
      // restent : elles portent la durée totale SNCF et le rail chronologique.
      {
        title: "QA",
        start: "2015-01",
        end: "2016-08",
        skills: [],
      },
    ],
  },

  // Condensé volontairement : ton export liste plusieurs missions distinctes
  // (SSII) entre 2011 et 2015, avant ta bascule vers le Product Management.
  // Regroupées en un seul bloc pour rester lisible sur un CV senior PM.
  {
    company: "Eurogiciel · Sigma Informatique · Virage Group",
    shortName: "Eurogiciel · Sigma · Virage", // nom affiché dans le rail chronologique (desktop), où le nom complet ne tient pas
    location: "Nantes, France",
    logo: "",
    logoLabel: "ESN", // texte de la pastille quand il n'y a pas de logo (sinon : 2 premières lettres du nom)
    roles: [
      {
        title: {
          fr: "Développeur Java, puis analyste fonctionnel (missions ESN)",
          en: "Java developer, then functional analyst (IT consulting)",
        },
        start: "2011-02",
        end: "2015-01",
        context: {
          fr: "Quatre ans côté technique avant de basculer vers le Product Management.",
          en: "Four years on the technical side before moving into Product Management.",
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
      en: "Antoine is a caring, committed and demanding product manager, driven by real enthusiasm. He knows how to structure his team's collaboration time intelligently and loves bringing out the best in each person. I can only recommend him to strengthen an ambitious, collaborative team.",
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
    institution: "Polytech Nantes",
    period: "2006 – 2011",
  },
];

// Formations continues. Vidé le 7 sept. 2026 (quatrième revue, choix
// d'Antoine) : deux stages de deux jours n'apportaient rien à un profil senior
// et prenaient une carte entière dans le PDF. Ils restent sur LinkedIn. Le
// sous-titre « Formations continues » disparaît tant que la liste est vide.
const TRAININGS = [];

const LANGUAGES = [
  { label: { fr: "Français", en: "French" }, level: { fr: "Langue maternelle", en: "Native" } },
  { label: { fr: "Anglais", en: "English" }, level: { fr: "Courant · langue de travail depuis 2022 (TOEIC 925/990)", en: "Fluent · working language since 2022 (TOEIC 925/990)" } },
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
      fr: "Un outil gratuit de growth check-up (framework AARRR), conçu et lancé pour situer une stratégie growth en trois minutes. En mots clairs plutôt qu'en jargon, on voit où elle tient déjà la route et où elle ne tient pas encore. Le mode approfondi s'appuie sur l'API Gemini.",
      en: "A free growth check-up tool (AARRR framework), designed and launched to size up a growth strategy in three minutes. In plain language rather than jargon, it shows where it already holds up and where it doesn't yet. The in-depth mode runs on the Gemini API.",
    },
    link: "https://www.tourdegrowth.com",
    detailSlug: "tour-de-growth",
    skills: ["plg", "user-research", "llm-integration", "genai"],
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
    liveUrl: "https://www.tourdegrowth.com",

    problem: {
      fr: "Beaucoup de gens qui pilotent un produit savent qu'ils devraient \"faire de la croissance\", sans trop savoir dire où ils en sont vraiment. Le vrai trou, c'est l'acquisition ou plutôt la rétention ? Ce qu'on appelle \"growth\" chez nous ressemble à ce que font les autres, ou est-ce qu'on a inventé sa propre définition au fur et à mesure ?\n\nTour de Growth part de cette question toute simple : **quinze questions**, en mots clairs plutôt qu'en jargon, pour voir où une stratégie growth tient déjà la route et où elle ne tient pas encore.",
      en: "A lot of people running a product know they're supposed to \"do growth\", without quite being able to say where they actually stand. Is the real gap acquisition, or is it retention? Does what we call \"growth\" here look anything like what other companies do, or have we just been making up our own definition as we go?\n\nTour de Growth starts from that simple question: **fifteen questions**, in plain words instead of jargon, to see where a growth strategy already holds up and where it doesn't yet.",
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
