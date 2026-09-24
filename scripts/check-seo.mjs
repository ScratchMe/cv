#!/usr/bin/env node
/**
 * scripts/check-seo.mjs — vérifications SEO de bout en bout, sur un serveur
 * qui sert la racine du dépôt (ou sur le site en ligne).
 *
 * Écrit pour la mission SEO de septembre 2026 (audit du 24/09/2026) : chaque
 * lot y ajoute ses critères de réussite, et le tout reste comme test de
 * non-régression. Deux lectures de chaque page :
 *   - le HTML BRUT (fetch, puis Chromium sans JavaScript) : ce que lisent les
 *     robots qui n'exécutent pas JS (assistants IA, LinkedIn, outils de tri) ;
 *   - le rendu AVEC JavaScript (Chromium via Playwright) : ce que voit un
 *     visiteur, et ce que Google indexe après rendu.
 *
 * Les requêtes vers d'autres domaines (polices Google, GoatCounter, Supabase)
 * reçoivent une réponse vide simulée : les vérifications ne dépendent pas du
 * réseau, et une erreur comptée est toujours une erreur du site lui-même.
 * Seule exception, --fit-call, qui fait UN vrai appel au Fit-Checker.
 *
 * Usage :
 *   node scripts/check-seo.mjs                          # http://localhost:8080, tous les lots
 *   node scripts/check-seo.mjs https://cv.antoine.berthaud.me
 *   node scripts/check-seo.mjs --lot 0                  # seulement la non-régression
 *   node scripts/check-seo.mjs --shots /tmp/captures    # + captures 390 px et 1 440 px
 *   node scripts/check-seo.mjs --fit-call               # + un vrai appel au Fit-Checker (en anglais)
 *
 * Code de sortie : 0 si tout passe, 1 si au moins un critère échoue.
 * Serveur local : python3 -m http.server 8080 (à la racine du dépôt).
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import pdfLib from "pdf-lib";

const { PDFDocument, PDFName } = pdfLib;

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
function argValue(name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}
const BASE = (argv.find((a) => /^https?:\/\//.test(a)) || "http://localhost:8080").replace(/\/+$/, "");
const MAX_LOT = argValue("--lot") !== undefined ? Number(argValue("--lot")) : Infinity;
const SHOTS_DIR = argValue("--shots");
const FIT_CALL = argv.includes("--fit-call");
const ORIGIN = new URL(BASE).origin;

// Domaine de production : c'est lui qu'écrivent canonical, hreflang, og:url,
// JSON-LD et sitemap, quel que soit le serveur vérifié.
const SITE = "https://cv.antoine.berthaud.me";

// ---------------------------------------------------------------------------
// Pages vérifiées (état visé à la fin du lot 1)
// ---------------------------------------------------------------------------
const HOME_FR = { path: "/", lang: "fr", url: `${SITE}/`, fr: `${SITE}/`, en: `${SITE}/en/`, kind: "home" };
const HOME_EN = { path: "/en/", lang: "en", url: `${SITE}/en/`, fr: `${SITE}/`, en: `${SITE}/en/`, kind: "home" };
const RES_FR = { path: "/results.html", lang: "fr", url: `${SITE}/results.html`, fr: `${SITE}/results.html`, en: `${SITE}/en/results.html`, kind: "results" };
const RES_EN = { path: "/en/results.html", lang: "en", url: `${SITE}/en/results.html`, fr: `${SITE}/results.html`, en: `${SITE}/en/results.html`, kind: "results" };
const LOT1_PAGES = [HOME_FR, HOME_EN, RES_FR, RES_EN];

// Captures : les cinq URL de l'état des lieux (lot 0). Après le lot 1,
// /?lang=en et /results.html?lang=en redirigent vers /en/… : la capture montre
// alors la page anglaise, à comparer à la référence prise avant.
const SHOT_PATHS = ["/", "/?lang=en", "/results.html", "/results.html?lang=en", "/project-detail.html?slug=tour-de-growth"];

// ---------------------------------------------------------------------------
// Résultats
// ---------------------------------------------------------------------------
const results = [];
function check(lot, id, label, ok, detail = "") {
  if (lot > MAX_LOT) return;
  results.push({ lot, id, label, ok: Boolean(ok), detail });
}
function skip(lot, id, label, why) {
  if (lot > MAX_LOT) return;
  results.push({ lot, id, label, ok: true, skipped: true, detail: why });
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const short = (s, n = 90) => (s == null ? String(s) : String(s).length > n ? `${String(s).slice(0, n)}…` : String(s));

// ---------------------------------------------------------------------------
// Navigateur : tiers simulés, erreurs du site relevées
// ---------------------------------------------------------------------------
const TYPES = { ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".woff2": "font/woff2" };
const stubbedHosts = new Set();

async function newContext(browser, { js = true, width = 1440, height = 900, realFit = false } = {}) {
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width, height }, reducedMotion: "reduce", locale: "en-US" });
  await ctx.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(ORIGIN) || url.startsWith("data:")) return route.continue();
    const host = new URL(url).host;
    if (realFit && host.endsWith(".supabase.co")) return route.continue();
    stubbedHosts.add(host);
    const ext = path.extname(new URL(url).pathname);
    return route.fulfill({ status: 200, contentType: TYPES[ext] || "text/plain", body: "" });
  });
  return ctx;
}

// Ouvre une page et relève : requêtes du site en erreur (statut ≥ 400 ou
// échec réseau), erreurs console et exceptions JS.
async function openTracked(ctx, pathOrUrl, { waitUntil = "load" } = {}) {
  const page = await ctx.newPage();
  const issues = [];
  page.on("console", (m) => {
    if (m.type() === "error") issues.push(`console : ${m.text()}`);
  });
  page.on("pageerror", (e) => issues.push(`exception JS : ${e.message}`));
  page.on("response", (r) => {
    if (r.url().startsWith(ORIGIN) && r.status() >= 400) issues.push(`HTTP ${r.status()} : ${r.url().slice(ORIGIN.length)}`);
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(ORIGIN)) issues.push(`requête échouée : ${r.url().slice(ORIGIN.length)} (${r.failure()?.errorText})`);
  });
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : BASE + pathOrUrl;
  const response = await page.goto(url, { waitUntil });
  await page.waitForTimeout(250); // rendus différés (DOMContentLoaded → load → microtâches)
  return { page, issues, status: response ? response.status() : 0 };
}

// Ce que les moteurs lisent dans le <head> et la structure de la page.
function readPage() {
  const q = (s) => document.querySelector(s);
  const meta = (s) => (q(s) ? q(s).getAttribute("content") : null);
  const all = (s) => [...document.querySelectorAll(s)];
  const body = document.body.cloneNode(true);
  body.querySelectorAll("script,style,noscript,template").forEach((el) => el.remove());
  const words = (body.textContent || "").split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
  return {
    lang: document.documentElement.getAttribute("lang"),
    title: document.title,
    description: meta('meta[name="description"]'),
    canonical: q('link[rel="canonical"]') ? q('link[rel="canonical"]').getAttribute("href") : null,
    hreflang: Object.fromEntries(all('link[rel="alternate"][hreflang]').map((l) => [l.getAttribute("hreflang"), l.getAttribute("href")])),
    ogUrl: meta('meta[property="og:url"]'),
    ogLocale: meta('meta[property="og:locale"]'),
    ogLocaleAlt: all('meta[property="og:locale:alternate"]').map((m) => m.getAttribute("content")),
    og: Object.fromEntries(all('meta[property^="og:"]').map((m) => [m.getAttribute("property"), m.getAttribute("content")])),
    twitter: Object.fromEntries(all('meta[name^="twitter:"]').map((m) => [m.getAttribute("name"), m.getAttribute("content")])),
    robots: meta('meta[name="robots"]'),
    jsonld: all('script[type="application/ld+json"]').map((s) => s.textContent),
    headings: all("body h1, body h2, body h3, body h4, body h5, body h6")
      .filter((h) => !h.closest("noscript"))
      .map((h) => Number(h.tagName[1])),
    h1: all("body h1").length,
    words,
    imgs: all("img").map((i) => ({
      src: i.getAttribute("src"),
      alt: i.getAttribute("alt"),
      loading: i.getAttribute("loading"),
      width: i.getAttribute("width"),
      height: i.getAttribute("height"),
      decorative: Boolean(i.closest('[aria-hidden="true"]')) || i.getAttribute("role") === "presentation",
    })),
    bodyText: document.body.innerText,
  };
}

async function rawFetch(p) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  return { status: res.status, text: await res.text(), location: res.headers.get("location") };
}

// Texte visible d'une page, sans ce qui n'existe qu'avec JavaScript (rail,
// Fit-Checker, bouton « Voir mes débuts ») ni ce qui n'existe que sans
// (noscript). Les débuts repliés sont dépliés pour comparer à contenu égal.
function visibleText() {
  document.body.classList.remove("early-collapsed");
  const skip = ["#fit-checker", ".xp-rail", ".early-toggle-wrap", "noscript", "script", "style", '[aria-hidden="true"]'];
  const hidden = [];
  skip.forEach((sel) =>
    document.querySelectorAll(sel).forEach((el) => {
      hidden.push([el, el.style.display]);
      el.style.setProperty("display", "none", "important");
    })
  );
  const text = document.body.innerText;
  hidden.forEach(([el, d]) => (el.style.display = d));
  return text.replace(/\s+/g, " ").trim();
}

function firstDiff(a, b) {
  const wa = a.split(" "),
    wb = b.split(" ");
  const n = Math.min(wa.length, wb.length);
  let i = 0;
  while (i < n && wa[i] === wb[i]) i++;
  if (i === wa.length && i === wb.length) return null;
  return `mot ${i} : sans JS « ${wa.slice(Math.max(0, i - 4), i + 8).join(" ")} » / avec JS « ${wb.slice(Math.max(0, i - 4), i + 8).join(" ")} »`;
}

// ---------------------------------------------------------------------------
// Lot 0 — non-régression : ce qui est bien fait et doit le rester
// ---------------------------------------------------------------------------
async function lot0(browser) {
  // robots.txt
  const robots = await rawFetch("/robots.txt");
  check(0, "0.robots", "robots.txt : 200, tout autorisé, sitemap déclaré", robots.status === 200 && /Sitemap:\s*https:\/\/cv\.antoine\.berthaud\.me\/sitemap\.xml/.test(robots.text) && !/Disallow:\s*\/\s*$/m.test(robots.text), `statut ${robots.status}`);

  // Sitemap : les deux PDF complets, jamais les courts
  const sm = await rawFetch("/sitemap.xml");
  check(0, "0.sitemap-pdf", "sitemap : les deux PDF complets déclarés, pas les courts", sm.text.includes(`${SITE}/assets/cv-antoine-berthaud-fr.pdf`) && sm.text.includes(`${SITE}/assets/cv-antoine-berthaud-en.pdf`) && !/-court\.pdf|-short\.pdf/.test(sm.text.replace(/<!--[\s\S]*?-->/g, "")));

  // HTTP → HTTPS : vérifiable seulement en ligne
  if (BASE.startsWith("https://")) {
    const http = await fetch(BASE.replace(/^https:/, "http:") + "/", { redirect: "manual" });
    check(0, "0.https", "http:// redirige vers https://", http.status >= 300 && http.status < 400 && /^https:/.test(http.headers.get("location") || ""), `statut ${http.status}`);
  } else skip(0, "0.https", "http:// redirige vers https://", "vérifiable seulement sur le site en ligne");

  const rawCtx = await newContext(browser, { js: false });
  const jsCtx = await newContext(browser, { js: true });
  const mobCtx = await newContext(browser, { js: true, width: 390, height: 844 });

  const pages = ["/", "/results.html", "/project-detail.html?slug=tour-de-growth"];
  for (const p of pages) {
    const { page } = await openTracked(rawCtx, p);
    const info = await page.evaluate(readPage);
    await page.close();

    const ogKeys = ["og:type", "og:title", "og:description", "og:image", "og:url", "og:locale"];
    const twKeys = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
    const missing = [...ogKeys.filter((k) => !info.og[k]), ...twKeys.filter((k) => !info.twitter[k])];
    check(0, "0.og", `${p} : balises og:/twitter: complètes, og:image 1200×630`, !missing.length && info.og["og:image:width"] === "1200" && info.og["og:image:height"] === "630", missing.length ? `manquantes : ${missing.join(", ")}` : "");

    check(0, "0.h1", `${p} : un seul h1 (HTML brut)`, info.h1 === 1, `${info.h1} h1`);
    const jumps = info.headings.map((h, i) => (i && h > info.headings[i - 1] + 1 ? `h${info.headings[i - 1]}→h${h}` : null)).filter(Boolean);
    check(0, "0.headings", `${p} : hiérarchie de titres sans saut, h1 en premier`, info.headings[0] === 1 && !jumps.length, jumps.join(", "));

    const noAlt = info.imgs.filter((i) => i.alt === null || (!i.decorative && !i.alt.trim()));
    check(0, "0.alt", `${p} : toutes les images ont un alt`, !noAlt.length, noAlt.map((i) => i.src).join(", "));

    if (p === "/") {
      check(0, "0.words", `${p} : au moins 1 700 mots lisibles sans JavaScript`, info.words >= 1700, `${info.words} mots`);
      const logos = info.imgs.filter((i) => /\/logos\//.test(i.src || ""));
      const bad = logos.filter((i) => !/\.webp$/.test(i.src) || i.loading !== "lazy" || !i.width || !i.height);
      check(0, "0.logos", `${p} : logos en WebP, lazy-loading, dimensions`, logos.length > 0 && !bad.length, `${logos.length} logos${bad.length ? `, en défaut : ${bad.map((i) => i.src).join(", ")}` : ""}`);
    }

    // Mise en page mobile sans défilement horizontal
    const { page: mp } = await openTracked(mobCtx, p);
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await mp.close();
    check(0, "0.mobile", `${p} : pas de défilement horizontal à 390 px`, overflow <= 1, `débordement ${overflow} px`);
  }

  // noindex des slugs inconnus : posé par JS, absent du HTML brut
  {
    const { page } = await openTracked(jsCtx, "/project-detail.html?slug=slug-inconnu-verif");
    const r = await page.evaluate(() => ({ robots: (document.querySelector('meta[name="robots"]') || {}).content || null, text: document.body.innerText }));
    await page.close();
    check(0, "0.noindex", "slug inconnu : « Projet introuvable » + noindex posé par JS", /introuvable|not found/i.test(r.text) && r.robots === "noindex", `robots=${r.robots}`);
    const raw = await rawFetch("/project-detail.html");
    check(0, "0.noindex-raw", "project-detail.html : pas de noindex dans le HTML brut", !/<meta[^>]+name="robots"[^>]+noindex/i.test(raw.text));
  }

  // GoatCounter sans cookies (count.js est simulé : on vérifie que le site
  // lui-même n'en pose aucun)
  {
    const { page } = await openTracked(jsCtx, "/");
    const cookies = await page.evaluate(() => document.cookie);
    await page.close();
    check(0, "0.cookies", "aucun cookie posé par le site", cookies === "", cookies);
  }

  // Métadonnées des PDF (titre, auteur, langue)
  for (const f of ["cv-antoine-berthaud-fr.pdf", "cv-antoine-berthaud-en.pdf", "cv-antoine-berthaud-fr-court.pdf", "cv-antoine-berthaud-en-short.pdf"]) {
    const res = await fetch(`${BASE}/assets/${f}`);
    let ok = false,
      detail = `statut ${res.status}`;
    if (res.ok) {
      const doc = await PDFDocument.load(new Uint8Array(await res.arrayBuffer()), { updateMetadata: false });
      const langObj = doc.catalog.get(PDFName.of("Lang"));
      const lang = langObj ? String(langObj.decodeText ? langObj.decodeText() : langObj).replace(/[()]/g, "") : "";
      ok = Boolean(doc.getTitle() && doc.getAuthor() && lang);
      detail = `titre « ${short(doc.getTitle(), 50)} », auteur « ${doc.getAuthor()} », langue ${lang || "absente"}`;
    }
    check(0, "0.pdf", `${f} : titre, auteur et langue`, ok, detail);
  }

  await rawCtx.close();
  await jsCtx.close();
  await mobCtx.close();
}

// ---------------------------------------------------------------------------
// Lot 1 — versions anglaises statiques (/en/, /en/results.html)
// ---------------------------------------------------------------------------
async function lot1(browser) {
  const rawCtx = await newContext(browser, { js: false });
  const jsCtx = await newContext(browser, { js: true });

  // Valeurs attendues, lues dans les sources (data.js, i18n.js) par le site lui-même
  const { page: probe } = await openTracked(jsCtx, "/");
  const expected = await probe.evaluate(() => {
    const out = {};
    for (const lang of ["fr", "en"]) {
      const prev = window.i18n.lang;
      window.i18n.setLang(lang);
      out[lang] = {
        home: { title: window.i18n.tc(PROFILE.seo.title), description: window.i18n.tc(PROFILE.seo.description) },
        results: { title: window.i18n.t("results.metaTitle"), description: window.i18n.t("results.metaDescription"), h1: window.i18n.t("results.title") },
      };
      window.i18n.setLang(prev);
    }
    return out;
  });
  await probe.close();

  const raw = {};
  for (const pg of LOT1_PAGES) {
    const r = await rawFetch(pg.path);
    const { page } = await openTracked(rawCtx, pg.path);
    raw[pg.path] = { status: r.status, text: r.text, info: r.status === 200 ? await page.evaluate(readPage) : null };
    await page.close();
  }

  // Critères 1 et 2 — HTML brut de chaque page
  for (const pg of LOT1_PAGES) {
    const { status, info } = raw[pg.path];
    const tag = `${pg.path}`;
    check(1, "1.1-status", `${tag} : statut 200`, status === 200, `statut ${status}`);
    if (!info) continue;
    const exp = expected[pg.lang][pg.kind];
    check(1, "1.1-lang", `${tag} : <html lang="${pg.lang}">`, info.lang === pg.lang, `lang=${info.lang}`);
    check(1, "1.1-title", `${tag} : <title> et description dans la langue de la page`, info.title === exp.title && info.description === exp.description, `« ${short(info.title, 60)} »`);
    check(1, "1.1-canonical", `${tag} : canonical ${pg.url}`, info.canonical === pg.url, `canonical=${info.canonical}`);
    check(1, "1.1-hreflang", `${tag} : hreflang fr, en et x-default`, eq(info.hreflang, { fr: pg.fr, en: pg.en, "x-default": pg.fr }), JSON.stringify(info.hreflang));
    const altLocale = pg.lang === "en" ? "fr_FR" : "en_US";
    check(1, "1.1-og", `${tag} : og:locale ${pg.lang === "en" ? "en_US" : "fr_FR"}, og:locale:alternate ${altLocale}, og:url sur soi`, info.ogLocale === (pg.lang === "en" ? "en_US" : "fr_FR") && eq(info.ogLocaleAlt, [altLocale]) && info.ogUrl === pg.url, `og:locale=${info.ogLocale} alt=${info.ogLocaleAlt} og:url=${info.ogUrl}`);
    if (pg.kind === "home") {
      let parsed = null,
        err = "";
      try {
        parsed = info.jsonld.map((s) => JSON.parse(s));
      } catch (e) {
        err = e.message;
      }
      const main = parsed && parsed.find((j) => j["@type"] === "ProfilePage");
      check(1, "1.1-jsonld", `${tag} : JSON-LD valide, ProfilePage inLanguage "${pg.lang}", Person #person`, main && main.inLanguage === pg.lang && main.url === pg.url && main.mainEntity && main.mainEntity["@id"] === `${SITE}/#person`, err || (main ? `inLanguage=${main.inLanguage} url=${main.url}` : "pas de ProfilePage"));
    }
    if (pg.lang === "en") {
      const body = info.bodyText;
      if (pg.kind === "home") check(1, "1.1-body", `${tag} : corps en anglais (« What defines me », pas « Ce qui me définit »)`, body.includes("What defines me") && !body.includes("Ce qui me définit"));
      else check(1, "1.2-body", `${tag} : corps en anglais (« ${exp.h1} »)`, body.includes(exp.h1) && !body.includes(expected.fr.results.h1));
    }
  }

  // Critère 3 — plus aucun « lang=en » dans le HTML généré, hors script de redirection
  for (const pg of LOT1_PAGES) {
    const text = (raw[pg.path].text || "").replace(/<script id="lang-redirect">[\s\S]*?<\/script>/, "");
    const n = (text.match(/lang=en/g) || []).length;
    check(1, "1.3", `${pg.path} : aucun « lang=en » hors script de redirection`, raw[pg.path].status === 200 && n === 0, `${n} occurrence(s)`);
  }

  // Critère 4 — avec JS : canonical, lang, titre, description identiques au HTML brut
  for (const pg of LOT1_PAGES) {
    if (!raw[pg.path].info) continue;
    const { page } = await openTracked(jsCtx, pg.path);
    const js = await page.evaluate(readPage);
    await page.close();
    const r = raw[pg.path].info;
    const same = ["canonical", "lang", "title", "description"].filter((k) => js[k] !== r[k]);
    check(1, "1.4", `${pg.path} : canonical, lang, titre, description identiques avec et sans JS`, !same.length, same.map((k) => `${k} : « ${short(r[k], 40)} » → « ${short(js[k], 40)} »`).join(" ; "));
  }

  // Critère 5 — texte visible identique avec et sans JS (pages anglaises)
  for (const pg of [HOME_EN, RES_EN]) {
    if (!raw[pg.path].info) {
      check(1, "1.5", `${pg.path} : même texte visible avec et sans JavaScript`, false, "page absente");
      continue;
    }
    const { page: p1 } = await openTracked(rawCtx, pg.path);
    const noJs = await p1.evaluate(visibleText);
    await p1.close();
    const { page: p2 } = await openTracked(jsCtx, pg.path);
    const withJs = await p2.evaluate(visibleText);
    await p2.close();
    const d = firstDiff(noJs, withJs);
    check(1, "1.5", `${pg.path} : même texte visible avec et sans JavaScript`, !d, d || `${noJs.split(" ").length} mots`);
  }

  // Critère 6 — redirections des anciennes URL ?lang=en
  for (const [from, to] of [
    ["/?lang=en", "/en/"],
    ["/?lang=en#experiences", "/en/#experiences"],
    ["/results.html?lang=en", "/en/results.html"],
  ]) {
    const { page } = await openTracked(jsCtx, from);
    await page.waitForURL((u) => u.pathname.startsWith("/en/"), { timeout: 3000 }).catch(() => {});
    const u = new URL(page.url());
    await page.close();
    check(1, "1.6", `${from} → ${to}`, u.pathname + u.search + u.hash === to, `arrivée : ${u.pathname + u.search + u.hash}`);
  }

  // Critère 7 — lien de langue (vrai lien), ancre conservée
  for (const [from, hash, to] of [
    ["/", "#experiences", "/en/#experiences"],
    ["/en/", "#experiences", "/#experiences"],
    ["/en/results.html", "", "/results.html"],
  ]) {
    const { page } = await openTracked(jsCtx, from + hash);
    const link = await page.evaluate(() => {
      const a = document.getElementById("langToggle");
      return a ? { tag: a.tagName, hreflang: a.getAttribute("hreflang"), lang: a.getAttribute("lang"), href: a.getAttribute("href") } : null;
    });
    let arrived = "";
    if (link && link.tag === "A") {
      await Promise.all([page.waitForNavigation({ waitUntil: "load" }), page.click("#langToggle")]);
      const u = new URL(page.url());
      arrived = u.pathname + u.search + u.hash;
    }
    await page.close();
    const other = from.startsWith("/en/") ? "fr" : "en";
    check(1, "1.7", `lien de langue ${from + hash} → ${to} (<a hreflang="${other}" lang="${other}">)`, link && link.tag === "A" && link.hreflang === other && link.lang === other && arrived === to, link ? `<${link.tag.toLowerCase()} href="${link.href}" hreflang=${link.hreflang} lang=${link.lang}> → ${arrived}` : "pas de #langToggle");
  }

  // Critère 8 — liens internes dans la langue de la page (rendu avec JS).
  // Exception du lot 1 (levée au lot 2) : les liens vers la page Tour de
  // Growth gardent leur fonctionnement actuel (project-detail.html?slug=).
  for (const pg of LOT1_PAGES) {
    if (!raw[pg.path].info) continue;
    const { page } = await openTracked(jsCtx, pg.path);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ id: a.id, href: a.href, raw: a.getAttribute("href") })));
    await page.close();
    const pageUrl = new URL(BASE + pg.path);
    const internal = links.filter((l) => l.href.startsWith(ORIGIN));
    const bad = internal.filter((l) => {
      const u = new URL(l.href);
      if (/^\/assets\/|\.pdf$/.test(u.pathname)) return false; // PDF et assets : partagés
      if (MAX_LOT < 2 && u.pathname === "/project-detail.html") return false; // exception du lot 1
      if (u.pathname === pageUrl.pathname && u.search === "" && u.hash) return false; // ancre de la page
      if (l.id === "langToggle") return false;
      return pg.lang === "en" ? !u.pathname.startsWith("/en/") : u.pathname.startsWith("/en/");
    });
    check(1, "1.8", `${pg.path} : liens internes dans la langue de la page`, !bad.length, bad.length ? bad.map((l) => l.raw).slice(0, 5).join(", ") : `${internal.length} liens internes`);
  }

  // Critère 9 — aucune requête en erreur ni erreur console ; Fit-Checker en anglais
  for (const pg of LOT1_PAGES) {
    const { page, issues } = await openTracked(jsCtx, pg.path, { waitUntil: "networkidle" });
    await page.close();
    check(1, "1.9", `${pg.path} : aucune requête en erreur, aucune erreur console`, !issues.length, issues.slice(0, 4).join(" | "));
  }
  {
    const { page } = await openTracked(jsCtx, "/en/");
    const fit = await page.evaluate(() => ({
      title: (document.querySelector("#fit-checker h2") || {}).textContent || "",
      placeholder: (document.getElementById("jobPosting") || {}).placeholder || "",
      button: (document.getElementById("analyzeBtn") || {}).textContent || "",
      lang: window.i18n && window.i18n.lang,
    }));
    await page.close();
    check(1, "1.9-fit", "/en/ : le Fit-Checker s'initialise en anglais", fit.lang === "en" && /fit/i.test(fit.title) && !/Vérifiez|Collez|Analyser/.test(fit.title + fit.placeholder + fit.button), `« ${short(fit.title, 50)} » / « ${short(fit.button, 30)} »`);
  }

  // Critère 10 — sitemap
  {
    const sm = await rawFetch("/sitemap.xml");
    const { page } = await openTracked(jsCtx, "/");
    const parse = await page.evaluate((xml) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      const err = doc.querySelector("parsererror");
      if (err) return { error: err.textContent.slice(0, 200) };
      const urls = [...doc.getElementsByTagNameNS("http://www.sitemaps.org/schemas/sitemap/0.9", "url")].map((u) => ({
        loc: u.getElementsByTagNameNS("http://www.sitemaps.org/schemas/sitemap/0.9", "loc")[0].textContent,
        lastmod: (u.getElementsByTagNameNS("http://www.sitemaps.org/schemas/sitemap/0.9", "lastmod")[0] || {}).textContent,
        alt: Object.fromEntries([...u.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link")].map((l) => [l.getAttribute("hreflang"), l.getAttribute("href")])),
      }));
      return { urls };
    }, sm.text);
    await page.close();
    check(1, "1.10-xml", "sitemap.xml : XML bien formé", sm.status === 200 && !parse.error, parse.error || "");
    if (!parse.error) {
      const byLoc = Object.fromEntries(parse.urls.map((u) => [u.loc, u]));
      for (const pg of LOT1_PAGES) {
        const u = byLoc[pg.url];
        check(1, "1.10-url", `sitemap : ${pg.url} avec ses hreflang et un lastmod`, u && eq(u.alt, { fr: pg.fr, en: pg.en, "x-default": pg.fr }) && /^\d{4}-\d{2}-\d{2}/.test(u.lastmod || ""), u ? JSON.stringify(u.alt) : "absente");
      }
      check(1, "1.10-nolang", "sitemap : plus aucune URL ?lang=en", !/lang=en/.test(sm.text));
    }
  }

  // Critère 11 — chemin compté par GoatCounter
  for (const [p, expectedPath] of [
    ["/", "/"],
    ["/en/", "/en/"],
    ["/results.html", "/results.html"],
    ["/en/results.html", "/en/results.html"],
  ]) {
    const { page } = await openTracked(jsCtx, p);
    const gc = await page.evaluate(() => window.goatcounter && window.goatcounter.path);
    await page.close();
    check(1, "1.11", `${p} : window.goatcounter.path = « ${expectedPath} »`, gc === expectedPath, `« ${gc} »`);
  }

  // Critère 12 — même mise en page FR / EN : mêmes sections, mêmes blocs
  for (const [fr, en] of [
    [HOME_FR, HOME_EN],
    [RES_FR, RES_EN],
  ]) {
    const prints = [];
    for (const pg of [fr, en]) {
      if (!raw[pg.path].info) break;
      const { page } = await openTracked(jsCtx, pg.path);
      prints.push(
        await page.evaluate(() => ({
          sections: [...document.querySelectorAll("main section[id], main > section, .results-list > article")].map((s) => s.id || s.className),
          blocks: Object.fromEntries(
            [".company-block", ".role", ".pillar", ".case-card", ".chip", ".result-block", ".result-star", ".hero-stat", "nav li", ".footer-links a", ".btn"].map((s) => [s, document.querySelectorAll(s).length])
          ),
          height: Math.round(document.documentElement.scrollHeight / 100) * 100,
        }))
      );
      await page.close();
    }
    if (prints.length < 2) {
      check(1, "1.12", `${fr.path} et ${en.path} : même structure de page`, false, "page anglaise absente");
      continue;
    }
    const [a, b] = prints;
    const diffBlocks = Object.keys(a.blocks).filter((k) => a.blocks[k] !== b.blocks[k]);
    check(1, "1.12", `${fr.path} et ${en.path} : mêmes sections et mêmes blocs (hauteur ${a.height} / ${b.height} px)`, eq(a.sections, b.sections) && !diffBlocks.length, diffBlocks.map((k) => `${k} ${a.blocks[k]}≠${b.blocks[k]}`).join(", ") || (eq(a.sections, b.sections) ? "" : "sections différentes"));
  }

  await rawCtx.close();
  await jsCtx.close();
}

// ---------------------------------------------------------------------------
// Un vrai appel au Fit-Checker, depuis la page anglaise (--fit-call)
// ---------------------------------------------------------------------------
async function fitCall(browser) {
  const ctx = await newContext(browser, { js: true, realFit: true });
  const { page } = await openTracked(ctx, "/en/");
  await page.fill("#jobPosting", "Senior Product Manager, Growth. B2B SaaS company in Nantes, France. You will own onboarding, activation and self-serve monetization, run A/B tests and work with data (SQL, Mixpanel). 5+ years of product management experience required.");
  await page.click("#analyzeBtn");
  const outcome = await Promise.race([
    page.waitForSelector("#fitResult:not([hidden])", { timeout: 60000 }).then(() => "result"),
    page.waitForSelector("#fitError:not([hidden])", { timeout: 60000 }).then(() => "error"),
  ]).catch(() => "timeout");
  const text = await page.evaluate((o) => (o === "result" ? document.getElementById("fitResult").innerText : (document.getElementById("fitError") || {}).textContent || ""), outcome);
  await ctx.close();
  check(1, "1.9-fitcall", "/en/ : un vrai appel au Fit-Checker renvoie une analyse en anglais", outcome === "result" && /strength|watch|question|score/i.test(text), `${outcome} : « ${short(text.replace(/\s+/g, " "), 120)} »`);
}

// ---------------------------------------------------------------------------
// Captures (--shots DIR)
// ---------------------------------------------------------------------------
async function shots(browser) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  for (const [label, width, height] of [
    ["390", 390, 844],
    ["1440", 1440, 900],
  ]) {
    const ctx = await newContext(browser, { js: true, width, height });
    for (const p of SHOT_PATHS) {
      const { page } = await openTracked(ctx, p, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const name = p.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "accueil";
      await page.screenshot({ path: path.join(SHOTS_DIR, `${name}-${label}.png`), fullPage: true });
      await page.close();
    }
    await ctx.close();
  }
  console.log(`Captures : ${SHOTS_DIR}`);
}

// ---------------------------------------------------------------------------
(async () => {
  const browser = await chromium.launch();
  try {
    await lot0(browser);
    if (MAX_LOT >= 1) await lot1(browser);
    if (FIT_CALL) await fitCall(browser);
    if (SHOTS_DIR) await shots(browser);
  } finally {
    await browser.close();
  }

  console.log(`check-seo — ${BASE}${Number.isFinite(MAX_LOT) ? ` (lots ≤ ${MAX_LOT})` : ""}\n`);
  let lastLot = -1;
  for (const r of results) {
    if (r.lot !== lastLot) {
      console.log(`${r.lot === 0 ? "Lot 0 — non-régression" : `Lot ${r.lot}`}`);
      lastLot = r.lot;
    }
    const mark = r.skipped ? "–" : r.ok ? "✅" : "❌";
    console.log(`  ${mark} [${r.id}] ${r.label}${r.detail ? `  (${r.detail})` : ""}`);
  }
  const failed = results.filter((r) => !r.ok);
  const skipped = results.filter((r) => r.skipped).length;
  if (stubbedHosts.size) console.log(`\nTiers simulés (réponse vide) : ${[...stubbedHosts].sort().join(", ")}`);
  console.log(`\n${results.length - failed.length - skipped} réussi(s), ${failed.length} échoué(s)${skipped ? `, ${skipped} ignoré(s)` : ""}.`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error("check-seo : erreur d'exécution —", err);
  process.exit(1);
});
