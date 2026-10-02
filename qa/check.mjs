// Standard QA pass for the one-page site: the checks every review round needs, in one run,
// so a tester agent only adds the few targeted checks a change calls for.
//
//   npm run qa                         build, serve the build, check 390 / 768 / 1440
//   npm run qa -- --sizes 320,390,1440 other sizes (width or WxH; <= 480 wide = phone emulation)
//   npm run qa -- --shots              also save one screenshot per section and size (qa/shots/)
//   npm run qa -- --base http://localhost:4321   check a running server instead of building
//
// Checks per size: console and page errors, horizontal overflow (with the elements that cause
// it), in-page links that point nowhere or at removed pages, the heading outline, where
// anchors land (sections and Kernkompetenzen cards just under the top bar, Werdegang
// stations just under the pinned chart), and that every Kernkompetenzen card shows its title
// below the top bar where it pins. Numbers first; screenshots only on request.
// Waits are for conditions (load, fonts, two animation frames), not fixed sleeps; every size
// has a hard time limit, so nothing can hang.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return fallback;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const sizes = String(opt("sizes", "390,768,1440"))
  .split(",")
  .map((s) => {
    const [w, h] = s.split("x").map(Number);
    return { w, h: h || (w <= 480 ? 844 : w <= 1024 ? Math.round(w * 1.33) : 900) };
  });
const shots = opt("shots", false);
const PER_SIZE_MS = 60_000;
const REMOVED = ["/werdegang/", "/kenntnisse/", "/kontakt/", "/projekte/"];

// ---- server: the built site (fast, no stale dev CSS) unless --base is given
let base = opt("base", null);
let server = null;
if (!base) {
  if (!args.includes("--no-build")) {
    console.log("building …");
    execSync("npm run build", { stdio: "ignore" });
  }
  const port = 4329;
  base = `http://localhost:${port}`;
  // the astro CLI run by node directly (no shell, no npx), so the pid is the server itself and
  // it can be stopped at the end (through npx + shell it outlived the run on Windows)
  server = spawn(process.execPath, ["node_modules/astro/bin/astro.mjs", "preview", "--port", String(port)], { stdio: "ignore" });
  const t0 = Date.now();
  for (;;) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    if (Date.now() - t0 > 30_000) throw new Error("preview server did not start");
    await new Promise((r) => setTimeout(r, 300));
  }
}

const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60)))),
  );

