const months: Record<string, number> = {
  jan: 0, feb: 1, mär: 2, mar: 2, apr: 3, mai: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, dez: 11,
};

export const today = new Date();
// Fixed at build time (static site): rebuild to move "heute" forward.
export const todayFrac = today.getFullYear() + (today.getMonth() + (today.getDate() - 1) / 31) / 12;

/**
 * "Okt 2021" -> 2021.75, "heute" -> current month.
 * Year-only values get a typical school/semester month: starts in September,
 * ends in July, so a plain "2020 – 2024" doesn't render as four full calendar years.
 */
export function toFrac(value: string, edge: "start" | "end"): number {
  const v = value.trim().toLowerCase();
  if (v === "heute") return todayFrac;
  const m = v.match(/^([a-zä]{3})\w*\s+(\d{4})$/);
  if (m && m[1] in months) {
    const month = months[m[1]];
    // an end month counts inclusively, up to the end of that month
    return Number(m[2]) + (edge === "end" ? month + 1 : month) / 12;
  }
  const y = Number(v);
  if (!Number.isNaN(y)) return y + (edge === "start" ? 8 : 7) / 12;
  throw new Error(`Unbekanntes Datum: ${value}`);
}
