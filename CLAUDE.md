# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal website (hobby project, not client work). Content will mix: about-me/bio, a resume/CV page derived from the owner's actual CV and LinkedIn profile, a projects/portfolio section, links to socials, and eventually a blog.

Design goal: deliberately non-standard/non-templated. Avoid shipping a component library's out-of-the-box look (Aceternity/Motion Primitives/etc. read as "generic AI-hackathon site" when used wholesale) — favor a hand-picked color/type palette plus one or two restrained, deliberate interactions over stacking every available effect.

## Planned stack

- **Astro + Tailwind** — chosen for its plugin/theme ecosystem, near-zero shipped JS by default, and first-class free hosting (Vercel/Netlify/Cloudflare Pages).
- **CV/LinkedIn → content**: [JSON Resume](https://jsonresume.org) schema, populated via a LinkedIn-export converter (e.g. `linkedin-to-jsonresume`), rendered as a page and exportable to PDF.
- Reference starters worth borrowing structure/ideas from (not templates to clone wholesale): [astrofy](https://github.com/manuelernestog/astrofy), [astro-portfolio-starter](https://github.com/drehimself/astro-portfolio-starter).

## Status

Scaffolded as an Astro + Tailwind v4 site. A multi-page site driven by CV + LinkedIn export data. No JSON Resume schema yet, no blog.

Design history, so a redesign doesn't circle back:
- **v1** single-page "technical drawing sheet" (title block, revision-table timeline). Rejected outright; also rejected auto dark mode (white-on-dark).
- **v2** "personal BI dashboard": bottom tab bar on all sizes, KPI tiles, Gantt, Fraunces + Bricolage Grotesque, copper/teal. A blunt reviewer found it read as AI-generated because the same few tricks (italic-serif micro-labels, boxed cards, KPI stat-tile grid, one accent color everywhere) repeated on every page.
- **v3 (current, 2026-09-24)** built from the owner's `inspo/` folder (see `inspo/README.md`) and portrait. Don't default back to v1's drawing-sheet motif or v2's KPI tiles/boxed cards.

### Setup / commands

- `npm run dev` — dev server at `http://localhost:4321`
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the production build locally (daemonizes; `npx astro preview stop` to stop)
- `npx astro check` — type/diagnostics check (closest thing to a lint/test step; there is no separate test suite)

### Design concept (v3, revised after two review rounds)

- **Palette taken from the portrait** (`public/img/daniel-lenski.jpg`, 400×400): sky `#adc2dc` (sampled from the photo backdrop) is the identity field, navy `#1e253f` (the pinstripe suit) is the ink, white paper. Signal yellow `#f3c318` has **exactly one meaning site-wide: the break-even point in the AM model** (fill with navy outline; also in the home-page glimpse of that chart). It is not used for ongoing entries, active buttons, the heliostat sun or text selection. Tokens live in `src/styles/global.css` (`--paper`, `--sky`, `--sky-wash`, `--navy`, `--ink-2`, `--ink-sky` for secondary text on sky, `--steel`, `--signal`, `--line`, `--pinstripe`, plus `--sans`/`--serif`, `--wrap`, `--gutter`, `--measure`).
- **Fixed light theme only**, deliberately **no** `prefers-color-scheme: dark` override. The owner rejected white-on-dark; don't reintroduce it without asking (also why no band is navy with white text).
- **Type**: two families via one Google Fonts `<link>` (avoid `@fontsource`: subpath-export bug here, likely the space in `personal website`). **Archivo** for UI and labels; its condensed heavy `.display` cut (`font-stretch: 68%`, 800) is used **only** for the name (top bar, home h1), page titles (`.page-title`, one h1 system on every page) and the Kontakt e-mail. **Source Serif 4** (`.text`) for all prose *and* content headings: home claim and clauses, essay titles (600), skill names, the model's verdict. The critic found the condensed cut carrying every kind of emphasis (thesis titles, proof words, level labels) so nothing stood out; don't spread it again.
- **Layout**: no sidebar rail. Every page has the **identical** slim sky top bar (name, nav with underline for the current page at ≥64rem, "Lebenslauf (PDF)" on every page incl. /kontakt/ so the nav never shifts). Content in a centred `.wrap` grid (72rem). Below 64rem the nav is the fixed **bottom tab bar** (`TabBar.astro`). `html` has `scroll-padding-top/bottom` for the sticky top bar and the fixed tab bar (and a larger top padding on /werdegang/ at ≥64rem for its sticky axis), so keyboard focus and anchors never land under a bar; sections don't need their own `scroll-margin`.
- **Each page has its own shape**:
  - Übersicht = **the claim as a sentence running down the page**. Hero: sky field, **name as the h1** (condensed, large), role and location, then `claimLead` in large serif. Portrait on the content grid (right column, not bleeding off the edge), bottom-flush, in a **paper-white mat** on three sides that joins the white band below: a deliberate print edge instead of a feathered or hard seam against the not-quite-matching backdrop blue (no side feathering, it smeared the sleeve; a 3px shift hides a light JPEG edge column; never wider than 260 CSS px). Then one band per `claimParts` clause, **each in its own form**: heliostat = text + the schematic; luftfahrt = text + a static glimpse of the AM chart (`amSvg(..., { bare: true })`, default case, verdict as caption); BI = text only, set a size larger. The station is named inside the paragraph (`body`): no grey meta line / bold title / link recipe, no big "proof word" (it read as a KPI tile). The page ends on a sky band with one contact line (e-mail, LinkedIn, CV, Kontakt); the home page drops the layout's bottom padding so that band runs to the page end.
  - Werdegang = **timeline**, newest start first (usual CV order). The axis starts at the first non-minor station (2020); older entries (Abitur) are a text-only row without a track. Every track carries a thin navy **"heute" line**; ongoing stations touch it (replaces the former yellow end caps). One title size for all full rows; rows with a case study link their title to it (no separate "Zur Fallstudie" line). `minor` entries (Tutor, Hilfskraft, Abitur) are one compact line. Grades live here (in the stories).
  - Projekte = **essays**: serif title, italic byline *after* the title (not an eyebrow above it), continuous serif prose ("Ergebnis." run-in); the second thesis on a sky-wash band; the heliostat schematic sits beside the text only from 75rem (narrower side columns made its labels unreadable), stacked below that.
  - Kenntnisse = **ledger**: skill names large (serif 600), the CV's own level words (sehr gut / gut / Grundkenntnisse, Muttersprache / C1) as small row heads, no meters. Software | Sprachen on a 3fr/2fr grid; the full-width blocks (Methoden with where they were applied, Zertifikate with issuer) use the same 3fr/2fr split so their second column lines up with Sprachen and all rules have the same width. Unevidenced methods go on one "Außerdem:" line (`otherCompetencies`).
  - Kontakt = **letterhead**: huge e-mail (owner's call, leave it), unlabelled address block (the LinkedIn URL only breaks after `linkedin.com/in/`), CV button, "Neben dem Job".
- **Data encoding**: Beruf = solid navy, Ausbildung = navy **pinstripe** hatch (`--pinstripe`, echoes the suit; works without hue). Levels only where the CV self-rates them (`ratedSkills`); never invent one.
- **Signature interaction**: `/projekte/#luftfahrt` embeds the AM model in the essay (`components/figures/AmModel.astro` + `lib/amModel.ts`, inspo 17 Ciechanowski). The prose first says it is a simplified example with rounded literature values, *not* the thesis's results, then explains "Materialeinsatz" (introduces the term **Buy-to-Fly-Verhältnis**) and "Gewicht". Below it the figure is **one self-contained unit** that fits a 1024×768 screen (no sticky column): three **visible toggle buttons** for the comparison cases across the top (`PRESETS`; active = navy fill; names only on phones), then verdict + sliders + a small facts table left and chart + legend right (stacked on phones: cases, verdict, chart, sliders). Opens on the **middle case** (`DEFAULT_PRESET`, kompaktes Teil 2:1 / 5 %, break-even after ~4 years), not the most flattering one. **Fixed y-axis** wide enough for all three cases (only extreme slider values widen it), with the other cases as dashed steel **ghost lines**, so the cases don't all look like the same triangle. Buy-to-fly slider 1.5–20 (below ~1.5:1 is unrealistic for milling); each slider has a live plain-language hint ("12 kg Titan eingekauft für 1 kg fertiges Teil", "gedruckt 950 g statt 1 kg"); on tablets the two sliders share subgrid rows so their tracks line up. The legend lists only marks that are present (`amMarks`). `amVerdict()` gives the actual reason for a lead (titanium saved vs. lighter part vs. "fast gleichauf" within 10 %). Time axis = years of airline operation over 25 years (~3,000 h/yr); energy in litres of kerosene (~35 MJ/L). The caption names the simplifications (no credit for recycled chips, no post-machining, supports only via powder overhead). **No-JS**: `html.js` is set by an inline one-liner in `Layout`; without it the cases and sliders are hidden, a static note names the shown case, and the SVG is server-rendered at a phone width (`CHART.ssrW`). This is the only JS on the site besides that one-liner.
- **Avoid the generated-site tells**: no uppercase tracked eyebrows, no mono micro-labels, no boxed card grids, no KPI stat tiles (incl. "big word + small caption"), no "→" appended to links, no middle-dot meta strings, sparing em dashes, no numbered "how it works" steps, no repeated meta-line → bold title → paragraph → link recipe. Copy: plain, specific German; no aphorisms, alliteration or "so that someone can decide" filler; never invent facts or figures. Boldness is spent in one place (home hero + bands); other pages stay quiet.

### Architecture

- `src/data/cv.ts` — all CV/LinkedIn content as typed data in short original prose: `claimLead` + `claimParts` (home bands: `clause`, project slug, `body` paragraph naming the station; `profile.claim` is derived from them), `profile`, `career` (each with `story`; `from`/`to` as `"2020"`, `"Okt 2021"` or `"heute"`; optional `minor` and `project` slug), `projects` (ordered by weight, not date; `slug` = anchor, optional `figure`), `ratedSkills`, `competencies` (with `where`/`href` evidence), `otherCompetencies`, `certifications`, `notes`. Edit content here, not in components. Exception: the AM model's explanatory essay text lives in `AmModel.astro` because it is written around the figure.
- `src/data/nav.ts` — the 5 routes (shared by top bar and tab bar, incl. tab icons) and the CV PDF path.
- `src/lib/dates.ts` — `toFrac()` turns `from`/`to` strings into fractional years (year-only starts count as September, ends as July).
- `src/lib/amModel.ts` — model constants (`AM`), `RANGE`, `PRESETS` + `DEFAULT_PRESET`, `amModel()`, `amMarks()` (which legend items exist), `amSvg(input, { w, h, bare, ghosts, fixed })` (chart markup for server render, client update and the home glimpse), `amVerdict()`, formatters (`fmtL`, `fmtBtf`, `fmtGrams`).
- `src/components/` — `TabBar`, `figures/AmModel`, `figures/Heliostat` (geometrically correct reflection schematic; labels are set larger in viewBox units below 26rem so they stay ≥12px on a 320px phone).
- `src/layouts/Layout.astro` — shell: fonts, `html.js` one-liner, skip link, sky top bar (sticky on phones, static at ≥64rem so the Werdegang axis can stick to the top), `<main id="inhalt" class="content">` with bottom padding for the tab bar, tab bar. Pages wrap their own content in `.wrap` so bands can go full-bleed.
- `src/pages/index.astro` (Übersicht), `werdegang/`, `projekte/`, `kenntnisse/`, `kontakt/`.
- CSS cascade caution: media-query overrides must come *after* the base rule they override (this broke the site twice); page-level overrides of layout/global rules need higher specificity (e.g. `:global(:root)`, `:global(main.content#inhalt)`) because Astro's scoped selectors carry an extra attribute.

### Design/QA skills available

`~/.claude/skills/` also has `ui-ux-pro-max` (design-system + UX-rule search; its `scripts/search.py` needs a real Python install — the Windows Store stub alias doesn't count, `python`/`python3`/`py -3` all fail without one — so its markdown references under `references/` were read directly instead), `web-design-guidelines`, `composition-patterns`, and the bundled `dataviz` skill (chart form/color/palette-validation procedure). When redesigning or adding charts, use these rather than eyeballing it.

### Process note

When asked for a substantial redesign, the owner wants a build → test → fix loop with the testing step done by a **separate subagent** (Agent tool, fresh `general-purpose`, not a `fork`) that only reports bugs — it doesn't edit files. Reviews should include real screenshots: a Playwright rig lives in an earlier session scratchpad (`%TEMP%/claude/C--Users-danie-personal-website/740c1ef4-b3ce-4d89-b99b-045aa187fe5c/scratchpad/browser`, has `node_modules/playwright` + example scripts). If it is gone, say the review was code-level only rather than implying a visual check happened. Design critique goes to a *separate* fresh agent told to be blunt, not the bug tester.

### Sensitive source files

`Lebenslauf_Daniel_Lenski.pdf` (repo root) and the extracted `Basic_LinkedInDataExport_*` folder/zips are the *raw* CV/LinkedIn exports (the latter contains messages, connections, phone numbers, etc.) — they're gitignored and must stay out of the repo. The only CV file meant to be published is `public/cv/Lebenslauf_Daniel_Lenski.pdf`, linked from the site's contact section.
