#!/usr/bin/env node
/**
 * scripts/generate-static.js — pré-rendu des pages (version française).
 *
 * Le contenu du CV vit dans js/data.js et c'est js/app.js (ou results.js,
 * project-detail.js) qui construit la page dans le navigateur. Un lecteur qui
 * n'exécute pas JavaScript — robots des moteurs de réponse IA, aperçus de lien,
 * une partie des outils de tri de candidatures — ne voyait que le pitch, trois
 * chiffres et le pied de page (258 mots sur 1 622, mesuré le 06/09/2026).
 *
 * Ce script ouvre chaque page dans Chromium (Playwright), en français, laisse
 * le JavaScript la rendre, puis recopie le HTML rendu dans le fichier source,
 * entre des marqueurs :
 *
 *     <!-- static:experiencesList -->…<!-- /static:experiencesList -->
 *
 * Tout ce qui est entre deux marqueurs est GÉNÉRÉ : ne jamais l'éditer à la
 * main, la prochaine génération l'écraserait. data.js reste la seule source ;
 * app.js re-rend par-dessus au chargement (même HTML en français, version
 * anglaise sur ?lang=en), les filtres, le Fit-Checker et la bascule de langue
 * continuent d'exiger JavaScript.
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

const PORT = 4174; // ≠ 4173 (generate-pdf.js) : les deux scripts peuvent tourner côte à côte
const CHECK_ONLY = process.argv.includes("--check");

// Une zone = un ou plusieurs éléments, recopiés en entier (outerHTML) entre
// les marqueurs <!-- static:ID --> et <!-- /static:ID -->. Les sélecteurs
// suivant le premier sont facultatifs (ex. le lien sous les chiffres du hero,
// absent si aucun chiffre n'a d'étude de cas).
// Les éléments du <head> posés par le JS (titre, description, canonical, og:)
// sont remplacés un par un, sans marqueur : ils sont uniques dans chaque page.
const PAGES = [
  {
    file: "index.html",
    url: "/index.html",
    head: ["title", 'meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]'],
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
      ["educationList", "#educationList"],
      ["trainingsList", "#trainingsList"],
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
    sentinels: ["Everysens", "Polytech", "Alix Paoli", "SNCF Connect"],
    minWords: 1400,
  },
  {
    file: "results.html",
    url: "/results.html",
    head: ["title", 'meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]'],
    zones: [["resultsRoot", "#resultsRoot"]],
    sentinels: ["Contexte", "Leçon", "Everysens"],
    minWords: 700,
  },
  {
    file: "project-detail.html",
    // Page gabarit pilotée par ?slug= : on y pré-rend LE side project (le seul
    // aujourd'hui). Le slug est lu dans PROJECT_DETAILS, pas codé en dur.
    url: (slug) => `/project-detail.html?slug=${encodeURIComponent(slug)}`,
    head: [
      "title",
      'meta[name="description"]',
      'link[rel="canonical"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
    ],
    zones: [["projectDetailRoot", "#projectDetailRoot"]],
    sentinels: ["Tour de Growth", "Stack"],
    minWords: 400,
  },
];

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
// tombent dans un commentaire <!-- … -->.
function findOutsideComments(html, re) {
  // Les commentaires sont remplacés par des espaces de même longueur : les
  // positions trouvées dans la copie masquée valent dans l'original, et une
  // mention de « <title> » dans un commentaire ne peut plus avaler le vrai.
  const masked = html.replace(/<!--[\s\S]*?-->/g, (c) => " ".repeat(c.length));
  return [...masked.matchAll(new RegExp(re.source, "g"))].map((m) => ({ index: m.index, length: m[0].length }));
}

function zonePattern(id) {
  return new RegExp(`<!-- static:${id} -->[\\s\\S]*?<!-- /static:${id} -->`);
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

async function renderPage(browser, page, slug) {
  const tab = await browser.newPage();
  const errors = [];
  tab.on("pageerror", (err) => errors.push(err.message));
  const url = typeof page.url === "function" ? page.url(slug) : page.url;
  // "load" suffit : le rendu se fait dans DOMContentLoaded, qui précède load.
  await tab.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: "load" });
  if (errors.length) throw new Error(`${page.file} : erreur JS au rendu — ${errors[0]}`);

  const lang = await tab.evaluate(() => document.documentElement.lang);
  if (lang !== "fr") throw new Error(`${page.file} : rendu en « ${lang} », attendu « fr »`);

  const head = await tab.evaluate((selectors) => {
    return selectors.map((sel) => {
      const el = document.querySelector(sel);
      return el ? el.outerHTML : null;
    });
  }, page.head);
  page.head.forEach((sel, i) => {
    if (!head[i]) throw new Error(`${page.file} : élément de <head> introuvable dans le rendu — ${sel}`);
  });

  const zones = await tab.evaluate((zoneList) => {
    return zoneList.map(([id, ...selectors]) => {
      const parts = selectors.map((sel) => document.querySelector(sel)).map((el) => (el ? el.outerHTML : null));
      return { id, first: parts[0], html: parts.filter(Boolean).join("\n") };
    });
  }, page.zones);
  zones.forEach((z) => {
    if (!z.first) throw new Error(`${page.file} : zone « ${z.id} » introuvable dans le rendu (${page.zones.find((x) => x[0] === z.id)[1]})`);
    if (!z.html.trim()) throw new Error(`${page.file} : zone « ${z.id} » rendue vide`);
    if (z.html.includes("static:")) throw new Error(`${page.file} : la zone « ${z.id} » contient un marqueur static: — marqueurs imbriqués ?`);
  });

  await tab.close();
  return { head, zones };
}

function applyToSource(page, rendered) {
  const filePath = path.join(ROOT, page.file);
  let html = fs.readFileSync(filePath, "utf8");

  page.head.forEach((sel, i) => {
    // Un commentaire du <head> peut citer « <title> » en toutes lettres : on ne
    // remplace que l'élément réel, hors commentaires.
    const found = findOutsideComments(html, headPattern(sel));
    if (found.length !== 1) throw new Error(`${page.file} : ${found.length} correspondance(s) pour ${sel} dans la source hors commentaires (attendu 1)`);
    const [m] = found;
    html = html.slice(0, m.index) + rendered.head[i] + html.slice(m.index + m.length);
  });

  rendered.zones.forEach((z) => {
    const re = zonePattern(z.id);
    const matches = html.match(new RegExp(re.source, "g")) || [];
    if (matches.length !== 1) {
      throw new Error(`${page.file} : ${matches.length} paire(s) de marqueurs pour « ${z.id} » (attendu 1 : <!-- static:${z.id} --> … <!-- /static:${z.id} -->)`);
    }
    html = html.replace(re, () => `<!-- static:${z.id} -->\n${z.html.trim()}\n<!-- /static:${z.id} -->`);
  });

  // Garde-fous sur le résultat complet.
  const words = wordCount(html);
  if (words < page.minWords) throw new Error(`${page.file} : ${words} mots sans JavaScript, attendu au moins ${page.minWords} — data.js incomplet ?`);
  const missing = page.sentinels.filter((s) => !html.includes(s));
  if (missing.length) throw new Error(`${page.file} : mot(s) attendu(s) absent(s) de la page générée — ${missing.join(", ")}`);

  return { filePath, html, words };
}

(async () => {
  const server = await startServer(PORT);
  const browser = await chromium.launch();
  let stale = 0;
  try {
    // Le slug du side project et son unicité : la page gabarit ne peut porter
    // qu'un seul pré-rendu. Un second side project demanderait une page par
    // projet (ou un pré-rendu du seul « principal ») — à décider à ce moment-là.
    const probe = await browser.newPage();
    await probe.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load" });
    const slugs = await probe.evaluate(() => Object.keys(PROJECT_DETAILS));
    await probe.close();
    if (slugs.length !== 1) {
      throw new Error(`PROJECT_DETAILS contient ${slugs.length} entrée(s) ; ce script pré-rend exactement un side project dans project-detail.html.`);
    }

    for (const page of PAGES) {
      const rendered = await renderPage(browser, page, slugs[0]);
      const { filePath, html, words } = applyToSource(page, rendered);
      const before = fs.readFileSync(filePath, "utf8");
      const changed = before !== html;
      if (changed && !CHECK_ONLY) fs.writeFileSync(filePath, html);
      if (changed) stale++;
      console.log(`${changed ? (CHECK_ONLY ? "✗ pas à jour" : "✓ régénéré ") : "= inchangé  "} ${page.file} (${words} mots sans JavaScript)`);
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
