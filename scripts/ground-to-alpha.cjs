// Cuts the flat ground out of one of the owner's card pictures, so the card panel's own colour
// can fade into the text side while the picture stays whole (index.astro, `arts[].bg`).
// "Colour to alpha": every pixel is unmixed from the ground colour, so soft edges and light
// metal keep their shape instead of getting a hard cut.
//
//   node scripts/ground-to-alpha.cjs <input.png> <output.webp> [ground hex, default: top-left pixel]
//
// Then put the ground colour into `arts[id].bg` in src/pages/index.astro.
const sharp = require("sharp");

const [src, dst, hex] = process.argv.slice(2);
if (!src || !dst) {
  console.error("usage: node scripts/ground-to-alpha.cjs <input> <output.webp> [#rrggbb]");
  process.exit(1);
}

(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = hex ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) : [data[0], data[1], data[2]];
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const c = [data[i], data[i + 1], data[i + 2]];
    // the smallest alpha that explains the pixel as a colour laid over the ground
    let a = 0;
    for (let k = 0; k < 3; k++) {
      const d = c[k] - bg[k];
      a = Math.max(a, d < 0 ? -d / (bg[k] || 1) : d / (255 - bg[k] || 1));
    }
    // a small threshold, so the grain of the ground goes fully clear
    a = Math.min(1, Math.max(0, (a - 0.02) / 0.98));
    for (let k = 0; k < 3; k++) out[j + k] = a > 0 ? Math.round(Math.min(255, Math.max(0, (c[k] - bg[k]) / a + bg[k]))) : 0;
    out[j + 3] = Math.round(a * 255);
  }
  const r = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 80, alphaQuality: 70, effort: 6 })
    .toFile(dst);
  const g = "#" + bg.map((v) => v.toString(16).padStart(2, "0")).join("");
  console.log(`${dst}: ${r.width}x${r.height}, ${Math.round(r.size / 1024)} KB, ground ${g}`);
})();
