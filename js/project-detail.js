/**
 * project-detail.js — rend la page d'un side project (étude de cas) à partir
 * de PROJECT_DETAILS (js/data.js).
 *
 * Pages statiques depuis septembre 2026 : /projets/<slug>.html (français) et
 * /en/projects/<slug>.html (anglais), générées par scripts/generate-static.js
 * à partir de scripts/templates/project.html. Le slug est lu sur la page
 * elle-même (<body data-slug="…">, posé par le générateur), la langue dans le
 * chemin. Le script re-rend par-dessus le pré-rendu (même HTML).
 *
 * project-detail.html n'est plus qu'une ancienne adresse : son <head> redirige
 * les slugs connus vers la page statique ; sans slug connu (pas de
 * data-slug), ce script y affiche « Projet introuvable » en noindex.
 *
 * Pour ajouter un nouveau side project avec sa page de détail :
 *   1. Ajoute une entrée dans PROJECT_DETAILS (js/data.js)
 *   2. Référence-la via `detailSlug` dans l'entrée SIDE_PROJECTS correspondante
 *   3. Relance le générateur (la CI le fait au push) — ce fichier n'a rien à changer.
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

  // Pages projet : le chemin décide (/en/projects/… = anglais). Ancienne
  // adresse project-detail.html (slug inconnu) : l'ancien paramètre ?lang=en
  // choisit encore la langue du message « introuvable ». Jamais le navigateur.
  const pageSlug = document.body.dataset.slug || null;
  function initLang() {
    const legacyEn = !pageSlug && new URLSearchParams(window.location.search).get("lang") === "en";
    window.i18n.setLang(legacyEn ? "en" : window.i18n.pathLang());
  }

  // Accueil et études de cas dans la langue de la page.
  function homeUrl() {
    return window.i18n.lang === "en" ? "/en/" : "/";
  }

  // Sans slug valide, la page affiche "Projet introuvable" : on demande aux
  // moteurs de ne pas l'indexer (posé ici, jamais dans le HTML brut de
  // project-detail.html, qui doit rester lisible pour que Google suive la
  // redirection des slugs connus).
  function setNoIndex(on) {
    let meta = document.querySelector('meta[name="robots"]');
    if (on && !meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex";
      document.head.appendChild(meta);
    } else if (!on && meta) {
      meta.remove();
    }
  }

  // Titre, description et aperçus de partage sont écrits dans la page, dans
  // sa langue, par le générateur : on ne réécrit que ce qui diffère des
  // sources (page pas encore régénérée), en le signalant en console.
  function setIfDifferent(label, current, expected, apply) {
    if ((current || "").trim() === (expected || "").trim()) return;
    console.warn(`[cv] Texte statique de la page différent pour « ${label} » : « ${String(current || "").trim().slice(0, 60)} » ≠ « ${String(expected || "").slice(0, 60)} » — page à régénérer : node scripts/generate-static.js`);
    apply(expected);
  }

  function renderNotFound(root) {
    setNoIndex(true);
    document.title = `${t("projectDetail.notFound")} — Antoine Berthaud`;
    root.innerHTML = `
      <div class="project-detail-notfound">
        <p>${t("projectDetail.notFound")}</p>
        <a href="${homeUrl()}" class="btn solid">${t("projectDetail.backToCv")}</a>
      </div>`;
    // Ancienne adresse en anglais : textes fixes de la coquille traduits
    // (pas un défaut de génération, pas d'avertissement).
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("#backToCvLink, #logoLink, #footerCvLink").forEach((a) => (a.href = homeUrl()));
  }

  function renderProject(root, project, slug) {
    setNoIndex(false);
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
        : `<p class="project-metrics-fallback">${tc(project.metricsFallback || "")}</p>`;

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
        <a href="${project.liveUrl}" target="_blank" rel="noopener" class="btn solid" data-goatcounter-click="project-${slug}">${t("projectDetail.viewLive")}</a>
      </div>

      <section class="project-detail-section">
        <h2>${t("projectDetail.theProblem")}</h2>
        ${richParagraphs(project.problem)}
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.whatItIs")}</h2>
        ${richParagraphs(project.whatItIs)}
        ${project.whatItIsPoints ? richList(project.whatItIsPoints) : ""}
        ${project.whatItIsClosing ? richParagraphs(project.whatItIsClosing) : ""}
      </section>

      ${
        project.teachingMoment
          ? `<section class="project-detail-section project-teaching-moment">
        <h2>${tc(project.teachingMoment.title)}</h2>
        ${richParagraphs(project.teachingMoment.body)}
      </section>`
          : ""
      }

      <section class="project-detail-section">
        <h2>${t("projectDetail.process")}</h2>
        ${richParagraphs(project.process)}
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.metrics")}</h2>
        ${metricsHtml}
      </section>

      <section class="project-detail-section">
        <h2>${t("projectDetail.techStack")}</h2>
        <div class="project-stack-groups">${techStackHtml}</div>
      </section>
      <div class="page-cta">
        <a class="btn solid" href="mailto:${PROFILE.contact.email}?subject=${encodeURIComponent(t("pageCta.mailSubject"))}" data-goatcounter-click="contact-email">${t("pageCta.contact")}</a>
        <a class="btn" href="${homeUrl()}#fit-checker">${t("pageCta.fit")}</a>
        <a class="btn" href="${homeUrl()}">${t("projectDetail.backToCv")}</a>
      </div>
    `;

    const pageTitle = `${project.title} — ${t("projectDetail.metaTitleSuffix")}`;
    const description = tc(project.metaDescription || project.tagline);
    setIfDifferent("<title>", document.title, pageTitle, (v) => (document.title = v));
    [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', pageTitle],
      ['meta[name="twitter:title"]', pageTitle],
      ['meta[property="og:description"]', description],
      ['meta[name="twitter:description"]', description],
    ].forEach(([sel, content]) => {
      const el = document.querySelector(sel);
      if (el) setIfDifferent(sel, el.getAttribute("content"), content, (v) => el.setAttribute("content", v));
    });
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      setIfDifferent(el.dataset.i18n, el.textContent, t(el.dataset.i18n), (v) => (el.textContent = v));
    });
  }

  function render() {
    const root = document.getElementById("projectDetailRoot");
    const project = pageSlug && typeof PROJECT_DETAILS !== "undefined" ? PROJECT_DETAILS[pageSlug] : null;
    if (project) renderProject(root, project, pageSlug);
    else renderNotFound(root);
    // Clics comptés (data-goatcounter-click) sur les liens que ce rendu
    // vient de recréer — même logique que bindAnalytics() dans app.js.
    if (window.goatcounter && typeof window.goatcounter.bind_events === "function") window.goatcounter.bind_events();
  }

  function init() {
    initLang();
    // Lien FR/EN (pages projet) : un vrai lien vers l'autre version, écrit
    // par le générateur ; au clic, il emporte l'ancre courante.
    const langLink = document.getElementById("langToggle");
    if (langLink) {
      langLink.addEventListener("click", () => {
        langLink.href = langLink.getAttribute("href").split("#")[0] + window.location.hash;
      });
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
