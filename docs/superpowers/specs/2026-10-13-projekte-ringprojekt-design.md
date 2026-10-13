# Projekte, step 1: the Ringprojekt

Date: 2026-10-13. Status: approved in chat, spec for review.

## Goal

Bring the Projekte section back, built up one project at a time in chronological order. The
first project is the Ringprojekt from the Bachelor. The section shows **how the team worked**
with the owner's PPS work as the thread through it; technical specifics of the part are
secondary (owner: "specifics are not really relevant in this part, more on how we worked").

## Facts (from the owner, 2026-10-13; nothing beyond these may be added)

- Ringprojekt, Hochschule Düsseldorf, 5th Bachelor semester (Wintersemester 2022/23, one
  semester; derived from the 2020 start, owner did not object), grade **1,2**, no competition.
- Task: design and manufacture a turbocharger (Turbolader). The real task is no longer
  available; the page shows roughly what it was about.
- Team of seven: Teamleitung, PPS (the owner), Konstruktion, Spanende Fertigung, Spanlose
  Fertigung, Rapid Prototyping, Messtechnik. Regular group meetings.
- Workflow: Konstruktion designs the part together with the group, plus a clamp
  (Niederhalter) that holds it for measuring. Casting and machining simulations keep leading to
  small design changes; in between Rapid Prototyping prints the part. Spanlose Fertigung casts
  aluminium in the lab, Spanende Fertigung mills and drills it. The clamp is 3D-printed and
  drilled onto the turbocharger (the only assembly). Then documentation.
- The owner (PPS): built a parts tree and the sequence of work steps in **Infor** (ERP); created
  one work plan per manufacturing step (Guss, Spanen, Rapid Prototyping, Messtechnik) plus the
  assembly plan for the clamp, printed them for manufacturing and assembly; created the workflow
  himself and recorded the times while parts were made; calculated machine costs per process;
  fictitious staff costs as a minor point. Total cost is not important.
- The team lead was ill at the end: the owner gave the **final presentation**. The team lead
  did the general documentation and presented interim results.
- PROCAD (CAD and the software for working across the team) barely used by the owner (he was not in the design group): named once in the team paragraph as the team's shared tool, not in his software line (owner 2026-10-13: "PROCAD should be named somewhere").
- Specific machines and figures are not available: no numbers, dates or machine names.
- The owner has real pictures; they replace the sketch later. The owner will describe the
  figure in more detail later.

## Page placement

- New section `src/components/sections/Projekte.astro`, `id="projekte"`, between Werdegang and
  Kenntnisse in `src/pages/index.astro`. Section break `.sec` (1.5px ink rule), `.display` title
  "Projekte", content in `.wrap`.
- Nav entry "Projekte" (`#projekte`) in `src/data/nav.ts`, between Werdegang and Kenntnisse.
- `src/data/day.ts`: a new hour for `#projekte` between noon (`#werdegang`) and afternoon
  (`#kenntnisse`); `--ink-2`/`--ink-3` keep 4.5:1 on it incl. its spots; no spot opposite its
  background on the colour wheel.
- Projects stack chronologically, each a full-width `<article>` with its own anchor
  (`id="ringprojekt"`), separated by hairlines. No card grid.

## Layout of one project (from mockup v3, `.superpowers/brainstorm/258-1791894682/content/ringprojekt-v3.html`)

1. Head: title "Ringprojekt: einen Turbolader konstruieren und fertigen" (Newsreader 600), line
   under it "Hochschule Düsseldorf, 5. Semester (Wintersemester 2022/23), Team aus sieben
   Studierenden" (`--ink-2`).
2. Top row, two columns from 56rem (text 6fr | sketch 5fr), stacked below:
   - Text: "Meine Rolle: Produktionsplanung und -steuerung" (grotesk 600), a lead sentence
     (serif), four tasks with sub-lines in the Kernkompetenzen style (serif main point with an
     ink disc, grotesk `--ink-2` sub-line), then "Note 1,2" and "Software Infor (ERP)" as two
     small label/value pairs, then a hairline and the team paragraph.
   - Sketch: the line drawing from mockup v3 (volute with section hatch, centre lines, Ø
     dimension, flange, clamp exploded above, measuring points), labels naming parts:
     Niederhalter (3D-gedruckt), Bohrungen (Niederhalter angebohrt), Flansch (gefräst,
     gebohrt), Gehäuse (Aluminiumguss), Messpunkt. Caption "Grobe Skizze, kein echtes Bauteil:
     die Aufgabe liegt nicht mehr vor."
3. Below, full width: "So lief das Semester", a one-sentence caption, the lanes figure on a
   white panel with a hairline edge, note "Vereinfacht: Reihenfolge und Abhängigkeiten stimmen,
   die Abstände sind nicht maßstäblich."

Copy (German, plain; as in mockup v3 with the presentation corrected):

- Lead: "Ich habe aus dem Entwurf die Fertigung geplant: welche Teile, welche Arbeitsgänge, in
  welcher Reihenfolge, und für jedes Labor einen Arbeitsplan."
