// Software shown in the skill hub: every tool gets a logo. Where no freely licensed logo
// exists (see src/assets/logos/LICENSES.md), `mono` is a monogram tile rendered as a marked
// logo placeholder until the owner adds the real logo.
import powerbi from "../assets/logos/powerbi.svg?raw";
import excel from "../assets/logos/excel.svg?raw";
import sap from "../assets/logos/sap.svg?raw";
import claude from "../assets/logos/claude.svg?raw";
import mssql from "../assets/logos/mssql.svg?raw";
import autodesk from "../assets/logos/autodesk.svg?raw";

export type Tool = { name: string; svg?: string; mono?: string };

export const tools: Record<string, Tool> = {
  "Power BI": { name: "Power BI", svg: powerbi },
  Excel: { name: "Excel", svg: excel },
  // no free Inventor logo exists: the Autodesk mark, captioned with the product name
  "Autodesk Inventor": { name: "Autodesk Inventor", svg: autodesk },
  SAP: { name: "SAP", svg: sap },
  Claude: { name: "Claude", svg: claude },
  // same name as the CV self-rating on /kenntnisse/
  MSSQL: { name: "MSSQL", svg: mssql },
  Timebutler: { name: "Timebutler", mono: "T" },
  Jedox: { name: "Jedox", mono: "J" },
  // non-breaking space: wraps as "Copilot in / Power BI", never leaves "BI" alone
  "Copilot in Power BI": { name: "Copilot in Power BI", mono: "Co" },
};

// Inlined SVGs carry fixed gradient/mask ids; the same logo in two boxes would duplicate
// them. Suffix every id (and its url(#…) / href="#…" references) per usage.
export function uniqueSvg(svg: string, suffix: string): string {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  let out = svg;
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`id="${esc}"`, "g"), `id="${id}-${suffix}"`)
      .replace(new RegExp(`#${esc}(?=[)"'])`, "g"), `#${id}-${suffix}`);
  }
  return out;
}

export function tool(key: string): Tool {
  const t = tools[key];
  if (!t) throw new Error(`Unbekannte Software im Skill-Hub: ${key} (in src/data/tools.ts ergänzen)`);
  return t;
}
