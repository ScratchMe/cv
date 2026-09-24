#!/usr/bin/env node
/**
 * scripts/generate-static.js — pré-rendu des pages, en français et en anglais.
 *
 * Le contenu du CV vit dans js/data.js et c'est js/app.js (ou results.js,
 * project-detail.js) qui construit la page dans le navigateur. Un lecteur qui
 * n'exécute pas JavaScript — robots des moteurs de réponse IA, aperçus de lien,
 * une partie des outils de tri de candidatures — ne voyait que le pitch, trois
 * chiffres et le pied de page (258 mots sur 1 622, mesuré le 06/09/2026).
 *
 * Ce script ouvre chaque page dans Chromium (Playwright), laisse le JavaScript
 * la rendre, puis recopie le HTML rendu dans le fichier, entre des marqueurs :
 *
 *     <!-- static:experiencesList -->…<!-- /static:experiencesList -->
 *
 * Tout ce qui est entre deux marqueurs est GÉNÉRÉ : ne jamais l'éditer à la
 * main, la prochaine génération l'écraserait. data.js et i18n.js restent les
 * seules sources ; les scripts de page re-rendent par-dessus au chargement
 * (même HTML), le Fit-Checker continue d'exiger JavaScript.
 *
 * Deux langues depuis septembre 2026 (mission SEO) : index.html et
 * results.html sont les gabarits, édités à la main hors des zones, et donnent
 * la version française à la racine. Le script en tire la version anglaise
 * (en/index.html, en/results.html) : même gabarit, <html lang="en">, sans le
 * script de redirection des anciennes URL ?lang=en, rendu par le navigateur
 * à son adresse /en/… (le JavaScript y lit la langue dans le chemin). Sont
 * écrits dans les deux langues :
 *   - les zones rendues par le JavaScript (captées dans le navigateur) ;
 *   - <title>, description, titres/descriptions og:/twitter: (idem) ;
 *   - les zones calculées ici : canonical, hreflang, og:url, og:locale
 *     (langLinks), JSON-LD (jsonLd, scripts/lib/structured-data.js), lien
 *     FR/EN (langToggle) ;
 *   - les textes du gabarit marqués data-i18n (et data-i18n-placeholder,
 *     -aria, -alt), repris d'i18n.js : menu, titres de section, <noscript>.
 *
 * Usage :
 *   node scripts/generate-static.js          # écrit les fichiers modifiés
 *   node scripts/generate-static.js --check  # code de sortie 2 si un fichier n'est pas à jour, n'écrit rien
 *
 * Tourne en CI (.github/workflows/generate-pdf.yml) avant les PDF, à chaque
 * push sur main qui touche le site et une fois par mois (durées d'expérience
 * calculées jusqu'à aujourd'hui), et sur chaque PR sans commit (pr-checks.yml).
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { ROOT, startServer } = require("./lib/site-server");
const { execFileSync } = require("child_process");
const { PAGE_URLS, profilePage, resultsPage, projectPage, projectUrls, jsonLdScript } = require("./lib/structured-data");

const PORT = 4174; // ≠ 4173 (generate-pdf.js) : les deux scripts peuvent tourner côte à côte
const CHECK_ONLY = process.argv.includes("--check");

// Éléments du <head> posés par le JS (titre, description, og:/twitter:) :
// remplacés un par un, sans marqueur, ils sont uniques dans chaque page.
const META_HEAD = ["title", 'meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]'];

// Une zone = un ou plusieurs éléments, recopiés en entier (outerHTML) entre
// les marqueurs <!-- static:ID --> et <!-- /static:ID -->. Les sélecteurs
// suivant le premier sont facultatifs (ex. le lien sous les chiffres du hero,
// absent si aucun chiffre n'a d'étude de cas).
const PAGES = [
  {
    template: "index.html",
    langs: ["fr", "en"],
    out: { fr: "index.html", en: "en/index.html" },
    path: { fr: "/index.html", en: "/en/index.html" },
    urls: PAGE_URLS.home,
    head: META_HEAD,
    // dateModified = <lastmod> de la page, dateCreated = premier commit de
    // index.html (voir pageDates plus bas).
    jsonLd: (lang, rendered, page, dates) => profilePage(lang, rendered.profile, dates),
    zones: [
      ["heroName", "#heroName"],
      ["heroRole", "#heroRole"],
      ["printContact", "#printContact"],
      ["heroPills", "#heroPills"],
      ["heroPitch", "#heroPitch"],
      ["heroStats", "#heroStats", "#heroStatsLink"],
      ["pillarGrid", "#pillarGrid"],
      ["skillsGroups", "#skillsGroups"],
      ["experiencesList", "#experiencesList"],
      ["caseGrid", "#caseGrid"],
      ["educationList", "#educationList"],
      ["trainingsList", "#trainingsTitle", "#trainingsList"], // titre compris : masqué avec la liste quand elle est vide
      ["languagesList", "#languagesList"],
      ["certificationsList", "#certificationsList"],
      ["testimonialQuote", "#testimonialQuote"],
      ["testimonialAvatar", "#testimonialAvatar"],
      ["testimonialName", "#testimonialName"],
      ["testimonialRole", "#testimonialRole"],
      ["projectsGrid", "#projectsGrid"],
      ["footerTagline", "#footerTagline"],
      ["footerAvailability", "#footerAvailability"],
      ["footerLinks", "#footerLinks"],
    ],
    // Sentinelles : un data.js à moitié cassé peut rendre une page « propre »
    // mais vide de sens. Ces mots doivent apparaître dans la page générée.
    sentinels: { fr: ["Everysens", "Polytech", "Alix Paoli", "SNCF Connect", "Ce qui me définit"], en: ["Everysens", "Polytech", "Alix Paoli", "SNCF Connect", "What defines me"] },
    minWords: 1400,
  },
  {
    template: "results.html",
    langs: ["fr", "en"],
    out: { fr: "results.html", en: "en/results.html" },
    path: { fr: "/results.html", en: "/en/results.html" },
    urls: PAGE_URLS.results,
    head: META_HEAD,
    extraKeys: ["nav.cases"], // libellé du fil d'Ariane (JSON-LD)
    jsonLd: (lang, rendered, page) => resultsPage(lang, { url: page.urls[lang], name: rendered.title, description: rendered.description, crumb: rendered.dict["nav.cases"] }),
    zones: [["resultsRoot", "#resultsRoot"]],
    sentinels: { fr: ["Contexte", "Leçon", "Everysens"], en: ["Context", "Lesson", "Everysens"] },
    minWords: 700,
  }
];

// Pages des side projects : une page française et une anglaise par entrée de
// PROJECT_DETAILS (js/data.js), à partir de scripts/templates/project.html —
// aucun code à ajouter pour un nouveau projet. Le slug est posé sur <body
// data-slug> : c'est là que js/project-detail.js le lit.
const PROJECT_TEMPLATE = "scripts/templates/project.html";
function projectPageConfig(slug) {
  return {
    template: PROJECT_TEMPLATE,
    slug,
    langs: ["fr", "en"],
    out: { fr: `projets/${slug}.html`, en: `en/projects/${slug}.html` },
    path: { fr: `/projets/${slug}.html`, en: `/en/projects/${slug}.html` },
    urls: projectUrls(slug),
    head: META_HEAD,
    jsonLd: (lang, rendered, page) => projectPage(lang, { url: page.urls[lang], name: rendered.title, description: rendered.description }, rendered.project),
    zones: [["projectDetailRoot", "#projectDetailRoot"]],
    sentinels: { fr: ["Le problème", "Stack technique"], en: ["The problem", "Tech stack"] },
    minWords: 300,
  };
}

// Ancienne adresse project-detail.html?slug= : page de redirection vers les
// pages statiques ci-dessus. Deux zones calculées ici (aucun rendu) : la
// table des slugs du script de redirection, et les liens du <noscript>.
const LEGACY_PROJECT_PAGE = "project-detail.html";

const OG_LOCALE = { fr: "fr_FR", en: "en_US" };

// ---------------------------------------------------------------------------
// Utilitaires HTML
// ---------------------------------------------------------------------------
function escapeText(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return escapeText(str).replace(/"/g, "&quot;");
}

// Expression qui retrouve, dans le HTML source, l'élément unique désigné par
// un sélecteur du <head> (« title », « meta[name="description"] »…).
function headPattern(selector) {
  if (selector === "title") return /<title\b[^>]*>[\s\S]*?<\/title>/;
  const m = selector.match(/^(\w+)\[(\w+(?::\w+)?)="([^"]+)"\]$/);
  if (!m) throw new Error(`Sélecteur de <head> non géré : ${selector}`);
  const [, tag, attr, value] = m;
  return new RegExp(`<${tag}\\s[^>]*\\b${attr}="${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`);
}

// Correspondances d'une expression dans le HTML, en ignorant celles qui
// tombent dans un commentaire <!-- … --> ou dans une zone générée.
function findOutsideComments(html, re) {
  // Commentaires et contenu des zones remplacés par des espaces de même
  // longueur : les positions trouvées dans la copie masquée valent dans
  // l'original, et une mention de « <title> » dans un commentaire ne peut
  // plus avaler le vrai.
  const masked = html
    .replace(/<!-- static:(\w+) -->[\s\S]*?<!-- \/static:\1 -->/g, (z) => " ".repeat(z.length))
    .replace(/<!--[\s\S]*?-->/g, (c) => " ".repeat(c.length));
  return [...masked.matchAll(new RegExp(re.source, "g"))].map((m) => ({ index: m.index, length: m[0].length }));
}

function zonePattern(id) {
  return new RegExp(`<!-- static:${id} -->[\\s\\S]*?<!-- /static:${id} -->`);
}

function replaceZone(html, file, id, content) {
  const re = zonePattern(id);
  const matches = html.match(new RegExp(re.source, "g")) || [];
  if (matches.length !== 1) {
    throw new Error(`${file} : ${matches.length} paire(s) de marqueurs pour « ${id} » (attendu 1 : <!-- static:${id} --> … <!-- /static:${id} -->)`);
  }
  // Sauts de ligne retirés aux deux bouts, pas l'indentation (sitemap).
  return html.replace(re, () => `<!-- static:${id} -->\n${content.replace(/^\s*\n|\s+$/g, "")}\n<!-- /static:${id} -->`);
}

// Pose (ou remplace) un attribut dans une balise ouvrante.
function setAttr(tag, name, value) {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  const attr = ` ${name}="${escapeAttr(value)}"`;
  return re.test(tag) ? tag.replace(re, attr) : tag.replace(/\s*(\/?)>$/, `${attr}$1>`);
}

// Clés i18n citées par le gabarit (data-i18n, -placeholder, -aria, -alt),
// y compris dans <noscript>, que le navigateur ne transforme pas en éléments.
function i18nKeys(html) {
  return [...new Set([...html.matchAll(/\sdata-i18n(?:-placeholder|-aria|-alt)?="([^"]+)"/g)].map((m) => m[1]))];
}

// Écrit dans le gabarit les textes i18n de la langue de la page. Le contenu
// d'un élément data-i18n doit être du texte simple (c'est ce que fait app.js
// avec textContent) : un élément qui contiendrait des balises est refusé.
function applyI18n(html, file, dict) {
  const expected = (html.match(/\sdata-i18n="/g) || []).length;
  let done = 0;
  html = html.replace(/<([a-zA-Z][\w-]*)((?:\s[^>]*?)?\sdata-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/g, (all, tag, attrs, key) => {
    done++;
    if (!(key in dict)) throw new Error(`${file} : clé i18n inconnue « ${key} »`);
    return `<${tag}${attrs}>${escapeText(dict[key])}</${tag}>`;
  });
  if (done !== expected) throw new Error(`${file} : ${expected - done} élément(s) data-i18n avec des balises à l'intérieur — texte simple attendu`);

  const attrRules = [
    ["data-i18n-placeholder", ["placeholder"]],
    ["data-i18n-aria", ["aria-label", "title"]],
    ["data-i18n-alt", ["alt"]],
  ];
  for (const [marker, attrs] of attrRules) {
    html = html.replace(new RegExp(`<[a-zA-Z][\\w-]*\\s[^>]*\\b${marker}="([^"]+)"[^>]*>`, "g"), (tag, key) => {
      if (!(key in dict)) throw new Error(`${file} : clé i18n inconnue « ${key} »`);
      return attrs.reduce((t, a) => setAttr(t, a, dict[key]), tag);
    });
  }
  return html;
}

// Liens vers la page d'un side project (data-project-href="<slug>") : adresse
// dans la langue de la page, comme i18n.projectUrl() côté navigateur.
function applyProjectHrefs(html, file, lang, slugs) {
  return html.replace(/<a\s[^>]*\bdata-project-href="([^"]+)"[^>]*>/g, (tag, slug) => {
    if (!slugs.includes(slug)) throw new Error(`${file} : data-project-href="${slug}" ne correspond à aucune entrée de PROJECT_DETAILS`);
    return setAttr(tag, "href", new URL(projectUrls(slug)[lang]).pathname);
  });
}

// Nombre de mots lisibles dans un HTML sans l'exécuter (approximation : on
// retire scripts, styles, commentaires et balises).
function wordCount(html) {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  return text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
}

// ---------------------------------------------------------------------------
// Zones calculées ici (pas captées dans le navigateur)
// ---------------------------------------------------------------------------
function langLinksHtml(page, lang) {
  const other = lang === "fr" ? "en" : "fr";
  return [
    `<link rel="canonical" href="${page.urls[lang]}">`,
    `<link rel="alternate" hreflang="fr" href="${page.urls.fr}">`,
    `<link rel="alternate" hreflang="en" href="${page.urls.en}">`,
    `<link rel="alternate" hreflang="x-default" href="${page.urls.fr}">`,
    `<meta property="og:url" content="${page.urls[lang]}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`,
  ].join("\n");
}

// Lien FR/EN : un vrai lien vers la même page dans l'autre langue, dans la
// langue de sa cible (hreflang, lang). Le libellé accessible vient d'i18n.js.
function langToggleHtml(page, lang, dict) {
  const other = lang === "fr" ? "en" : "fr";
  if (!dict["nav.langToggleLabel"]) throw new Error(`${page.out[lang]} : libellé nav.langToggleLabel introuvable dans i18n.js`);
  const href = new URL(page.urls[other]).pathname;
  return `<a id="langToggle" class="btn" href="${href}" hreflang="${other}" lang="${other}" aria-label="${escapeAttr(dict["nav.langToggleLabel"])}">${other.toUpperCase()}</a>`;
}

// ---------------------------------------------------------------------------
// Rendu dans le navigateur
// ---------------------------------------------------------------------------
// `shell` : HTML à servir à l'adresse de la page au lieu du fichier (version
// anglaise, qui n'existe pas encore sur le disque ou n'est pas à jour).
async function renderPage(browser, page, lang, { shell, keys }) {
  const tab = await browser.newPage();
  const errors = [];
  tab.on("pageerror", (err) => errors.push(err.message));
  const pagePath = page.path[lang];
  const pageUrl = `http://127.0.0.1:${PORT}${pagePath}`;
  // Rien d'externe pendant le rendu : le HTML généré doit être le même sur
  // n'importe quelle machine, avec ou sans réseau. Concrètement, count.js
  // (GoatCounter) marque les liens qu'il a reliés (data-goatcounter-bound) et
  // ce marqueur entrait dans les pages générées en CI, pas en local.
  await tab.route("**/*", (route) => {
    const url = route.request().url();
    if (shell && url === pageUrl) return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: shell });
    return url.startsWith(`http://127.0.0.1:${PORT}/`) ? route.continue() : route.abort();
  });
  // "load" suffit : le rendu se fait dans DOMContentLoaded, qui précède load.
  await tab.goto(pageUrl, { waitUntil: "load" });
  if (errors.length) throw new Error(`${page.out[lang]} : erreur JS au rendu — ${errors[0]}`);

  const rendered = await tab.evaluate(
    ({ head, zones, keys }) => {
      // Ceinture et bretelles (voir tab.route ci-dessus) : aucun attribut posé
      // par un script tiers ne doit finir dans les pages générées.
      document.querySelectorAll("[data-goatcounter-bound]").forEach((el) => el.removeAttribute("data-goatcounter-bound"));
      return {
        lang: document.documentElement.lang,
        head: head.map((sel) => {
          const el = document.querySelector(sel);
          return el ? el.outerHTML : null;
        }),
        zones: zones.map(([id, ...selectors]) => {
          // outerHTML sérialise les attributs booléens en hidden="" : on écrit hidden.
          const parts = selectors.map((sel) => document.querySelector(sel)).map((el) => (el ? el.outerHTML.replace(/ hidden=""/g, " hidden") : null));
          return { id, first: parts[0], html: parts.filter(Boolean).join("\n") };
        }),
        dict: Object.fromEntries(keys.map((k) => [k, window.i18n.t(k)])),
        title: document.title,
        description: (document.querySelector('meta[name="description"]') || {}).content || "",
        profile: typeof PROFILE !== "undefined" ? { yearsExperience: PROFILE.yearsExperience } : null,
        // Page de side project : ce que le JSON-LD décrit de l'application.
        project: (() => {
          const p = document.body.dataset.slug && PROJECT_DETAILS[document.body.dataset.slug];
          return p ? { title: p.title, liveUrl: p.liveUrl, summary: window.i18n.tc(p.tagline), applicationCategory: p.applicationCategory } : null;
        })(),
      };
    },
    { head: page.head, zones: page.zones, keys }
  );
  await tab.close();

  if (rendered.lang !== lang) throw new Error(`${page.out[lang]} : rendu en « ${rendered.lang} », attendu « ${lang} »`);
  page.head.forEach((sel, i) => {
    if (!rendered.head[i]) throw new Error(`${page.out[lang]} : élément de <head> introuvable dans le rendu — ${sel}`);
  });
  rendered.zones.forEach((z) => {
    if (!z.first) throw new Error(`${page.out[lang]} : zone « ${z.id} » introuvable dans le rendu (${page.zones.find((x) => x[0] === z.id)[1]})`);
    if (!z.html.trim()) throw new Error(`${page.out[lang]} : zone « ${z.id} » rendue vide`);
    if (z.html.includes("static:")) throw new Error(`${page.out[lang]} : la zone « ${z.id} » contient un marqueur static: — marqueurs imbriqués ?`);
  });
  return rendered;
}

