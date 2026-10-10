// Self-hosted web fonts: downloads Schibsted Grotesk and Newsreader (variable, latin + latin-ext)
// from Google Fonts into src/assets/fonts/ and writes src/styles/fonts.css. Newsreader italic is
// only the letters of the claim's *marked* words (profile.claim in cv.ts), a ~7 KB subset.
//
//   node scripts/fonts.mjs
//
// Run it again when the claim's marked words change: the build fails with a hint if a marked
// letter is missing from the subset (Layout.astro). Both families are SIL Open Font License 1.1
// (src/assets/fonts/OFL.txt).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/assets/fonts");
// a current browser's user agent: Google then serves woff2 with unicode-range subsets
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const KEEP = ["latin", "latin-ext"];
// the fallbacks' corrections (Chromium, 2026-10-10): size-adjust = web font width / local font
// width on German sample text (Newsreader averaged over 17, 24 and 40px: its optical sizes differ
// in width), ascent/descent = the web font's, divided by size-adjust
const FALLBACK = {
  serif: { size: "93.39%", ascent: "79.24%", descent: "28.91%" }, // Newsreader on Georgia
  // the hero name alone (Newsreader 500 at display size is wider than at text size): matched on
  // "Daniel Lenski" at 80-190px, so the portrait and the claim beside it don't shift (critic)
  name: { size: "103.29%", ascent: "71.64%", descent: "26.14%" },
  sans: { size: "103.87%", ascent: "94.35%", descent: "25.03%" }, // Schibsted Grotesk on Arial
};

// the claim's marked letters, exactly as Layout.astro computes them
const cv = readFileSync(join(ROOT, "src/data/cv.ts"), "utf8");
const claim = cv.match(/claim:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
if (!claim) throw new Error("profile.claim not found in cv.ts");
const italicText = [...new Set((claim.match(/\*(.+?)\*/g) ?? []).join("").replace(/\*/g, ""))].join("");

const css = async (q) => {
  const r = await fetch(`https://fonts.googleapis.com/css2?${q}&display=swap`, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${r.status} for ${q}`);
  return r.text();
};
// the @font-face blocks of one stylesheet, with the subset name Google puts before each
const faces = (text) =>
  [...text.matchAll(/(?:\/\* ([\w-]+) \*\/\s*)?@font-face\s*\{([^}]+)\}/g)].map(([, subset, body]) => ({
    subset: subset ?? "subset",
    family: body.match(/font-family:\s*'([^']+)'/)[1],
    style: body.match(/font-style:\s*(\w+)/)[1],
    weight: body.match(/font-weight:\s*([\d ]+);/)[1].trim(),
    src: body.match(/url\(([^)]+)\)/)[1],
    range: body.match(/unicode-range:\s*([^;]+);/)?.[1],
  }));

const roman = faces(await css("family=Schibsted+Grotesk:wght@400..900&family=Newsreader:opsz,wght@6..72,300..700")).filter((f) =>
  KEEP.includes(f.subset),
);
const italic = faces(await css(`family=Newsreader:ital,opsz,wght@1,6..72,400&text=${encodeURIComponent(italicText)}`));

mkdirSync(OUT, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const blocks = [];
for (const f of [...roman, ...italic.map((f) => ({ ...f, subset: "claim" }))]) {
  const file = `${slug(f.family)}-${f.style === "italic" ? "italic-" : ""}${f.subset}.woff2`;
  const r = await fetch(f.src, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${r.status} for ${f.src}`);
  writeFileSync(join(OUT, file), Buffer.from(await r.arrayBuffer()));
  console.log(file);
  blocks.push(`@font-face {
  font-family: "${f.family}";
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url("../assets/fonts/${file}") format("woff2");${f.range ? `\n  unicode-range: ${f.range};` : ""}
}`);
}
writeFileSync(join(OUT, "italic-text.json"), JSON.stringify({ italicText }) + "\n");

// Local fallbacks with the web fonts' metrics (width, ascent, descent), so text set in the
// fallback while the web font loads takes the same room and nothing shifts when it swaps in.
// Measured in Chromium against Georgia and Arial (2026-10-10, see AGENTS.md).
const fallbacks = `/* metric-matched fallbacks (measured, see scripts/fonts.mjs) */
@font-face {
  font-family: "Newsreader Fallback";
  src: local("Georgia");
  size-adjust: ${FALLBACK.serif.size};
  ascent-override: ${FALLBACK.serif.ascent};
  descent-override: ${FALLBACK.serif.descent};
  line-gap-override: 0%;
}
@font-face {
  font-family: "Newsreader Name Fallback";
  src: local("Georgia");
  size-adjust: ${FALLBACK.name.size};
  ascent-override: ${FALLBACK.name.ascent};
  descent-override: ${FALLBACK.name.descent};
  line-gap-override: 0%;
}
@font-face {
  font-family: "Schibsted Grotesk Fallback";
  src: local("Arial");
  size-adjust: ${FALLBACK.sans.size};
  ascent-override: ${FALLBACK.sans.ascent};
  descent-override: ${FALLBACK.sans.descent};
  line-gap-override: 0%;
}`;

writeFileSync(
  join(ROOT, "src/styles/fonts.css"),
  `/* Generated by scripts/fonts.mjs: self-hosted Schibsted Grotesk and Newsreader (SIL OFL 1.1). */\n\n${blocks.join("\n\n")}\n\n${fallbacks}\n`,
);
console.log("italic letters:", italicText);
