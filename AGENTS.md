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

Not yet scaffolded. `index.html`, `style.css`, `script.js` in the repo root are an early plain HTML/CSS/JS test/throwaway, not the real site — expect them to be replaced once the Astro build starts.

There is no build system, dependency manifest, test suite, or documented architecture yet. Once the Astro project is scaffolded, update this file with:

- Setup, build, lint, and test commands (including how to run a single test)
- High-level architecture notes once there are multiple files/modules whose relationships aren't obvious from a directory listing alone
