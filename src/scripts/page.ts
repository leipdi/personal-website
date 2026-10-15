// Small contracts the page's scripts share (the top bar, the day colours, the Kernkompetenzen
// pile, Werdegang, the hero, Kenntnisse, the Hobbys shelf). Kept here so each one is written
// down once instead of re-typed in every script.

/** The visitor's motion setting (Windows "animation effects off" is common on laptops). */
export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// ---- one animation frame for all scroll work
// Every script used to listen to "scroll" and request its own frame; now they share one: the
// callbacks run in the order they were registered (the same order their frames had before).
const queue = new Set<() => void>();
let raf = 0;
const flush = () => {
  raf = 0;
  const fns = [...queue];
  queue.clear();
  for (const fn of fns) fn();
};
/** Run `fn` in the next animation frame (once, however often it is asked for before that). */
export const requestFrame = (fn: () => void) => {
  queue.add(fn);
  if (!raf) raf = requestAnimationFrame(flush);
};
const onScroll: (() => void)[] = [];
/** Run `fn` once per animation frame while the page scrolls. */
export const onScrollFrame = (fn: () => void) => {
  if (!onScroll.length)
    addEventListener("scroll", () => onScroll.forEach(requestFrame), { passive: true });
  onScroll.push(fn);
};

// ---- the saved scroll position
// Werdegang sets `history.scrollRestoration = "manual"` (the browser restored positions saved
// before the page's layout settled) and keeps the position in the history entry instead. A
// reload or Back returns there; a fresh visit has none and lands on its hash.
const KEY = "wdY";
/** The position this history entry last saved, or null on a fresh visit. */
export const savedY = (state: unknown = history.state): number | null => {
  const y = (state as Record<string, unknown> | null)?.[KEY];
  return typeof y === "number" ? y : null;
};
export const saveY = (y: number) => history.replaceState({ ...(history.state ?? {}), [KEY]: y }, "");

/** The URL's hash without "#", decoded (a malformed "%" stays as it is instead of throwing). */
export const hashId = () => {
  const h = location.hash.slice(1);
  try {
    return decodeURIComponent(h);
  } catch {
    return h;
  }
};

/** The element the URL's hash names, if any. */
export const hashTarget = () => (location.hash ? document.getElementById(hashId()) : null);

/** Resolves once the web fonts and the whole page (images included) have loaded. */
export const settled = (): Promise<unknown> =>
  Promise.all([
    document.fonts?.ready,
    document.readyState === "complete" ? null : new Promise((r) => addEventListener("load", r, { once: true })),
  ]);
