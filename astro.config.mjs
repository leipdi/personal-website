// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// The deploy workflow (.github/workflows/deploy.yml) sets SITE_URL and BASE_PATH from
// GitHub Pages: a project site lives under https://<user>.github.io/<repo>/, a custom
// domain at its root. Locally both are unset, so the site is served at "/".
// Root-absolute paths in the source go through src/lib/url.ts so they follow the base.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  vite: {
    plugins: [tailwindcss()]
  }
});
