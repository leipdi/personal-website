// Software shown in the skill hub: every tool gets a logo. Where no freely licensed logo
// exists (see src/assets/logos/LICENSES.md), `mono` is a monogram tile rendered as a marked
// logo placeholder until the owner adds the real logo.
import powerbi from "../assets/logos/powerbi.svg?raw";
import excel from "../assets/logos/excel.svg?raw";
import python from "../assets/logos/python.svg?raw";
import sap from "../assets/logos/sap.svg?raw";
import claude from "../assets/logos/claude.svg?raw";
import mssql from "../assets/logos/mssql.svg?raw";

// wordmark: the logo already spells the name, so the text label is only for screen readers
export type Tool = { name: string; svg?: string; mono?: string; wordmark?: true };

export const tools: Record<string, Tool> = {
  "Power BI": { name: "Power BI", svg: powerbi },
  Excel: { name: "Excel", svg: excel },
  Python: { name: "Python", svg: python },
  SAP: { name: "SAP", svg: sap, wordmark: true },
  Claude: { name: "Claude", svg: claude },
  // same name as the CV self-rating on /kenntnisse/
  MSSQL: { name: "MSSQL", svg: mssql },
  Jedox: { name: "Jedox", mono: "J" },
  Timebutler: { name: "Timebutler", mono: "T" },
  "Copilot in Power BI": { name: "Copilot in Power BI", mono: "Co" },
};

export function tool(key: string): Tool {
  const t = tools[key];
  if (!t) throw new Error(`Unbekannte Software im Skill-Hub: ${key} (in src/data/tools.ts ergänzen)`);
  return t;
}