// Écrit le rendu d'une langue dans le HTML (gabarit ou coquille anglaise).
function applyRender(html, page, lang, rendered, slugs, dates) {
  const file = page.out[lang];

  page.head.forEach((sel, i) => {
    // Un commentaire du <head> peut citer « <title> » en toutes lettres : on ne
    // remplace que l'élément réel, hors commentaires et hors zones.
    const found = findOutsideComments(html, headPattern(sel));
    if (found.length !== 1) throw new Error(`${file} : ${found.length} correspondance(s) pour ${sel} dans la source hors commentaires (attendu 1)`);
    const [m] = found;
    html = html.slice(0, m.index) + rendered.head[i] + html.slice(m.index + m.length);
  });

  rendered.zones.forEach((z) => {
    html = replaceZone(html, file, z.id, z.html);
  });

  if (page.urls) {
    html = replaceZone(html, file, "langLinks", langLinksHtml(page, lang));
    html = replaceZone(html, file, "langToggle", langToggleHtml(page, lang, rendered.dict));
  }
  if (page.jsonLd) html = replaceZone(html, file, "jsonLd", jsonLdScript(page.jsonLd(lang, rendered, page, dates)));
  html = applyI18n(html, file, rendered.dict);
  html = applyProjectHrefs(html, file, lang, slugs);

  // Garde-fous sur le résultat complet.
  const words = wordCount(html);
  if (words < page.minWords) throw new Error(`${file} : ${words} mots sans JavaScript, attendu au moins ${page.minWords} — data.js incomplet ?`);
  const missing = page.sentinels[lang].filter((s) => !html.includes(s));
  if (missing.length) throw new Error(`${file} : mot(s) attendu(s) absent(s) de la page générée — ${missing.join(", ")}`);
  if (!new RegExp(`<html lang="${lang}">`).test(html)) throw new Error(`${file} : <html lang="${lang}"> absent`);
  return { html, words };
}

