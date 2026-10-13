# Projekte, step 1 (Ringprojekt) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring back a Projekte section between Werdegang and Kenntnisse with its first project, the Ringprojekt: text about the owner's PPS role, a line sketch of the part, and a lanes figure of how the team worked.

**Architecture:** One new section component renders `projects` from `src/data/cv.ts`; the Ringprojekt's two figures are their own server-rendered SVG components (no JS). The lanes figure is drawn from small data lists inside its component and is two SVGs at one scale (lane names | chart); a container query switches it to natural size with sideways scrolling and pinned names when the column is narrow. The QA harness learns to check project anchors and the scroller.

**Tech Stack:** Astro 5 (static), plain scoped CSS with the tokens in `src/styles/global.css`, inline SVG, Playwright 1.63 (`qa/check.mjs`).

**Spec:** `docs/superpowers/specs/2026-10-13-projekte-ringprojekt-design.md`

## Global Constraints

- Read AGENTS.md before starting; its design rules are binding.
- Palette: ink/steel only in the figures. `--sun` never (it means light); `--c-edu/--c-thesis/--c-work/--c-ai` never (Werdegang categories). `--steel` never for text.
- Type: Newsreader for headings and prose, Schibsted Grotesk for UI; `.display` only for the section title "Projekte".
- No uppercase tracked eyebrows, no mono micro-labels, no KPI tiles, no "→" on links, no middle-dot meta strings, no boxed-card grids, no visible numbered steps.
- Copy: German, plain; only facts from the spec's "Facts" section. No numbers, dates, machine names beyond them.
- Every root-absolute path to a `public/` file goes through `url()` (none are needed here).
- CSS cascade: media/container-query overrides come after the base rule they override.
- Must work at 320-480 phones, tablets (portrait too), 1024x560 to 1536x730 laptops, up to 2560.
- Reduced motion: nothing in this feature moves.
- Do **not** commit: the owner commits on request only (AGENTS.md / session rule). Tasks end with a verification step instead of a commit.
- Do not start `astro preview` by hand without `npx astro preview stop` before and after.

## Review Focus

1. Phone (320/390): the lanes figure must scroll sideways inside its panel, names pinned, page itself not wider than the window; text in the chart readable (≥ 12px rendered).
2. Fresh load of `/#ringprojekt` and `/#projekte`: lands under the top bar (the index.astro re-landing script must cover them; they are not Kernkompetenzen or Werdegang targets).
3. Top bar at 1024-1280 wide: a sixth nav link ("Projekte") must still fit on one line without overlapping the name or wrapping.
4. Day colour: `#projekte` gets its own hour; `--ink-2`/`--ink-3` stay ≥ 4.5:1 on it.
5. Kenntnisse with a seventh software pillar (Infor): the KI row's `--cols` comes from the Software count; it must still lay out at 320 and 1440.

Tests pinning 1 and 2 are in Task 1 (qa harness); 3-5 are explicit checks in Task 7's tester prompt and a contrast check in Task 5.

---

### Task 1: QA harness checks for projects (failing first)

**Files:**
- Modify: `qa/check.mjs` (the `ids` object near line 150, the anchor loops near line 183, a new block after the Kernkompetenzen check near line 135)

**Interfaces:**
- Consumes: nothing yet.
- Produces: the harness expects `article[data-project][id]` elements and, for the lanes figure, `.rf-scroll`, `.rf-names`, `.rf-chart` (Task 4 must use these class names).

- [ ] **Step 1: Add the scroller check** after the Kernkompetenzen block (after the line `if (kk?.on) notes.push(...)`):

```js
  // Projekte: the lanes figure scrolls sideways inside its panel when the column is narrow,
  // its lane names stay pinned, and its text stays readable at every size
  const rf = await page.evaluate(() => {
    const s = document.querySelector(".rf-scroll");
    const names = document.querySelector(".rf-names");
    const txt = document.querySelector(".rf-chart text");
    if (!s || !names || !txt) return null;
    const scrolls = s.scrollWidth > s.clientWidth + 1;
    const before = names.getBoundingClientRect().left;
    s.scrollLeft = 200;
    const after = names.getBoundingClientRect().left;
    s.scrollLeft = 0;
    return { scrolls, pinned: Math.abs(after - before) < 1, font: txt.getBoundingClientRect().height };
  });
  if (rf?.scrolls && !rf.pinned) fails.push("Projekte: the lane names scroll away with the chart");
  if (rf && rf.font < 12) fails.push(`Projekte: chart text ${rf.font.toFixed(1)}px tall, too small to read`);
  if (rf?.scrolls) notes.push("Projekte: lanes figure scrolls sideways");
```

- [ ] **Step 2: Collect project ids.** In the `ids` object add a line:

```js
    projects: [...document.querySelectorAll("article[data-project][id]")].map((p) => p.id),
```

- [ ] **Step 3: Check where project anchors land.** After the `for (const id of ids.sections)` loop add:

```js
  if (!ids.projects.length) fails.push("Projekte: no project on the page");
  for (const id of ids.projects) {
    const r = await land(id);
    if (r.titleTop < r.bar - 1 || (r.top > r.bar + 40 && !r.atEnd)) fails.push(`#${id} lands at ${r.top} (bar ${r.bar})`);
  }
