// The top bar: the section in view, the phone menu, and the bar's name hidden while the hero's
// big name is on screen.
import { onScrollFrame } from "./page";

// the section in view gets the ink bar in the top bar: the last section whose top has
// passed a line a third of the way down the window (by position, not by the section
// boxes, so content pushed past a section's box still counts as that section)
const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-nav]")];
const secs = links.map((a) => document.getElementById(a.dataset.nav!));
const mark = () => {
  const line = innerHeight / 3;
  let cur = -1;
  secs.forEach((el, i) => {
    if (el && el.getBoundingClientRect().top <= line) cur = i;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = secs.length - 1;
  links.forEach((a, i) => (i === cur ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
};
onScrollFrame(mark);
addEventListener("resize", mark);
mark();

// the phone menu closes when a section is picked, on Escape, or on a tap elsewhere
const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
if (menu) {
  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) menu.open = false;
  });
  document.addEventListener("click", (e) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  // also when focus leaves it, or the page scrolls on (it would cover the pinned chart)
  menu.addEventListener("focusout", (e) => {
    if (!menu.contains(e.relatedTarget as Node | null)) menu.open = false;
  });
  let openY = 0;
  menu.addEventListener("toggle", () => (openY = scrollY));
  addEventListener(
    "scroll",
    () => {
      if (menu.open && Math.abs(scrollY - openY) > 40) menu.open = false;
    },
    { passive: true },
  );
}

// the bar's name stays hidden while the hero's big name is on screen; the bar starts
// hidden (class in the markup, only with JS), so the name doesn't flash twice on load
const top = document.querySelector<HTMLElement>(".top");
const heroName = document.getElementById("name");
if (top && heroName) {
  // (the last entry: after Back one batch can hold a stale "visible" before the real state)
  new IntersectionObserver((es) => top.classList.toggle("is-hero", es[es.length - 1].isIntersecting), {
    rootMargin: `-${top.offsetHeight}px 0px 0px 0px`,
  }).observe(heroName);
} else top?.classList.remove("is-hero");
