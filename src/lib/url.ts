// Site-root paths with the deploy base: GitHub Pages serves a project site under
// /<repo>/ (the workflow sets BASE_PATH), locally and on a custom domain the base is "/".
// Use for every root-absolute link or file in public/ ("/img/…", "/cv/…").
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const url = (path: string) => base + path;
