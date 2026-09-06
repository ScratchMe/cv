#!/usr/bin/env node
/**
 * scripts/generate-pdf.js
 *
 * Génère un vrai PDF (via Chromium piloté par Playwright) directement à
 * partir du site — pas un simple "impression navigateur" : on garde donc un
 * contrôle total sur les marges, les couleurs et la mise en page, pour un
 * rendu fidèle au site et net à l'impression comme à l'écran.
 *
 * Usage :
 *   node scripts/generate-pdf.js
 *
 * Prérequis (une seule fois) :
 *   npm install -D playwright
 *   npx playwright install --with-deps chromium
 *
 * Sortie : assets/cv-antoine-berthaud-fr.pdf et assets/cv-antoine-berthaud-en.pdf
 *
 * Ce script tourne aussi automatiquement via GitHub Actions à chaque push
 * (voir .github/workflows/generate-pdf.yml) : tu n'as normalement jamais
 * besoin de le lancer toi-même, sauf pour prévisualiser un changement en local.
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PDFDocument, PDFName } = require("pdf-lib");
const { ROOT, startServer } = require("./lib/site-server");

const PORT = 4173;
const OUT_DIR = path.join(ROOT, "assets");
const BASE_NAME = "cv-antoine-berthaud"; // nom des fichiers PDF générés
// Origine publique du site (cf. CNAME). Chromium résout les liens relatifs
// contre le serveur local de génération : sans réécriture, les liens du PDF
// (chiffres du hero, étude de cas) pointaient vers http://127.0.0.1:4173/.
const SITE_URL = "https://cv.antoine.berthaud.me/";

// Métadonnées écrites dans chaque PDF (titre, auteur, sujet, mots-clés,
// langue). Chromium n'en écrit aucune ; or les PDF sont indexables par Google
// et c'est ce titre qui apparaît dans les résultats de recherche et dans
// l'onglet du lecteur PDF. Garder cohérent avec PROFILE.seo (js/data.js).
const PDF_META = {
  fr: {
    title: "CV Antoine Berthaud — Senior Product Manager à Nantes (Growth, SaaS)",
    subject: "CV d'Antoine Berthaud, Senior Product Manager à Nantes : 10 ans de produit en SaaS B2B (AB Tasty, Everysens, SNCF Connect). Growth, PLG, discovery, data.",
    keywords: ["Antoine Berthaud", "CV", "Product Manager", "Product Owner", "Growth", "SaaS", "Nantes"],
    language: "fr-FR",
  },
  en: {
    title: "Antoine Berthaud — Resume, Senior Growth Product Manager, Nantes (France)",
    subject: "Antoine Berthaud's CV, Senior Product Manager in Nantes, France: 10+ years in B2B SaaS product (AB Tasty, Everysens, SNCF Connect). Growth, PLG, discovery, data.",
    keywords: ["Antoine Berthaud", "resume", "CV", "Product Manager", "Product Owner", "Growth", "SaaS", "Nantes", "France"],
    language: "en-US",
  },
};

async function stampMetadata(pdfPath, lang) {
  const meta = PDF_META[lang];
  // updateMetadata:false — on garde les dates écrites par Chromium, on ne
  // touche qu'aux champs descriptifs.
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath), { updateMetadata: false });

  // Garde-fous de bout en bout : le workflow ouvre une issue si ce script
  // échoue, donc mieux vaut échouer ici que publier un PDF cassé sans bruit.
  // 1) Un data.js cassé produit un PDF de 2 pages (hero seul) sans erreur.
  if (doc.getPageCount() < 3) {
    throw new Error(`PDF ${lang} anormalement court : ${doc.getPageCount()} page(s) — data.js cassé ?`);
  }
  // 2) Aucun lien ne doit pointer vers le serveur local de génération.
  const localLinks = [];
  for (const page of doc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const annot = annots.lookup(i);
      const uri = annot?.lookup?.(PDFName.of("A"))?.lookup?.(PDFName.of("URI"));
      const value = uri?.decodeText?.();
      if (value && /^https?:\/\/(127\.|localhost)/.test(value)) localLinks.push(value);
    }
  }
  if (localLinks.length) {
    throw new Error(`Liens locaux dans ${path.basename(pdfPath)} : ${localLinks.join(", ")}`);
  }

  doc.setTitle(meta.title);
  doc.setAuthor("Antoine Berthaud");
  doc.setSubject(meta.subject);
  doc.setKeywords(meta.keywords);
  doc.setLanguage(meta.language);
  doc.setCreator(new URL(SITE_URL).host);
  fs.writeFileSync(pdfPath, await doc.save());
}

async function generateFor(browser, { lang, format, outPath }) {
  const page = await browser.newPage();
  // Une erreur JS sur la page (data.js cassé, par exemple) rend un site
  // réduit au hero, et page.pdf() sortirait un PDF vide sans se plaindre.
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  await page.goto(`http://127.0.0.1:${PORT}/index.html?lang=${lang}`, { waitUntil: "networkidle" });
  // Attend que les polices web (Google Fonts) soient réellement chargées,
  // sinon le PDF peut capturer un instant la police de secours système.
  await page.evaluate(() => document.fonts.ready);
  // Les logos d'entreprise sont en loading="lazy" et sous le pli : à ce
  // stade le navigateur ne les a pas chargés, et page.pdf() ne déclenche pas
  // le chargement différé — le PDF sortait sans logos. On force le chargement
  // de toutes les images et on attend qu'elles soient là.
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((img) => {
      img.loading = "eager";
    });
    await Promise.all(
      images.map((img) =>
        img.complete ? Promise.resolve() : new Promise((resolve) => img.addEventListener("load", resolve, { once: true }) || img.addEventListener("error", resolve, { once: true }))
      )
    );
  });

  if (pageErrors.length) throw new Error(`Erreur JS sur la page (${lang}) : ${pageErrors[0]}`);
  const check = await page.evaluate(() => ({
    roles: document.querySelectorAll(".role-block").length,
    // Une image qui n'a pas chargé (chemin cassé, type MIME inconnu du
    // serveur) sort du PDF sans bruit : on la compte.
    brokenImages: [...document.images].filter((img) => img.naturalWidth === 0).map((img) => img.getAttribute("src")),
    // Faces réellement chargées (pas seulement déclarées) : 0 = la feuille
    // Google Fonts n'a pas chargé, ou les fichiers woff2 n'ont pas suivi.
    fontFaces: [...document.fonts].filter((f) => f.status === "loaded").length,
  }));
  if (check.roles === 0) throw new Error(`Aucune expérience rendue (${lang}) — data.js probablement cassé.`);
  if (check.brokenImages.length) throw new Error(`Image(s) non chargée(s) (${lang}) : ${check.brokenImages.join(", ")}`);
  // PDF_ALLOW_FALLBACK_FONTS=1 : pour un test local sans accès à Google Fonts.
  if (check.fontFaces === 0 && !process.env.PDF_ALLOW_FALLBACK_FONTS) {
    throw new Error(`Polices web absentes (${lang}) — le PDF sortirait en police de secours.`);
  }

  // Réécrit les liens relatifs en absolus vers le site public (voir SITE_URL).
  // Les ancres #..., mailto:, tel: et les URLs déjà absolues restent intacts.
  await page.evaluate((site) => {
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;
      a.href = new URL(href, site).href;
    });
  }, SITE_URL);

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: outPath,
    format,
    printBackground: true,
    // PDF balisé (arbre de structure pour les lecteurs d'écran et les ATS)
    // et signets à partir des titres. Quelques dizaines de Ko de plus.
    tagged: true,
    outline: true,
    margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
  await page.close();
  await stampMetadata(outPath, lang);
  console.log(`✓ ${path.relative(ROOT, outPath)}`);
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await startServer(PORT);
  const browser = await chromium.launch();

  try {
    // A4 dans les deux langues : la cible anglophone est européenne (équipes
    // internationales à Nantes, Londres...), et le format Letter, plus court,
    // ajoutait deux pages à la version anglaise. À repasser en Letter
    // seulement pour une cible US explicite.
    await generateFor(browser, { lang: "fr", format: "A4", outPath: path.join(OUT_DIR, `${BASE_NAME}-fr.pdf`) });
    await generateFor(browser, { lang: "en", format: "A4", outPath: path.join(OUT_DIR, `${BASE_NAME}-en.pdf`) });
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error("Échec de la génération PDF :", err);
  process.exit(1);
});