```

- [ ] **Step 4: Update the header comment** of `qa/check.mjs` (the list of checks near line 9-12): add "project anchors (`article[data-project]`) and the Projekte lanes scroller (pinned names, readable text)".

- [ ] **Step 5: Run it and see it fail**

Run: `npm run qa -- --sizes 1440`
Expected: `FAIL Projekte: no project on the page` (everything else passes).

---

### Task 2: Project data, Infor rating, Ringprojekt links

**Files:**
- Modify: `src/data/cv.ts` (header comment lines 7-10, `CareerEntry.project` comment line 44, `Project` type and `projects` lines 280-346, `ratedSkills` lines 357-372, `topSkills[].learned` hrefs for "Ringprojekt (B.Eng.)")

**Interfaces:**
- Produces (used by Task 5):

```ts
export type Project = {
  id: string; // anchor on the page (#id), keep stable
  title: string;
  org: string;
  period: string;
  team?: string;
  role: string; // heading of the role block
  lead: string;
  tasks: { text: string; sub?: string }[];
  facts: { label: string; value: string }[];
  tools: string[]; // plain names, no logos
  story: string; // how the team worked
  figure?: "ringprojekt";
};
export const projects: Project[];
export type ProjectDraft; // the old shape, renamed
export const projectDrafts: ProjectDraft[];
```

- [ ] **Step 1: Rename the old type and list.** Change `export type Project = {` (line 280) to `export type ProjectDraft = {`, and `export const projects: Project[] = [` (line 294) to `export const projectDrafts: ProjectDraft[] = [`. Replace the comment above it (`// Reihenfolge = Gewichtung auf der Projektseite, nicht Chronologie.`) with:

```ts
// Die alten Projekttexte (vor 2026-10-13), auf der Seite nicht verwendet: sie werden einzeln
// überarbeitet und wandern dann nach `projects`.
```

- [ ] **Step 2: Add the new type and the Ringprojekt** directly after the `projectDrafts` array:

```ts
// Projekte auf der Seite (seit 2026-10-13), chronologisch. Schritt für Schritt aufgebaut,
// zuerst das Ringprojekt. Nur Fakten vom Besitzer, keine erfundenen Zahlen.
export type Project = {
  id: string; // Anker auf der Seite (#id), stabil halten
  title: string;
  org: string;
  period: string;
  team?: string;
  role: string;
  lead: string;
  tasks: { text: string; sub?: string }[];
  facts: { label: string; value: string }[];
  tools: string[]; // Klartext, keine Logos
  story: string; // wie das Team gearbeitet hat
  figure?: "ringprojekt";
};

export const projects: Project[] = [
  {
    id: "ringprojekt",
    title: "Ringprojekt: einen Turbolader konstruieren und fertigen",
    org: "Hochschule Düsseldorf",
    period: "5. Semester (Wintersemester 2022/23)",
    team: "Team aus sieben Studierenden",
    role: "Meine Rolle: Produktionsplanung und -steuerung",
    lead: "Ich habe aus dem Entwurf die Fertigung geplant: welche Teile, welche Arbeitsgänge, in welcher Reihenfolge, und für jedes Labor einen Arbeitsplan.",
    tasks: [
      { text: "Stückliste und Arbeitsgangfolge in Infor aufgebaut", sub: "Turbolader und Niederhalter als Baum, darunter die Arbeitsgänge je Teil" },
      { text: "Arbeitspläne erstellt und gedruckt", sub: "Je einer für Guss, Spanen, Rapid Prototyping und Messtechnik, dazu der Montageplan für den Niederhalter" },
      { text: "Zeiten in der Fertigung erfasst", sub: "Daraus die Maschinenkosten der Verfahren berechnet, nebenbei fiktive Personalkosten" },
      { text: "Die Teamleitung vertreten", sub: "Als der Teamleiter krank war, die Abschlusspräsentation gehalten" },
    ],
    facts: [{ label: "Note", value: "1,2" }],
    tools: ["Infor (ERP)"],
    story:
      "Ein Semester lang arbeitet das Team wie eine kleine Firma, jede und jeder führt eine Abteilung. Die Konstruktion entwirft mit der ganzen Gruppe in PROCAD, über das auch die Daten im Team laufen; Simulationen von Guss und Zerspanung bringen kleine Änderungen, dazwischen wird ein Prototyp gedruckt. Dann wird das Gehäuse in Aluminium gegossen, gefräst und gebohrt, der gedruckte Niederhalter wird angebohrt und hält es für die Messung. Regelmäßige Gruppentermine halten alles zusammen.",
    figure: "ringprojekt",
  },
];
```

- [ ] **Step 3: Fix the comments that name the old list.** Line 7: `projects[].title/context/approach/result` → `projectDrafts[].title/context/approach/result`. Line 10: `(career-Stories, projects)` → `(career-Stories, projectDrafts)`. Line 44: `// Slug eines Eintrags in \`projects\` (die Projektseite ist entfernt, die Daten bleiben).` → `// Slug eines Eintrags in \`projectDrafts\` (alte Projekttexte, noch nicht wieder auf der Seite).`

- [ ] **Step 4: Add Infor to `ratedSkills`** after the `Autodesk Inventor` line:

```ts
  // Infor: Stufe vom Besitzer selbst (2026-10-13, Ringprojekt), nicht aus dem CV
  { name: "Infor", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
```

- [ ] **Step 5: Point the Ringprojekt links at the new anchor.** In `topSkills`, both entries `{ label: "Ringprojekt (B.Eng.)", href: "#bachelor" }` become `{ label: "Ringprojekt (B.Eng.)", href: "#ringprojekt" }`.

- [ ] **Step 6: Verify types**

Run: `npx astro check`
Expected: `0 errors` (the unused `projects` export is fine).

---

### Task 3: The sketch (`RingSketch.astro`)

**Files:**
- Create: `src/components/figures/RingSketch.astro`

**Interfaces:**
- Produces: `<RingSketch />`, no props; renders a `<figure class="rs">` with the SVG and its caption.

- [ ] **Step 1: Create the component**

```astro
---
// The Ringprojekt's part as a rough line drawing (owner liked the sketch from mockup B,
// 2026-10-13): turbine housing (volute) with section hatch, centre lines, a bore dimension,
// the outlet flange, the 3D-printed clamp (Niederhalter) exploded above, measuring points.
// Labels name parts, not people. A stand-in: the owner's real photos replace it later.
---

<figure class="rs">
  <svg viewBox="0 0 590 520" role="img" aria-label="Skizze: Turboladergehäuse aus Aluminiumguss mit gefrästem und gebohrtem Flansch, darüber der 3D-gedruckte Niederhalter, der an das Gehäuse gebohrt wird">
    <defs>
      <pattern id="rs-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" class="hatch" />
      </pattern>
      <marker id="rs-dim" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0 2 L10 5 L0 8" fill="none" stroke="currentColor" stroke-width="1.2" />
      </marker>
    </defs>

    <!-- centre lines -->
    <g class="centre">
      <line x1="90" y1="330" x2="420" y2="330" /><line x1="250" y1="160" x2="250" y2="490" />
    </g>

    <!-- Niederhalter, exploded upwards -->
    <g class="part">
      <path d="M150 62 H350 Q360 62 364 70 L376 92 H124 L136 70 Q140 62 150 62 Z" />
      <rect x="112" y="92" width="276" height="16" rx="2" />
      <rect x="148" y="108" width="20" height="30" /><rect x="332" y="108" width="20" height="30" />
    </g>
    <g class="explode"><line x1="158" y1="142" x2="158" y2="206" /><line x1="342" y1="142" x2="342" y2="206" /></g>

    <!-- volute: outer and inner wall, the wall in section -->
    <path
      class="wall"
      fill-rule="evenodd"
      d="M250 474 C 150 474 92 410 96 336 C 100 262 166 210 240 208 L 430 208 L 430 286 L 384 290 C 392 392 340 474 250 474 Z M250 444 C 168 444 124 392 128 336 C 132 280 184 240 240 238 L 384 238 L 384 262 L 362 264 C 368 372 322 444 250 444 Z"
    />
    <path class="thin" d="M250 412 C 196 412 160 378 162 334 C 164 292 200 268 240 268 L 340 268" />
    <circle class="part" cx="250" cy="330" r="56" />
    <circle class="thin" cx="250" cy="330" r="36" />
    <circle class="part" cx="250" cy="330" r="11" />
    <g class="blade">
      <path d="M250 294 q 16 16 2 36" /><path d="M286 330 q -16 16 -36 2" /><path d="M250 366 q -16 -16 -2 -36" /><path d="M214 330 q 16 -16 36 -2" />
    </g>
    <!-- outlet flange and its holes; the holes drilled for the clamp -->
    <rect class="part" x="430" y="196" width="20" height="104" />
    <g class="hole"><circle cx="440" cy="214" r="4.5" /><circle cx="440" cy="282" r="4.5" /><circle cx="158" cy="223" r="5" /><circle cx="342" cy="223" r="5" /></g>

    <!-- bore diameter -->
    <g class="dim">
      <line x1="194" y1="330" x2="194" y2="500" /><line x1="306" y1="330" x2="306" y2="500" />
      <line x1="194" y1="494" x2="306" y2="494" marker-start="url(#rs-dim)" marker-end="url(#rs-dim)" />
    </g>
    <text x="250" y="488" class="lbl-s" text-anchor="middle">Ø</text>

    <!-- measuring points -->
    <g class="dim">
      <g transform="translate(96 336)"><line x1="-8" y1="0" x2="8" y2="0" /><line x1="0" y1="-8" x2="0" y2="8" /><circle r="4.5" /></g>
      <g transform="translate(372 420)"><line x1="-8" y1="0" x2="8" y2="0" /><line x1="0" y1="-8" x2="0" y2="8" /><circle r="4.5" /></g>
    </g>

    <!-- part labels -->
    <g class="dim">
      <path d="M376 80 L 412 52 H 424" /><path d="M342 223 L 400 160 H 424" /><path d="M450 248 L 470 248 H 476" />
      <path d="M370 380 L 430 400 H 440" /><path d="M92 340 L 40 380 H 20" />
    </g>
    <text x="428" y="48" class="lbl">Niederhalter</text><text x="428" y="64" class="lbl-s">3D-gedruckt</text>
    <text x="428" y="156" class="lbl">Bohrungen</text><text x="428" y="172" class="lbl-s">Niederhalter angebohrt</text>
    <text x="480" y="244" class="lbl">Flansch</text><text x="480" y="260" class="lbl-s">gefräst,</text><text x="480" y="274" class="lbl-s">gebohrt</text>
    <text x="444" y="396" class="lbl">Gehäuse</text><text x="444" y="412" class="lbl-s">Aluminiumguss</text>
    <text x="20" y="398" class="lbl">Messpunkt</text>
  </svg>
  <figcaption>Grobe Skizze, kein echtes Bauteil: die Aufgabe liegt nicht mehr vor.</figcaption>
</figure>

<style>
  .rs {
    margin: 0;
    color: var(--ink);
  }
  .rs svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .part,
  .wall,
  .hole {
    fill: var(--paper);
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linejoin: round;
  }
  .wall {
    fill: url(#rs-hatch);
  }
  .hole {
    stroke-width: 1.3;
  }
  .thin {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
  }
  .hatch {
    stroke: currentColor;
    stroke-width: 0.9;
    stroke-opacity: 0.55;
  }
  .centre line {
    stroke: var(--steel);
    stroke-width: 1;
    stroke-dasharray: 14 4 2 4;
  }
  .explode line {
    stroke: var(--steel);
    stroke-width: 1;
    stroke-dasharray: 5 4;
  }
  .blade path {
    fill: none;
    stroke: var(--steel);
    stroke-width: 1.1;
  }
  .dim,
  .dim line,
  .dim path,
  .dim circle {
    fill: none;
    stroke: currentColor;
    stroke-width: 1;
  }
  .lbl,
  .lbl-s {
    font-family: var(--sans);
    fill: var(--ink);
  }
  .lbl {
    font-size: 13px;
    font-weight: 600;
  }
  .lbl-s {
    font-size: 12px;
    fill: var(--ink-2);
  }
  figcaption {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
</style>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: `0 errors`. (It is rendered from Task 5 on; visual check there.)

---

### Task 4: The lanes figure (`RingFlow.astro`)

**Files:**
- Create: `src/components/figures/RingFlow.astro`

**Interfaces:**
- Produces: `<RingFlow />`, no props; a `<figure class="rf">` containing `.rf-scroll > .rf-inner > svg.rf-names + svg.rf-chart` (names the Task 1 checks rely on), a hint `p.rf-hint`, a `figcaption`, and a visually hidden summary.

- [ ] **Step 1: Create the component**

```astro
---
// The Ringprojekt's semester in lanes (spec: docs/superpowers/specs/2026-10-13-projekte-ringprojekt-design.md).
// How the team of seven worked, with the owner's PPS work on top: one work plan per lab step,
// sent down at its start, the time taken recorded at its end, machine costs from those times.
// Drawn from the lists below, so corrections from the owner change data, not drawing code.
// Two SVGs at one scale, side by side: the lane names and the chart. In a narrow column the
// pair keeps its natural size (13px text) and scrolls sideways with the names pinned (CSS
// container query below). Ink and steel only: sun means light, the category colours mean
// Werdegang. No JS.

type RowId = "plan" | "time" | "cost" | "lead" | "kon" | "rp" | "guss" | "span" | "mess";
type Kind = "pc" | "sim" | "lab" | "ink" | "minor";
type Item = { id: string; row: RowId; t0: number; t1: number; kind: Kind; label: string; size?: number };

const LW = 180; // names column (SVG units = px at natural size)
const CW = 860; // chart
const H = 548;
const X0 = 16;
const X1 = CW - 16;
/** time 0 (Semesterbeginn) to 100 (Abgabe) to chart x */
const x = (t: number) => X0 + (t / 100) * (X1 - X0);

const PPS = { y: 24, h: 134 };
const rows: { id: RowId; label: string; y: number; h: number; sub?: boolean }[] = [
  { id: "plan", label: "Arbeitspläne (Infor)", y: 58, h: 33, sub: true },
  { id: "time", label: "Zeiten erfassen", y: 91, h: 34, sub: true },
  { id: "cost", label: "Maschinenkosten", y: 125, h: 33, sub: true },
  { id: "lead", label: "Teamleitung", y: 158, h: 52 },
  { id: "kon", label: "Konstruktion", y: 210, h: 52 },
  { id: "rp", label: "Rapid Prototyping", y: 262, h: 52 },
  { id: "guss", label: "Spanlose Fertigung", y: 314, h: 52 },
  { id: "span", label: "Spanende Fertigung", y: 366, h: 52 },
  { id: "mess", label: "Messtechnik", y: 418, h: 52 },
];
const LANES_END = 470;
const row = (id: RowId) => rows.find((r) => r.id === id)!;
const mid = (id: RowId) => row(id).y + row(id).h / 2;

const BOX = 26;
const items: Item[] = [
  { id: "entwurf", row: "kon", t0: 0, t1: 21, kind: "pc", label: "Entwurf mit der Gruppe" },
  { id: "aend1", row: "kon", t0: 24, t1: 29.5, kind: "pc", label: "Änd.", size: 11 },
  { id: "aend2", row: "kon", t0: 32, t1: 37.5, kind: "pc", label: "Änd.", size: 11 },
  { id: "aend3", row: "kon", t0: 43, t1: 48.5, kind: "pc", label: "Änd.", size: 11 },
  { id: "gsim", row: "guss", t0: 17, t1: 37, kind: "sim", label: "Gusssimulation" },
  { id: "fsim", row: "span", t0: 15, t1: 41, kind: "sim", label: "Fräs- und Bohrsimulation" },
  { id: "proto", row: "rp", t0: 40, t1: 52, kind: "pc", label: "Prototyp" },
  { id: "guss", row: "guss", t0: 55, t1: 68, kind: "lab", label: "Alu-Guss" },
  { id: "nh", row: "rp", t0: 58, t1: 71, kind: "pc", label: "Niederhalter" },
  { id: "spanen", row: "span", t0: 72, t1: 79, kind: "lab", label: "Spanen", size: 12 },
  { id: "mont", row: "span", t0: 80, t1: 88, kind: "pc", label: "Montage", size: 11 },
  { id: "mess", row: "mess", t0: 89, t1: 99, kind: "lab", label: "Messung" },
  { id: "tree", row: "plan", t0: 21, t1: 38, kind: "ink", label: "Stückliste, Folge", size: 12 },
  { id: "kosten", row: "cost", t0: 76, t1: 100, kind: "minor", label: "aus den Zeiten berechnet", size: 11 },
  { id: "praes", row: "lead", t0: 84, t1: 100, kind: "ink", label: "Präsentation (ich)", size: 12 },
];
const byId = (id: string) => items.find((i) => i.id === id)!;
const top = (i: Item) => mid(i.row) - BOX / 2;
const bottom = (i: Item) => mid(i.row) + BOX / 2;

// one printed work plan per lab step, at its start; the time recorded at its end
const plans: { item: string; label: string }[] = [
  { item: "proto", label: "RP" },
  { item: "guss", label: "Guss" },
  { item: "nh", label: "RP" },
  { item: "spanen", label: "Spanen" },
  { item: "mont", label: "Montage" },
  { item: "mess", label: "Messen" },
];
const SHEET = 18;
const sheets = plans.map((p, k) => {
  const it = byId(p.item);
  const sx = x(it.t0) + 6;
  // labels of sheets closer than 6 time units step up, so they don't collide
  const close = k > 0 && it.t0 - byId(plans[k - 1].item).t0 < 6;
  return { ...p, it, sx, ly: close ? 47 : 56 };
});

// arrows between steps (changes fed back, the clamp into the assembly, the draft into the tree)
const links: { from: string; fromT: number; to: string }[] = [
  { from: "gsim", fromT: 26.5, to: "aend1" },
  { from: "fsim", fromT: 39, to: "aend2" },
  { from: "proto", fromT: 46, to: "aend3" },
  { from: "nh", fromT: 70, to: "mont" },
  { from: "entwurf", fromT: 18, to: "tree" },
];
const linkPath = (l: (typeof links)[number]) => {
  const a = byId(l.from);
  const b = byId(l.to);
  const up = mid(b.row) < mid(a.row);
  const sx = x(l.fromT);
  const sy = up ? top(a) : bottom(a);
  const ex = (x(b.t0) + x(b.t1)) / 2;
  const ey = up ? bottom(b) + 2 : top(b) - 2;
  const my = (sy + ey) / 2;
  return `M${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
};

const meetings = [8, 22, 36, 50, 64, 78, 92];
const interim = [30, 66]; // Zwischenstände of the team lead
const DOC_END = 83;
---

<figure class="rf" aria-labelledby="rf-note">
  <div class="rf-scroll">
    <div class="rf-inner">
      <svg class="rf-names" viewBox={`0 0 ${LW} ${H}`} aria-hidden="true">
        <rect class="band" x="0" y={PPS.y} width={LW} height={PPS.h} />
        <rect class="edge" x="0" y={PPS.y} width="4" height={PPS.h} />
        <text class="t b" x="14" y={PPS.y + 22}>PPS (ich)</text>
        {rows.map((r) => (
          <text class:list={["t", r.sub && "m"]} x={r.sub ? 14 : 0} y={r.y + r.h / 2 + 5}>
            {r.label}
          </text>
        ))}
        {rows.map((r) => !r.sub && <line class="rule" x1="0" y1={r.y} x2={LW} y2={r.y} />)}
        <line class="rule" x1="0" y1={LANES_END} x2={LW} y2={LANES_END} />
        <line class="rule sub" x1="14" y1={row("time").y} x2={LW} y2={row("time").y} />
        <line class="rule sub" x1="14" y1={row("cost").y} x2={LW} y2={row("cost").y} />
      </svg>

      <svg class="rf-chart" viewBox={`0 0 ${CW} ${H}`} aria-hidden="true">
        <defs>
          <marker id="rf-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" class="ah" />
          </marker>
        </defs>

        <!-- PPS band and row rules -->
        <rect class="band" x="0" y={PPS.y} width={CW} height={PPS.h} />
        {rows.map((r) => !r.sub && <line class="rule" x1="0" y1={r.y} x2={CW} y2={r.y} />)}
        <line class="rule" x1="0" y1={LANES_END} x2={CW} y2={LANES_END} />
        <line class="rule sub" x1="0" y1={row("time").y} x2={CW} y2={row("time").y} />
        <line class="rule sub" x1="0" y1={row("cost").y} x2={CW} y2={row("cost").y} />

        <!-- group meetings -->
        {meetings.map((t) => <line class="meet" x1={x(t)} y1="20" x2={x(t)} y2={LANES_END} />)}
        <text class="t s m" x={x(meetings[0])} y="14">Gruppentermine</text>

        <!-- Teamleitung: documentation thread, interim results -->
        <line class="doc" x1={x(0)} y1={mid("lead")} x2={x(DOC_END)} y2={mid("lead")} />
        <text class="t s m" x={x(0) + 6} y={mid("lead") - 8}>Dokumentation</text>
        {interim.map((t) => (
          <>
            <rect class="dia" x={x(t) - 6} y={mid("lead") - 6} width="12" height="12" transform={`rotate(45 ${x(t)} ${mid("lead")})`} />
            <text class="t s m" x={x(t)} y={mid("lead") - 12} text-anchor="middle">Zwischenstand</text>
          </>
        ))}

        <!-- the steps -->
        {items.map((i) => (
          <>
            <rect class:list={["box", i.kind]} x={x(i.t0)} y={top(i)} width={x(i.t1) - x(i.t0)} height={BOX} />
            {i.id === "tree" && (
              <g class="tree" transform={`translate(${x(i.t0)} ${top(i)})`}>
                <path d="M12 8 V20 M12 12 H21 M12 19 H21" />
                <circle cx="12" cy="7" r="2.2" /><circle cx="23" cy="12" r="2" /><circle cx="23" cy="19" r="2" />
              </g>
            )}
            <text
              class:list={["t", (i.kind === "lab" || i.kind === "ink") && "inv"]}
              x={i.id === "tree" ? x(i.t0) + 34 : (x(i.t0) + x(i.t1)) / 2}
              y={mid(i.row) + 4.5}
              text-anchor={i.id === "tree" ? "start" : "middle"}
              font-size={i.size ?? 13}
            >
              {i.label}
            </text>
          </>
        ))}

        <!-- arrows between steps -->
        {links.map((l) => <path class="link" d={linkPath(l)} marker-end="url(#rf-ah)" />)}

        <!-- PPS: the plan line from the tree, a work plan sheet per lab step sent down at its start -->
        <line class="plan" x1={x(byId("tree").t1)} y1={mid("plan")} x2={sheets.at(-1)!.sx} y2={mid("plan")} />
        {sheets.map((s) => (
          <>
            <path class="sheet" d={`M${s.sx} ${mid("plan") - 11} h${SHEET - 5} l5 5 v17 h-${SHEET} z`} />
            <path class="sheet-l" d={`M${s.sx + 4} ${mid("plan") - 1} h10 M${s.sx + 4} ${mid("plan") + 3} h10 M${s.sx + 4} ${mid("plan") + 7} h7`} />
            <text class="t s m" x={s.sx + SHEET / 2} y={s.ly} text-anchor="middle">
              {s.label}
            </text>
            <path class="down" d={`M${s.sx + SHEET / 2} ${mid("plan") + 12} V${top(s.it) - 2}`} marker-end="url(#rf-ah)" />
          </>
        ))}

        <!-- PPS: the time recorded at the end of each lab step -->
        <line class="dots" x1={x(byId(plans[0].item).t1) - 70} y1={mid("time")} x2={x(byId(plans.at(-1)!.item).t1)} y2={mid("time")} />
        {sheets.map((s) => (
          <g class="clock" transform={`translate(${x(s.it.t1)} ${mid("time")})`}>
            <circle r="6.5" />
            <path d="M0 0 V-4 M0 0 h3" />
          </g>
        ))}

        <!-- time axis and legend -->
        <line class="axis" x1={x(0)} y1="488" x2={x(100)} y2="488" />
        <text class="t s m" x={x(0)} y="506">Semesterbeginn</text>
        <text class="t s m" x={x(100)} y="506" text-anchor="end">Abgabe</text>
        <g transform={`translate(${x(14)} 0)`}>
          <rect class="box pc" x="0" y="522" width="14" height="12" /><text class="t s m" x="20" y="532">am Rechner</text>
          <rect class="box sim" x="104" y="522" width="14" height="12" /><text class="t s m" x="124" y="532">Simulation</text>
          <rect class="box lab" x="206" y="522" width="14" height="12" /><text class="t s m" x="226" y="532">im Labor</text>
          <path class="sheet" d="M296 522 h9 l3 3 v9 h-12 z" /><text class="t s m" x="314" y="532">Arbeitsplan</text>
          <circle class="clock-c" cx="402" cy="528" r="6" /><text class="t s m" x="414" y="532">Zeit erfasst</text>
        </g>
      </svg>
    </div>
  </div>
  <p class="rf-hint">Die Grafik lässt sich seitlich verschieben.</p>
  <figcaption id="rf-note">Vereinfacht: Reihenfolge und Abhängigkeiten stimmen, die Abstände sind nicht maßstäblich.</figcaption>
  <div class="sr-only">
    <p>Ablauf des Ringprojekts über das Semester, in sieben Rollen.</p>
    <p>Die Konstruktion entwirft das Teil mit der Gruppe. Guss- sowie Fräs- und Bohrsimulation führen zu kleinen Änderungen, ebenso der gedruckte Prototyp.</p>
    <p>Aus dem Entwurf baue ich als PPS Stückliste und Arbeitsgangfolge in Infor auf. Zu jedem Laborschritt geht ein Arbeitsplan: Prototyp, Aluminiumguss, Niederhalter, Spanen, Montage des Niederhalters, Messung. Am Ende jedes Schritts erfasse ich die Zeit, daraus berechne ich die Maschinenkosten.</p>
    <p>Die Teamleitung dokumentiert und stellt Zwischenstände vor; die Abschlusspräsentation habe ich gehalten. Regelmäßige Gruppentermine begleiten das Semester.</p>
  </div>
</figure>

<style>
  .rf {
    margin: 0;
    container-type: inline-size;
  }
  .rf-scroll {
    background: var(--paper);
    border: 1px solid var(--line);
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }
  /* the two SVGs at one scale: tracks in the ratio of their viewBox widths (180 : 860) */
  .rf-inner {
    display: grid;
    grid-template-columns: 180fr 860fr;
    align-items: start;
    padding: 1rem 1rem 0.75rem 0.9rem;
  }
  .rf-inner svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .rf-names {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--paper);
  }
  .rf-hint {
    display: none;
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }
  figcaption {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: var(--ink-3);
  }

  /* SVG parts */
  .t {
    font-family: var(--sans);
    font-size: 13px;
    fill: var(--ink);
  }
  .rf-names .t {
    font-size: 14px;
  }
  .rf-names .t.m {
    font-size: 13px;
  }
  .t.b {
    font-size: 15px;
    font-weight: 700;
  }
  .t.s {
    font-size: 12px;
  }
  .t.m {
    fill: var(--ink-2);
  }
  .t.inv {
    fill: var(--paper);
  }
  .band {
    fill: var(--ink);
    fill-opacity: 0.05;
  }
  .edge {
    fill: var(--ink);
  }
  .rule {
    stroke: var(--ink);
    stroke-opacity: 0.17;
  }
  .rule.sub {
    stroke-opacity: 0.12;
  }
  .meet {
    stroke: var(--ink);
    stroke-opacity: 0.1;
  }
  .doc {
    stroke: var(--steel);
    stroke-width: 2;
    stroke-dasharray: 2 5;
  }
  .dia {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 1.5;
  }
  .box {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 1.5;
  }
  .box.sim {
    stroke-dasharray: 5 3;
  }
  .box.lab,
  .box.ink {
    fill: var(--ink);
    stroke: none;
  }
  .box.minor {
    stroke-width: 1.2;
  }
  .tree path {
    fill: none;
    stroke: var(--paper);
    stroke-width: 1.2;
  }
  .tree circle {
    fill: var(--paper);
  }
  .link,
  .down {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .down {
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }
  .ah {
    fill: var(--ink);
  }
  .plan {
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .sheet {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 1.4;
  }
  .sheet-l {
    stroke: var(--ink);
    stroke-opacity: 0.6;
  }
  .dots {
    stroke: var(--steel);
    stroke-width: 1.5;
    stroke-dasharray: 2 4;
  }
  .clock circle,
  .clock-c {
    fill: var(--paper);
    stroke: var(--ink);
    stroke-width: 1.4;
  }
  .clock path {
    stroke: var(--ink);
    stroke-width: 1.2;
  }
  .axis {
    stroke: var(--ink);
    stroke-width: 1.5;
  }

  /* a narrow column: natural size (the SVG units become px, 13px text), scrolling sideways
     inside the panel, the lane names pinned at its left edge */
  @container (max-width: 60rem) {
    .rf-inner {
      width: calc(1040px + 1.9rem);
      grid-template-columns: 180px 860px;
    }
    .rf-names {
      box-shadow: 1px 0 0 var(--line);
    }
    .rf-hint {
      display: block;
    }
  }
</style>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: `0 errors`.

---

### Task 5: The Projekte section and its wiring

**Files:**
- Create: `src/components/sections/Projekte.astro`
- Modify: `src/pages/index.astro` (imports; `<Werdegang />` line)
- Modify: `src/data/nav.ts`
- Modify: `src/data/day.ts` (the `DAY` array)
- Modify: `src/pages/projekte/index.astro`

**Interfaces:**
- Consumes: `projects`, `Project` from `src/data/cv.ts` (Task 2); `RingSketch` (Task 3); `RingFlow` (Task 4).
- Produces: `section#projekte.sec` with `article#ringprojekt[data-project]` (Task 1's checks).

- [ ] **Step 1: Create the section**

```astro
---
import { projects } from "../../data/cv";
import RingSketch from "../figures/RingSketch.astro";
import RingFlow from "../figures/RingFlow.astro";

// Projekte, rebuilt one project at a time in chronological order (owner 2026-10-13), each a
// full-width block: the owner's role first (lead, tasks with sub-lines like the Kernkompetenzen
// sheets), the facts, how the team worked; its figures beside and below. Mockups and picks:
// docs/decisions.md (Projekte). No card grid, no JS.
---

<section id="projekte" class="sec" aria-labelledby="h-projekte">
  <div class="wrap page">
    <h2 id="h-projekte" class="display page-title">Projekte</h2>

    {
      projects.map((p) => (
        <article id={p.id} class="proj" data-project aria-labelledby={`${p.id}-h`}>
          <header class="proj-head">
            <h3 id={`${p.id}-h`}>{p.title}</h3>
            <p class="where">{[p.org, p.period, p.team].filter(Boolean).join(", ")}</p>
          </header>

          <div class="top">
            <div class="prose">
              <h4>{p.role}</h4>
              <p class="lead">{p.lead}</p>
              <ul class="tasks">
                {p.tasks.map((t) => (
                  <li>
                    {t.text}
                    {t.sub && <span class="sub">{t.sub}</span>}
                  </li>
                ))}
              </ul>
              <dl class="facts">
                {p.facts.map((f) => (
                  <div>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
                {p.tools.length > 0 && (
                  <div>
                    <dt>Software</dt>
                    <dd>{p.tools.join(", ")}</dd>
                  </div>
                )}
              </dl>
              <p class="story">{p.story}</p>
            </div>
            {p.figure === "ringprojekt" && (
              <div class="side">
                <RingSketch />
              </div>
            )}
          </div>

          {p.figure === "ringprojekt" && (
            <div class="flow">
              <h4>So lief das Semester</h4>
              <p class="cap">
                Die Simulationen schicken kleine Änderungen an die Konstruktion zurück. Oben meine PPS-Zeilen: aus dem Entwurf entstehen Stückliste und Arbeitsgangfolge, daraus je Labor ein Arbeitsplan, der zum Start des Schritts gedruckt dort liegt; während gefertigt wird, erfasse ich die Zeiten.
              </p>
              <RingFlow />
            </div>
          )}
        </article>
      ))
    }
  </div>
</section>

<style>
  .page {
    padding-top: var(--sp-section);
    padding-bottom: var(--sp-block);
  }
  .proj {
    margin-top: var(--sp-gap);
  }
  .proj + .proj {
    margin-top: var(--sp-block);
    padding-top: var(--sp-block);
    border-top: 1px solid var(--line);
  }
  .proj-head h3 {
    font-family: var(--serif);
    font-weight: 600;
    font-size: clamp(1.5rem, 1.1rem + 1.4vw, 2.125rem);
    line-height: 1.15;
    letter-spacing: -0.01em;
    max-width: 40ch;
  }
  .where {
    margin-top: 0.35rem;
    font-size: 0.9375rem;
    color: var(--ink-2);
  }

  .top {
    display: grid;
    gap: var(--sp-gap);
    margin-top: var(--sp-gap);
  }
  .prose h4,
  .flow h4 {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 1.0625rem;
    line-height: 1.3;
  }
  .lead {
    margin-top: 0.5rem;
    max-width: var(--measure);
    font-family: var(--serif);
    font-size: 1.25rem;
    line-height: 1.5;
  }
  .tasks {
    list-style: none;
    margin: 1rem 0 1.25rem;
    padding: 0;
  }
  .tasks > li {
    position: relative;
    padding-left: 1.2rem;
    margin-bottom: 0.7rem;
    font-family: var(--serif);
    font-weight: 500;
    font-size: 1.1875rem;
    line-height: 1.4;
  }
  .tasks > li::before {
    content: "";
    position: absolute;
    left: 0.1rem;
    top: 0.58em;
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 50%;
    background: var(--ink);
  }
  .sub {
    display: block;
    margin-top: 0.2rem;
    font-family: var(--sans);
    font-weight: 400;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--ink-2);
  }
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 2.5rem;
    margin: 0;
    font-size: 0.9375rem;
  }
  .facts dt {
    font-weight: 600;
    color: var(--ink);
  }
  .facts dd {
    margin: 0;
    color: var(--ink-2);
  }
  .story {
    margin-top: 1.5rem;
    padding-top: 1.1rem;
    border-top: 1px solid var(--line);
    max-width: var(--measure);
    font-family: var(--serif);
    font-size: 1.0625rem;
    line-height: 1.55;
  }
  .side {
    max-width: 34rem;
  }

  .flow {
    margin-top: var(--sp-block);
  }
  .cap {
    margin: 0.2rem 0 0.9rem;
    max-width: 52rem;
    font-size: 0.9375rem;
    color: var(--ink-2);
  }

  /* wide: text | sketch side by side */
  @media (min-width: 56rem) {
    .top {
      grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
      align-items: start;
    }
    .side {
      max-width: none;
    }
  }
</style>
```

- [ ] **Step 2: Place it on the page.** In `src/pages/index.astro` add the import after the `Werdegang` import:

```astro
import Projekte from "../components/sections/Projekte.astro";
```

and the element after `<Werdegang />`:

```astro
  <Werdegang />
  <Projekte />
  <Kenntnisse />
```

- [ ] **Step 3: Nav entry.** In `src/data/nav.ts` insert after the Werdegang line:

```ts
  { href: "#projekte", id: "projekte", label: "Projekte" },
```

- [ ] **Step 4: Day hour.** In `src/data/day.ts` insert between the `#werdegang` and `#kenntnisse` entries:

```ts
  // early afternoon (2026-10-13, Projekte): noon's white turning warm, a pale straw light
  { sel: "#projekte", bg: "#f2f1e6", a: "#fff1c4", b: "#ffffff", k: 0.7, pa: [18, 28], pb: [85, 80] },
```

- [ ] **Step 5: Check its contrast.** Run:

```bash
node -e '
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for (const bg of ["#f2f1e6","#fff1c4","#ffffff"]) console.log(bg, "ink-2", cr("#434f5e",bg).toFixed(2), "ink-3", cr("#4e5a67",bg).toFixed(2));'
```

Expected: every ratio ≥ 4.5 (ink-3 on `#f2f1e6` ≈ 6.3).

- [ ] **Step 6: Old URL.** Replace the body of `src/pages/projekte/index.astro`'s `<Redirect … />` with:

```astro
<Redirect
  to="projekte"
  strict
  map={{ ringprojekt: "ringprojekt", heliostat: "bachelorarbeit", luftfahrt: "masterarbeit", "bi-consulting": "praktikum-bi", zeiterfassung: "werkstudent-controlling" }}
/>
```

- [ ] **Step 7: Make the fresh-load re-landing cover the new anchors.** No change needed: index.astro's script re-lands every target that is not `kk-*` or inside `[data-stations]`; `#projekte` and `#ringprojekt` fall under it. Verify by reading `src/pages/index.astro` lines 41-55.

- [ ] **Step 8: Run the QA harness**

Run: `npm run qa -- --sizes 320x640,390,768,1024x560,1366x657,1440,2560x1440`
Expected: `all checks pass`; notes show "Projekte: lanes figure scrolls sideways" at 320, 390 and 768, not at 1366 and larger.

- [ ] **Step 9: Look at it.** Run `npm run qa -- --sizes 390,1440 --shots` and open `qa/shots/*projekte*.png` at both sizes: sketch beside the text at 1440 and below it at 390; lanes figure readable; no overlapping labels.

---

### Task 6: Docs

**Files:**
- Modify: `AGENTS.md` (Status paragraph; Architecture: `cv.ts` line, `components/sections/` and `figures/` lines; Design rules: none)
- Modify: `docs/decisions.md` (a new bullet under "Design history")

- [ ] **Step 1: AGENTS.md Status.** Replace "hero → Kernkompetenzen → Werdegang → Kenntnisse → Hobbys → Kontakt" with "hero → Kernkompetenzen → Werdegang → Projekte → Kenntnisse → Hobbys → Kontakt", and replace the sentence "Projekte is removed for now (its figure components `LifeCycle`, `AmModel` + `lib/amModel.ts` stay in the repo, unused, and `projects` stays in cv.ts)." with: "Projekte is being rebuilt one project at a time, chronologically (since 2026-10-13; first the Ringprojekt, spec in `docs/superpowers/specs/2026-10-13-projekte-ringprojekt-design.md`); the old project texts wait in `projectDrafts` in cv.ts, and `LifeCycle`, `AmModel` + `lib/amModel.ts` stay unused."

- [ ] **Step 2: AGENTS.md Architecture.** In the `cv.ts` bullet replace "`projects`," with "`projects` (the Projekte section: role, lead, tasks with `sub`, facts, tools, story, `figure`), `projectDrafts` (old texts, unused)," and in "Kept on purpose though unused:" replace `projects` with `projectDrafts`. In the `src/components/sections/` bullet add `Projekte` after `Werdegang`; in `figures/` add "`RingSketch`, `RingFlow` (Ringprojekt: sketch and the lanes figure, drawn from data lists in the component; scrolls sideways with pinned names in a narrow column)".

- [ ] **Step 3: decisions.md.** Add under "## Design history" after the last bullet:

```markdown
- **Projekte back, step 1: Ringprojekt (2026-10-13)**: rebuilt one project at a time, chronologically, between Werdegang and Kenntnisse. Mockups in `.superpowers/brainstorm/258-1791894682/content/` (gitignored): A lanes over the semester, B the part labelled with the roles, C the routing card. Owner: "A is good but I like the draft of the sketch in B", then "focus more on my tasks as PPS" and "more on how we worked in this project" (specifics like machines and figures are not available and not wanted). Built: role first (lead, four tasks with sub-lines), grade 1,2, Infor, the team paragraph (PROCAD named there: owner wants it on the page, but he barely used it); the sketch beside (a stand-in until the owner's real photos); the lanes below with three PPS rows (work plans in Infor sent down to each lab step, times recorded at each step's end, machine costs minor) and the owner's final presentation as stand-in team lead. Kenntnisse gained Infor (Grundkenntnisse, owner's rating).
```

- [ ] **Step 4: Verify**

Run: `npx astro check`
Expected: `0 errors`.

---

### Task 7: Test round (AGENTS.md process note)

**Files:** none edited by the testers; fixes go into the files above.

- [ ] **Step 1:** `npm run qa` (default sizes). Expected: all pass.
- [ ] **Step 2: Tester subagent** (fresh `general-purpose`, strong model, reports only). Prompt names the diff (`git diff` + new files: `src/components/sections/Projekte.astro`, `src/components/figures/RingSketch.astro`, `src/components/figures/RingFlow.astro`, `qa/check.mjs`, `src/data/cv.ts`, `src/data/nav.ts`, `src/data/day.ts`, `src/pages/index.astro`, `src/pages/projekte/index.astro`, docs) and asks for: sizes 390 / 768 / 1366x657 / 1440 + 320 / 1024x560 / 1280x600 / 1536x730 / 2560; fresh loads of `/#projekte` and `/#ringprojekt` (not via qa, which sets the hash after load); `/projekte/` and `/projekte/#ringprojekt` redirects; the top bar with six links at 1024-1280 (one line, no overlap with the name); the phone menu lists Projekte and closes on pick; the nav current-section bar on Projekte; the day colour changes at Projekte; reduced motion; the lanes scroller on phones (names pinned, page not wider than the window, keyboard can reach the panel); the Kenntnisse yard with seven software pillars at 320 and 1440; the "KI-Systems" hyphen in the KOMAcons station. Only issues in the diff; old ones in one line at the end.
- [ ] **Step 3: Design critic subagent** (separate fresh `general-purpose`, told to be blunt, real screenshots at 390 and 1440): does the section read as the owner's PPS work and how the team worked; does it fall into AGENTS.md's generated-site tells; is the lanes figure legible.
- [ ] **Step 4:** Fix confirmed issues; narrow re-check (`npm run qa` + a `sonnet` tester on just the fixes).
- [ ] **Step 5:** Report to the owner with screenshots; commit only when asked.
