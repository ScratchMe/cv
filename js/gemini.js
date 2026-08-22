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

  // Construit un résumé texte du CV à partir de js/data.js, envoyé à Gemini
  // comme contexte, dans la langue actuellement affichée sur le site.
  function buildCvContext() {
    const { PROFILE, PILLARS, EXPERIENCES, skillLabel, formatDuration } = window.__cvData;

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

    return `Profil : ${PROFILE.firstName} ${PROFILE.lastName}, ${PROFILE.age} ans, ${tc(PROFILE.role)}, ${PROFILE.location}, ${PROFILE.yearsExperience} ans d'expérience en Product Management.

Pitch : ${tc(PROFILE.pitch)}

Principes clés :
${pillarsTxt}

Expériences :
${expTxt}`;
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

  function startLoadingMessages() {
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
      });

      if (res.status === 429) throw new Error(t("fit.errRateLimited"), { cause: "rate-limited" });
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data = await res.json();
      renderResult(data);

      // Le résultat apparaît sous le bouton : sur un écran pas trop grand
      // (ou si la fenêtre a scrollé pendant l'attente), il peut facilement
      // passer sous le pli sans qu'on s'en rende compte. On y amène l'œil.
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });

      // Analytics respectueux de la vie privée : compte les analyses
      // réussies (pas les visites, déjà comptées automatiquement par le
      // script GoatCounter chargé dans <head>). Ne fait rien si GoatCounter
      // n'est pas configuré ou bloqué par un bloqueur de pub.
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "fit-checker-used", title: "Fit-Checker used", event: true });
      }
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = err.cause === "rate-limited" ? err.message : t("fit.errFailed") + err.message;
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
  function renderResult(data) {
    const resultEl = document.getElementById("fitResult");
    const score = Math.max(0, Math.min(100, Number(data.score) || 0));

    resultEl.innerHTML = `
      <div class="fit-score-row">
        <div class="fit-score" style="--pct:${score}"><span>${score}</span></div>
        <p class="fit-explanation">${data.explanation || ""}</p>
      </div>
      <div class="fit-columns">
        <div>
          <h4 data-i18n="fit.strengths">${t("fit.strengths")}</h4>
          <ul>${(data.strengths || []).map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="gaps">
          <h4 data-i18n="fit.gaps">${t("fit.gaps")}</h4>
          <ul>${(data.gaps || []).map((g) => `<li>${g}</li>`).join("")}</ul>
        </div>
      </div>
      ${
        data.interviewQuestion
          ? `<div class="fit-question"><b data-i18n="fit.interviewQuestion">${t("fit.interviewQuestion")}</b> ${data.interviewQuestion}</div>`
          : ""
      }
    `;
    resultEl.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("analyzeBtn");
    if (btn) btn.addEventListener("click", analyzeFit);
  });
})();
