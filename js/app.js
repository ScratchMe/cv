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
  const activeFilters = new Set();

  // Copie statique du pitch FR telle qu'écrite dans index.html (#heroPitch),
  // capturée au premier rendu pour vérifier qu'elle ne dérive pas de data.js.
  let staticPitchHtml = null;

  // --------------------------------------------------------------------
  // 1. HERO
  // --------------------------------------------------------------------
  function renderHero() {
    document.getElementById("heroName").textContent = `${PROFILE.firstName} ${PROFILE.lastName}`;
    document.getElementById("heroRole").textContent = tc(PROFILE.role);

    // Le pitch FR est aussi écrit en dur dans index.html, pour les robots qui
    // n'exécutent pas JavaScript (moteurs IA, aperçus...). Au premier rendu on
    // garde cette copie statique, et on prévient dans la console si elle
    // diverge de PROFILE.pitch.fr — invisible pour le visiteur, c'est juste un
    // garde-fou pour ne pas laisser les deux textes dériver.
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
          ? `<a class="hero-stat is-linked" href="results.html?lang=${window.i18n.lang}#${s.resultId}">${inner}</a>`
          : `<div class="hero-stat">${inner}</div>`;
      }).join("");
    }

    const pillsEl = document.getElementById("heroPills");
    pillsEl.innerHTML = "";
    [
      `🎂 ${PROFILE.age} ${t("hero.pillAge")}`,
      `📍 ${PROFILE.location}`,
      `🚀 ${PROFILE.yearsExperience} ${t("hero.pillYears")}`,
    ].forEach((text) => {
      const span = document.createElement("span");
      span.className = "pill";
      span.textContent = text;
      pillsEl.appendChild(span);
    });

    const photoEl = document.getElementById("heroPhoto");
    if (PROFILE.photo) {
      photoEl.innerHTML = `<img src="${PROFILE.photo}" alt="${t("hero.photoAlt")}">`;
    } else {
      const initials = (PROFILE.firstName[0] || "") + (PROFILE.lastName[0] || "");
      photoEl.innerHTML = `<strong>${initials}</strong><span>Photo</span>`;
    }

    // Footer
    const footerLinks = document.getElementById("footerLinks");
    footerLinks.innerHTML = "";
    if (PROFILE.contact.email) {
      footerLinks.innerHTML += `<a href="mailto:${PROFILE.contact.email}">${PROFILE.contact.email}</a>`;
    }
    if (PROFILE.contact.linkedin) {
      footerLinks.innerHTML += `<a href="${PROFILE.contact.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`;
    }
    document.getElementById("footerTagline").textContent = `${tc(PROFILE.role)} — ${PROFILE.contact.location}`;
  }

  // --------------------------------------------------------------------
  // 2. PILIERS
  // --------------------------------------------------------------------
  function renderPillars() {
    const grid = document.getElementById("pillarGrid");
    grid.innerHTML = PILLARS.map(
      (p) => `
      <article class="pillar" data-id="${p.id}">
        <h3>${p.title}</h3>
        <div class="sub">${tc(p.subtitle)}</div>
        <ul>${p.points.map((pt) => `<li>${tc(pt)}</li>`).join("")}</ul>
      </article>`
    ).join("");
  }

  // --------------------------------------------------------------------
  // 3. COMPÉTENCES / FILTRES
  // --------------------------------------------------------------------
  function renderSkills() {
    const categories = {};
    SKILLS.forEach((s) => {
      (categories[s.category] = categories[s.category] || []).push(s);
    });

    const container = document.getElementById("skillsGroups");
    container.innerHTML = Object.entries(categories)
      .map(
        ([cat, items]) => `
      <div class="skills-group">
        <span class="skills-group-label">${t("skills.cat." + cat)}</span>
        <div class="skills-chips">
          ${items
            .map(
              (s) =>
                `<button class="chip${activeFilters.has(s.id) ? " active" : ""}" type="button" data-skill="${s.id}">${tc(s.label)}</button>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = chip.dataset.skill;
        if (activeFilters.has(id)) {
          activeFilters.delete(id);
          chip.classList.remove("active");
        } else {
          activeFilters.add(id);
          chip.classList.add("active");
        }
        applyFilters();
      });
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
      activeFilters.clear();
      container.querySelectorAll(".chip.active").forEach((c) => c.classList.remove("active"));
      applyFilters();
    });
  }

  // --------------------------------------------------------------------
  // 4. EXPÉRIENCES
  //    Chaque rôle : contexte (1-2 phrases), accomplissements (liste),
  //    puis un bandeau "cadre" optionnel (méthodologie / équipe).
  // --------------------------------------------------------------------
  const skillLabel = (id) => tc((SKILLS.find((s) => s.id === id) || {}).label) || id;

  function renderExperiences() {
    const list = document.getElementById("experiencesList");
    list.innerHTML = EXPERIENCES.map((company, ci) => {
      const total = company.roles.length > 1 ? companyTotalDuration(company.roles) : null;
      const logoHtml = company.logo
        ? `<img class="company-logo" src="${company.logo}" alt="Logo ${company.company}">`
        : `<div class="company-logo-fallback">${company.company.slice(0, 2).toUpperCase()}</div>`;

      const rolesHtml = company.roles
        .map((r, ri) => {
          const achievementsHtml = (r.achievements || []).map((a) => `<li>${richText(a)}</li>`).join("");
          const metaParts = [];
          if (r.methodology) {
            metaParts.push(`<span class="role-meta-item">🧭 <b>${t("experiences.methodology")}</b> — ${tc(r.methodology)}</span>`);
          }
          if (r.team) {
            metaParts.push(`<span class="role-meta-item">👥 <b>${t("experiences.team")}</b> — ${tc(r.team)}</span>`);
          }
          const metaHtml = metaParts.length ? `<div class="role-meta">${metaParts.join("")}</div>` : "";

          return `
        <div class="role-block" data-company="${ci}" data-role="${ri}" data-skills="${r.skills.join(",")}">
          <div class="role-top">
            <span class="role-title">${tc(r.title)}</span>
            <span class="role-dates">${formatDateLabel(r.start)} — ${formatDateLabel(r.end)} · ${formatDuration(r.start, r.end)}</span>
          </div>
          ${r.context ? `<p class="role-context">${richText(r.context)}</p>` : ""}
          ${
            achievementsHtml
              ? `<div class="role-achievements-label">${t("experiences.achievements")}</div><ul class="role-achievements">${achievementsHtml}</ul>`
              : ""
          }
          ${metaHtml}
          <div class="role-skills">
            ${r.skills.map((s) => `<span class="role-skill" data-skill="${s}">${skillLabel(s)}</span>`).join("")}
          </div>
        </div>`;
        })
        .join("");

      return `
      <article class="company-block" data-company="${ci}">
        <div class="company-header">
          ${logoHtml}
          <div>
            <div class="company-name">${company.company}</div>
            <div class="company-meta">${company.location}</div>
          </div>
          ${total ? `<div class="company-total">${t("experiences.total")}<strong>${total}</strong></div>` : ""}
        </div>
        ${rolesHtml}
      </article>`;
    }).join("");
  }

  function applyFilters() {
    const statusEl = document.getElementById("filterStatus");
    const clearBtn = document.getElementById("clearFilters");
    const hasFilters = activeFilters.size > 0;
    clearBtn.hidden = !hasFilters;

    let visibleRoles = 0;
    document.querySelectorAll(".company-block").forEach((block) => {
      let anyVisible = false;
      block.querySelectorAll(".role-block").forEach((role) => {
        const skills = (role.dataset.skills || "").split(",").filter(Boolean);
        const matches = !hasFilters || skills.some((s) => activeFilters.has(s));
        role.classList.toggle("is-hidden", !matches);
        if (matches) {
          anyVisible = true;
          visibleRoles++;
        }
        role.querySelectorAll(".role-skill").forEach((chip) => {
          chip.classList.toggle("is-matched", activeFilters.has(chip.dataset.skill));
        });
      });
      block.classList.toggle("is-hidden", !anyVisible);
    });

    if (hasFilters) {
      const labels = [...activeFilters].map(skillLabel).join(", ");
      statusEl.hidden = false;
      statusEl.textContent = `${t("experiences.filterStatusPrefix")}${labels} — ${visibleRoles} ${t("experiences.filterStatusSuffix")}`;
    } else {
      statusEl.hidden = true;
    }
  }

  // --------------------------------------------------------------------
  // 5. FORMATION / LANGUES / CERTIFICATIONS
  // --------------------------------------------------------------------
  function renderFormation() {
    document.getElementById("educationList").innerHTML = EDUCATION.map(
      (e) => `<li><div class="formation-item-title">${tc(e.title)}</div><div class="formation-item-meta">${e.institution} · ${tc(e.period)}</div></li>`
    ).join("");

    document.getElementById("trainingsList").innerHTML = TRAININGS.map(
      (tItem) => `<li><div class="formation-item-title">${tc(tItem.title)}</div><div class="formation-item-meta">${tItem.institution} · ${tc(tItem.period)}</div></li>`
    ).join("");

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
          ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${t("projects.viewLink")}</a>` : ""}
          ${p.detailSlug ? `<a href="project-detail.html?slug=${p.detailSlug}&lang=${window.i18n.lang}">${t("projects.viewCaseStudy")}</a>` : ""}
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

    // Canonical par langue : l'URL nue pour le français (langue par défaut),
    // ?lang=en pour l'anglais — chaque version se déclare elle-même, en
    // cohérence avec les balises hreflang statiques du <head>.
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      const base = canonicalEl.href.split("?")[0];
      canonicalEl.href = window.i18n.lang === "en" ? `${base}?lang=en` : base;
    }
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
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
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    window.i18n.setLang(urlLang === "en" ? "en" : "fr");
  }

  // Reflète la langue courante dans l'URL : ?lang=en pour l'anglais, et
  // l'URL nue (sans paramètre) pour le français, langue par défaut — c'est
  // aussi l'URL canonique déclarée pour la version française.
  function syncUrlLang() {
    const url = new URL(window.location.href);
    if (window.i18n.lang === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }

  // --------------------------------------------------------------------
  // 10. RENDU COMPLET (appelé au chargement + à chaque changement de langue)
  // --------------------------------------------------------------------
  function renderAll() {
    applyStaticTranslations();
    renderHero();
    renderPillars();
    renderSkills();
    renderExperiences();
    renderTestimonials();
    renderFormation();
    renderSideProjects();
    applyFilters(); // ré-applique les filtres actifs sur les nouveaux éléments du DOM

    // Les libellés du menu changent de largeur d'une langue à l'autre :
    // on repositionne l'indicateur sur le lien actif après le re-rendu.
    const current = navLinksEls.find((a) => a.classList.contains("is-active"));
    moveIndicatorTo(current || navLinksEls[0]);
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

    document.getElementById("printBtn").addEventListener("click", async () => {
      const lang = window.i18n.lang;
      const pdfPath = `assets/cv-antoine-berthaud-${lang}.pdf`;
      try {
        const res = await fetch(pdfPath, { method: "HEAD" });
        if (res.ok) {
          const a = document.createElement("a");
          a.href = pdfPath;
          a.download = `Antoine-Berthaud-CV-${lang.toUpperCase()}.pdf`;
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

    document.getElementById("langToggle").addEventListener("click", () => {
      window.i18n.setLang(window.i18n.lang === "fr" ? "en" : "fr");
      syncUrlLang();
      renderAll();
    });

    setupScrollSpy();
    setupFitReveal();
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
