/**
 * project-detail.js — lit ?slug= dans l'URL, cherche l'entrée correspondante
 * dans PROJECT_DETAILS (js/data.js), et génère la page.
 *
 * Pour ajouter un nouveau side project avec sa page de détail :
 *   1. Ajoute une entrée dans PROJECT_DETAILS (js/data.js)
 *   2. Référence-la via `detailSlug` dans l'entrée SIDE_PROJECTS correspondante
 *   3. C'est tout — ce fichier n'a rien à changer.
 */
(function () {
  "use strict";

  const { t, tc } = window.i18n;

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function richText(field) {
    return escapeHtml(tc(field)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function initLang() {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang === "en" || urlLang === "fr") {
      window.i18n.setLang(urlLang);
      return;
    }
    const browserLang = (navigator.language || navigator.userLanguage || "fr").toLowerCase();
    window.i18n.setLang(browserLang.startsWith("fr") ? "fr" : "en");
  }

  function renderNotFound(root) {
    root.innerHTML = `
      <div class="project-detail-notfound">
        <p>${t("projectDetail.notFound")}</p>
        <a href="index.html" class="btn solid">${t("projectDetail.backToCv")}</a>
      </div>`;
  }

  function renderProject(root, project) {
    const metricsHtml =
      project.metrics && project.metrics.length > 0
        ? `<div class="project-metrics-grid">${project.metrics
            .map(
              (m) => `
            <div class="project-metric">
              <div class="project-metric-value">${m.value}</div>
              <div class="project-metric-label">${tc(m.label)}</div>
            </div>`
            )
            .join("")}</div>`
        : `<p class="project-metrics-fallback">${tc(project.metricsFallback)}</p>`;

    const stackCategories = ["frontend", "backend", "analytics", "testing", "seo", "ops"];
    const techStackHtml = stackCategories
      .filter((cat) => project.techStack[cat] && project.techStack[cat].length)
      .map(
        (cat) => `
        <div class="project-stack-group">
          <h3>${t("projectDetail.stack." + cat)}</h3>
          <div class="project-stack-tags">${project.techStack[cat].map((item) => `<span>${tc(item)}</span>`).join("")}</div>
        </div>`
      )
      .join("");

    root.innerHTML = `
      <div class="project-detail-hero">
        <p class="project-detail-eyebrow">${t("nav.projects")}</p>
        <h1>${project.title}</h1>
        <p class="project-detail-tagline">${tc(project.tagline)}</p>
        <a href="${project.liveUrl}" target="_blank" rel="noopener" class="btn solid">${t("projectDetail.viewLive")}</a>
      </div>

      <section class="project-detail-section">
        <h2>${t("projectDetail.theProblem")}</h2>
        <p>${richText(project.problem)}</p>
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.whatItIs")}</h2>
        <p>${richText(project.whatItIs)}</p>
      </section>

      <section class="project-detail-section project-teaching-moment">
        <h2>${tc(project.teachingMoment.title)}</h2>
        <p>${richText(project.teachingMoment.body)}</p>
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.process")}</h2>
        <p>${richText(project.process)}</p>
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.metrics")}</h2>
        ${metricsHtml}
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.techStack")}</h2>
        <div class="project-stack-groups">${techStackHtml}</div>
      </section>
    `;

    document.getElementById("pageTitle").textContent = `${project.title} — Antoine Berthaud`;
    document.getElementById("pageDescription").setAttribute("content", tc(project.tagline));
  }

  // Rendu (ré-appelé à chaque changement de langue) — ne touche jamais à la
  // langue elle-même, seulement au DOM. `initLang()` ne doit tourner qu'une
  // fois au chargement : sinon, comme elle relit `?lang=` dans l'URL (qui ne
  // change pas quand on clique sur le bouton), le clic sur langToggle serait
  // aussitôt annulé par le prochain appel à `render()`.
  function render() {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const root = document.getElementById("projectDetailRoot");
    const project = slug && typeof PROJECT_DETAILS !== "undefined" ? PROJECT_DETAILS[slug] : null;

    if (!project) {
      renderNotFound(root);
    } else {
      renderProject(root, project);
    }

    document.getElementById("backToCvLink").textContent = t("projectDetail.backToCv");
    document.getElementById("backToCvLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("logoLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("footerCvLink").href = `index.html?lang=${window.i18n.lang}`;
    document.getElementById("langToggle").textContent = window.i18n.lang === "fr" ? "EN" : "FR";
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
