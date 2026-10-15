// The day behind the page (data/day.ts): the page colour (--bg, set on the top bar, the pinned
// chart, Werdegang's label backings and the page behind; see holders below) blends from one section's colour to the next across a
// window height around their border; two soft light spots (.light in global.css) take the
// colours of that hour and drift slowly with the scroll (not with reduced motion).
import { DAY, STRENGTH } from "../data/day";
import { onScrollFrame, reduceMotion } from "./page";

const els = DAY.map((d) => document.querySelector<HTMLElement>(d.sel));
const spots = [...document.querySelectorAll<HTMLElement>("[data-light]")];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c: number[]) => `rgb(${c.map(Math.round).join(" ")})`;
const root = document.documentElement;
let lastBg = "";
// Who shows the colour: the page behind (.light, and the html for overscroll), the frosted bars
// and Werdegang (label backings, the pinned chart). --bg is set on these alone, not on the
// root: a custom property on the root restyles every element of the page (about 20 ms a frame
// on the owner's laptop, the stutter while scrolling). Werdegang only while it is near the
// screen (its own few hundred elements); decided here from its measured box, not by an observer
// (that arrived a frame late: a jump into Werdegang showed its chart in the old colour).
const werdegang = document.getElementById("werdegang");
const holders = [...document.querySelectorAll<HTMLElement>(".light, .frost")].filter((el) => !werdegang?.contains(el));
const setBg = (el: HTMLElement) => el.style.setProperty("--bg", lastBg);
let wgTop = 0, wgBottom = 0, wgBg = "";
// what each spot last got: only changed values are written (a new gradient repaints the whole
// spot; within a section only its position moves, which the compositor does alone)
const lastSpot = spots.map(() => ({ bg: "", op: "", tf: "" }));
let tops: number[] = [];
let pageH = 0;
const measureTops = () => {
  tops = els.map((el) => (el ? el.getBoundingClientRect().top + scrollY : Infinity));
  const r = werdegang?.getBoundingClientRect();
  if (r) [wgTop, wgBottom] = [r.top + scrollY, r.bottom + scrollY];
};
const measure = () => {
  measureTops();
  paint();
};
const paint = () => {
  // sections change height after load (the pile, the Werdegang padding): re-measure when
  // the page height changed. (Not with a ResizeObserver on the body: its callback's
  // layout reads made the Werdegang text jump a frame, npm run qa caught it.)
  const h = root.scrollHeight;
  if (h !== pageH) {
    pageH = h;
    measureTops();
  }
  // where we are: a line that runs from the window's top (page start) to its bottom (page
  // end), the middle in between, so the short first and last sections reach their own
  // colour too; a blend across one window height per border
  const max = Math.max(h - innerHeight, 1);
  const y = scrollY + innerHeight * Math.min(Math.max(scrollY / max, 0), 1);
  const z = innerHeight / 2;
  let i = 0;
  for (let j = 1; j < tops.length; j++) if (y >= tops[j] - z) i = j;
  // i = the section we're in or blending into; t = how far into it
  const t = i === 0 ? 1 : Math.min(Math.max((y - (tops[i] - z)) / (2 * z), 0), 1);
  const s = t * t * (3 - 2 * t);
  const p = DAY[Math.max(i - 1, 0)];
  const q = DAY[i];
  const bg = rgb(lerp(hex(p.bg), hex(q.bg), s));
  if (bg !== lastBg) {
    lastBg = bg;
    root.style.backgroundColor = bg;
    holders.forEach(setBg);
  }
  // (Werdegang within half a window of the screen)
  if (werdegang && wgBg !== bg && scrollY + innerHeight * 1.5 > wgTop && scrollY - innerHeight / 2 < wgBottom) {
    wgBg = bg;
    setBg(werdegang);
  }
  const k = (p.k + (q.k - p.k) * s) * STRENGTH;
  // the drift: within a section the spots travel a little with the scroll
  const into = reduceMotion.matches ? 0 : Math.min(Math.max((y - tops[i]) / innerHeight, -1), 2);
  const pairs: [string, string, number[], number[]][] = [
    [p.a, q.a, p.pa, q.pa],
    [p.b, q.b, p.pb, q.pb],
  ];
  pairs.forEach(([c0, c1, p0, p1], n) => {
    const el = spots[n];
    if (!el) return;
    const cv = lerp(hex(c0), hex(c1), s).map(Math.round).join(" ");
    const at = (a: number) => `rgb(${cv} / ${a})`;
    const pos = lerp(p0, p1, s);
    const dx = (n ? -1 : 1) * into * 4;
    const dy = -into * 6;
    // (the spot's size, 80vmax, without reading layout)
    const w = 0.8 * Math.max(innerWidth, innerHeight);
    // (eased stops: a plain two-stop falloff showed rings on the wide, pale spots)
    const was = lastSpot[n];
    if (cv !== was.bg) {
      was.bg = cv;
      el.style.background = `radial-gradient(closest-side, ${at(1)}, ${at(0.82)} 22%, ${at(0.5)} 48%, ${at(0.2)} 72%, ${at(0)})`;
    }
    const op = k.toFixed(3);
    if (op !== was.op) el.style.opacity = was.op = op;
    const tf = `translate(${((innerWidth * (pos[0] + dx)) / 100 - w / 2).toFixed(0)}px, ${((innerHeight * (pos[1] + dy)) / 100 - w / 2).toFixed(0)}px)`;
    if (tf !== was.tf) el.style.transform = was.tf = tf;
  });
};
onScrollFrame(paint);
addEventListener("resize", measure);
document.fonts?.ready.then(measure);
addEventListener("load", measure);
measure();
