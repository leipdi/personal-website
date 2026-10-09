# Daniel Lenski – persönliche Website

One scrolling page built with [Astro](https://astro.build) and Tailwind CSS v4: hero, Kernkompetenzen, Werdegang, Kenntnisse, Hobbys, Kontakt.

## Commands

| Command | |
| --- | --- |
| `npm install` | install dependencies (Node 22, see `.nvmrc`) |
| `npm run dev` | dev server at http://localhost:4321 |
| `npm run build` | static build to `dist/` |
| `npm run preview` | serve the build locally |
| `npx astro check` | type check |
| `npm run qa` | build + browser QA pass (needs `npx playwright install chromium` once) |

## Structure

```
src/
  data/        content (cv.ts), top-bar anchors, software logos
  pages/       index.astro (the page) + redirect pages for old URLs
  components/  sections/, figures/ (hero field, heliostat), helpers
  layouts/     page shell, top bar
  lib/         geometry, dates, url() for base-aware paths
  styles/      global.css (tokens, palette)
public/        files served as-is (images, CV PDF, favicon)
Pictures/      source pictures (not published)
scripts/       image helpers
qa/            QA script
```

Design notes and decisions live in `AGENTS.md`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `master`.
One-time setup: repository **Settings → Pages → Source: GitHub Actions**.
The workflow passes the Pages URL and base path to the build, so the site works both at
`https://<user>.github.io/<repo>/` and on a custom domain. Paths to files in `public/` must go
through `url()` from `src/lib/url.ts`.
