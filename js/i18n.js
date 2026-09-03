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
    "nav.formation": { fr: "Formation", en: "Education" },
    "nav.fit": { fr: "Fit-Checker", en: "Fit Checker" },
    "nav.projects": { fr: "Side projects", en: "Side projects" },

    "nav.focusToggle": { fr: "Focus lecture", en: "Focus mode" },
    "nav.printBtn": { fr: "Télécharger PDF", en: "Download PDF" },
    "nav.langToggleLabel": { fr: "Switch to English", en: "Passer en français" },

    "hero.ctaExperience": { fr: "Voir les expériences", en: "View my experience" },
    "hero.ctaContact": { fr: "Me contacter", en: "Contact me" },
    "hero.pillYears": { fr: "ans en Product", en: "years in Product" },
    "hero.pillAge": { fr: "ans", en: "y/o" },

    "pillars.sectionTitle": { fr: "Ce qui me définit", en: "What defines me" },

    "testimonial.eyebrow": { fr: "Recommandation LinkedIn", en: "LinkedIn recommendation" },

    "skills.sectionTitle": { fr: "Compétences & outils", en: "Skills & tools" },
    "skills.hint": {
      fr: "Clique sur une ou plusieurs compétences pour filtrer les expériences correspondantes ci-dessous.",
      en: "Click one or more skills to filter the matching experience below.",
    },
    "skills.clearFilters": { fr: "Réinitialiser les filtres ✕", en: "Clear filters ✕" },
    "skills.cat.Produit": { fr: "Produit", en: "Product" },
    "skills.cat.Méthode": { fr: "Méthode", en: "Method" },
    "skills.cat.Data": { fr: "Data", en: "Data" },
    "skills.cat.Outils": { fr: "Outils", en: "Tools" },

    "experiences.sectionTitle": { fr: "Expériences", en: "Experience" },
    "experiences.total": { fr: "Total", en: "Total" },
    "experiences.today": { fr: "Aujourd'hui", en: "Present" },
    "experiences.achievements": { fr: "Accomplissements", en: "Key achievements" },
    "experiences.methodology": { fr: "Méthodologie", en: "Methodology" },
    "experiences.team": { fr: "Équipe", en: "Team" },
    "experiences.filterStatusPrefix": { fr: "Filtré par : ", en: "Filtered by: " },
    "experiences.filterStatusSuffix": { fr: "expérience(s) correspondante(s).", en: "matching experience(s)." },
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
    "fit.analyzeBtn": { fr: "Analyser le fit", en: "Analyze fit" },
    "fit.analyzing": { fr: "Analyse en cours...", en: "Analyzing..." },
    "fit.errNoPosting": { fr: "Collez d'abord le texte de l'offre d'emploi.", en: "Paste the job posting text first." },
    "fit.errNotConfigured": {
      fr: "Le Fit-Checker n'est pas encore configuré (voir README.md, section Gemini/Supabase).",
      en: "The Fit Checker isn't configured yet (see README.md, Gemini/Supabase section).",
    },
    "fit.errFailed": { fr: "L'analyse a échoué : ", en: "Analysis failed: " },
    "fit.errRateLimited": {
      fr: "Trop de tentatives depuis cet appareil. Réessayez dans une minute.",
      en: "Too many attempts from this device. Try again in a minute.",
    },
    "fit.loading1": { fr: "Lecture de l'offre d'emploi...", en: "Reading the job posting..." },
    "fit.loading2": { fr: "Comparaison avec mon profil...", en: "Comparing with my profile..." },
    "fit.loading3": { fr: "Calcul du score de compatibilité...", en: "Calculating the compatibility score..." },
    "fit.loading4": { fr: "Finalisation de l'analyse...", en: "Finalizing the analysis..." },
    "fit.strengths": { fr: "Points forts", en: "Strengths" },
    "fit.gaps": { fr: "Points de vigilance", en: "Areas of caution" },
    "fit.interviewQuestion": { fr: "Question d'entretien suggérée :", en: "Suggested interview question:" },

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
    "projectDetail.mechanisms": { fr: "Mécanismes de croissance mis en place", en: "Growth mechanisms implemented" },
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

  window.i18n = {
    get lang() {
      return currentLang;
    },
    setLang(lang) {
      currentLang = lang === "en" ? "en" : "fr";
    },
    t,
    tc,
    months: () => MONTHS[currentLang],
  };
})();
