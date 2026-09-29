// Stark vereinfachtes Anschauungsmodell: gefrästes vs. 3D-gedrucktes Titan-Bauteil (1 kg gefräst).
// Größenordnungen aus der Literatur gerundet, bewusst NICHT die Methodik oder Ergebnisse der Masterarbeit.
// Nicht enthalten: Gutschrift für recycelte Titanspäne, Nachbearbeitung des gedruckten Teils.
// Stützstrukturen stecken nur pauschal im Pulvermehrbedarf (btfPrint).
// Intern rechnet alles in MJ Primärenergie; angezeigt wird in Liter Kerosin, weil sich darunter jeder etwas vorstellen kann.

export const AM = {
  massConv: 1, // kg, gefrästes Bauteil
  titanium: 600, // MJ/kg Titan-Halbzeug
  machining: 10, // MJ je kg Rohmaterial (Zerspanen)
  btfPrint: 1.5, // kg Pulver je kg gedrucktes Teil (Stützstrukturen, Ausschuss)
  atomise: 200, // MJ/kg Pulverherstellung zusätzlich zum Titan
  printing: 1000, // MJ/kg gedrucktes Bauteil (Laserschmelzen inkl. Nebenaggregate)
  flight: 1.5, // MJ je kg mitgeflogener Masse und Flugstunde (Kerosin inkl. Vorkette)
  hoursPerYear: 3000, // rund, typische Auslastung eines Verkehrsflugzeugs
  years: 25, // rund, typische Nutzungsdauer eines Verkehrsflugzeugs
  mjPerLitre: 35, // Kerosin, gerundet
};

// btf: kg Titan, die beim Fräsen für 1 kg fertiges Bauteil eingekauft werden (Buy-to-Fly-Verhältnis).
// Unter ~1,5:1 kommt man beim Fräsen praktisch nicht, daher die Untergrenze des Reglers.
export type AmInput = { saving: number; btf: number }; // saving 0..0.6, btf 1.5..20
export const RANGE = { btf: { min: 1.5, max: 20, step: 0.5 }, saving: { min: 0, max: 60, step: 1 } };

// Vergleichsfälle über dem Diagramm. Voreinstellung ist der mittlere Fall (DEFAULT_PRESET),
// nicht der schmeichelhafteste.
export const PRESETS: { id: string; label: string; input: AmInput }[] = [
  { id: "filigran", label: "Filigrane Halterung", input: { saving: 0.3, btf: 12 } },
  { id: "kompakt", label: "Kompaktes Teil", input: { saving: 0.05, btf: 2 } },
  { id: "gleich", label: "Gedruckt nicht leichter", input: { saving: 0, btf: 1.5 } },
];
export const DEFAULT_PRESET = 1;

export const litres = (mj: number) => mj / AM.mjPerLitre;

function production({ saving, btf }: AmInput) {
  const mPrint = AM.massConv * (1 - saving);
  const prodConv = AM.massConv * btf * (AM.titanium + AM.machining);
  const prodPrint = mPrint * (AM.btfPrint * (AM.titanium + AM.atomise) + AM.printing);
  return { mPrint, prodConv, prodPrint };
}

export function amModel(input: AmInput) {
  const { mPrint, prodConv, prodPrint } = production(input);
  const head = prodConv - prodPrint; // Vorsprung (+) oder Rückstand (-) des Drucks nach der Herstellung
  const perHour = (AM.massConv - mPrint) * AM.flight; // Einsparung je Flugstunde
  const perYear = perHour * AM.hoursPerYear;
  const advantage = (years: number) => head + perYear * years; // MJ
  const breakEven = head >= 0 ? 0 : perYear > 0 ? -head / perYear : Infinity; // Jahre
  return { mPrint, prodConv, prodPrint, head, perYear, advantage, breakEven };
}

// Which chart marks exist for this input (the legend only lists those).
export function amMarks(input: AmInput) {
  const r = amModel(input);
  const T = AM.years;
  return {
    deficit: r.breakEven > 0,
    gain: r.breakEven < T,
    be: r.breakEven > 0 && r.breakEven <= T,
    ghost: true,
  };
}

// Chart geometry shared by server render and client update. On the client the width follows
// the element's real pixel width, so axis labels stay at 12px on every screen. The server
// renders at a phone width so the no-JS fallback stays legible on small screens.
export const CHART = { w: 640, ssrW: 360, h: 300, left: 52, right: 14, top: 30, bottom: 44 };