async function checkSize(browser, { w, h }) {
  const phone = w <= 480;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    reducedMotion: "reduce", // instant scrolls, still sun: measurements don't race animations
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);

  const fails = [];
  const notes = [];

  // overflow, with the elements reaching past the window
  const ov = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const culprits =
      sw > W
        ? [...document.querySelectorAll("body *")]
            .filter((el) => el.getBoundingClientRect().right > W + 1 && el.getClientRects().length)
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} →${Math.round(el.getBoundingClientRect().right)}`)
        : [];
    return { W, sw, culprits };
  });
  if (ov.sw > ov.W) fails.push(`overflow: page ${ov.sw}px wide in ${ov.W}px (${ov.culprits.join(", ")})`);

  // links: in-page targets exist, nothing points at removed pages
  const links = await page.evaluate((removed) => {
    const bad = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (href.startsWith("#") && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))))
        bad.push(`dead #: ${href}`);
      if (removed.some((r) => href.startsWith(r))) bad.push(`removed page: ${href}`);
    }
    return bad;
  }, REMOVED);
  fails.push(...links);

  // heading outline: one h1, no skipped levels
  const outline = await page.evaluate(() => {
    const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    const bad = [];
    if (hs.filter((l) => l === 1).length !== 1) bad.push(`${hs.filter((l) => l === 1).length} h1`);
    hs.forEach((l, i) => i > 0 && l > hs[i - 1] + 1 && bad.push(`h${hs[i - 1]} → h${l}`));
    return bad;
  });
  fails.push(...outline.map((o) => `headings: ${o}`));

  // anchors: where a hash lands
  const ids = await page.evaluate(() => ({
    sections: [...document.querySelectorAll("main > section[id]")].map((s) => s.id),
    panels: [...document.querySelectorAll("[data-kk-panel]")].map((p) => p.id),
    stations: [...document.querySelectorAll("[data-st]")].map((s) => s.id),
  }));
  const land = async (id) => {
    await page.evaluate((id) => {
      history.replaceState(null, "", location.pathname);
      scrollTo(0, 0);
      location.hash = id;
    }, id);
    await settle(page);
    await settle(page);
    return page.evaluate((id) => {
      const el = document.getElementById(id);
      const bar = document.querySelector(".top")?.getBoundingClientRect().bottom ?? 0;
      const chart = document.querySelector("[data-plan]");
      const cb = chart && getComputedStyle(chart).position === "sticky" ? chart.getBoundingClientRect().bottom : bar;
      const card = el.querySelector("[data-kk-card]");
      const title = (card ?? el).querySelector("h2, h3, .title");
      return {
        top: Math.round(el.getBoundingClientRect().top),
        titleTop: title ? Math.round(title.getBoundingClientRect().top) : null,
        bar: Math.round(bar),
        chartBottom: Math.round(cb),
        cardBottom: card ? Math.round(card.getBoundingClientRect().bottom) : null,
        opacity: card ? Number(getComputedStyle(card).opacity) : 1,
        h: innerHeight,
        // the page ended before the target could reach the top (the last section on a tall screen)
        atEnd: scrollY + innerHeight >= document.documentElement.scrollHeight - 2,
      };
    }, id);
  };
  for (const id of ids.sections) {
    const r = await land(id);
    if (r.top < r.bar - 1 || (r.top > r.bar + 40 && !r.atEnd)) fails.push(`#${id} lands at ${r.top} (bar ${r.bar})`);
  }
  for (const id of ids.panels) {
    const r = await land(id);
    if (r.titleTop < r.bar) fails.push(`#${id}: title at ${r.titleTop}, under the top bar (${r.bar})`);
    if (r.opacity < 0.99) fails.push(`#${id}: lands faded (opacity ${r.opacity})`);
    if (r.cardBottom > r.h + 1) notes.push(`#${id}: card runs ${r.cardBottom - r.h}px past the window (pins by its bottom)`);
  }
  for (const id of [ids.stations[0], ids.stations[Math.floor(ids.stations.length / 2)], ids.stations.at(-1)]) {
    if (!id) continue;
    const r = await land(id);
    if (r.top < r.chartBottom - 1 || r.top > r.chartBottom + 80)
      fails.push(`#${id} lands at ${r.top} (chart bottom ${r.chartBottom})`);
  }

  // the page-end sun: inside the picture and in open sky, left of the first mirror
  const end = await page.evaluate(() => {
    const svg = document.querySelector("[data-end-svg]");
    const sun = document.querySelector("[data-end-sun]");
    if (!svg || !sun) return null;
    const s = sun.getBoundingClientRect();
    const b = svg.getBoundingClientRect();
    const mirrorLeft = Math.min(...[...svg.querySelectorAll(".mirrors line")].map((l) => l.getBoundingClientRect().left));
    return { sunL: Math.round(s.left), sunR: Math.round(s.right), svgL: Math.round(b.left), mirrorLeft: Math.round(mirrorLeft) };
  });
  if (end && end.sunL < end.svgL) fails.push(`end sun cut off at the left (${end.sunL} < ${end.svgL})`);
  if (end && end.sunR > end.mirrorLeft) fails.push(`end sun over the mirrors (sun right ${end.sunR}, first mirror ${end.mirrorLeft})`);

  // screenshots, one per section
  if (shots) {
    const dir = `qa/shots/${w}x${h}`;
    mkdirSync(dir, { recursive: true });
    await page.evaluate(() => {
      history.replaceState(null, "", location.pathname);
      scrollTo(0, 0);
    });
    await settle(page);
    await page.screenshot({ path: `${dir}/0-hero.png` });
    for (const [i, id] of ids.sections.entries()) {
      await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
      await settle(page);
      await page.screenshot({ path: `${dir}/${i + 1}-${id}.png` });
    }
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await settle(page);
    await page.screenshot({ path: `${dir}/9-end.png` });
  }

  fails.push(...errors);
  await ctx.close();
  return { size: `${w}x${h}${phone ? " (phone)" : ""}`, fails, notes };
}

const browser = await chromium.launch();
const results = [];
try {
  for (const s of sizes) {
    const r = await Promise.race([
      checkSize(browser, s),
      new Promise((res) =>
        setTimeout(() => res({ size: `${s.w}x${s.h}`, fails: [`timed out after ${PER_SIZE_MS / 1000}s`], notes: [] }), PER_SIZE_MS),
      ),
    ]);
    results.push(r);
    console.log(`\n${r.size}: ${r.fails.length ? `${r.fails.length} FAIL` : "pass"}`);
    for (const f of r.fails) console.log(`  FAIL ${f}`);
    for (const n of r.notes) console.log(`  note ${n}`);
  }
} finally {
  await browser.close();
  if (server) {
    server.kill();
  }
}
mkdirSync("qa", { recursive: true });
writeFileSync("qa/last-report.json", JSON.stringify(results, null, 2));
const total = results.reduce((n, r) => n + r.fails.length, 0);
console.log(`\n${total ? `${total} failure(s)` : "all checks pass"} · report: qa/last-report.json${shots ? " · shots: qa/shots/" : ""}`);
process.exit(total ? 1 : 0);
