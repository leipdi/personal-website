// Quelle: Lebenslauf (PDF) + LinkedIn-Datenexport.
//
// KI-PLATZHALTER: Fakten (Titel, Arbeitgeber, Orte, Zeiträume, Noten, Software-Einstufungen,
// Zertifikate, Kontaktdaten) stammen aus CV/LinkedIn. Alle Fließtexte und Zuordnungen sind
// dagegen KI-Entwürfe und auf der Seite magenta als Platzhalter markiert:
//   profile.claim, career[].story, projects[].title/context/approach/result,
//   topSkills (komplett: Auswahl, Titel, Belegzeilen, Zuordnung von Stationen und Software),
//   competencies[].skill (Zuordnung CV-Methode -> Kernkompetenz), notes.
// Beim Ersetzen durch eigene Texte auch den <Placeholder>-Wrapper in der Seite entfernen.

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  // KI-PLATZHALTER
  claim:
    "Ich berechne, was Bauteile in der Fertigung kosten und welchen Energieaufwand sie verursachen, und baue Berichte in Power BI und Jedox.",
  location: "Langenfeld (Rheinland) / Düsseldorf",
  email: "daniel.lenski@hotmail.com",
  phone: "+49 157 74585248",
  linkedin: "linkedin.com/in/daniel-lenski-de",
  linkedinUrl: "https://linkedin.com/in/daniel-lenski-de",
};

export type CareerEntry = {
  id: string; // Anker auf /werdegang/ (#id), stabil halten: der Skill-Hub verlinkt darauf
  from: string;
  to: string;
  fromYear: number;
  toYear: number;
  title: string;
  org: string;
  place: string;
  kind: "ausbildung" | "beruf";
  story: string; // KI-PLATZHALTER
  // Nebenstationen: kompakte Zeile ohne Text, damit sie nicht so viel Raum bekommen wie die Abschlussarbeiten.
  minor?: true;
  // Slug eines Projekts auf /projekte/, falls es dazu eine ausführliche Fallstudie gibt.
  project?: string;
};