// Ancienne adresse project-detail.html : le script de redirection reçoit la
// table slug → pages (hasOwnProperty : un slug comme « constructor » ne doit
// rien trouver), le <noscript> un lien par projet.
function legacyProjectPage(html, projects, dict, slugs) {
  const file = LEGACY_PROJECT_PAGE;
  const table = Object.fromEntries(projects.map(({ slug }) => [slug, { fr: new URL(projectUrls(slug).fr).pathname, en: new URL(projectUrls(slug).en).pathname }]));
  const script = `<script id="project-redirect">
  (function () {
    var pages = ${JSON.stringify(table)};
    var q = new URLSearchParams(location.search), slug = q.get("slug");
    if (slug && Object.prototype.hasOwnProperty.call(pages, slug)) {
      location.replace(pages[slug][q.get("lang") === "en" ? "en" : "fr"] + location.hash);
    }
  })();
</script>`;
  html = replaceZone(html, file, "projectRedirect", script);
  const links = projects.map((p) => `<p><a href="${new URL(projectUrls(p.slug).fr).pathname}">${escapeText(p.title)}</a></p>`).join("\n");
  html = replaceZone(html, file, "projectLinks", links);
  html = applyI18n(html, file, dict);
  return applyProjectHrefs(html, file, "fr", slugs);
}

