/**
 * scripts/lib/site-server.js
 *
 * Petit serveur HTTP statique qui sert le dépôt tel quel, partagé par
 * scripts/generate-pdf.js et scripts/generate-static.js : Chromium (Playwright)
 * a besoin d'une vraie origine http:// pour exécuter le site comme en ligne
 * (fetch, polices, chemins relatifs).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp", // logos d'entreprise : sans ce type, Chromium ignore l'image et le PDF sort sans logos
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function startServer(port) {
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
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

module.exports = { ROOT, MIME, startServer };