function niceStep(range: number) {
  const raw = range / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

export const fmt = (n: number, d = 0) =>
  n.toLocaleString("de-DE", { maximumFractionDigits: d, minimumFractionDigits: d });

// "rund"-Werte: zwei gültige Stellen reichen für ein Anschauungsmodell
function round2(n: number) {
  if (n === 0) return 0;
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(Math.abs(n))) - 1);
  return Math.round(n / mag) * mag;
}
export const fmtL = (mj: number) => `${fmt(round2(litres(mj)))} Liter`;
export const fmtBtf = (btf: number) => `${fmt(btf, btf % 1 ? 1 : 0)} : 1`;
export const fmtGrams = (kg: number) => (kg >= 1 ? "1 kg" : `${fmt(Math.round(kg * 1000))} g`);
// Slider hint; at 0 % saving "1 kg statt 1 kg" would read like a typo
export const savingHint = (kg: number) => (kg >= 1 ? "gedruckt genauso schwer wie gefräst" : `gedruckt ${fmtGrams(kg)} statt 1 kg`);
// Below one litre, "rund 0 Liter" would contradict "vorn"
const aboutL = (mj: number) => (litres(mj) < 1 ? "weniger als 1 Liter" : `rund ${fmtL(mj)}`);

const sameInput = (a: AmInput, b: AmInput) => a.btf === b.btf && Math.abs(a.saving - b.saving) < 1e-9;

// Fixed value range: always wide enough for all three comparison cases, so switching cases
// doesn't rescale the chart into the same triangle. Only extreme slider values widen it.
const presetRange = PRESETS.reduce(
  (acc, p) => {
    const r = amModel(p.input);
    const a0 = litres(r.advantage(0));
    const a1 = litres(r.advantage(AM.years));
    return { lo: Math.min(acc.lo, a0, a1), hi: Math.max(acc.hi, a0, a1) };
  },
  { lo: 0, hi: 0 },
);

type SvgOpts = { w?: number; h?: number; bare?: boolean; ghosts?: boolean; fixed?: boolean };

export function amSvg(input: AmInput, opts: SvgOpts = {}) {
  const { w = CHART.w, bare = false, ghosts = true, fixed = true } = opts;
  const h = opts.h ?? CHART.h;
  const r = amModel(input);
  const { left: l0, right, top: t0, bottom: b0 } = CHART;
  const left = bare ? 4 : l0;
  const top = bare ? 10 : t0;
  const bottom = bare ? 10 : b0;
  const T = AM.years;
  const a0 = litres(r.advantage(0));
  const a1 = litres(r.advantage(T));
  const lo = Math.min(a0, a1, 0, fixed ? presetRange.lo : 0);
  const hi = Math.max(a0, a1, fixed ? presetRange.hi : 0);
  const step = niceStep(Math.max(hi - lo, 10));
  const half = step / 2;
  const yMax = Math.max(step, Math.ceil(hi / step) * step);
  const yMin = Math.min(0, Math.floor(lo / half) * half);
  const x = (t: number) => left + (t / T) * (w - left - right);
  const y = (v: number) => top + ((yMax - v) / (yMax - yMin)) * (h - top - bottom);
  const n = (v: number) => v.toFixed(1);
  const at = (t: number) => litres(r.advantage(t));

  const out: string[] = [
    `<defs><pattern id="am-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<rect class="hatch-bg" width="6" height="6"/><line class="hatch-ln" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>`,
  ];
  if (!bare) {
    // ticks only at full steps; the half step of room below zero stays unlabelled
    const first = Math.ceil(yMin / step) * step;
    for (let v = first; v <= yMax + 1e-9; v += step) {
      const val = Number(v.toFixed(6));
      out.push(
        `<line class="gl" x1="${left}" x2="${w - right}" y1="${n(y(val))}" y2="${n(y(val))}"/>`,
        `<text class="tk" x="${left - 8}" y="${n(y(val))}" dy="0.32em" text-anchor="end">${fmt(val)}</text>`,
      );
    }
    const xStep = w < 420 ? 10 : 5;
    const xt: number[] = [];
    for (let t = 0; t < T; t += xStep) xt.push(t);
    if (T - xt[xt.length - 1] < xStep * 0.5) xt.pop(); // keep the end label clear of its neighbour
    xt.push(T);
    for (const t of xt) {
      const anchor = t === 0 ? "start" : t === T ? "end" : "middle";
      out.push(`<text class="tk" x="${n(x(t))}" y="${h - bottom + 20}" text-anchor="${anchor}">${t}</text>`);
    }
    out.push(
      `<text class="an" x="${w - right}" y="${h - 4}" text-anchor="end">Jahre im Linienbetrieb</text>`,
      `<text class="an" x="1" y="14">Vorteil des Drucks in Litern Kerosin</text>`,
    );
  }

  // deficit (hatched) up to the break-even, advantage (light steel) after it
  const be = Math.min(r.breakEven, T);
  const poly = (t0: number, t1: number) =>
    `M${n(x(t0))},${n(y(0))} L${n(x(t0))},${n(y(at(t0)))} L${n(x(t1))},${n(y(at(t1)))} L${n(x(t1))},${n(y(0))} Z`;
  if (be > 0) out.push(`<path class="deficit" d="${poly(0, be)}"/>`);
  if (be < T) out.push(`<path class="gain" d="${poly(be, T)}"/>`);

  out.push(`<line class="zero" x1="${left}" x2="${w - right}" y1="${n(y(0))}" y2="${n(y(0))}"/>`);

  // the other comparison cases as thin ghost lines, so the cases can be compared on one scale
  if (ghosts) {
    for (const p of PRESETS) {
      if (sameInput(p.input, input)) continue;
      const g = amModel(p.input);
      const g0 = Math.min(Math.max(litres(g.advantage(0)), yMin), yMax);
      const g1 = Math.min(Math.max(litres(g.advantage(T)), yMin), yMax);
      out.push(`<path class="ghost" d="M${n(x(0))},${n(y(g0))} L${n(x(T))},${n(y(g1))}"/>`);
    }
  }

  out.push(`<path class="ln" d="M${n(x(0))},${n(y(a0))} L${n(x(T))},${n(y(a1))}"/>`);
  if (r.breakEven > 0 && r.breakEven <= T)
    out.push(`<circle class="be" r="6.5" cx="${n(x(r.breakEven))}" cy="${n(y(0))}"/>`);
  return out.join("");
}

