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
// où (Nantes), formation, sujets maîtrisés, et les autres pages qui parlent de
// la même personne. `profile` = { yearsExperience } lu dans js/data.js.
function profilePage(lang, profile) {
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
      sameAs: ["https://www.linkedin.com/in/antoine-berthaud-pm/", "https://antoine.berthaud.me/", "https://www.tourdegrowth.com/"],
    },
  };
}

// Bloc <script> prêt à écrire dans la page. JSON indenté comme avant (lisible
// dans le source) ; « < » échappé pour qu'aucun texte ne puisse fermer le
// <script>.
function jsonLdScript(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

module.exports = { SITE, PERSON_ID, PAGE_URLS, profilePage, jsonLdScript };
