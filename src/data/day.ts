// A day while scrolling (owner 2026-10-09, colour mockups "A + C"): each section has the light of
// one time of day, dawn at the hero to dusk at Kontakt (scripts/day.ts paints it).
// The colours keep --ink-2/--ink-3 at 4.5:1 or more, the spots included (their strength is
// capped for that). Retuned after a blunt critique: the arc must read (dawn and sunset were the
// same peach, noon the dullest stop), and a spot never sits on the opposite side of the colour
// wheel from its background (blue on peach mixed to grey mud). Dawn is a cool pale sky with the
// warm light only low at the horizon, so the hero's sun stays the brightest warm thing; noon has
// the day's whitest light; sunset is the deepest, hottest stop; dusk ends with a last glow at
// the horizon.
export type Hour = {
  sel: string; // the section
  bg: string; // the page colour (--bg)
  a: string; // the two light spots' colours
  b: string;
  k: number; // the spots' strength (times STRENGTH)
  pa: number[]; // the spots' centres in % of the window (x, y)
  pb: number[];
};

export const DAY: Hour[] = [
  { sel: ".hero", bg: "#ebebf5", a: "#ffc8a2", b: "#f3d0e4", k: 1, pa: [45, 104], pb: [96, 6] },
  { sel: "#kompetenzen", bg: "#d9e8fb", a: "#a8cdfa", b: "#c4ecf0", k: 0.9, pa: [10, 30], pb: [90, 80] },
  { sel: "#werdegang", bg: "#e6f1fc", a: "#fff6d8", b: "#ffffff", k: 0.7, pa: [78, 22], pb: [15, 85] },
  { sel: "#kenntnisse", bg: "#fbeac4", a: "#ffc46b", b: "#ffad90", k: 0.9, pa: [85, 30], pb: [15, 85] },
  { sel: "#hobbys", bg: "#ffcdb5", a: "#ffae94", b: "#ffb3c7", k: 0.9, pa: [20, 25], pb: [85, 75] },
  { sel: "#kontakt", bg: "#e2d9f3", a: "#ffc0a8", b: "#c9b8f2", k: 0.8, pa: [70, 104], pb: [10, 20] },
];

/** the spots' peak opacity (see the contrast note above) */
export const STRENGTH = 0.35;
