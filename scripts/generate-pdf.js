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

const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const PORT = 4173;
const OUT_DIR = path.join(ROOT, "assets");
const BASE_NAME = "cv-antoine-berthaud"; // [À COMPLÉTER] change ici si tu renommes le CV

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      const filePath = path.join(ROOT, urlPath === "/" ? "/index.html" : urlPath);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function generateFor(browser, { lang, format, outPath }) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/index.html?lang=${lang}`, { waitUntil: "networkidle" });
  // Attend que les polices web (Google Fonts) soient réellement chargées,
  // sinon le PDF peut capturer un instant la police de secours système.
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: outPath,
    format,
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
  await page.close();
  console.log(`✓ ${path.relative(ROOT, outPath)}`);
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch();

  try {
    // A4 pour la version française (norme France/Europe), Letter pour la
    // version anglaise (norme US) — petit détail qui compte pour un
    // recruteur qui imprime le document.
    await generateFor(browser, { lang: "fr", format: "A4", outPath: path.join(OUT_DIR, `${BASE_NAME}-fr.pdf`) });
    await generateFor(browser, { lang: "en", format: "Letter", outPath: path.join(OUT_DIR, `${BASE_NAME}-en.pdf`) });
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error("Échec de la génération PDF :", err);
  process.exit(1);
});
