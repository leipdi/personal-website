// Cuts a photographed object out of its background with a local AI model
// (@imgly/background-removal-node, runs offline after the first model download),
// trims the empty border and writes a webp with alpha.
// For flat-coloured drawings use ground-to-alpha.cjs instead.
//
//   node scripts/cutout.mjs <input.jpg> <output.webp> [max width, default 1200] [--solid] [--fill-holes]
//
// --solid       sharpens the mask: half-transparent leftovers (a blurred second object, a hand)
//               go clear, the object goes fully opaque. Leave it off for glass.
// --fill-holes  makes every clear area that doesn't touch the picture's border opaque again
//               (white panels of a football read as background). Not for objects with real
//               openings, like a headphone band.
import { removeBackground } from "@imgly/background-removal-node";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

// The model package brings its own older sharp; loading the project's sharp as well
// clashes over the libvips DLL on Windows, so use that same copy.
const sharp = createRequire(import.meta.resolve("@imgly/background-removal-node"))("sharp");

const args = process.argv.slice(2);
const solid = args.includes("--solid");
const fillHoles = args.includes("--fill-holes");
const [src, dst, maxW = "1200"] = args.filter((a) => !a.startsWith("--"));
if (!src || !dst) {
  console.error("usage: node scripts/cutout.mjs <input> <output.webp> [max width]");
  process.exit(1);
}

const blob = await removeBackground(pathToFileURL(path.resolve(src)).href, {
  model: "medium",
  output: { format: "image/png" },
});
let png = Buffer.from(await blob.arrayBuffer());

if (solid || fillHoles) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  if (solid) {
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(255 * Math.min(1, Math.max(0, (data[i] / 255 - 0.4) / 0.25)));
    }
  }
  if (fillHoles) {
    // flood the clear area from the border; whatever clear area stays unreached is a hole
    const outside = new Uint8Array(w * h);
    const stack = [];
    const clear = (p) => data[p * 4 + 3] < 128;
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const p = stack.pop();
      if (outside[p] || !clear(p)) continue;
      outside[p] = 1;
      const x = p % w;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (p >= w) stack.push(p - w);
      if (p < w * (h - 1)) stack.push(p + w);
    }
    // take the hole's colours from the photo itself (the model may blank clear pixels)
    const orig = await sharp(src).resize(w, h, { fit: "fill" }).removeAlpha().raw().toBuffer();
    for (let p = 0; p < w * h; p++) {
      if (outside[p] || data[p * 4 + 3] === 255) continue;
      for (let k = 0; k < 3; k++) data[p * 4 + k] = orig[p * 3 + k];
      data[p * 4 + 3] = 255;
    }
  }
  png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// crop to the object: the model leaves faint specks near the edges that a plain trim keeps
const { data: px, info: pi } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let x0 = pi.width, y0 = pi.height, x1 = -1, y1 = -1;
for (let y = 0; y < pi.height; y++) {
  let n = 0, xa = pi.width, xb = -1;
  for (let x = 0; x < pi.width; x++) if (px[(y * pi.width + x) * 4 + 3] > 40) { n++; if (x < xa) xa = x; xb = x; }
  if (n < 3) continue; // a row with only a speck or two isn't the object
  y0 = Math.min(y0, y); y1 = y; x0 = Math.min(x0, xa); x1 = Math.max(x1, xb);
}
const pad = Math.round(0.01 * Math.max(pi.width, pi.height));
const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
const r = await sharp(png)
  .extract({ left, top, width: Math.min(pi.width, x1 + pad + 1) - left, height: Math.min(pi.height, y1 + pad + 1) - top })
  .resize({ width: +maxW, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 80, effort: 6 })
  .toFile(dst);
console.log(`${dst}: ${r.width}x${r.height}, ${Math.round(r.size / 1024)} KB`);