// Älteste zuerst. from/to: "2020" (nur Jahr), "Okt 2021" (Monat + Jahr) oder "heute".
export const career: CareerEntry[] = [
  {
    from: "2013",
    to: "2020",
    fromYear: 2013,
    toYear: 2020,
    id: "abitur",
    title: "Allgemeine Hochschulreife",
    org: "Konrad-Adenauer-Gymnasium",
    place: "Langenfeld",
    kind: "ausbildung",
    minor: true,
    story:
      "Abitur mit Note 2,0, mit Mathematik und Physik als den Fächern, die am meisten hängen geblieben sind und später den roten Faden zum Wirtschaftsingenieurwesen bildeten.",
  },
  {
    from: "2020",
    to: "2024",
    fromYear: 2020,
    toYear: 2024,
    id: "bachelor",
    title: "B.Eng. Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Grundstudium zwischen Technik und Betriebswirtschaft, mit Note 1,8 abgeschlossen. Die Bachelorarbeit am DLR entschied den Weg in Richtung Produktion und Energie.",
  },
  {
    from: "Okt 2021",
    to: "Jul 2022",
    fromYear: 2021,
    toYear: 2022,
    id: "tutor",
    title: "Mathematik-Tutor",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "beruf",
    minor: true,
    story:
      "Als erster Job Tutorien für Erstsemester in Mathematik gehalten, wo Erklären genauso wichtig war wie Rechnen können.",
  },
  {
    from: "Okt 2022",
    to: "Feb 2023",
    fromYear: 2022,
    toYear: 2023,
    id: "praktikum-pm",
    title: "Praktikant Projektmanagement",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Schnittstelle zwischen Kunden und Softwareentwicklung: Kundentermine vor- und nachbereitet, SAP-Tabellen in Kundensystemen gepflegt und in Produktions-/Logistikfragen beraten.",
  },
  {
    from: "Feb 2023",
    to: "Feb 2024",
    fromYear: 2023,
    toYear: 2024,
    id: "werkstudent-controlling",
    title: "Werkstudent Finanzen & Controlling",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    project: "zeiterfassung",
    story:
      "Ein Jahr Mitarbeitercontrolling und Monatsabschlüsse in Excel/Pivot betreut und nebenbei ein neues Zeiterfassungssystem (Timebutler) eingeführt und die Kolleg:innen darauf geschult.",
  },
  {
    from: "Mär 2024",
    to: "Jun 2024",
    fromYear: 2024,
    toYear: 2024,
    id: "bachelorarbeit",
    title: "Bachelorarbeit: Herstellkostenoptimierung von Heliostaten",
    org: "DLR, Deutsches Zentrum für Luft- und Raumfahrt",
    place: "Jülich",
    kind: "beruf",
    project: "heliostat",
    story:
      "Ein Heliostat ist ein computergesteuerter Spiegel, der Sonnenlicht auf den Receiver eines Solarturm-Kraftwerks bündelt. Je günstiger seine Stahlkonstruktion zu fertigen ist, desto eher rechnet sich Solarturm-Strom. Am DLR in Jülich Bottom-Up-Kalkulationen aus CAD-Daten gebaut, um genau diese Fertigungskosten künftiger Heliostaten zu bewerten. Ergebnis als Fachbeitrag bei der SolarPACES Conference veröffentlicht.",
  },
  {
    from: "2024",
    to: "heute",
    fromYear: 2024,
    toYear: 2026,
    id: "master",
    title: "M.Sc. Internationales Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Vertiefung mit Schwerpunkt Produktion und Innovation, aktuell mit Note 1,8. Die Masterarbeit läuft parallel an der RWTH Aachen.",
  },
  {
    from: "Sep 2024",
    to: "Mai 2026",
    fromYear: 2024,
    toYear: 2026,
    id: "hilfskraft",
    title: "Wissenschaftliche Hilfskraft",
    org: "Hochschule Düsseldorf, FB Maschinenbau & Verfahrenstechnik",
    place: "Düsseldorf",
    kind: "beruf",
    minor: true,
    story:
      "Das Dekanat im Tagesgeschäft unterstützt (Mitteilungen für den Fachbereich, Büromaterial, Eventorganisation) und dabei die organisatorische Seite eines Fachbereichs von innen kennengelernt.",
  },
  {
    from: "Jan 2026",
    to: "heute",
    fromYear: 2026,
    toYear: 2026,
    id: "masterarbeit",
    title: "Masterarbeit: Ökobilanz additiver Fertigung in der Luftfahrt",
    org: "RWTH Aachen",
    place: "Remote",
    kind: "beruf",
    project: "luftfahrt",
    story:
      "3D-gedruckte Bauteile sparen in der Luftfahrt Gewicht und Material. Aber lohnt sich das auch ökologisch, über den gesamten Lebenszyklus? Dafür eine Bewertungsmetrik entwickelt: Ökobilanzierung nach ISO 14040 plus ein Excel-Tool zur Berechnung des kumulierten Energieaufwands (KEA), um additive Fertigung dort einzusetzen, wo sie tatsächlich ökologisch sinnvoll ist. Bislang mit Note 1,2 bewertet.",
  },
  {
    from: "Mai 2026",
    to: "heute",
    fromYear: 2026,
    toYear: 2026,
    id: "praktikum-bi",
    title: "Praktikum BI Consulting",
    org: "ATVISIO Consult GmbH",
    place: "Düsseldorf",
    kind: "beruf",
    project: "bi-consulting",
    story:
      "ETL-Strecken und Berichte für Kunden und intern in Power BI und Jedox gebaut, außerdem eine Schulung zu Microsoft Copilot in Power BI konzipiert und selbst gehalten.",
  },
];

export type Project = {
  slug: string;
  title: string; // KI-PLATZHALTER
  org: string;
  period: string;
  context: string; // KI-PLATZHALTER
  approach: string; // KI-PLATZHALTER
  result: string; // KI-PLATZHALTER
  link?: { label: string; href: string };
  // Welche Abbildung das Projekt begleitet (Komponenten in src/components/figures/).
  figure?: "am-model" | "heliostat";
};

