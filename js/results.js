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

  // Même règle que sur la page d'accueil (voir app.js) : le chemin décide,
  // /en/results.html = anglais, /results.html = français. Pas de détection de
  // la langue du navigateur — Googlebot navigue en anglais.
  function initLang() {
    window.i18n.setLang(window.i18n.pathLang());
  }

  // Un chiffre du hero pointe vers RESULT_DETAILS[id] via `resultId` — on
  // reconstruit la liste des ids dans le même ordre que HERO_STATS plutôt
  // que d'itérer RESULT_DETAILS directement, pour que l'ordre d'affichage
  // ici corresponde toujours à l'ordre des chiffres dans le hero.
  function orderedResultIds() {
    // Dédupliqué : deux chiffres du hero peuvent pointer la même étude
    // (AB Tasty porte le +15 % d'activation et le -20 % de Time-to-Value).
    const fromHero = [...new Set(HERO_STATS.map((s) => s.resultId).filter((id) => id && RESULT_DETAILS[id]))];
    // Puis les études sans chiffre du hero, dans l'ordre de RESULT_DETAILS.
    return [...fromHero, ...Object.keys(RESULT_DETAILS).filter((id) => !fromHero.includes(id))];
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
            <h2 class="result-company">${r.company}</h2>
            <div class="result-role">${tc(r.role)} · ${tc(r.period)}</div>
          </div>
        </div>
        ${r.value ? `<div class="result-value">${r.value}</div>` : ""}
        <div class="result-label">${tc(r.label)}</div>
        ${r.status ? `<p class="result-status">${richText(r.status)}</p>` : ""}

        <section class="result-star">
          <h3>${t("results.context")}</h3>
          ${richParagraphs(r.context)}
        </section>

        <section class="result-star">
          <h3>${t("results.challenge")}</h3>
          ${richParagraphs(r.challenge)}
          ${r.challengePoints ? richList(r.challengePoints) : ""}
        </section>

${
          r.hypothesis
            ? `
        <section class="result-star">
          <h3>${t("results.hypothesis")}</h3>
          ${richParagraphs(r.hypothesis)}
        </section>`
            : ""
        }${
          r.discarded
            ? `
        <section class="result-star">
          <h3>${t("results.discarded")}</h3>
          ${richParagraphs(r.discarded)}
        </section>`
            : ""
        }
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

  // results.html et en/results.html portent la page pré-rendue dans leur
  // langue (zone static:resultsRoot, générée en CI par
  // scripts/generate-static.js) : au premier rendu, on signale en console ce
  // qui ne correspond plus à i18n.js / data.js — une page pas encore
  // régénérée après un changement.
  let staticChecked = false;
  function checkStaticCopy(root) {
    if (staticChecked) return;
    staticChecked = true;
    const warn = (what, got, expected) =>
      console.warn(`[cv] Texte statique de la page différent pour « ${what} » : « ${got} » ≠ « ${expected} » — page à régénérer : node scripts/generate-static.js`);
    const txt = (sel, scope = root) => ((scope.querySelector(sel) || {}).textContent || "").trim();
    if (txt("h1") !== t("results.title")) warn("results.title", txt("h1"), t("results.title"));
    if (txt(".project-detail-tagline") !== t("results.intro")) warn("results.intro", txt(".project-detail-tagline"), t("results.intro"));
    const staticIds = [...root.querySelectorAll(".result-block")].map((el) => el.id);
    const ids = orderedResultIds();
    if (staticIds.join(",") !== ids.join(",")) warn("liste des chiffres", staticIds.join(","), ids.join(","));
    root.querySelectorAll(".result-block").forEach((el) => {
      const r = RESULT_DETAILS[el.id];
      if (!r) return;
      if (txt(".result-company", el) !== r.company) warn(`${el.id} company`, txt(".result-company", el), r.company);
      // Une étude sans chiffre (`value` absent) n'affiche pas de .result-value :
      // comparer une chaîne vide à undefined déclenchait un faux avertissement.
      if (r.value && txt(".result-value", el) !== r.value) warn(`${el.id} value`, txt(".result-value", el), r.value);
      if (txt(".result-label", el) !== tc(r.label)) warn(`${el.id} label`, txt(".result-label", el), tc(r.label));
    });
  }

  // Fin de page : la lecture des études de cas ne doit pas se terminer sur
  // le pied de page sans porte de sortie — contact, Fit-Checker, retour au CV.
  // Liens relatifs : ./ mène à l'accueil de la même langue (/ ou /en/).
  function pageCtaHtml() {
    return `
      <div class="page-cta">
        <a class="btn solid" href="mailto:${PROFILE.contact.email}?subject=${encodeURIComponent(t("pageCta.mailSubject"))}" data-goatcounter-click="contact-email">${t("pageCta.contact")}</a>
        <a class="btn" href="./#fit-checker">${t("pageCta.fit")}</a>
        <a class="btn" href="./">${t("projectDetail.backToCv")}</a>
      </div>`;
  }

  // Titre, description et aperçus de partage sont écrits dans la page, dans
  // sa langue, par le générateur : on ne réécrit que ce qui diffère d'i18n.js
  // (page pas encore régénérée), en le signalant en console.
  function setIfDifferent(label, current, expected, apply) {
    if ((current || "").trim() === (expected || "").trim()) return;
    console.warn(`[cv] Texte statique de la page différent pour « ${label} » : « ${String(current || "").trim().slice(0, 60)} » ≠ « ${String(expected || "").slice(0, 60)} » — page à régénérer : node scripts/generate-static.js`);
    apply(expected);
  }

  function render() {
    const root = document.getElementById("resultsRoot");
    const ids = orderedResultIds();
    checkStaticCopy(root);

    root.innerHTML = `
      <div class="results-hero">
        <p class="project-detail-eyebrow">${t("results.eyebrow")}</p>
        <h1>${t("results.title")}</h1>
        <p class="project-detail-tagline">${t("results.intro")}</p>
      </div>
      <div class="results-list">${ids.map(renderBlock).join("")}</div>
      ${pageCtaHtml()}
    `;

    const titleEl = document.getElementById("pageTitle");
    setIfDifferent("<title>", titleEl.textContent, t("results.metaTitle"), (v) => (titleEl.textContent = v));
    [
      ['meta[name="description"]', t("results.metaDescription")],
      ['meta[property="og:title"]', t("results.metaTitle")],
      ['meta[name="twitter:title"]', t("results.metaTitle")],
      ['meta[property="og:description"]', t("results.metaDescription")],
      ['meta[name="twitter:description"]', t("results.metaDescription")],
    ].forEach(([sel, content]) => {
      const el = document.querySelector(sel);
      if (el) setIfDifferent(sel, el.getAttribute("content"), content, (v) => el.setAttribute("content", v));
    });
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      setIfDifferent(el.dataset.i18n, el.textContent, t(el.dataset.i18n), (v) => (el.textContent = v));
    });
    // Clics comptés (data-goatcounter-click) sur les liens recréés par ce rendu.
    if (window.goatcounter && typeof window.goatcounter.bind_events === "function") window.goatcounter.bind_events();

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
    // Lien FR/EN : un vrai lien vers l'autre version (écrit par le
    // générateur) ; au clic, il emporte l'ancre courante (#ab-tasty-activation…).
    const langLink = document.getElementById("langToggle");
    langLink.addEventListener("click", () => {
      langLink.href = langLink.getAttribute("href").split("#")[0] + window.location.hash;
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