// ---------------------------------------------------------------------------
// Dates : <lastmod> du sitemap et dateModified / dateCreated du JSON-LD
// ---------------------------------------------------------------------------
// Le <lastmod> d'une page (et le dateModified de l'accueil, qui le reprend)
// n'avance que quand le HTML généré de cette page change : le script compare
// au fichier sur le disque. Une page régénérée dans une PR y porte déjà sa
// nouvelle date, la CI de main la retrouve à l'identique et ne touche à rien ;
// une page que seule la CI régénère (data.js modifié sans relancer le script,
// durées mensuelles) prend la date du jour. Jour en UTC, comme la CI.
const SITEMAP = "sitemap.xml";
const TODAY = new Date().toISOString().slice(0, 10);
const sitemapSource = fs.readFileSync(path.join(ROOT, SITEMAP), "utf8");
const previousLastmod = new Map([...sitemapSource.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => [m[1], m[2]]));
const newLastmod = new Map(); // URL → date retenue pendant ce passage

// Premier commit de index.html : date de création de la page profil. Un
// clone superficiel (CI sans fetch-depth: 0) n'a pas l'historique : on
// s'arrête plutôt que d'écrire une date fausse.
function firstCommitDate(file) {
  const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
    throw new Error("Clone Git superficiel : impossible de dater la création de la page (dateCreated). En CI, actions/checkout doit avoir fetch-depth: 0.");
  }
  const first = git(["log", "--reverse", "--format=%as", "--", file]).split("\n")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(first)) throw new Error(`Aucun commit trouvé pour ${file} (dateCreated)`);
  return first;
}
const DATE_CREATED = firstCommitDate("index.html");

