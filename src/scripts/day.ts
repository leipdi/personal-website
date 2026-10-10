// The day behind the page (data/day.ts): the page colour (--bg, so the top bar, the pinned chart
// and every label backing follow it) blends from one section's colour to the next across a
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
let tops: number[] = [];
let pageH = 0;
const measureTops = () => {
  tops = els.map((el) => (el ? el.getBoundingClientRect().top + scrollY : Infinity));
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
    root.style.setProperty("--bg", bg);
    lastBg = bg;
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
    el.style.background = `radial-gradient(closest-side, ${at(1)}, ${at(0.82)} 22%, ${at(0.5)} 48%, ${at(0.2)} 72%, ${at(0)})`;
    el.style.opacity = k.toFixed(3);
    el.style.transform = `translate(${((innerWidth * (pos[0] + dx)) / 100 - w / 2).toFixed(0)}px, ${((innerHeight * (pos[1] + dy)) / 100 - w / 2).toFixed(0)}px)`;
  });
};
onScrollFrame(paint);
addEventListener("resize", measure);
document.fonts?.ready.then(measure);
addEventListener("load", measure);
measure();