function fmtDuration(years: number) {
  const months = years * 12;
  if (months < 1) return "wenigen Wochen";
  if (months < 1.5) return "etwa einem Monat";
  if (months < 18) return `rund ${Math.round(months)} Monaten`;
  const y = Math.round(years * 2) / 2;
  return `rund ${fmt(y, y % 1 ? 1 : 0)} Jahren`;
}

function fmtHours(years: number) {
  const hrs = years * AM.hoursPerYear;
  if (hrs < 100) return fmt(Math.max(10, Math.round(hrs / 10) * 10));
  return fmt(hrs < 1000 ? Math.round(hrs / 50) * 50 : Math.round(hrs / 100) * 100);
}

export function amVerdict(input: AmInput) {
  const r = amModel(input);
  const total = fmtL(r.advantage(AM.years));
  // Would printing be ahead at production even if the part weren't lighter? Then the
  // lead comes from the titanium saved; otherwise it comes from the lighter part.
  const sameWeight = production({ ...input, saving: 0 });
  const materialLead = sameWeight.prodConv >= sameWeight.prodPrint;
  // within 10 % of each other, production is a draw, not a "lead"
  const close = Math.abs(r.head) < 0.1 * Math.max(r.prodConv, r.prodPrint);

  if (r.head >= 0) {
    const why = close
      ? `In der Herstellung liegen beide Verfahren fast gleichauf, der Druck knapp vorn (${aboutL(r.head)}).`
      : materialLead
        ? "Der Druck liegt schon ab Werk vorn, weil beim Fräsen so viel Titan im Span landet."
        : "Der Druck liegt schon ab Werk vorn, weil das gedruckte Teil so viel leichter ist, dass es weniger Pulver und Laserenergie braucht.";
    const then =
      r.perYear > 0
        ? close
          ? ` Den Unterschied macht das Gewicht: Über ${AM.years} Jahre kommen rund ${total} zusammen.`
          : ` Über ${AM.years} Jahre kommen rund ${total} zusammen.`
        : " Im Flug kommt nichts dazu, das Teil ist nicht leichter.";
    return why + then;
  }
  if (r.perYear === 0)
    return `Ohne Gewichtsersparnis holt das gedruckte Teil seinen Mehraufwand in der Herstellung nie wieder herein: Es fehlen dauerhaft rund ${fmtL(-r.head)}.`;
  if (r.breakEven > AM.years)
    return `Der Mehraufwand des Drucks wäre erst nach ${fmtDuration(r.breakEven)} wieder eingeflogen, länger, als ein Flugzeug üblicherweise fliegt.`;
  return `Der Mehraufwand des Drucks ist nach ${fmtDuration(r.breakEven)} im Linienbetrieb wieder eingeflogen (etwa ${fmtHours(r.breakEven)} Flugstunden). Über ${AM.years} Jahre bleiben rund ${total} Vorteil.`;
}