// Reihenfolge = Gewichtung auf der Projektseite, nicht Chronologie.
export const projects: Project[] = [
  {
    slug: "luftfahrt",
    figure: "am-model",
    title: "Wann sich 3D-Druck in der Luftfahrt ökologisch lohnt",
    org: "Masterarbeit an der RWTH Aachen",
    period: "2026",
    context:
      "Additive Fertigung spart in der Luftfahrt oft Gewicht und Material. Ob sie dadurch auch über den gesamten Lebenszyklus ökologisch vorteilhaft ist, hängt stark vom Einzelfall ab und war bisher kaum systematisch bewertbar.",
    approach:
      "Eine Bewertungsmetrik für die ökologischen Einflussfaktoren additiver Fertigung entwickelt: Ökobilanzierung nach ISO 14040, ergänzt um ein selbst gebautes Excel-Tool zur Berechnung des kumulierten Energieaufwands (KEA).",
    result:
      "Eine Metrik, mit der sich für ein konkretes Bauteil prüfen lässt, ob sich der 3D-Druck über den Lebenszyklus ökologisch lohnt. Bislang mit Note 1,2 bewertet.",
  },
  {
    slug: "heliostat",
    figure: "heliostat",
    title: "Was die Stahlkonstruktion eines Heliostaten kostet",
    org: "Bachelorarbeit am DLR",
    period: "2024",
    context:
      "Solarturm-Kraftwerke brauchen hunderte bis tausende Heliostaten, nachführbare Spiegel, die Sonnenlicht auf einen zentralen Receiver bündeln. Sie machen einen Großteil der Anlagenkosten aus, wurden aber bislang oft nur grob kalkuliert.",
    approach:
      "Bottom-Up-Kostenkalkulation direkt aus CAD-Geometrie: Stahlbearbeitung, Fertigungsschritte und Materialbedarf künftiger Heliostat-Designs Schritt für Schritt durchgerechnet, statt mit Pauschalwerten zu arbeiten.",
    result:
      "Belastbare Kostenmodelle für die Bewertung künftiger Heliostat-Generationen, als Fachbeitrag bei der SolarPACES Conference veröffentlicht.",
    link: {
      label: "SolarPACES Conference Proceedings, DOI",
      href: "https://doi.org/10.52825/solarpaces.v3i.2420",
    },
  },
  {
    slug: "bi-consulting",
    title: "Berichte in Power BI und Jedox",
    org: "Praktikum bei ATVISIO Consult GmbH",
    period: "2026 – heute",
    context:
      "Die Daten eines Kunden liegen meist in mehreren Systemen. Bevor daraus ein Bericht werden kann, müssen sie über ETL-Strecken zusammengeführt und in ein Datenmodell gebracht werden.",
    approach:
      "ETL-Strecken und Berichte für Kunden und intern in Power BI und Jedox aufgebaut; zusätzlich eine Schulung zu Microsoft Copilot in Power BI konzipiert, um Kolleg:innen und Kunden den Einstieg zu erleichtern.",
    result: "Laufende Berichte im Kundeneinsatz und eine wiederverwendbare Copilot-Schulung für das Team.",
  },
  {
    slug: "zeiterfassung",
    title: "Ein neues Zeiterfassungssystem einführen",
    org: "Werkstudent bei IGH Infotec AG",
    period: "2023 – 2024",
    context:
      "Ein wachsendes Team brauchte ein digitales Zeiterfassungssystem statt manueller Prozesse, inklusive der Frage, wie man Kolleg:innen zuverlässig auf ein neues Werkzeug umstellt.",
    approach:
      "Timebutler als neues Zeiterfassungssystem eingerichtet und Kolleg:innen darin geschult, parallel Mitarbeitercontrolling und Monatsabschlüsse in Excel/Pivot weitergeführt.",
    result: "Timebutler lief danach im Alltag, und die Monatsabschlüsse liefen während der Umstellung normal weiter.",
  },
];

export type RatedSkill = { name: string; level: 1 | 2 | 3 | 4 | 5; levelLabel: string; group: "Software & BI" | "Sprachen" };

// Nur Skills mit expliziter Selbsteinschätzung im Original-CV, keine geschätzten Werte.
export const ratedSkills: RatedSkill[] = [
  { name: "Excel / Word / PowerPoint", level: 5, levelLabel: "sehr gut", group: "Software & BI" },
  { name: "Power BI", level: 4, levelLabel: "gut", group: "Software & BI" },
  { name: "MSSQL", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Jedox", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Autodesk Fusion", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Autodesk Inventor", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Deutsch", level: 5, levelLabel: "Muttersprache", group: "Sprachen" },
  { name: "Englisch", level: 4, levelLabel: "C1", group: "Sprachen" },
];

// Methoden/Fachgebiete aus dem CV ohne eigene Skalen-Bewertung. `skill` ordnet sie einer
// Kernkompetenz aus `topSkills` zu; /kenntnisse/ zeigt sie dort als "Im CV: …" unter dem
// Kompetenztitel, damit Startseite und Kenntnisse dieselben Namen verwenden.
// KI-PLATZHALTER: die Zuordnung Methode -> Kernkompetenz (skill) ist abgeleitet, nicht aus dem CV.
export const competencies: { name: string; skill: TopSkillId }[] = [
  { name: "Herstellkostenrechnung", skill: "kosten" },
  { name: "Stahlkonstruktionen", skill: "kosten" },
  { name: "BI Consulting", skill: "data" },
  { name: "Controlling und Finanzen", skill: "controlling" },
];

// Python steht als Werkzeug unter "Data & AI" (Kaggle-Kurs), daher hier nicht doppelt.
// Ökobilanz hat seit 2026-09-25 keine eigene Box mehr (Vorgabe Daniel), steht daher hier.
export const otherCompetencies = ["Ökobilanz (LCA) nach ISO 14040", "Forschungsprojektmanagement", "Marketing"];