// Construit la page avec la date de sa dernière modification connue ; si le
// résultat diffère du fichier existant, la page a changé : on la reconstruit
// datée d'aujourd'hui. Deux passages de suite donnent donc le même résultat.
function withLastmod(page, lang, build) {
  const url = page.urls[lang];
  const filePath = path.join(ROOT, page.out[lang]);
  const before = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  const known = previousLastmod.get(url);
  let date = known || TODAY;
  let out = build({ created: DATE_CREATED, modified: date });
  if (out.html !== before && date !== TODAY) {
    date = TODAY;
    out = build({ created: DATE_CREATED, modified: date });
  }
  // La date retenue est celle de la dernière construction : inchangée, la
  // page garde la sienne ; reconstruite, elle porte celle du jour.
  newLastmod.set(url, date);
  return out;
}

// Entrées « pages » du sitemap (zone <!-- static:pages -->) : une par page
// générée, avec ses hreflang et son lastmod. Les PDF, hors zone, restent
// datés par le workflow.
function sitemapPages(pages) {
  const entries = pages.flatMap((page) =>
    page.langs.map((lang) =>
      [
        "  <url>",
        `    <loc>${page.urls[lang]}</loc>`,
        `    <lastmod>${newLastmod.get(page.urls[lang])}</lastmod>`,
        `    <xhtml:link rel="alternate" hreflang="fr" href="${page.urls.fr}"/>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${page.urls.en}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${page.urls.fr}"/>`,
        "  </url>",
      ].join("\n")
    )
  );
  return replaceZone(sitemapSource, SITEMAP, "pages", entries.join("\n"));
}

