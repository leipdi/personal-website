// Heliostat field for the home hero, side view. Each mirror is tilted so its normal bisects
// the directions to the sun and to the receiver (law of reflection), exactly as a real
// heliostat tracks. Shared by the server render (no-JS picture) and the client update.

export const FIELD = {
  // the viewBox starts left of 0: empty ground that widens the picture, so the field draws
  // smaller at the same page width (the hero sizes the SVG to this full aspect)
  x0: -480,
  w: 1440,
  h: 502, // ends just under the ground line, which doubles as the rule closing the hero
  ground: 500,
  tower: { x: 1330, top: 170, w: 22 },
  receiver: { x: 1341, y: 150 },
  first: 800, // the field starts right of the chart and the portrait (it started at 470)
  last: 1230,
  gap: 38,
  sunMaxY: 400, // the sun never sets below the mirrors
};

// Three rows for depth: the front row on the ground line, two rows further back that are
// smaller and sit a little higher toward the horizon, offset so they show between the
// front mirrors. Each mirror is aimed from its own pivot. Listed back to front, so the
// front row is drawn on top.
export type Row = { base: number; post: number; half: number; offset: number; light: number };
export const ROWS: Row[] = [
  { base: 468, post: 12, half: 8, offset: FIELD.gap / 4, light: 0.35 },
  { base: 482, post: 18, half: 11, offset: -FIELD.gap / 2, light: 0.6 },
  { base: FIELD.ground, post: 26, half: 15, offset: 0, light: 1 },
];

export const MIRRORS: { x: number; row: number }[] = [];
ROWS.forEach((r, row) => {
  for (let x = FIELD.first + r.offset; x <= FIELD.last + 1; x += FIELD.gap) MIRRORS.push({ x, row });
});

// Resting position (SSR, no JS, reduced motion): high and right of the name, so it clears
// the text at 768/1024/1440 and stays inside the right-hand slice on a 390px phone.
export const SUN_START = { x: 1165, y: 84 };

export type MirrorPose = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  px: number;
  py: number;
  base: number;
  row: number;
  cos: number;
};

export function clampSun(x: number, y: number) {
  return { x: Math.min(Math.max(x, FIELD.x0 + 10), FIELD.w - 10), y: Math.min(Math.max(y, 10), FIELD.sunMaxY) };
}

export function poses(sx: number, sy: number): MirrorPose[] {
  const { receiver: R } = FIELD;
  return MIRRORS.map(({ x: px, row }) => {
    const { base, post, half } = ROWS[row];
    const py = base - post;
    let ax = sx - px, ay = sy - py;
    let bx = R.x - px, by = R.y - py;
    const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
    ax /= la; ay /= la; bx /= lb; by /= lb;
    let nx = ax + bx, ny = ay + by;
    const ln = Math.hypot(nx, ny) || 1;
    nx /= ln; ny /= ln;
    // cosine loss: how face-on the mirror stands to the sun (1 = full light)
    const cos = Math.max(0, ax * nx + ay * ny);
    const tx = -ny, ty = nx;
    return { px, py, base, row, cos, x1: px - tx * half, y1: py - ty * half, x2: px + tx * half, y2: py + ty * half };
  });
}

// Reflected ray strength: follows the mirror's cosine, a mirror that stands almost edge-on
// to the sun (cos below ~0.2) sends only a faint ray; back rows are fainter overall.
export function rayOpacity(m: MirrorPose) {
  const edgeOn = Math.min(Math.max((m.cos - 0.1) / 0.15, 0.25), 1);
  return (0.3 + 0.65 * m.cos) * edgeOn * ROWS[m.row].light;
}

// How much light reaches the receiver: the field's mean cosine times how high the sun
// stands (a sun near the horizon brings little light). A sun behind the tower is not
// dimmed: its light meets the mirrors nearly head-on, which is why real fields are built
// on the far side of the tower from the sun.
export function fieldEfficiency(p: MirrorPose[], sunY: number) {
  const cos = p.reduce((s, m) => s + m.cos, 0) / p.length;
  const height = Math.min(Math.max((FIELD.ground - sunY) / (FIELD.ground - 160), 0.15), 1);
  return cos * height;
}

// The receiver's glow reacts strongly (cubic): a good sun makes it flare, a poor one leaves it dim.
export function receiverGlow(eff: number) {
  const k = eff ** 3;
  return { r: 10 + 75 * k, opacity: 0.15 + 0.85 * k };
}

export const f1 = (n: number) => n.toFixed(1);

// The economics side of the hero: a bar chart standing on the same ground line, left of the
// portrait, drawn like the field (steel bars, ink line). Its last bar is live: it shows what
// the field yields right now (fieldEfficiency), so the chart rises and falls with the sun.
export const CHART = {
  x: 412, // left edge of the first bar (just right of the text column)
  step: 38, // bar pitch
  w: 24, // bar width
  heights: [74, 98, 90, 128, 156], // the past: a rising, not perfectly smooth year
};

export type Bar = { x: number; y: number; w: number; h: number; live: boolean };

export function chartBars(eff: number): Bar[] {
  const hs = [...CHART.heights, 96 + 130 * eff];
  return hs.map((h, i) => ({
    x: CHART.x + i * CHART.step,
    y: FIELD.ground - h,
    w: CHART.w,
    h,
    live: i === hs.length - 1,
  }));
}

// the trend line through the bar tops
export function chartLine(bars: Bar[]) {
  return bars.map((b, i) => `${i ? "L" : "M"}${f1(b.x + b.w / 2)} ${f1(b.y)}`).join(" ");
}