// id = Anker auf /kenntnisse/ (#id), der Skill-Hub verlinkt darauf.
export const certifications = [
  { id: "z-lean-six-sigma", name: "Lean Six Sigma Yellow Belt", authority: "Lean Six Sigma Academy (LSSA)", date: "2025" },
  { id: "z-sql", name: "SQL Grundkurs 1 & 2", authority: "LinkedIn Learning", date: "2025" },
  { id: "z-python", name: "Python Course", authority: "Kaggle", date: "2026" },
];

// KI-PLATZHALTER: Formulierung von KI, Fakten aus LinkedIn.
export const notes = [
  "Spielt beim VfB 06 Langenfeld und pfeift als Schiedsrichter im Kreis Remscheid/Solingen, auf beiden Seiten der Linie zu Hause.",
  "Baut in der Freizeit mit 3D-Druck und automatisiert eigene Projekte mit Claude (Cowork, Code).",
];

// KI-PLATZHALTER (komplett): Skill-Hub der Startseite und Gruppierung auf /kenntnisse/.
// Ein erster KI-Vorschlag, den Daniel selbst überarbeitet: welche Kompetenzen, ihre Titel,
// die Belegzeilen (proof) und die Zuordnung von Stationen (learned) und Software (tools)
// sind abgeleitet. Die Fakten in den Belegzeilen stammen nur aus den Stationen oben.
// Software steht nur dort, wo eine Station oder ein Zertifikat sie belegt; wo das offen ist, steht eine Frage
// an Daniel (toolsQuestion) statt einer geratenen Angabe.
export type TopSkillId = "kosten" | "data" | "prozesse" | "controlling";

export type TopSkill = {
  id: TopSkillId;
  title: string;
  proof: string[];
  tools: string[]; // Schlüssel aus src/data/tools.ts (Logo oder Logo-Platzhalter)
  toolsQuestion?: string;
  learned: { label: string; href: string }[];
};

// Reihenfolge und Auswahl der Boxen: Vorgabe von Daniel (2026-09-25). Belegzeilen und
// Zuordnungen bleiben KI-Entwurf.
export const topSkills: TopSkill[] = [
  {
    id: "kosten",
    title: "Bauteilkostenkalkulation",
    proof: [
      "Bottom-Up-Kostenmodelle für die Stahlkonstruktion von Heliostaten, direkt aus CAD-Daten. Bachelorarbeit am DLR 2024, veröffentlicht bei der SolarPACES Conference.",
    ],
    tools: [],
    toolsQuestion: "Offen: Mit welcher Software entstanden die Kalkulationen und die CAD-Daten (Excel, Autodesk Inventor oder Fusion)?",
    learned: [{ label: "Bachelorarbeit am DLR", href: "/projekte/#heliostat" }],
  },
  {
    id: "data",
    title: "Data & AI",
    proof: [
      "ETL-Strecken und Berichte in Power BI und Jedox für Kunden und intern, dazu eine selbst konzipierte Schulung zu Copilot in Power BI. Praktikum bei ATVISIO, seit 2026.",
      "Privat eigene Projekte mit Claude automatisiert (Cowork, Code).",
    ],
    tools: ["Power BI", "Jedox", "MSSQL", "Python", "Copilot in Power BI", "Claude"],
    learned: [
      { label: "Praktikum BI Consulting (ATVISIO)", href: "/projekte/#bi-consulting" },
      { label: "SQL Grundkurs (LinkedIn Learning)", href: "/kenntnisse/#z-sql" },
      { label: "Python Course (Kaggle)", href: "/kenntnisse/#z-python" },
    ],
  },
  {
    id: "prozesse",
    title: "Prozesse und Projekte",
    proof: [
      "Als Werkstudent bei IGH Infotec (2023–2024) Timebutler als neues Zeiterfassungssystem eingeführt und die Kolleg:innen darauf geschult.",
      "Im Praktikum Projektmanagement Kundentermine vor- und nachbereitet, SAP-Tabellen in Kundensystemen gepflegt und in Produktions- und Logistikfragen beraten.",
    ],
    tools: ["Timebutler", "SAP"],
    learned: [
      { label: "Timebutler-Einführung (IGH Infotec)", href: "/projekte/#zeiterfassung" },
      { label: "Praktikum Projektmanagement (IGH Infotec)", href: "/werdegang/#praktikum-pm" },
      { label: "Lean Six Sigma Yellow Belt", href: "/kenntnisse/#z-lean-six-sigma" },
    ],
  },
  {
    id: "controlling",
    title: "Controlling",
    proof: [
      "Ein Jahr Mitarbeitercontrolling und Monatsabschlüsse mit Excel und Pivot-Tabellen, als Werkstudent Finanzen & Controlling bei IGH Infotec (2023–2024).",
    ],
    tools: ["Excel"],
    learned: [
      { label: "Werkstudent Finanzen & Controlling (IGH Infotec)", href: "/werdegang/#werkstudent-controlling" },
    ],
  },
];
