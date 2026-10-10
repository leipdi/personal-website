// The share preview (og:image, Layout.astro): a 1200x630 shot of the hero from the built site,
// still sun (reduced motion), no top bar. Rerun after hero changes:
//   npm run build && node scripts/og-image.mjs      (writes public/og.jpg; build again after)
import { createRequire } from "node:module";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");
const DIST = join(ROOT, "dist");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg" };
const srv = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  try { const b = await readFile(join(DIST, p)); res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(4411);
const t = setTimeout(() => process.exit(1), 50000);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
await p.goto("http://localhost:4411/", { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: ".top{display:none!important}" });
await p.evaluate(() => dispatchEvent(new Event("resize")));
await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
await p.waitForTimeout(400);
const buf = await p.screenshot();
await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(join(ROOT, "public", "og.jpg"));
await b.close(); srv.close(); clearTimeout(t);
