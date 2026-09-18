# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

A personal website (hobby project, not client work). Content will mix: about-me/bio, a resume/CV page derived from the owner's actual CV and LinkedIn profile, a projects/portfolio section, links to socials, and eventually a blog.

Design goal: deliberately non-standard/non-templated. Avoid shipping a component library's out-of-the-box look (Aceternity/Motion Primitives/etc. read as "generic AI-hackathon site" when used wholesale) — favor a hand-picked color/type palette plus one or two restrained, deliberate interactions over stacking every available effect.

## Planned stack

- **Astro + Tailwind** — chosen for its plugin/theme ecosystem, near-zero shipped JS by default, and first-class free hosting (Vercel/Netlify/Cloudflare Pages).
- **CV/LinkedIn → content**: [JSON Resume](https://jsonresume.org) schema, populated via a LinkedIn-export converter (e.g. `linkedin-to-jsonresume`), rendered as a page and exportable to PDF.
- Reference starters worth borrowing structure/ideas from (not templates to clone wholesale): [astrofy](https://github.com/manuelernestog/astrofy), [astro-portfolio-starter](https://github.com/drehimself/astro-portfolio-starter).

## Status

Scaffolded as an Astro + Tailwind v4 site (the old throwaway `index.html`/`style.css`/`script.js` are gone). A multi-page prototype driven by CV + LinkedIn export data — no JSON Resume schema yet, no blog.

The site went through two design passes: v1 was a single-page "technical drawing sheet" concept (title block, revision-table timeline) that the owner rejected outright (disliked the overall look, and disliked that dark-mode auto-switched to white-on-dark). v2 (current) is a real multi-page site with a persistent bottom tab bar, a fixed light-only theme, and content rewritten as short narrative/case-study prose instead of CV-bullet paraphrase. If asked to redesign again, don't default back to v1's drawing-sheet motif.

### Setup / commands

- `npm run dev` — dev server at `http://localhost:4321`
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the production build locally
- `npx astro check` — type/diagnostics check (closest thing to a lint/test step right now; there is no separate test suite)

### Design concept

A personal "BI dashboard" reading of the CV, grounded in the owner's actual BI/Power BI work: KPI tiles on the overview page, a Gantt-style timeline for career history (colored by Ausbildung vs. Beruf), and a skills page with proficiency bars — but only for skills the CV explicitly self-rates (`sehr gut`/`gut`/`Grundkenntnisse`/`C1`/etc. in `ratedSkills`); everything else goes in the unscaled `competencies` list rather than inventing a level. Real multi-page routing (`/`, `/werdegang/`, `/projekte/`, `/kenntnisse/`, `/kontakt/`) with a fixed bottom tab bar (`TabBar.astro`, ≤5 items, `aria-current="page"`), not a single scrolling page or a JS tab-switcher.

**Fixed light theme only** — dark text on light surfaces (`--ink` #14181c on `--page`/`--surface`), deliberately **no** `prefers-color-scheme: dark` override. The owner explicitly rejected white-text-on-dark-background; don't reintroduce an automatic dark mode without asking.

Palette was picked and validated with the `dataviz` skill's `scripts/validate_palette.js` (categorical: copper `#c7742a` = Beruf, teal `#0c93a2` = Ausbildung, CVD ΔE 23.1 normal-vision; skills bars use a validated 3-step teal ordinal ramp `--teal-mid`/`--teal`/`--teal-ink`). Tokens live in `src/styles/global.css` as plain CSS custom properties, mapped to Tailwind utilities via `@theme`.

Fonts: Big Shoulders Display (display/labels), Source Serif 4 (body), JetBrains Mono (technical annotations) — loaded via a Google Fonts `<link>` in `Layout.astro`, **not** `@fontsource` packages: those hit a subpath-export resolution bug in this environment (likely the space in `personal website`), so avoid re-adding them without testing first.

### Architecture

- `src/data/cv.ts` — all CV/LinkedIn content as typed data, written as short original prose (not copied CV lines): `profile`, `revisions` (career history, each with a `story` paragraph), `projects` (case studies: context/approach/result), `ratedSkills` (only self-rated skills, with numeric `level`), `competencies` (unrated fields), `certifications`, `notes`. Edit content here, not in components.
- `src/components/` — `TabBar` (bottom nav), `Gantt` (career timeline, pure CSS/HTML, no JS/chart lib), `SkillBar`, `KpiTile`, `ProjectCard`.
- `src/layouts/Layout.astro` — page shell: fonts, sticky top bar (site name + page label), bottom `TabBar`, content margin that accounts for the fixed tab bar height.
- `src/pages/index.astro` (Übersicht), `src/pages/werdegang/index.astro`, `src/pages/projekte/index.astro`, `src/pages/kenntnisse/index.astro`, `src/pages/kontakt/index.astro` — one route per tab.

### Design/QA skills available

`~/.claude/skills/` also has `ui-ux-pro-max` (design-system + UX-rule search; its `scripts/search.py` needs a real Python install — the Windows Store stub alias doesn't count, `python`/`python3`/`py -3` all fail without one — so its markdown references under `references/` were read directly instead), `web-design-guidelines`, `composition-patterns`, and the bundled `dataviz` skill (chart form/color/palette-validation procedure). When redesigning or adding charts, use these rather than eyeballing it.

### Process note

When asked for a substantial redesign, the owner wants a build → test → fix loop with the testing step done by a **separate subagent**, not the same agent that just built it — it only reports bugs, it doesn't edit files. No browser/screenshot tool is available in this environment, so that agent's checks are necessarily code-level + `curl`/`astro check`/`astro build`, not visual; say so explicitly rather than implying a visual review happened.

### Sensitive source files

`Lebenslauf_Daniel_Lenski.pdf` (repo root) and the extracted `Basic_LinkedInDataExport_*` folder/zips are the *raw* CV/LinkedIn exports (the latter contains messages, connections, phone numbers, etc.) — they're gitignored and must stay out of the repo. The only CV file meant to be published is `public/cv/Lebenslauf_Daniel_Lenski.pdf`, linked from the site's contact section.
