/**
 * js/gemini.js
 *
 * ⚠️  CE FICHIER RESTE SUR TON SITE (il tourne dans le navigateur, utilise
 *     `window`) — ce n'est PAS le code à coller dans Supabase. Le code
 *     serveur (qui appelle réellement l'API Gemini avec la clé secrète) est
 *     dans supabase/functions/gemini-fit/index.ts. Ne mélange jamais les deux.
 *
 * Fit-Checker : le front-end n'appelle JAMAIS l'API Gemini directement (la
 * clé ne doit jamais apparaître dans du code exécuté côté navigateur). On
 * appelle ici une Supabase Edge Function qui, elle, détient la clé Gemini
 * côté serveur. Voir README.md pour la mise en place complète.
 */
(function () {
  "use strict";

  const { t, tc } = window.i18n;

  // Échappe tout texte venant de l'extérieur (réponse de l'IA) avant de
  // l'injecter en HTML : sans ça, une réponse contenant du HTML s'exécuterait
  // dans la page. Copie locale volontaire (voir CLAUDE.md sur les helpers
  // dupliqués) pour ne pas élargir window.__cvData à une question de sécurité.
  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cleanList = (arr) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim()) : []);

  // Construit un résumé texte du CV à partir de js/data.js, envoyé à Gemini
  // comme contexte, dans la langue actuellement affichée sur le site.
  // Les constantes de data.js (PROFILE, EXPERIENCES, EDUCATION...) sont
  // lues directement : ce sont des `const` de portée globale, chargées avant
  // ce fichier. window.__cvData ne sert que pour skillLabel/formatDuration,
  // qui vivent dans app.js. Tout champ traduisible passe par tc() (piège n°4
  // de CLAUDE.md : un {fr, en} brut s'affiche identique dans les 2 langues).
  function buildCvContext() {
    const { skillLabel, formatDuration } = window.__cvData;

    const pillarsTxt = PILLARS.map(
      (p) => `- ${p.title} : ${tc(p.subtitle)} (${p.points.map(tc).join(" ")})`
    ).join("\n");

    const expTxt = EXPERIENCES.map((c) => {
      const roles = c.roles
        .map((r) => {
          const achievements = (r.achievements || []).map(tc).join(" ");
          const metaBits = [];
          if (r.methodology) metaBits.push(`Méthodologie : ${tc(r.methodology)}`);
          if (r.team) metaBits.push(`Équipe : ${tc(r.team)}`);
          const meta = metaBits.length ? ` [${metaBits.join(" — ")}]` : "";
          return `  * ${tc(r.title)} (${r.start} → ${r.end || t("experiences.today")}, ${formatDuration(r.start, r.end)}) : ${tc(r.context)} Réalisations : ${achievements}${meta} — Compétences : ${r.skills.map(skillLabel).join(", ")}`;
        })
        .join("\n");
      return `${c.company} (${c.location}) :\n${roles}`;
    }).join("\n\n");

    // Formation, langues, certifications, side projects : sans ces blocs,
    // l'IA fabriquait des points de vigilance faux (« niveau d'anglais à
    // valider », « aucun side project ») sur des critères souvent éliminatoires.
    const educationTxt = EDUCATION.map((e) => `- ${tc(e.title)}, ${e.institution} (${tc(e.period)})`).join("\n");
    const trainingsTxt = TRAININGS.map((tr) => `- ${tc(tr.title)} — ${tr.institution} (${tc(tr.period)})`).join("\n");
    const languagesTxt = LANGUAGES.map((l) => `- ${tc(l.label)} : ${tc(l.level)}`).join("\n");
    const certificationsTxt = CERTIFICATIONS.map((c) => `- ${tc(c.title)}${c.note ? ` : ${tc(c.note)}` : ""}`).join("\n");

    let sideProjectsTxt = "";
    if (CONFIG.showSideProjects && SIDE_PROJECTS.length) {
      sideProjectsTxt = SIDE_PROJECTS.map((p) => {
        const detail = p.detailSlug && typeof PROJECT_DETAILS !== "undefined" ? PROJECT_DETAILS[p.detailSlug] : null;
        const stack = detail && detail.techStack ? Object.values(detail.techStack).flat().map(tc).join(", ") : "";
        return `- ${tc(p.title)}${p.link ? ` (${p.link})` : ""} : ${tc(p.description)}${detail && detail.process ? ` ${tc(detail.process)}` : ""}${stack ? ` — Stack : ${stack}` : ""} — Compétences : ${p.skills.map(skillLabel).join(", ")}`;
      }).join("\n");
    }

    // Le Fit-Checker lui-même est une fonctionnalité IA conçue et déployée
    // par Antoine : l'IA doit le savoir quand une offre demande de l'IA.
    const fitCheckerTxt = t("fit.selfDescription");

    // La ligne « Recherche » fait passer l'objection géographique ou de
    // niveau de « à confirmer » à « à organiser » dans l'analyse.
    const lookingForTxt = tc(PROFILE.lookingFor) ? `\nRecherche : ${tc(PROFILE.lookingFor)}` : "";

    return `Profil : ${PROFILE.firstName} ${PROFILE.lastName}, ${tc(PROFILE.role)}, ${PROFILE.location}, ${PROFILE.yearsExperience} ans d'expérience en Product Management.${lookingForTxt}

Pitch : ${tc(PROFILE.pitch)}

Principes clés :
${pillarsTxt}

Expériences :
${expTxt}

Formation :
${educationTxt}

Formations continues :
${trainingsTxt}

Langues :
${languagesTxt}

Certifications :
${certificationsTxt}
${sideProjectsTxt ? `\nSide projects :\n${sideProjectsTxt}\n` : ""}
Autre réalisation : ${fitCheckerTxt}`;
  }

  // Fait défiler un petit texte qui change toutes les ~2,2s pendant l'attente
  // (le Fit-Checker peut prendre plusieurs dizaines de secondes, surtout si
  // un repli de modèle a lieu côté serveur) — évite l'impression que rien ne
  // se passe. 8 phrases à ~2,2s = ~17,6s par cycle, pour limiter les
  // répétitions visibles sur les analyses longues.
  const LOADING_MESSAGE_KEYS = [
    "fit.loading1",
    "fit.loading2",
    "fit.loading3",
    "fit.loading4",
    "fit.loading5",
    "fit.loading6",
    "fit.loading7",
    "fit.loading8",
  ];
  let loadingInterval = null;

  // Une seule annonce pour les lecteurs d'écran (#fitAnnounce, role=status) :
  // « Analyse en cours… » au départ, le score à l'arrivée. Les messages
  // tournants de #fitLoadingStatus sont décoratifs (aria-hidden).
  function announce(text) {
    const el = document.getElementById("fitAnnounce");
    if (el) el.textContent = text;
  }

  function startLoadingMessages() {
    announce(t("fit.analyzing"));
    const statusEl = document.getElementById("fitLoadingStatus");
    if (!statusEl) return;
    let i = 0;
    statusEl.hidden = false;
    statusEl.style.opacity = 1;
    statusEl.textContent = t(LOADING_MESSAGE_KEYS[0]);
    loadingInterval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGE_KEYS.length;
      statusEl.style.opacity = 0;
      setTimeout(() => {
        statusEl.textContent = t(LOADING_MESSAGE_KEYS[i]);
        statusEl.style.opacity = 1;
      }, 220);
    }, 2200);
  }

  function stopLoadingMessages() {
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = null;
    const statusEl = document.getElementById("fitLoadingStatus");
    if (statusEl) statusEl.hidden = true;
  }

  async function analyzeFit() {
    const jobPosting = document.getElementById("jobPosting").value.trim();
    const errorEl = document.getElementById("fitError");
    const resultEl = document.getElementById("fitResult");
    const btn = document.getElementById("analyzeBtn");
    errorEl.hidden = true;

    if (!jobPosting) {
      errorEl.hidden = false;
      errorEl.textContent = t("fit.errNoPosting");
      return;
    }
    if (!CONFIG.supabaseFunctionUrl) {
      errorEl.hidden = false;
      errorEl.textContent = t("fit.errNotConfigured");
      return;
    }

    btn.disabled = true;
    btn.textContent = t("fit.analyzing");
    resultEl.hidden = true;
    startLoadingMessages();

    try {
      const res = await fetch(CONFIG.supabaseFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CONFIG.supabaseAnonKey ? { Authorization: `Bearer ${CONFIG.supabaseAnonKey}` } : {}),
        },
        body: JSON.stringify({
          cvContext: buildCvContext(),
          jobPosting,
          lang: window.i18n.lang, // "fr" ou "en" — la fonction Supabase demandera à Gemini de répondre dans cette langue
        }),
        // Délai maximal : 90 s et pas moins, le repli multi-modèles côté
        // serveur peut enchaîner plusieurs tentatives de plusieurs secondes.
        signal: AbortSignal.timeout(90000),
      });

      if (res.status === 429) throw new Error(t("fit.errRateLimited"), { cause: "rate-limited" });
      if (!res.ok) {
        // Le détail (message serveur, code HTTP) va en console, jamais à
        // l'écran : un recruteur n'a rien à faire d'un « 503 » ou d'un
        // message technique en français au milieu de la version anglaise.
        let detail = "";
        try {
          detail = (await res.json()).error || "";
        } catch (_e) {
          // corps non JSON : rien à lire
        }
        console.error("Fit-Checker : réponse serveur", res.status, detail);
        throw new Error(`HTTP ${res.status}`, { cause: "unavailable" });
      }
      const data = await res.json();
      if (!hasUsableResult(data)) throw new Error("Réponse vide", { cause: "empty" });

      // On coupe le message de chargement AVANT de rendre et de scroller :
      // sinon la mise en page bouge de ~32 px après le calcul du scroll et le
      // score se retrouve caché sous le header sticky.
      stopLoadingMessages();
      renderResult(data);

      // Le résultat apparaît sous le bouton : sur un écran pas trop grand
      // (ou si la fenêtre a scrollé pendant l'attente), il peut facilement
      // passer sous le pli sans qu'on s'en rende compte. On y amène l'œil.
      resultEl.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      // Le focus suit le résultat (tabindex=-1 dans index.html) : clavier et
      // lecteur d'écran arrivent sur le score au lieu de rester sur le bouton.
      resultEl.focus({ preventScroll: true });

      // Analytics respectueux de la vie privée : compte les analyses
      // réussies (pas les visites, déjà comptées automatiquement par le
      // script GoatCounter chargé dans <head>).
      countEvent("fit-checker-used", "Fit-Checker used");
    } catch (err) {
      console.error("Fit-Checker :", err);
      countEvent(err.cause === "rate-limited" ? "fit-checker-rate-limited" : "fit-checker-error", "Fit-Checker error");
      announce("");
      errorEl.hidden = false;
      if (err.cause === "rate-limited") {
        errorEl.textContent = err.message;
      } else if (err.cause === "empty") {
        errorEl.textContent = t("fit.errEmpty");
      } else if (err.name === "TimeoutError") {
        errorEl.textContent = t("fit.errTimeout");
      } else {
        // Réseau coupé, serveur en panne, réponse illisible : un seul
        // message, bilingue, avec une porte de sortie (l'e-mail) — jamais
        // err.message, qui vient du navigateur ou du serveur.
        errorEl.textContent = t("fit.errUnavailable");
        const a = document.createElement("a");
        a.href = `mailto:${PROFILE.contact.email}`;
        a.textContent = PROFILE.contact.email;
        errorEl.appendChild(a);
      }
    } finally {
      stopLoadingMessages();
      btn.disabled = false;
      btn.textContent = t("fit.analyzeBtn");
    }
  }

  // Les labels de structure (Points forts / Strengths...) portent un
  // data-i18n : ils se retraduisent automatiquement si la langue change
  // après coup (voir applyStaticTranslations() dans app.js). Le contenu
  // renvoyé par Gemini, lui, reste dans la langue demandée au moment de l'appel.
  // Vrai si la réponse contient au moins un score exploitable : sans ça, une
  // réponse vide ({}) s'affichait comme un score 0/100 avec des colonnes
  // vides, ce qui ressemblait à un verdict.
  function hasUsableResult(data) {
    return !!data && typeof data === "object" && Number.isFinite(Number(data.score));
  }

  function renderResult(data) {
    const resultEl = document.getElementById("fitResult");
    const score = Math.round(Math.max(0, Math.min(100, Number(data.score))));
    const explanation = typeof data.explanation === "string" ? data.explanation : "";
    const question = typeof data.interviewQuestion === "string" ? data.interviewQuestion : "";

    resultEl.innerHTML = `
      <div class="fit-score-row">
        <div class="fit-score" style="--pct:${score}"><span>${score}</span></div>
        <p class="fit-explanation">${esc(explanation)}</p>
      </div>
      <div class="fit-columns">
        <div>
          <h4 data-i18n="fit.strengths">${t("fit.strengths")}</h4>
          <ul>${cleanList(data.strengths).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        </div>
        <div class="gaps">
          <h4 data-i18n="fit.gaps">${t("fit.gaps")}</h4>
          <ul>${cleanList(data.gaps).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
        </div>
      </div>
      ${
        question
          ? `<div class="fit-question"><b data-i18n="fit.interviewQuestion">${t("fit.interviewQuestion")}</b> ${esc(question)}</div>`
          : ""
      }
    `;
    resultEl.hidden = false;
    announce(t("fit.resultReady").replace("{score}", String(score)));
  }

  const reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Événement GoatCounter (voir README §8). Ne fait rien si count.js n'est
  // pas chargé (bloqueur de pub, hors-ligne) ou si les visites sont exclues.
  function countEvent(path, title) {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path, title, event: true });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("analyzeBtn");
    if (btn) btn.addEventListener("click", analyzeFit);
  });
})();
