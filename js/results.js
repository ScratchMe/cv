/**
 * results.js — génère la page "Résultats" : le détail (format STAR) derrière
 * chaque chiffre cliquable du hero (RESULT_DETAILS dans js/data.js).
 *
 * Contrairement à project-detail.js (une entrée = une page via ?slug=), cette
 * page affiche TOUTES les entrées de RESULT_DETAILS à la suite, dans l'ordre
 * de HERO_STATS. Cliquer sur un chiffre du hero amène directement au bon
 * bloc via une ancre (#resultId).
 */
(function () {
  "use strict";

  const { t, tc } = window.i18n;

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function boldify(str) {
    return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
  function richText(field) {
    return boldify(tc(field));
  }
  // Comme richText(), mais découpe le texte sur les doubles sauts de ligne
  // ("\n\n" dans data.js) pour rendre plusieurs <p> — aère les blocs de texte
  // denses sans avoir à les répartir sur plusieurs champs séparés.
  function richParagraphs(field) {
    return tc(field)
      .split(/\n\n+/)
      .map((p) => `<p>${boldify(p)}</p>`)
      .join("");
  }
  // Liste à puces à partir d'un tableau de champs traduisibles (même format
  // que tc() accepte : {fr,en} ou chaîne simple).
  function richList(items) {
    return `<ul class="detail-list">${items.map((item) => `<li>${richText(item)}</li>`).join("")}</ul>`;
  }

  // Même règle que sur la page d'accueil (voir app.js) : ?lang=en affiche
  // l'anglais, tout le reste affiche le français. Pas de détection de la
  // langue du navigateur — Googlebot navigue en anglais et indexerait sinon
  // la version anglaise à l'URL canonique.
  function initLang() {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    window.i18n.setLang(urlLang === "en" ? "en" : "fr");
  }

  // Un chiffre du hero pointe vers RESULT_DETAILS[id] via `resultId` — on
  // reconstruit la liste des ids dans le même ordre que HERO_STATS plutôt
  // que d'itérer RESULT_DETAILS directement, pour que l'ordre d'affichage
  // ici corresponde toujours à l'ordre des chiffres dans le hero.
  function orderedResultIds() {
    return HERO_STATS.map((s) => s.resultId).filter((id) => id && RESULT_DETAILS[id]);
  }

  function renderBlock(id) {
    const r = RESULT_DETAILS[id];
    const resultHtml = r.result
      ? `
      <section class="result-star">
        <h3>${t("results.result")}</h3>
        <p>${richText(r.result)}</p>
      </section>`
      : "";

    return `
      <article class="result-block" id="${id}">
        <div class="result-badge">
          <img src="${r.companyLogo}" alt="${r.company}" class="result-logo">
          <div>
            <div class="result-company">${r.company}</div>
            <div class="result-role">${r.role} · ${r.period}</div>
          </div>
        </div>
        <div class="result-value">${r.value}</div>
        <div class="result-label">${tc(r.label)}</div>

        <section class="result-star">
          <h3>${t("results.context")}</h3>
          ${richParagraphs(r.context)}
        </section>

        <section class="result-star">
          <h3>${t("results.challenge")}</h3>
          ${richParagraphs(r.challenge)}
          ${r.challengePoints ? richList(r.challengePoints) : ""}
        </section>

        <section class="result-star">
          <h3>${t("results.action")}</h3>
          ${richParagraphs(r.action)}
          ${r.actionPoints ? richList(r.actionPoints) : ""}
        </section>
        ${resultHtml}
        <section class="result-star">
          <h3>${t("results.lesson")}</h3>
          ${richParagraphs(r.lesson)}
        </section>
      </article>`;
  }

  function render() {
    const root = document.getElementById("resultsRoot");
    const ids = orderedResultIds();

    root.innerHTML = `
      <div class="results-hero">
        <p class="project-detail-eyebrow">${t("results.eyebrow")}</p>
        <h1>${t("results.title")}</h1>
        <p class="project-detail-tagline">${t("results.intro")}</p>
      </div>
      <div class="results-list">${ids.map(renderBlock).join("")}</div>
    `;

    document.getElementById("pageTitle").textContent = t("results.metaTitle");
    document.getElementById("pageDescription").setAttribute("content", t("results.metaDescription"));
    document.getElementById("backToCvLink").textContent = t("projectDetail.backToCv");
    document.getElementById("backToCvLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("logoLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("footerCvLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("langToggle").textContent = window.i18n.lang === "fr" ? "EN" : "FR";

    // Ré-applique le scroll vers l'ancre : le contenu est rendu après coup en
    // JS, donc le scroll natif du navigateur vers #resultId (s'il a eu lieu
    // avant que le DOM existe) n'a pas pu fonctionner.
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ block: "start" });
    }
  }

  function init() {
    initLang();
    document.getElementById("langToggle").addEventListener("click", () => {
      window.i18n.setLang(window.i18n.lang === "fr" ? "en" : "fr");
      render();
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