// Coquille de la version anglaise : la page française générée, en anglais, sans
// le script qui redirige les anciennes URL ?lang=en (il bouclerait sous /en/).
function englishShell(frHtml, file, { redirect: hasRedirect = true } = {}) {
  const redirect = /\n?<script id="lang-redirect">[\s\S]*?<\/script>/;
  if (hasRedirect && !redirect.test(frHtml)) throw new Error(`${file} : script id="lang-redirect" introuvable dans le gabarit`);
  if (!hasRedirect && redirect.test(frHtml)) throw new Error(`${file} : script id="lang-redirect" inattendu`);
  if (!/<html lang="fr">/.test(frHtml)) throw new Error(`${file} : <html lang="fr"> introuvable dans le gabarit`);
  return frHtml.replace(redirect, "").replace('<html lang="fr">', '<html lang="en">');
}

// ---------------------------------------------------------------------------
(async () => {
  const server = await startServer(PORT);
  const browser = await chromium.launch();
  let stale = 0;
  const report = (file, html, words) => {
    const filePath = path.join(ROOT, file);
    const before = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
    const changed = before !== html;
    if (changed && !CHECK_ONLY) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, html);
    }
    if (changed) stale++;
    console.log(`${changed ? (CHECK_ONLY ? "✗ pas à jour" : "✓ régénéré ") : "= inchangé  "} ${file} (${words} mots sans JavaScript)`);
  };
  try {
    // Side projects et textes de la page de redirection, lus dans les sources
    // par le site lui-même.
    const probe = await browser.newPage();
    await probe.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load" });
    const projects = await probe.evaluate(() => Object.entries(PROJECT_DETAILS).map(([slug, p]) => ({ slug, title: p.title })));
    const legacyTemplate = fs.readFileSync(path.join(ROOT, LEGACY_PROJECT_PAGE), "utf8");
    const legacyDict = await probe.evaluate((keys) => Object.fromEntries(keys.map((k) => [k, window.i18n.t(k)])), i18nKeys(legacyTemplate));
    await probe.close();
    const slugs = projects.map((p) => p.slug);
    if (!slugs.length) throw new Error("PROJECT_DETAILS est vide : aucune page projet à générer.");
    slugs.forEach((slug) => {
      if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Slug « ${slug} » : minuscules, chiffres et tirets seulement (il devient un nom de fichier).`);
    });

    const allPages = [...PAGES, ...slugs.map(projectPageConfig)];
    for (const page of allPages) {
      const template = fs.readFileSync(path.join(ROOT, page.template), "utf8");
      // + le libellé du lien FR/EN, que le gabarit ne cite pas (zone calculée).
      const keys = [...i18nKeys(template), "nav.langToggleLabel", ...(page.extraKeys || [])];
      // Page projet : la page française n'est pas le gabarit lui-même, c'est
      // le gabarit portant son slug, servi depuis la mémoire.
      const frSource = page.slug ? template.replace(/<body\b[^>]*>/, (tag) => setAttr(tag, "data-slug", page.slug)) : template;

      const fr = await renderPage(browser, page, "fr", { keys, shell: page.slug ? frSource : null });
      const frOut = withLastmod(page, "fr", (dates) => applyRender(frSource, page, "fr", fr, slugs, dates));
      report(page.out.fr, frOut.html, frOut.words);

      if (page.langs.includes("en")) {
        const shell = englishShell(frOut.html, page.template, { redirect: !page.slug });
        const en = await renderPage(browser, page, "en", { shell, keys });
        const enOut = withLastmod(page, "en", (dates) => applyRender(shell, page, "en", en, slugs, dates));
        report(page.out.en, enOut.html, enOut.words);
      }
    }

    // Ancienne adresse project-detail.html?slug= : table de redirection et
    // liens du <noscript>, sans rendu.
    const legacy = legacyProjectPage(legacyTemplate, projects, legacyDict, slugs);
    report(LEGACY_PROJECT_PAGE, legacy, wordCount(legacy));

    const sitemap = sitemapPages(allPages);
    const sitemapChanged = sitemap !== sitemapSource;
    if (sitemapChanged && !CHECK_ONLY) fs.writeFileSync(path.join(ROOT, SITEMAP), sitemap);
    if (sitemapChanged) stale++;
    console.log(`${sitemapChanged ? (CHECK_ONLY ? "✗ pas à jour" : "✓ régénéré ") : "= inchangé  "} ${SITEMAP} (${allPages.length * 2} pages, créées le ${DATE_CREATED})`);

    // Pages d'un projet retiré de PROJECT_DETAILS : fichiers générés devenus
    // orphelins, supprimés (signalés en mode --check).
    for (const dir of ["projets", "en/projects"]) {
      const abs = path.join(ROOT, dir);
      if (!fs.existsSync(abs)) continue;
      for (const f of fs.readdirSync(abs).filter((n) => n.endsWith(".html"))) {
        if (slugs.includes(f.replace(/\.html$/, ""))) continue;
        stale++;
        if (!CHECK_ONLY) fs.unlinkSync(path.join(abs, f));
        console.log(`${CHECK_ONLY ? "✗ orphelin   " : "✓ supprimé  "} ${dir}/${f} (plus dans PROJECT_DETAILS)`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  if (CHECK_ONLY && stale) {
    console.error(`${stale} page(s) à régénérer : node scripts/generate-static.js`);
    process.exit(2);
  }
})().catch((err) => {
  console.error("Échec du pré-rendu :", err.message || err);
  process.exit(1);
});
