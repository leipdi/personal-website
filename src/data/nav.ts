export type NavId = "uebersicht" | "werdegang" | "projekte" | "kenntnisse" | "kontakt";

export const nav: { href: string; id: NavId; label: string; icon: string }[] = [
  {
    href: "/",
    id: "uebersicht",
    label: "Übersicht",
    icon: "M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4v-8.5Z",
  },
  {
    href: "/werdegang/",
    id: "werdegang",
    label: "Werdegang",
    icon: "M3 12h18M6 9.5v5M12 9.5v5M18 7v10",
  },
  {
    href: "/projekte/",
    id: "projekte",
    label: "Projekte",
    icon: "M4 5h7v7H4V5Zm9 0h7v4h-7V5ZM4 14h7v5H4v-5Zm9-3h7v8h-7v-8Z",
  },
  {
    href: "/kenntnisse/",
    id: "kenntnisse",
    label: "Kenntnisse",
    icon: "M4 6.5l1.5 1.5L8.5 5M11 6.5h9M4 12.5l1.5 1.5 3-3M11 12.5h9M11 18.5h9M5 18.5h2",
  },
  {
    href: "/kontakt/",
    id: "kontakt",
    label: "Kontakt",
    icon: "M3.5 6h17v12h-17V6Zm0 0 8.5 6.5L20.5 6",
  },
];

export const cvPdf = "/cv/Lebenslauf_Daniel_Lenski.pdf";