- Tasks:
  - "Stückliste und Arbeitsgangfolge in Infor aufgebaut" / "Turbolader und Niederhalter als
    Baum, darunter die Arbeitsgänge je Teil"
  - "Arbeitspläne erstellt und gedruckt" / "Je einer für Guss, Spanen, Rapid Prototyping und
    Messtechnik, dazu der Montageplan für den Niederhalter"
  - "Zeiten in der Fertigung erfasst" / "Daraus die Maschinenkosten der Verfahren berechnet,
    nebenbei fiktive Personalkosten"
  - "Die Teamleitung vertreten" / "Als der Teamleiter krank war, die Abschlusspräsentation
    gehalten"
- Team paragraph: as in mockup v3, plus one clause that the team designed and shared its data in PROCAD.

## The lanes figure (`src/components/figures/RingFlow.astro`)

- Server-rendered SVG, no JS. Ink and steel only (no sun, no category colours: they mean
  Werdegang categories).
- Driven by a small data list at the top of the component (lanes; items with lane, start, end,
  kind, label; links), so later corrections from the owner change data, not drawing code.
- Rows, top to bottom:
  - **PPS (ich)** on a wash band with an ink edge, three rows: "Arbeitspläne (Infor)" (tree box
    "Stückliste, Folge" fed from the draft, then a work plan sheet at the start of each lab
    step: RP, Guss, RP, Spanen, Montage, Messen, each with a dashed arrow down to its step),
    "Zeiten erfassen" (a clock at the end of each step), "Maschinenkosten" (one small outlined
    box "aus den Zeiten berechnet").
  - Teamleitung: dotted documentation line, two interim-result diamonds, and "Abschluss­
    präsentation (ich)" as an ink box at the end. No stand-in stretch.
  - Konstruktion: "Entwurf mit der Gruppe", three "Änd." boxes, "+ Niederhalter".
  - Rapid Prototyping: Prototyp (feeds a change back), Niederhalter (feeds the assembly).
  - Spanlose Fertigung: Gusssimulation (dashed, arrow to a change), Alu-Guss (lab, ink).
  - Spanende Fertigung: Fräs- und Bohrsimulation (dashed, arrow to a change), Spanen (lab),
    Montage.
  - Messtechnik: Messung (lab).
- Faint vertical lines for the group meetings, labelled once "Gruppentermine". Time axis
  "Semesterbeginn" to "Abgabe", no dates. Legend: am Rechner, Simulation, im Labor,
  Arbeitsplan, Zeit erfasst.
- Accessible: `role="img"` with an `aria-label`, plus a short visually hidden text summary of
  the sequence for screen readers.

## Every screen

- From 56rem: the layout above; the lanes figure fills the content width.
- Below 56rem: text, then the sketch at full width (max height so it doesn't dominate), then
  the lanes figure at a fixed readable width (about 56rem) in a horizontal scroller; the lane
  names are an HTML column pinned left outside the scroller, so they stay visible while
  scrolling. A short note "Die Grafik lässt sich seitlich verschieben." No page overflow.
- Short laptop windows (1024x560 to 1536x730) use the wide layout; nothing pins, so heights
  don't matter beyond normal flow. Large displays to 2560 scale with the fluid tokens.
- Reduced motion: nothing moves.

## Data (`src/data/cv.ts`)

- New `Project` type: `id`, `title`, `org`, `period`, `team?`, `role`, `lead`,
  `tasks: { text: string; sub?: string }[]`, `facts: { label; value }[]`, `tools: string[]`
  (plain names, no logos), `story` (team paragraph), `figure?: "ringprojekt"`. `projects` holds
  the new entries in chronological order, starting with the Ringprojekt.
- The four existing entries (luftfahrt, heliostat, bi-consulting, zeiterfassung) move unchanged
  into `projectDrafts` (old type renamed `ProjectDraft`), not rendered, until each is redone.
  `LifeCycle`, `AmModel`, `lib/amModel.ts` stay unused.
- `ratedSkills`: add `{ name: "Infor", level: 2, levelLabel: "Grundkenntnisse", group:
  "Software & BI" }` (owner's own rating, 2026-10-13).

## Links

- `topSkills`: the Ringprojekt proof items stay; `learned` links "Ringprojekt (B.Eng.)" point to
  `#ringprojekt` instead of `#bachelor`.
- `src/pages/projekte/index.astro` (Redirect): the bare `/projekte/` lands on `#projekte`; the
  old project anchors keep mapping to their Werdegang stations.

## Docs

- AGENTS.md Status/Architecture: one page now includes Projekte (Ringprojekt only); the new
  components; `projectDrafts`.
- docs/decisions.md: a short Projekte entry (mockups, owner's picks: A + sketch from B, PPS
  focus, final presentation, real photos to come).

## Testing (AGENTS.md process note)

- `npm run qa`; extend it so `#projekte` and `#ringprojekt` are checked for landing and the
  lanes scroller is excluded from the page-overflow check but must not overflow the page itself.
- Fresh tester subagent on the diff: 390 / 768 / 1366x657 / 1440, plus 320, 1024x560,
  1280x600, 1536x730, 2560; fresh loads of `/#projekte` and `/#ringprojekt`; nav current-section
  bar; day colour; reduced motion; the scroller with pinned labels on phones.
- Separate blunt design critic with screenshots.
- Fix, then a narrow re-check.

## Out of scope

- The other projects (later steps, one at a time).
- Real photos (owner sends them later; the sketch is the stand-in).
- More detail in the figure (owner describes it later).
