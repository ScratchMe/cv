/**
 * i18n.js — gère la bascule FR/EN.
 *
 * Deux types de textes :
 *  1. Les textes FIXES de l'interface (nav, boutons, labels...) → dictionnaire UI_STRINGS ci-dessous.
 *  2. Le CONTENU (pitch, expériences, formation...) → directement dans js/data.js,
 *     sous forme de { fr: "...", en: "..." } pour les champs traduits. Un champ
 *     laissé en texte simple (ex: "AB Tasty") s'affiche identique dans les deux langues.
 *
 * Pour ajouter une langue : duplique les clés fr/en partout (ici et dans data.js).
 */
(function () {
  "use strict";

  let currentLang = "fr";

  const UI_STRINGS = {
    "nav.profile": { fr: "Profil", en: "Profile" },
    "nav.experience": { fr: "Expériences", en: "Experience" },
    "nav.skills": { fr: "Compétences", en: "Skills" },
    "nav.cases": { fr: "Études de cas", en: "Case studies" },
    "nav.formation": { fr: "Formation", en: "Education" },
    "nav.fit": { fr: "Fit-Checker", en: "Fit Checker" },
    "nav.projects": { fr: "Side projects", en: "Side projects" },
    "nav.contact": { fr: "Contact", en: "Contact" },

    "nav.focusToggle": { fr: "Focus lecture", en: "Focus mode" },
    "nav.printBtn": { fr: "Télécharger le CV (PDF, 2 pages)", en: "Download the CV (PDF, 2 pages)" },
    "nav.printShort": { fr: "PDF", en: "PDF" },
    "nav.printShortBtn": { fr: "Télécharger le CV complet (PDF, 5 pages)", en: "Download the full CV (PDF, 5 pages)" },
    "nav.printShortLabel": { fr: "complet", en: "full" },
    "nav.langToggleLabel": { fr: "Switch to English", en: "Passer en français" },

    "hero.ctaExperience": { fr: "Voir les expériences", en: "View my experience" },
    "hero.ctaContact": { fr: "Me contacter", en: "Contact me" },
    "hero.pillYears": { fr: "en Product Management", en: "in Product Management" },
    "hero.pillYearsDigital": { fr: "ans dans le numérique", en: "years in digital" },
    "hero.photoAlt": { fr: "Portrait d'Antoine Berthaud, Product Manager à Nantes", en: "Portrait of Antoine Berthaud, Product Manager in Nantes, France" },

    "pillars.sectionTitle": { fr: "Ce qui me définit", en: "What defines me" },

    "testimonial.eyebrow": { fr: "Recommandation LinkedIn", en: "LinkedIn recommendation" },

    "footer.photos": { fr: "Photos", en: "Photos" },
    "footer.caseStudies": { fr: "Études de cas", en: "Case studies" },
    "hero.seeCaseStudies": { fr: "Voir les {n} études de cas →", en: "See the {n} case studies →" },

    "cases.sectionTitle": { fr: "Études de cas", en: "Case studies" },
    "cases.intro": {
      fr: "Trois problèmes produit, ce que j'ai fait et ce que ça a donné.",
      en: "Three product problems, what I did and what came out of it.",
    },
    "cases.problem": { fr: "Problème —", en: "Problem —" },
    "cases.approach": { fr: "Approche —", en: "Approach —" },
    "cases.cta": { fr: "Lire l'étude de cas →", en: "Read the case study →" },

    "skills.sectionTitle": { fr: "Compétences", en: "Skills" },
    "skills.cat.growth": { fr: "Growth & stratégie", en: "Growth & strategy" },
    "skills.cat.discovery": { fr: "Discovery & data", en: "Discovery & data" },
    "skills.cat.leadership": { fr: "Leadership", en: "Leadership" },
    "skills.cat.delivery": { fr: "Delivery", en: "Delivery" },
    "skills.cat.tech": { fr: "Technique", en: "Technical" },
    "skills.cat.everydayTools": { fr: "Outils du quotidien", en: "Everyday tools" },

    "experiences.sectionTitle": { fr: "Expériences", en: "Experience" },
    "experiences.total": { fr: "Total", en: "Total" },
    "experiences.today": { fr: "Aujourd'hui", en: "Present" },
    "experiences.achievements": { fr: "Accomplissements", en: "Key achievements" },
    "experiences.methodology": { fr: "Méthodologie", en: "Methodology" },
    "experiences.team": { fr: "Équipe", en: "Team" },
    "experiences.showEarly": { fr: "Voir mes débuts ({range}) →", en: "See my early career ({range}) →" },
    "experiences.lessThanMonth": { fr: "< 1 mois", en: "< 1 month" },
    "experiences.year": { fr: "an", en: "year" },
    "experiences.years": { fr: "ans", en: "years" },
    "experiences.month": { fr: "mois", en: "month" },
    "experiences.months": { fr: "mois", en: "months" },

    "formation.sectionTitle": { fr: "Formation, langues & certifications", en: "Education, languages & certifications" },
    "formation.education": { fr: "Éducation", en: "Education" },
    "formation.trainings": { fr: "Formations continues", en: "Continuing education" },
    "formation.languages": { fr: "Langues", en: "Languages" },
    "formation.certifications": { fr: "Certifications", en: "Certifications" },

    "fit.badge": { fr: "IA", en: "AI" },
    "fit.sectionTitle": { fr: "Recruteur·se ? Vérifiez le fit en 10 secondes", en: "Hiring? Check the fit in 10 seconds" },
    "fit.intro": {
      fr: "Collez votre offre d'emploi ci-dessous. Une IA (Gemini) compare mon profil à votre besoin et vous donne un score de compatibilité argumenté — points forts, points de vigilance, et une question d'entretien suggérée.",
      en: "Paste your job posting below. An AI (Gemini) compares my profile to your needs and gives you a reasoned compatibility score — strengths, gaps, and a suggested interview question.",
    },
    "fit.placeholder": {
      fr: "Collez ici le texte de l'offre d'emploi (intitulé, missions, compétences recherchées...)",
      en: "Paste the job posting text here (title, responsibilities, required skills...)",
    },
    "fit.label": { fr: "Texte de l'offre d'emploi", en: "Job posting text" },
    "fit.resultLabel": { fr: "Résultat de l'analyse", en: "Analysis result" },
    "fit.scoreAria": { fr: "Score de compatibilité : {score} sur 100", en: "Compatibility score: {score} out of 100" },
    "fit.resultReady": { fr: "Analyse terminée : score de compatibilité {score} sur 100.", en: "Analysis complete: compatibility score {score} out of 100." },
    "fit.analyzeBtn": { fr: "Analyser le fit", en: "Analyze fit" },
    "fit.analyzing": { fr: "Analyse en cours...", en: "Analyzing..." },
    "fit.errNoPosting": { fr: "Collez d'abord le texte de l'offre d'emploi.", en: "Paste the job posting text first." },
    "fit.errNotConfigured": {
      fr: "Le Fit-Checker n'est pas encore configuré (voir README.md, section Gemini/Supabase).",
      en: "The Fit Checker isn't configured yet (see README.md, Gemini/Supabase section).",
    },
    "fit.errRateLimited": {
      fr: "Trop de tentatives depuis cet appareil. Réessayez dans une minute.",
      en: "Too many attempts from this device. Try again in a minute.",
    },
    // Panne, réseau coupé, réponse illisible : un seul message, suivi de
    // l'adresse e-mail en lien (ajoutée en JS). Jamais de détail technique.
    "fit.errUnavailable": {
      fr: "Le Fit-Checker est momentanément indisponible. Écrivez-moi directement : ",
      en: "The Fit Checker is temporarily unavailable. Reach me directly: ",
    },
    "fit.errTimeout": {
      fr: "L'analyse prend trop de temps. Réessayez dans un instant.",
      en: "The analysis is taking too long. Try again in a moment.",
    },
    "fit.errEmpty": {
      fr: "L'analyse n'a rien donné d'exploitable. Réessayez, ou collez une offre plus complète.",
      en: "The analysis returned nothing usable. Try again, or paste a fuller job posting.",
    },
    // Ligne envoyée à l'IA dans le contexte du CV : le Fit-Checker est
    // lui-même une réalisation à faire valoir quand une offre demande de l'IA.
    "fit.selfDescription": {
      fr: "le Fit-Checker de ce site, fonctionnalité IA conçue et déployée par Antoine (fonction serveur Supabase + API Gemini, repli automatique entre plusieurs modèles, limitation de débit, aucune clé exposée côté navigateur).",
      en: "this site's Fit Checker, an AI feature Antoine designed and shipped himself (Supabase edge function + Gemini API, automatic fallback across several models, rate limiting, no key exposed to the browser).",
    },
    "fit.loading1": { fr: "Lecture de l'offre d'emploi...", en: "Reading the job posting..." },
    "fit.loading2": { fr: "Comparaison avec mon profil...", en: "Comparing with my profile..." },
    "fit.loading3": { fr: "Calcul du score de compatibilité...", en: "Calculating the compatibility score..." },
    "fit.loading4": { fr: "Finalisation de l'analyse...", en: "Finalizing the analysis..." },
    "fit.loading5": { fr: "Analyse des compétences clés...", en: "Analyzing key skills..." },
    "fit.loading6": { fr: "Recherche des points de correspondance...", en: "Looking for matching points..." },
    "fit.loading7": { fr: "Rédaction des recommandations...", en: "Drafting recommendations..." },
    "fit.loading8": { fr: "Encore un instant...", en: "Just a moment more..." },
    "fit.strengths": { fr: "Points forts", en: "Strengths" },
    "fit.gaps": { fr: "Points de vigilance", en: "Areas of caution" },
    "fit.interviewQuestion": { fr: "Question d'entretien suggérée :", en: "Suggested interview question:" },
    // Appel à l'action sous le résultat du Fit-Checker + ligne de confidentialité.
    "fit.nextLead": { fr: "Envie d'en parler ?", en: "Want to talk about it?" },
    "fit.nextEmail": { fr: "M'écrire", en: "Email me" },
    "fit.nextLinkedin": { fr: "Me contacter sur LinkedIn", en: "Reach me on LinkedIn" },
    "fit.mailSubject": { fr: "À propos d'un poste (via le Fit-Checker)", en: "About a role (via the Fit-Checker)" },
    // Vrai depuis le 06/09/2026 : clé Gemini sur un compte de facturation
    // (« Paid Services » des conditions Gemini API : prompts et réponses non
    // utilisés pour améliorer les modèles). Si la clé repassait en gratuit,
    // retirer la phrase sur Google. Copie statique dans index.html.
    "fit.privacy": {
      fr: "Le texte que vous collez part vers l'API Google Gemini pour l'analyse. Google ne l'utilise pas pour améliorer ses modèles, et ce site ne l'enregistre pas.",
      en: "The text you paste is sent to the Google Gemini API for analysis. Google does not use it to improve its models, and this site does not store it.",
    },
    // Rangée d'appels à l'action en fin de page Résultats / étude de cas.
    "pageCta.contact": { fr: "Me contacter", en: "Contact me" },
    "pageCta.mailSubject": { fr: "À propos d'un poste", en: "About a role" },
    "pageCta.fit": { fr: "Tester votre poste avec le Fit-Checker →", en: "Test your role with the Fit-Checker →" },

    "fitTeaser.text": {
      fr: "Recruteur·se ? Vérifiez en 10 secondes si mon profil correspond à votre poste.",
      en: "Hiring? Check in 10 seconds if my profile fits your role.",
    },
    "fitTeaser.cta": { fr: "Essayer le Fit-Checker →", en: "Try the Fit Checker →" },

    "projects.sectionTitle": { fr: "Side projects", en: "Side projects" },
    "projects.viewLink": { fr: "Voir le projet →", en: "View project →" },
    "projects.viewCaseStudy": { fr: "Voir l'étude de cas →", en: "View case study →" },
    "projectDetail.backToCv": { fr: "← Retour au CV", en: "← Back to CV" },
    "projectDetail.viewLive": { fr: "Essayer l'outil →", en: "Try the tool →" },
    "projectDetail.theProblem": { fr: "Le problème", en: "The problem" },
    "projectDetail.whatItIs": { fr: "Ce que c'est", en: "What it is" },
    "projectDetail.process": { fr: "Démarche produit", en: "Product process" },
    "projectDetail.metrics": { fr: "Chiffres d'usage", en: "Usage numbers" },
    "projectDetail.techStack": { fr: "Stack technique", en: "Tech stack" },
    "projectDetail.stack.frontend": { fr: "Frontend", en: "Frontend" },
    "projectDetail.stack.backend": { fr: "Backend / données", en: "Backend / data" },
    "projectDetail.stack.analytics": { fr: "Analytics / tracking", en: "Analytics / tracking" },
    "projectDetail.stack.testing": { fr: "Tests / qualité", en: "Testing / quality" },
    "projectDetail.stack.seo": { fr: "SEO", en: "SEO" },
    "projectDetail.stack.ops": { fr: "Ops", en: "Ops" },
    "projectDetail.notFound": { fr: "Projet introuvable.", en: "Project not found." },
    // Suffixe du <title> d'une page d'étude de cas : "Tour de Growth — étude de cas · Antoine Berthaud, Product Manager"
    "projectDetail.metaTitleSuffix": { fr: "étude de cas · Antoine Berthaud, Product Manager", en: "case study · Antoine Berthaud, Product Manager" },

    "results.eyebrow": { fr: "Études de cas · Product Manager", en: "Case studies · Product Manager" },
    // <title> et <meta name="description"> de results.html, par langue.
    "results.metaTitle": { fr: "Études de cas Product Manager — Antoine Berthaud, Nantes", en: "Product Manager case studies — Antoine Berthaud, Nantes" },
    "results.metaDescription": {
      fr: "Le détail derrière les chiffres clés du CV d'Antoine Berthaud, Product Manager à Nantes : contexte, défi, action, résultat, leçon (AB Tasty, Everysens, SNCF Connect & Tech).",
      en: "The story behind the key numbers of Antoine Berthaud's CV, Product Manager in Nantes, France: context, challenge, action, result, lesson (AB Tasty, Everysens, SNCF Connect & Tech).",
    },
    "results.title": { fr: "Le détail derrière les chiffres", en: "The story behind the numbers" },
    "results.intro": {
      fr: "Un chiffre seul ne dit jamais tout. Voici, pour chacun des chiffres affichés en haut du CV, le contexte, le problème identifié, ce que j'ai concrètement fait, et ce que j'en retiens.",
      en: "A number alone never tells the full story. For each figure shown at the top of the CV, here's the context, the problem identified, what I actually did, and what I took away from it.",
    },
    "results.context": { fr: "Contexte", en: "Context" },
    "results.challenge": { fr: "Défi", en: "Challenge" },
    "results.action": { fr: "Action", en: "Action" },
    "results.result": { fr: "Résultat", en: "Result" },
    "results.lesson": { fr: "Leçon", en: "Lesson" },
  };

  const MONTHS = {
    fr: ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };

  // Traduction d'un texte fixe de l'UI (clé du dictionnaire UI_STRINGS ci-dessus).
  function t(key) {
    const entry = UI_STRINGS[key];
    if (!entry) return key;
    return entry[currentLang] || entry.fr || "";
  }

  // Traduction d'un champ de contenu venant de data.js : accepte soit une
  // chaîne simple (identique dans les 2 langues), soit { fr, en }.
  function tc(field) {
    if (field && typeof field === "object" && !Array.isArray(field)) {
      return field[currentLang] || field.fr || field.en || "";
    }
    return field;
  }

  // Suffixe à ajouter aux liens internes : le français est la langue par
  // défaut, servie à l'URL nue (c'est l'URL canonique), donc on n'écrit
  // ?lang=fr nulle part ; l'anglais porte ?lang=en. `sep` vaut "?" ou "&"
  // selon que l'URL a déjà un paramètre.
  function langSuffix(sep = "?") {
    return currentLang === "en" ? `${sep}lang=en` : "";
  }

  // Reflète la langue courante dans l'URL de la page (sans recharger) :
  // ?lang=en en anglais, URL nue en français. Utilisé par le bouton FR/EN
  // des trois pages, pour qu'une URL copiée partage la bonne langue.
  function syncUrl() {
    const url = new URL(window.location.href);
    if (currentLang === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }

  window.i18n = {
    get lang() {
      return currentLang;
    },
    setLang(lang) {
      currentLang = lang === "en" ? "en" : "fr";
      // Seul point d'entrée des trois pages : la langue du document suit
      // (lecteurs d'écran, moteurs), au chargement comme à la bascule.
      document.documentElement.lang = currentLang;
    },
    t,
    tc,
    langSuffix,
    syncUrl,
    months: () => MONTHS[currentLang],
  };
})();
