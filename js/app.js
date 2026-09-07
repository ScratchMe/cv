/**
 * app.js — lit js/data.js et génère tout le contenu du site.
 * Tu n'as normalement rien à modifier ici : édite js/data.js à la place.
 * (La bascule FR/EN est gérée avec js/i18n.js.)
 */
(function () {
  "use strict";

  const { t, tc } = window.i18n;

  // Échappe le HTML puis convertit une syntaxe **gras** très simple en <strong>.
  // Utilisé pour tout texte narratif (pitch, contexte, accomplissements) afin
  // de pouvoir mettre en avant des mots/chiffres directement depuis data.js,
  // ex: "**+15% d'activation**" → <strong>+15% d'activation</strong>.
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function richText(field) {
    return escapeHtml(tc(field)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  // --------------------------------------------------------------------
  // Utilitaires de dates / durées
  // --------------------------------------------------------------------
  function parseYM(str) {
    const [y, m] = str.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }

  function monthsBetween(startStr, endStr) {
    const start = parseYM(startStr);
    const end = endStr ? parseYM(endStr) : new Date();
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(months, 1);
  }

  function formatDuration(startStr, endStr) {
    const months = monthsBetween(startStr, endStr);
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} ${years > 1 ? t("experiences.years") : t("experiences.year")}`);
    if (rem > 0) parts.push(`${rem} ${rem > 1 ? t("experiences.months") : t("experiences.month")}`);
    return parts.join(" ") || t("experiences.lessThanMonth");
  }

  function formatDateLabel(str) {
    if (!str) return t("experiences.today");
    const [y, m] = str.split("-").map(Number);
    return `${window.i18n.months()[m - 1]} ${y}`;
  }

  function companyTotalDuration(roles) {
    const earliestStart = roles.reduce((min, r) => (parseYM(r.start) < parseYM(min) ? r.start : min), roles[0].start);
    const hasOngoing = roles.some((r) => !r.end);
    const latestEnd = hasOngoing
      ? null
      : roles.reduce((max, r) => (parseYM(r.end) > parseYM(max) ? r.end : max), roles[0].end);
    return formatDuration(earliestStart, latestEnd);
  }

  // --------------------------------------------------------------------
  // État des filtres compétences
  // --------------------------------------------------------------------
  // Débuts (rôles anciens, cf. CONFIG.collapseRolesEndingBefore) dépliés à la
  // main ; un filtre actif les déplie aussi, sans toucher à ce choix.
  let earlyExpanded = false;

  // Pitch FR pré-rendu dans index.html (#heroPitch), capturé au premier rendu
  // pour vérifier qu'il ne dérive pas de data.js (page pas régénérée).
  let staticPitchHtml = null;
  let staticI18nChecked = false;

  // --------------------------------------------------------------------
  // 1. HERO
  // --------------------------------------------------------------------
  function renderHero() {
    document.getElementById("heroName").textContent = `${PROFILE.firstName} ${PROFILE.lastName}`;
    document.getElementById("heroRole").textContent = tc(PROFILE.role);

    // index.html porte le pitch FR pré-rendu (zone static:heroPitch, générée
    // en CI par scripts/generate-static.js). Au premier rendu on garde cette
    // copie, et on prévient dans la console si elle diverge de PROFILE.pitch.fr :
    // ça signale une page pas encore régénérée après un changement de data.js.
    const pitchEl = document.getElementById("heroPitch");
    if (staticPitchHtml === null) staticPitchHtml = pitchEl.innerHTML.trim();
    pitchEl.innerHTML = richText(PROFILE.pitch);
    if (window.i18n.lang === "fr" && staticPitchHtml && staticPitchHtml !== pitchEl.innerHTML) {
      console.warn("[cv] Le pitch statique de index.html (#heroPitch) diffère de PROFILE.pitch.fr (js/data.js) — pense à le resynchroniser.");
    }

    const statsEl = document.getElementById("heroStats");
    if (!HERO_STATS || HERO_STATS.length === 0) {
      if (statsEl) statsEl.remove();
    } else if (statsEl) {
      statsEl.innerHTML = HERO_STATS.map((s) => {
        const inner = `
          <div class="hero-stat-value">${s.value}</div>
          <div class="hero-stat-label">${tc(s.label)}</div>`;
        return s.resultId
          ? `<a class="hero-stat is-linked" href="results.html${window.i18n.langSuffix()}#${s.resultId}" data-goatcounter-click="hero-stat-${s.resultId}">${inner}</a>`
          : `<div class="hero-stat">${inner}</div>`;
      }).join("");

      // Lien texte vers la page Résultats sous les chiffres : sur téléphone,
      // rien ne disait que les chiffres étaient cliquables, et results.html
      // n'était liée nulle part ailleurs.
      // Études DISTINCTES : deux chiffres peuvent pointer la même étude.
      const linkedCount = new Set(HERO_STATS.filter((s) => s.resultId && RESULT_DETAILS[s.resultId]).map((s) => s.resultId)).size;
      const existing = document.getElementById("heroStatsLink");
      if (existing) existing.remove();
      if (linkedCount > 0) {
        statsEl.insertAdjacentHTML(
          "afterend",
          `<a class="hero-stats-link" id="heroStatsLink" href="results.html${window.i18n.langSuffix()}" data-goatcounter-click="hero-stats-link">${t("hero.seeCaseStudies").replace("{n}", linkedCount)}</a>`
        );
      }
    }

    const pillsEl = document.getElementById("heroPills");
    pillsEl.innerHTML = "";
    // Pas d'âge dans les pastilles (ni ailleurs) : inutile pour juger un
    // profil, et c'est un critère de discrimination à l'embauche — autant ne
    // pas le mettre sous les yeux d'un recruteur.
    // L'émoji est décoratif : hors du nom accessible (aria-hidden), sinon un
    // lecteur d'écran lit « épingle ronde Nantes, France ».
    [
      ["📍", PROFILE.location],
      ["🚀", `${PROFILE.yearsDigital} ${t("hero.pillYearsDigital")} · ${PROFILE.yearsExperience} ${t("hero.pillYears")}`],
      // Pastille « ce que je cherche » : seulement si le champ est renseigné.
      ...(tc(PROFILE.lookingFor) ? [["🎯", tc(PROFILE.lookingFor)]] : []),
    ].forEach(([emoji, text]) => {
      const span = document.createElement("span");
      span.className = "pill";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = emoji;
      span.append(icon, ` ${text}`);
      pillsEl.appendChild(span);
    });

    const photoEl = document.getElementById("heroPhoto");
    if (PROFILE.photo) {
      // index.html porte déjà l'<img> (en dur, pour les robots sans JS) :
      // on met à jour src/alt plutôt que de recréer l'image.
      const img = photoEl.querySelector("img") || photoEl.appendChild(document.createElement("img"));
      if (img.getAttribute("src") !== PROFILE.photo) img.src = PROFILE.photo;
      img.alt = t("hero.photoAlt");
      photoEl.querySelectorAll(":scope > :not(img)").forEach((el) => el.remove());
    } else {
      const initials = (PROFILE.firstName[0] || "") + (PROFILE.lastName[0] || "");
      photoEl.innerHTML = `<strong>${initials}</strong><span>Photo</span>`;
    }

    // Footer
    const footerLinks = document.getElementById("footerLinks");
    footerLinks.innerHTML = "";
    footerLinks.innerHTML += `<a href="results.html${window.i18n.langSuffix()}">${t("footer.caseStudies")}</a>`;
    // Étude de cas de chaque side project : results.html ne renvoyait vers
    // project-detail.html nulle part (constat F07 de l'audit).
    if (CONFIG.showSideProjects) {
      SIDE_PROJECTS.filter((p) => p.detailSlug).forEach((p) => {
        footerLinks.innerHTML += `<a href="project-detail.html?slug=${p.detailSlug}${window.i18n.langSuffix("&")}" data-goatcounter-click="footer-project-${p.detailSlug}">${p.title}</a>`;
      });
    }
    // data-goatcounter-click : clics comptés comme événements GoatCounter
    // (liés par bindAnalytics() après chaque rendu) — voir README §8.
    if (PROFILE.contact.email) {
      footerLinks.innerHTML += `<a href="mailto:${PROFILE.contact.email}" data-goatcounter-click="contact-email">${PROFILE.contact.email}</a>`;
    }
    if (PROFILE.contact.linkedin) {
      footerLinks.innerHTML += `<a href="${PROFILE.contact.linkedin}" target="_blank" rel="noopener" data-goatcounter-click="contact-linkedin">LinkedIn</a>`;
    }
    if (PROFILE.contact.photos) {
      footerLinks.innerHTML += `<a href="${PROFILE.contact.photos}" target="_blank" rel="noopener" data-goatcounter-click="link-photos">${t("footer.photos")}</a>`;
    }
    document.getElementById("footerTagline").textContent = `${tc(PROFILE.role)} — ${PROFILE.contact.location}`;
    const availability = document.getElementById("footerAvailability");
    if (availability) {
      const text = tc(PROFILE.contact.availability || "");
      availability.textContent = text;
      availability.hidden = !text;
    }

    // Ligne de contact du PDF (page 1) : e-mail · LinkedIn · site, en toutes
    // lettres et cliquables. Masquée à l'écran (voir .print-contact).
    const printContact = document.getElementById("printContact");
    if (printContact) {
      const parts = [];
      if (PROFILE.contact.email) parts.push(`<a href="mailto:${PROFILE.contact.email}">${PROFILE.contact.email}</a>`);
      if (PROFILE.contact.linkedin) parts.push(`<a href="${PROFILE.contact.linkedin}">${PROFILE.contact.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>`);
      if (PROFILE.contact.site) parts.push(`<a href="${PROFILE.contact.site}">${PROFILE.contact.site.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>`);
      printContact.innerHTML = parts.join(" · ");
    }
  }

  // --------------------------------------------------------------------
  // 2. PILIERS
  // --------------------------------------------------------------------
  function renderPillars() {
    const grid = document.getElementById("pillarGrid");
    grid.innerHTML = PILLARS.map(
      (p) => `
      <article class="pillar" data-id="${p.id}">
        <h3>${tc(p.title)}</h3>
        <div class="sub">${tc(p.subtitle)}</div>
        <ul>${p.points.map((pt) => `<li>${tc(pt)}</li>`).join("")}</ul>
      </article>`
    ).join("");
  }

  // --------------------------------------------------------------------
  // 3. COMPÉTENCES
  //    Cinq groupes de pratiques, dans l'ordre de SKILLS. Les pastilles ne
  //    filtrent plus rien depuis le 7 sept. 2026 (quatrième revue, choix
  //    d'Antoine : « plus gadget qu'autre chose ») : la section est descendue
  //    sous les expériences, où filtrer ce qui est déjà lu n'a plus de sens.
  //    Ce sont donc des <span>, pas des <button>.
  // --------------------------------------------------------------------
  function renderSkills() {
    const categories = {};
    SKILLS.forEach((s) => {
      (categories[s.category] = categories[s.category] || []).push(s);
    });

    const groupsHtml = Object.entries(categories)
      .map(
        ([cat, items]) => `
      <div class="skills-group">
        <span class="skills-group-label">${t("skills.cat." + cat)}</span>
        <div class="skills-chips">
          ${items.map((s) => `<span class="chip">${tc(s.label)}</span>`).join("")}
        </div>
      </div>`
      )
      .join("");

    // Les outils sont une ligne de texte, pas des pastilles : lisibles par les
    // outils de tri de candidatures sans occuper le regard.
    const toolsHtml =
      typeof EVERYDAY_TOOLS !== "undefined" && EVERYDAY_TOOLS.length
        ? `
      <div class="skills-group skills-tools">
        <span class="skills-group-label">${t("skills.cat.everydayTools")}</span>
        <p class="skills-tools-line">${EVERYDAY_TOOLS.join(" · ")}</p>
      </div>`
        : "";

    document.getElementById("skillsGroups").innerHTML = groupsHtml + toolsHtml;
  }

  // --------------------------------------------------------------------
  // 3bis. ÉTUDES DE CAS — trois cartes Problème → Approche → Résultat sur
  //    l'accueil (7 sept. 2026, quatrième revue). Même source que
  //    results.html : RESULT_DETAILS, dans l'ordre des chiffres du hero,
  //    dédoublonné (deux chiffres peuvent pointer la même étude). Une entrée
  //    sans `cardTitle` n'a pas de carte : le champ est le contrat.
  // --------------------------------------------------------------------
  function renderCaseStudies() {
    const grid = document.getElementById("caseGrid");
    if (!grid) return;
    const ids = [...new Set(HERO_STATS.map((s) => s.resultId).filter(Boolean))].filter(
      (id) => RESULT_DETAILS[id] && RESULT_DETAILS[id].cardTitle
    );
    grid.innerHTML = ids
      .map((id) => {
        const d = RESULT_DETAILS[id];
        const stat = HERO_STATS.find((s) => s.resultId === id);
        return `
      <a class="case-card" href="results.html${window.i18n.langSuffix()}#${id}" data-goatcounter-click="case-card-${id}">
        <span class="case-company">${d.company}</span>
        <h3 class="case-title">${tc(d.cardTitle)}</h3>
        <p class="case-line"><b>${t("cases.problem")}</b> ${tc(d.problem)}</p>
        <p class="case-line"><b>${t("cases.approach")}</b> ${tc(d.approach)}</p>
        <p class="case-result"><span class="case-value">${stat ? stat.value : d.value}</span> ${tc(d.label)}</p>
        <span class="case-cta">${t("cases.cta")}</span>
      </a>`;
      })
      .join("");
  }

  // --------------------------------------------------------------------
  // 4. EXPÉRIENCES
  //    Chaque rôle : contexte (1-2 phrases), accomplissements (liste),
  //    puis un bandeau "cadre" optionnel (méthodologie / équipe).
  // --------------------------------------------------------------------
  const skillLabel = (id) => tc((SKILLS.find((s) => s.id === id) || {}).label) || id;

  // Un rôle est « ancien » quand il s'est terminé au plus tard à la date de
  // CONFIG.collapseRolesEndingBefore (comparaison de chaînes "AAAA-MM").
  const isEarlyRole = (r) => Boolean(CONFIG.collapseRolesEndingBefore && r.end && r.end <= CONFIG.collapseRolesEndingBefore);
  const earlyRoles = () => EXPERIENCES.flatMap((c) => c.roles).filter(isEarlyRole);
  function earlyRange() {
    const roles = earlyRoles();
    if (!roles.length) return "";
    const from = Math.min(...roles.map((r) => Number(r.start.slice(0, 4))));
    const to = Math.max(...roles.map((r) => Number(r.end.slice(0, 4))));
    return from === to ? String(from) : `${from} – ${to}`;
  }

  function renderExperiences() {
    const list = document.getElementById("experiencesList");
    list.innerHTML = EXPERIENCES.map((company, ci) => {
      const total = company.roles.length > 1 ? companyTotalDuration(company.roles) : null;
      const companyEarly = company.roles.every(isEarlyRole);
      const logoHtml = company.logo
        ? `<img class="company-logo" src="${company.logo}" alt="Logo ${company.company}" width="56" height="56" loading="lazy" decoding="async">`
        : `<div class="company-logo-fallback">${(company.logoLabel || company.company.slice(0, 2)).toUpperCase()}</div>`;

      const rolesHtml = company.roles
        .map((r, ri) => {
          const achievementsHtml = (r.achievements || []).map((a) => `<li>${richText(a)}</li>`).join("");
          const metaParts = [];
          if (r.methodology) {
            metaParts.push(`<span class="role-meta-item"><span aria-hidden="true">🧭</span> <b>${t("experiences.methodology")}</b> — ${tc(r.methodology)}</span>`);
          }
          if (r.team) {
            metaParts.push(`<span class="role-meta-item"><span aria-hidden="true">👥</span> <b>${t("experiences.team")}</b> — ${tc(r.team)}</span>`);
          }
          const metaHtml = metaParts.length ? `<div class="role-meta">${metaParts.join("")}</div>` : "";

          return `
        <div class="role-block${isEarlyRole(r) ? " role-early" : ""}" data-company="${ci}" data-role="${ri}" data-skills="${r.skills.join(",")}">
          <div class="role-top">
            <h4 class="role-title">${tc(r.title)}</h4>
            <span class="role-dates">${formatDateLabel(r.start)} — ${formatDateLabel(r.end)} · ${formatDuration(r.start, r.end)}</span>
          </div>
          ${r.context ? `<p class="role-context">${richText(r.context)}</p>` : ""}
          ${
            achievementsHtml
              ? `<div class="role-achievements-label">${t("experiences.achievements")}</div><ul class="role-achievements">${achievementsHtml}</ul>`
              : ""
          }
          ${metaHtml}
          ${
            r.skills.length
              ? `<div class="role-skills">${r.skills.map((s) => `<span class="role-skill" data-skill="${s}">${skillLabel(s)}</span>`).join("")}</div>`
              : ""
          }
        </div>`;
        })
        .join("");

      return `
      <article class="company-block${companyEarly ? " company-early" : ""}" data-company="${ci}">
        <div class="company-header">
          ${logoHtml}
          <div>
            <h3 class="company-name">${company.company}</h3>
            <div class="company-meta">${company.location}</div>
            ${company.scope ? `<div class="company-scope">${tc(company.scope)}</div>` : ""}
          </div>
          ${total ? `<div class="company-total">${t("experiences.total")}<strong>${total}</strong></div>` : ""}
        </div>
        ${rolesHtml}
      </article>`;
    }).join("");

    // Bouton « Voir mes débuts » juste après le dernier rôle récent : les
    // rôles anciens (et les entreprises qui n'en ont que) restent dans le
    // DOM, repliés en CSS via body.early-collapsed, et toujours dépliés dans
    // le PDF.
    const range = earlyRange();
    const recent = [...list.querySelectorAll(".role-block:not(.role-early)")].pop();
    if (range && recent) {
      recent.insertAdjacentHTML(
        "afterend",
        `<div class="early-toggle-wrap"><button class="early-toggle" type="button">${t("experiences.showEarly").replace("{range}", range)}</button></div>`
      );
    }
    updateEarlyToggle();
  }

  // Repli effectif : replié tant que les débuts n'ont pas été dépliés à la
  // main. Une fois dépliés, le bouton
  // disparaît (le contenu se déroule sur place, pas de « Masquer » qui
  // flotterait entre deux rôles). Appelé au rendu et à chaque changement de
  // rendu.
  function updateEarlyToggle() {
    const wrap = document.querySelector(".early-toggle-wrap");
    const expanded = earlyExpanded;
    document.body.classList.toggle("early-collapsed", Boolean(wrap) && !expanded);
    if (wrap) wrap.hidden = expanded;
  }

  // Posé une seule fois (setupControls) : le bouton est recréé à chaque
  // rendu, d'où la délégation sur la liste.
  function setupEarlyToggle() {
    document.getElementById("experiencesList").addEventListener("click", (e) => {
      if (!e.target.closest(".early-toggle")) return;
      earlyExpanded = true;
      updateEarlyToggle();
      // Le bouton disparaît : on pose le focus sur le premier rôle déplié
      // pour que clavier et lecteur d'écran suivent le contenu.
      const first = document.querySelector(".role-early");
      if (first) {
        first.setAttribute("tabindex", "-1");
        first.focus({ preventScroll: true });
      }
    });
  }



  // --------------------------------------------------------------------
  // 5. FORMATION / LANGUES / CERTIFICATIONS
  // --------------------------------------------------------------------
  function renderFormation() {
    document.getElementById("educationList").innerHTML = EDUCATION.map(
      (e) => `<li><div class="formation-item-title">${tc(e.title)}</div><div class="formation-item-meta">${e.institution} · ${tc(e.period)}</div></li>`
    ).join("");

    // Liste vide : la liste ET son sous-titre disparaissent (CSS :empty ne
    // peut pas cacher le titre, qui est un frère).
    const trainings = document.getElementById("trainingsList");
    trainings.innerHTML = TRAININGS.map(
      (tItem) => `<li><div class="formation-item-title">${tc(tItem.title)}</div><div class="formation-item-meta">${tItem.institution} · ${tc(tItem.period)}</div></li>`
    ).join("");
    const trainingsTitle = document.querySelector('[data-i18n="formation.trainings"]');
    if (trainingsTitle) trainingsTitle.hidden = TRAININGS.length === 0;

    document.getElementById("languagesList").innerHTML = LANGUAGES.map(
      (l) => `<li><span>${tc(l.label)}</span><span class="lang-level">${tc(l.level)}</span></li>`
    ).join("");

    document.getElementById("certificationsList").innerHTML = CERTIFICATIONS.map(
      (c) => `<li><div class="formation-item-title">${tc(c.title)}</div>${c.note ? `<div class="formation-item-meta">${tc(c.note)}</div>` : ""}</li>`
    ).join("");
  }

  // --------------------------------------------------------------------
  // 5bis. RECOMMANDATION (citation vedette)
  // --------------------------------------------------------------------
  function renderTestimonials() {
    const section = document.getElementById("testimonial");
    if (!section) return;
    if (!TESTIMONIALS || TESTIMONIALS.length === 0) {
      section.remove();
      return;
    }
    const item = TESTIMONIALS[0];
    document.getElementById("testimonialQuote").textContent = `“${tc(item.quote)}”`;
    document.getElementById("testimonialName").textContent = item.name;
    const roleText = item.context ? `${tc(item.role)} · ${tc(item.context)}` : tc(item.role);
    document.getElementById("testimonialRole").textContent = roleText;

    const avatarEl = document.getElementById("testimonialAvatar");
    if (item.photo) {
      avatarEl.innerHTML = `<img src="${item.photo}" alt="${item.name}">`;
    } else {
      const initials = item.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      avatarEl.textContent = initials;
    }
  }

  // --------------------------------------------------------------------
  // 6. SIDE PROJECTS
  // --------------------------------------------------------------------
  function renderSideProjects() {
    const section = document.getElementById("projects");
    if (!section) return; // déjà retiré (CONFIG.showSideProjects === false)
    const navLink = document.querySelector(".nav-side-projects");
    if (!CONFIG.showSideProjects) {
      section.remove();
      if (navLink) navLink.remove();
      return;
    }
    const grid = document.getElementById("projectsGrid");
    grid.innerHTML = SIDE_PROJECTS.map(
      (p) => `
      <div class="project-card">
        <h3>${tc(p.title)}</h3>
        <p>${tc(p.description)}</p>
        <div class="project-links">
          ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" data-goatcounter-click="project-${p.detailSlug || "link"}">${t("projects.viewLink")}</a>` : ""}
          ${p.detailSlug ? `<a href="project-detail.html?slug=${p.detailSlug}${window.i18n.langSuffix("&")}">${t("projects.viewCaseStudy")}</a>` : ""}
        </div>
        <div class="project-skills">${p.skills.map((s) => `<span>${skillLabel(s)}</span>`).join("")}</div>
      </div>`
    ).join("");
  }

  // --------------------------------------------------------------------
  // 7. TRADUCTIONS STATIQUES (attributs data-i18n dans index.html)
  // --------------------------------------------------------------------
  function applyStaticTranslations() {
    document.documentElement.lang = window.i18n.lang;

    // <title> et <meta name="description"> par langue (PROFILE.seo dans
    // data.js) : c'est ce que Google affiche dans ses résultats.
    document.title = tc(PROFILE.seo.title);
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute("content", tc(PROFILE.seo.description));
    // Aperçus de partage : même titre et même description que la page. Les
    // valeurs françaises sont pré-rendues dans index.html par
    // scripts/generate-static.js à partir de ce même rendu.
    [
      ['meta[property="og:title"]', tc(PROFILE.seo.title)],
      ['meta[name="twitter:title"]', tc(PROFILE.seo.title)],
      ['meta[property="og:description"]', tc(PROFILE.seo.description)],
      ['meta[name="twitter:description"]', tc(PROFILE.seo.description)],
    ].forEach(([sel, content]) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", content);
    });

    // Canonical par langue : l'URL nue pour le français (langue par défaut),
    // ?lang=en pour l'anglais — chaque version se déclare elle-même, en
    // cohérence avec les balises hreflang statiques du <head>.
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      const base = canonicalEl.href.split("?")[0];
      canonicalEl.href = window.i18n.lang === "en" ? `${base}?lang=en` : base;
    }
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      // Les textes écrits en dur dans index.html (menu, titres de section :
      // hors zones générées) sont ce que lisent les robots sans JavaScript :
      // au premier rendu, on signale en console ceux qui ne correspondent
      // plus à la version française d'i18n.js.
      if (!staticI18nChecked && window.i18n.lang === "fr" && el.textContent.trim() !== t(el.dataset.i18n).trim()) {
        console.warn(`[cv] Texte statique de index.html différent d'i18n.js pour « ${el.dataset.i18n} » : « ${el.textContent.trim().slice(0, 60)} » ≠ « ${t(el.dataset.i18n).slice(0, 60)} »`);
      }
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      if (!staticI18nChecked && window.i18n.lang === "fr" && el.placeholder.trim() !== t(el.dataset.i18nPlaceholder).trim()) {
        console.warn(`[cv] Placeholder statique de index.html différent d'i18n.js pour « ${el.dataset.i18nPlaceholder} »`);
      }
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    staticI18nChecked = true;
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const label = t(el.dataset.i18nAria);
      el.setAttribute("aria-label", label);
      el.setAttribute("title", label);
    });
    const langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.textContent = window.i18n.lang === "fr" ? "EN" : "FR";
      langBtn.setAttribute("aria-label", t("nav.langToggleLabel"));
    }
  }

  // --------------------------------------------------------------------
  // 8. NAVIGATION — indicateur qui suit la section active (scroll + clic)
  // --------------------------------------------------------------------
  let navLinksEls = [];
  let navIndicatorEl = null;

  function moveIndicatorTo(link) {
    if (!navIndicatorEl) return;
    if (!link) {
      navIndicatorEl.classList.remove("is-visible");
      return;
    }
    navIndicatorEl.style.transform = `translateX(${link.offsetLeft}px)`;
    navIndicatorEl.style.width = `${link.offsetWidth}px`;
    navIndicatorEl.style.top = `${link.offsetTop + link.offsetHeight + 6}px`;
    navIndicatorEl.classList.add("is-visible");
  }

  function setActiveNavLink(link) {
    navLinksEls.forEach((a) => a.classList.remove("is-active"));
    if (link) link.classList.add("is-active");
    moveIndicatorTo(link);
  }

  function setupScrollSpy() {
    navIndicatorEl = document.getElementById("navIndicator");
    navLinksEls = Array.from(document.querySelectorAll("nav a[href^='#']"));
    if (!navLinksEls.length || !navIndicatorEl) return;

    // Clic : retour visuel immédiat, sans attendre la fin du scroll fluide.
    navLinksEls.forEach((link) => {
      link.addEventListener("click", () => setActiveNavLink(link));
    });

    // Scroll : la section qui traverse une bande proche du centre de l'écran
    // devient la section active (pattern classique de scrollspy).
    const sections = navLinksEls.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = navLinksEls.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
            if (link) setActiveNavLink(link);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((sec) => observer.observe(sec));

    setActiveNavLink(navLinksEls[0]);

    // Filet de sécurité : si la dernière section est courte, il arrive que
    // l'observer ne la déclenche jamais une fois qu'on atteint le tout bas
    // de la page (le footer prend le dessus). On force alors le dernier lien.
    let scrollTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
          if (nearBottom) setActiveNavLink(navLinksEls[navLinksEls.length - 1]);
          scrollTicking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      const current = navLinksEls.find((a) => a.classList.contains("is-active"));
      moveIndicatorTo(current || navLinksEls[0]);
    });
  }

  // --------------------------------------------------------------------
  // 8bis. APPARITION DU FIT-CHECKER — petit effet d'entrée au scroll.
  //    La classe "fit-reveal-pending" n'est ajoutée qu'ici, en JS : si ce
  //    script ne tourne pas (erreur JS), la section reste visible par
  //    défaut (dégradation propre, rien ne peut rester caché).
  // --------------------------------------------------------------------
  function setupFitReveal() {
    const section = document.getElementById("fit-checker");
    if (!section) return;
    section.classList.add("fit-reveal-pending");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add("is-revealed");
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(section);
  }

  // --------------------------------------------------------------------
  // 9. LANGUE — ?lang=en dans l'URL affiche l'anglais ; tout le reste (pas
  //    de paramètre, ?lang=fr, valeur inconnue) affiche le français.
  //    Volontairement PAS de détection de la langue du navigateur : Googlebot
  //    rend la page avec un navigateur en anglais (en-US), et indexait donc
  //    la version anglaise à l'URL canonique — à contre-sens d'un CV qui vise
  //    des requêtes françaises ("product manager Nantes"). L'URL décide :
  //    un recruteur anglophone reçoit un lien avec ?lang=en.
  // --------------------------------------------------------------------
  function initLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    window.i18n.setLang(params.get("lang") === "en" ? "en" : "fr");
    // ?pdf=court : mode d'impression « CV court » (2 pages), utilisé par
    // scripts/generate-pdf.js — voir body.cv-court dans le @media print.
    // Sans effet à l'écran.
    document.body.classList.toggle("cv-court", params.get("pdf") === "court");
  }


  // --------------------------------------------------------------------
  // 10. RENDU COMPLET (appelé au chargement + à chaque changement de langue)
  // --------------------------------------------------------------------
  function renderAll() {
    applyStaticTranslations();
    renderHero();
    renderPillars();
    renderCaseStudies();
    renderSkills();
    renderExperiences();
    renderTestimonials();
    renderFormation();
    renderSideProjects();

    // Les libellés du menu changent de largeur d'une langue à l'autre :
    // on repositionne l'indicateur sur le lien actif après le re-rendu.
    const current = navLinksEls.find((a) => a.classList.contains("is-active"));
    moveIndicatorTo(current || navLinksEls[0]);
    bindAnalytics();
    renderExperienceRail(); // libellé « Aujourd'hui » et positions (sans effet avant setupExperienceRail)
    // Sur ?lang=en, index.html masque la page pré-rendue en français jusqu'ici
    // (script inline du <head>) : le rendu anglais est en place, on affiche.
    document.documentElement.classList.remove("lang-pending");
  }

  // Relie les clics à compter (data-goatcounter-click) aux éléments qui
  // viennent d'être rendus. count.js est chargé en async : s'il arrive
  // après ce rendu, il fait lui-même ce bind au chargement ; s'il est déjà
  // là, c'est cet appel qui le fait (il ignore les éléments déjà liés).
  // Rappelé à chaque bascule de langue, parce que le rendu recrée les liens.
  function bindAnalytics() {
    if (window.goatcounter && typeof window.goatcounter.bind_events === "function") {
      window.goatcounter.bind_events();
    }
  }

  // --------------------------------------------------------------------
  // 11. FOCUS LECTURE + IMPRESSION + LANGUE
  // --------------------------------------------------------------------
  function setupControls() {
    const focusBtn = document.getElementById("focusToggle");
    focusBtn.addEventListener("click", () => {
      const isOn = document.body.classList.toggle("focus-mode");
      focusBtn.setAttribute("aria-pressed", String(isOn));
    });

    // Deux PDF par langue (scripts/generate-pdf.js) : le complet (5 pages)
    // et le court (2 pages, pour les candidatures transmises par un
    // recruteur). Le suffixe du fichier est dans la langue du document.
    const pdfVariants = {
      // Le bouton principal sert le CV court (2 pages) depuis le 7 sept. 2026 :
      // c'est le document qu'un recruteur ouvre. Le segment sert le complet.
      printBtn: {
        file: (lang) => `assets/cv-antoine-berthaud-${lang}-${lang === "fr" ? "court" : "short"}.pdf`,
        name: (lang) => `Antoine-Berthaud-CV-${lang.toUpperCase()}-${lang === "fr" ? "court" : "short"}.pdf`,
      },
      printShortBtn: { file: (lang) => `assets/cv-antoine-berthaud-${lang}.pdf`, name: (lang) => `Antoine-Berthaud-CV-${lang.toUpperCase()}.pdf` },
    };
    Object.entries(pdfVariants).forEach(([id, variant]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener("click", async () => {
        const lang = window.i18n.lang;
        const pdfPath = variant.file(lang);
        try {
          const res = await fetch(pdfPath, { method: "HEAD" });
          if (res.ok) {
            const a = document.createElement("a");
            a.href = pdfPath;
            a.download = variant.name(lang);
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
          }
        } catch (_err) {
          // PDF pas encore généré (ou hors-ligne) : on retombe sur l'impression navigateur.
        }
        window.print();
      });
    });

    document.getElementById("langToggle").addEventListener("click", () => {
      window.i18n.setLang(window.i18n.lang === "fr" ? "en" : "fr");
      window.i18n.syncUrl();
      renderAll();
    });

    setupEarlyToggle();
    setupScrollSpy();
    setupFitReveal();
    setupExperienceRail();
  }

  // --------------------------------------------------------------------
  // 12. RAIL CHRONOLOGIQUE (desktop) — vue d'ensemble des expériences,
  // fixée dans la marge gauche pendant la lecture de la section.
  // Décision d'Antoine (sept. 2026), direction « échelle du temps » : la
  // ligne est proportionnelle aux durées (RAIL_PX_PER_YEAR par an), un
  // point suit la position de lecture, un clic amène à l'entreprise. Ne
  // prend jamais de place au contenu : n'existe qu'au-dessus de 1 300 px
  // de large (logos seuls) et 1 480 px (noms et années), jamais sur
  // téléphone, dans le PDF ni pour les lecteurs d'écran (aria-hidden :
  // c'est un doublon de navigation). Seuils et positions : voir .xp-rail
  // dans style.css.
  // --------------------------------------------------------------------
  const RAIL_PX_PER_YEAR = 24;
  let railEl = null;
  let railCompanies = []; // { index, top, height } en px sur la ligne

  function ymIndex(str) {
    const d = parseYM(str);
    return d.getFullYear() * 12 + d.getMonth();
  }

  function renderExperienceRail() {
    if (!railEl) return;
    const now = new Date();
    const todayIdx = now.getFullYear() * 12 + now.getMonth();
    const spans = EXPERIENCES.map((company, index) => {
      const starts = company.roles.map((r) => ymIndex(r.start));
      const ends = company.roles.map((r) => (r.end ? ymIndex(r.end) : todayIdx));
      return { index, start: Math.min(...starts), end: Math.max(...ends) };
    });
    const latestEnd = Math.max(...spans.map((s) => s.end));
    const earliestStart = Math.min(...spans.map((s) => s.start));
    const px = RAIL_PX_PER_YEAR / 12;
    railCompanies = spans.map((s) => ({ index: s.index, top: Math.round((latestEnd - s.end) * px), height: Math.round((s.end - s.start) * px), start: s.start, end: s.end }));
    const trackHeight = Math.round((latestEnd - earliestStart) * px);
    railEl.style.height = `${trackHeight}px`;

    const entries = railCompanies.map((c) => {
      const company = EXPERIENCES[c.index];
      const logo = company.logo
        ? `<img class="xp-rail-logo" src="${company.logo}" alt="" width="18" height="18" decoding="async">`
        : `<span class="xp-rail-logo xp-rail-logo-text">${(company.logoLabel || company.company.slice(0, 2)).toUpperCase()}</span>`;
      const startYear = Math.floor(c.start / 12);
      const endLabel = c.end === todayIdx ? t("experiences.today") : String(Math.floor(c.end / 12));
      return `<button type="button" tabindex="-1" class="xp-rail-entry" data-company="${c.index}" style="top:${c.top}px">${logo}<span class="xp-rail-text"><span class="xp-rail-name">${company.shortName || company.company}</span><span class="xp-rail-years">${startYear} – ${endLabel}</span></span></button>`;
    });
    railEl.innerHTML = `
      <div class="xp-rail-track">
        ${railCompanies.map((c) => `<span class="xp-rail-seg" data-company="${c.index}" style="top:${c.top}px;height:${c.height}px"></span>`).join("")}
        <span class="xp-rail-dot" style="top:0"></span>
      </div>
      ${entries.join("")}`;
    updateExperienceRail();
  }

  // Position de lecture = 40 % de la hauteur de l'écran. Le point descend
  // le long du segment de l'entreprise lue (haut du bloc = rôle le plus
  // récent = haut du segment). Blocs masqués (débuts repliés, filtre) : leur
  // entrée passe en retrait et le point les ignore.
  function updateExperienceRail() {
    if (!railEl || !railCompanies.length) return;
    const section = document.getElementById("experiences");
    if (!section) return;
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const readLine = vh * 0.4;
    const visible = rect.top < vh * 0.6 && rect.bottom > vh * 0.4;
    railEl.classList.toggle("is-visible", visible);
    if (!visible) return;

    const blocks = [...document.querySelectorAll("#experiencesList .company-block")];
    const shown = blocks.map((b, i) => ({ b, i, r: b.getBoundingClientRect() })).filter(({ b }) => b.offsetParent !== null);
    let current = null;
    let frac = 0;
    for (const { i, r } of shown) {
      if (readLine >= r.top && readLine < r.bottom) {
        current = i;
        frac = (readLine - r.top) / r.height;
        break;
      }
    }
    if (current === null && shown.length) {
      const first = shown[0];
      const last = shown[shown.length - 1];
      if (readLine < first.r.top) {
        current = first.i;
      } else if (readLine >= last.r.bottom) {
        current = last.i;
        frac = 1;
      } else {
        const next = shown.find(({ r }) => r.top > readLine);
        if (next) current = next.i;
      }
    }
    railEl.querySelectorAll(".xp-rail-seg, .xp-rail-entry").forEach((el) => el.classList.toggle("is-current", Number(el.dataset.company) === current));
    railEl.querySelectorAll(".xp-rail-entry").forEach((el) => {
      const b = blocks[Number(el.dataset.company)];
      el.classList.toggle("is-collapsed", !b || b.offsetParent === null);
    });
    const c = railCompanies.find((x) => x.index === current);
    const dot = railEl.querySelector(".xp-rail-dot");
    if (c && dot) dot.style.top = `${Math.round(c.top + frac * c.height)}px`;
  }

  function setupExperienceRail() {
    railEl = document.createElement("div");
    railEl.className = "xp-rail";
    railEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(railEl);
    railEl.addEventListener("click", (e) => {
      const entry = e.target.closest(".xp-rail-entry");
      if (!entry) return;
      const block = document.querySelectorAll("#experiencesList .company-block")[Number(entry.dataset.company)];
      if (!block) return;
      // Débuts repliés : on les déplie d'abord (même geste que le bouton).
      if (block.offsetParent === null) {
        const toggle = document.querySelector(".early-toggle");
        if (toggle) toggle.click();
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      block.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateExperienceRail();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    renderExperienceRail();
  }

  // --------------------------------------------------------------------
  // INIT
  // --------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLangFromUrl();
    renderAll();
    setupControls();
  });

  // Exposé pour gemini.js (a besoin de résumer le CV pour le prompt)
  window.__cvData = { PROFILE, PILLARS, SKILLS, EXPERIENCES, formatDuration, skillLabel };
})();
