/**
 * scripts/lib/structured-data.js — données structurées (schema.org, JSON-LD)
 * des pages, par langue. Utilisé par scripts/generate-static.js, qui les
 * écrit dans la zone <!-- static:jsonLd --> du <head> de chaque page.
 *
 * Invisibles pour les visiteurs, lues par les moteurs. La personne garde le
 * même @id dans toutes les pages et toutes les langues
 * (https://cv.antoine.berthaud.me/#person) : c'est ce qui permet aux moteurs
 * de relier l'accueil, ses versions et les autres pages à une seule entité.
 */

const SITE = "https://cv.antoine.berthaud.me";
const PERSON_ID = `${SITE}/#person`;

// Adresse publique de chaque page, par langue (le français à la racine).
const PAGE_URLS = {
  home: { fr: `${SITE}/`, en: `${SITE}/en/` },
  results: { fr: `${SITE}/results.html`, en: `${SITE}/en/results.html` },
};

// Accueil : une ProfilePage (format que Google reconnaît pour la page profil
// d'une personne) dont l'entité principale est la Person : qui, quel métier,
// où (Nantes), formation, sujets maîtrisés, et les autres pages qui décrivent
// la même personne (sameAs : LinkedIn, portfolio — pas Tour de Growth, un
// produit, relié à Antoine par WebApplication.creator sur sa page projet).
// `profile` = { yearsExperience } lu dans js/data.js ; `dates` =
// { created, modified } : premier commit de index.html, et <lastmod> de la
// page dans sitemap.xml (posés par le générateur). Date ET heure ISO 8601
// avec fuseau (2026-09-26T09:15:00Z) : Google attend un DateTime, une date
// seule est signalée dans la Search Console.
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;

function profilePage(lang, profile, dates) {
  for (const key of ["created", "modified"]) {
    if (!DATE_TIME.test(dates[key] || "")) throw new Error(`profilePage : ${key} doit être une date et heure ISO 8601 avec fuseau (reçu « ${dates[key]} »)`);
  }
  const years = profile.yearsExperience;
  const text = {
    fr: {
      name: "CV d'Antoine Berthaud — Senior Product Manager à Nantes",
      description: `Product Manager depuis ${years} ans, basé à Nantes. SaaS B2B et grands comptes (AB Tasty, Everysens, SNCF Connect & Tech) : growth, Product-Led Growth, discovery, décisions appuyées sur la donnée.`,
    },
    en: {
      name: "Antoine Berthaud's CV — Senior Product Manager in Nantes",
      description: `Product Manager for ${years} years, based in Nantes, France. B2B SaaS and enterprise (AB Tasty, Everysens, SNCF Connect & Tech): growth, Product-Led Growth, discovery, data-informed decisions.`,
    },
  }[lang];

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: PAGE_URLS.home[lang],
    name: text.name,
    inLanguage: lang,
    dateCreated: dates.created,
    dateModified: dates.modified,
    mainEntity: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Antoine Berthaud",
      givenName: "Antoine",
      familyName: "Berthaud",
      jobTitle: "Senior Growth Product Manager",
      description: text.description,
      url: `${SITE}/`,
      image: `${SITE}/assets/photo/antoine.jpg`,
      email: "mailto:antoine.berthaud@gmail.com",
      worksFor: {
        "@type": "Organization",
        name: "AB Tasty",
        url: "https://www.abtasty.com/",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nantes",
        addressRegion: "Pays de la Loire",
        addressCountry: "FR",
      },
      hasOccupation: {
        "@type": "Occupation",
        name: "Product Manager",
        occupationLocation: { "@type": "City", name: "Nantes" },
        skills:
          "Product Management, Product Ownership, Growth, Product-Led Growth, Onboarding & Activation, A/B testing, Self-serve monetization, APIs & integrations, Generative AI, Discovery, User Research, Roadmapping, OKR, Agile / Scrum, SQL, Metabase, Mixpanel",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Polytech Nantes",
        url: "https://polytech.univ-nantes.fr/",
      },
      knowsAbout: [
        "Product Management",
        "Product Ownership",
        "Product-Led Growth",
        "Growth",
        "SaaS B2B",
        "A/B testing",
        "Onboarding & Activation",
        "Self-serve monetization",
        "APIs & integrations",
        "Generative AI",
        "Experience Optimization",
        "Product Discovery",
        "User Research",
        "SQL",
        "Metabase",
        "Mixpanel",
        "Agile / Scrum",
        "OKR",
      ],
      knowsLanguage: [
        { "@type": "Language", name: "Français", alternateName: "fr" },
        { "@type": "Language", name: "English", alternateName: "en" },
      ],
      sameAs: ["https://www.linkedin.com/in/antoine-berthaud-pm/", "https://antoine.berthaud.me/"],
    },
  };
}

// Études de cas (results.html, en/results.html) : une CollectionPage (la page
// rassemble les études) et son fil d'Ariane depuis l'accueil de la même
// langue. `page` = { url, name, description, crumb } : adresse, titre et
// description de la page telle que générée, libellé du fil d'Ariane.
function resultsPage(lang, page) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${page.url}#page`,
        url: page.url,
        name: page.name,
        description: page.description,
        inLanguage: lang,
        author: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${page.url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${page.url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CV", item: PAGE_URLS.home[lang] },
          { "@type": "ListItem", position: 2, name: page.crumb, item: page.url },
        ],
      },
    ],
  };
}

// Page d'un side project (PROJECT_DETAILS) : la page elle-même (WebPage),
// son fil d'Ariane depuis l'accueil de la même langue, et l'application
// qu'elle décrit (WebApplication), créée par la même personne que le CV. C'est
// ce lien « creator » qui rattache désormais Antoine à l'outil (plutôt qu'un
// sameAs sur la Person, réservé aux pages qui le décrivent lui).
// `page` = { url, name, description } : adresse, titre et description de la
// page telle que générée ; `project` = l'entrée de PROJECT_DETAILS, avec
// `summary` (une phrase dans la langue de la page).
function projectPage(lang, page, project) {
  const appUrl = new URL(project.liveUrl).href;
  const appId = `${appUrl}#app`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${page.url}#page`,
        url: page.url,
        name: page.name,
        description: page.description,
        inLanguage: lang,
        author: { "@id": PERSON_ID },
        about: { "@id": appId },
        breadcrumb: { "@id": `${page.url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${page.url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CV", item: PAGE_URLS.home[lang] },
          { "@type": "ListItem", position: 2, name: project.title, item: page.url },
        ],
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        name: project.title,
        url: appUrl,
        description: project.summary,
        applicationCategory: project.applicationCategory || "BusinessApplication",
        operatingSystem: "Web",
        creator: { "@id": PERSON_ID },
      },
    ],
  };
}

// Adresse publique des pages d'un side project, par langue.
function projectUrls(slug) {
  return { fr: `${SITE}/projets/${slug}.html`, en: `${SITE}/en/projects/${slug}.html` };
}

// Bloc <script> prêt à écrire dans la page. JSON indenté comme avant (lisible
// dans le source) ; « < » échappé pour qu'aucun texte ne puisse fermer le
// <script>.
function jsonLdScript(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

module.exports = { SITE, PERSON_ID, PAGE_URLS, profilePage, resultsPage, projectPage, projectUrls, jsonLdScript };
