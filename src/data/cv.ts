// Quelle: Lebenslauf (PDF) + LinkedIn-Datenexport.
// Texte hier sind eigene Formulierungen auf Basis der Rohdaten, keine Kopien der CV-Zeilen.

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  claim:
    "Ich übersetze technische Fragen in Zahlen: was ein Bauteil wirklich kostet, wie viel CO2 ein Fertigungsverfahren verursacht, was ein BI-Dashboard über ein Geschäft verrät.",
  location: "Langenfeld (Rheinland) / Düsseldorf",
  email: "daniel.lenski@hotmail.com",
  phone: "+49 157 74585248",
  linkedin: "linkedin.com/in/daniel-lenski-de",
  linkedinUrl: "https://linkedin.com/in/daniel-lenski-de",
};

export type RevisionEntry = {
  rev: string;
  from: string;
  to: string;
  fromYear: number;
  toYear: number;
  title: string;
  org: string;
  place: string;
  kind: "ausbildung" | "beruf";
  story: string;
};

// Älteste zuerst; Rev-Buchstaben folgen der Zeichnungskonvention (I, O, Q ausgelassen).
export const revisions: RevisionEntry[] = [
  {
    rev: "A",
    from: "2013",
    to: "2020",
    fromYear: 2013,
    toYear: 2020,
    title: "Allgemeine Hochschulreife",
    org: "Konrad-Adenauer-Gymnasium",
    place: "Langenfeld",
    kind: "ausbildung",
    story:
      "Abitur mit Note 2,0, mit Mathematik und Physik als den Fächern, die am meisten hängen geblieben sind und später den roten Faden zum Wirtschaftsingenieurwesen bildeten.",
  },
  {
    rev: "B",
    from: "2020",
    to: "2024",
    fromYear: 2020,
    toYear: 2024,
    title: "B.Eng. Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Grundstudium zwischen Technik und Betriebswirtschaft, mit Note 1,8 abgeschlossen. Die Bachelorarbeit (siehe Rev. F) entschied den Weg in Richtung Produktion und Energie.",
  },
  {
    rev: "C",
    from: "Okt 2021",
    to: "Jul 2022",
    fromYear: 2021,
    toYear: 2022,
    title: "Mathematik-Tutor",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Als erster Job Tutorien für Erstsemester in Mathematik gehalten, wo Erklären genauso wichtig war wie Rechnen können.",
  },
  {
    rev: "D",
    from: "Okt 2022",
    to: "Feb 2023",
    fromYear: 2022,
    toYear: 2023,
    title: "Praktikant Projektmanagement",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Schnittstelle zwischen Kunden und Softwareentwicklung: Kundentermine vor- und nachbereitet, SAP-Tabellen in Kundensystemen gepflegt und in Produktions-/Logistikfragen beraten.",
  },
  {
    rev: "E",
    from: "Feb 2023",
    to: "Feb 2024",
    fromYear: 2023,
    toYear: 2024,
    title: "Werkstudent Finanzen & Controlling",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Ein Jahr Mitarbeitercontrolling und Monatsabschlüsse in Excel/Pivot betreut und nebenbei ein neues Zeiterfassungssystem (Timebutler) eingeführt und die Kolleg:innen darauf geschult.",
  },
  {
    rev: "F",
    from: "Mär 2024",
    to: "Jun 2024",
    fromYear: 2024,
    toYear: 2024,
    title: "Bachelorarbeit: Herstellkostenoptimierung von Heliostaten",
    org: "DLR, Deutsches Zentrum für Luft- und Raumfahrt",
    place: "Jülich",
    kind: "beruf",
    story:
      "Ein Heliostat ist ein computergesteuerter Spiegel, der Sonnenlicht auf den Receiver eines Solarturm-Kraftwerks bündelt. Je günstiger seine Stahlkonstruktion zu fertigen ist, desto eher rechnet sich Solarturm-Strom. Am DLR in Jülich Bottom-Up-Kalkulationen aus CAD-Daten gebaut, um genau diese Fertigungskosten künftiger Heliostaten zu bewerten. Ergebnis als Fachbeitrag bei der SolarPACES Conference veröffentlicht.",
  },
  {
    rev: "G",
    from: "2024",
    to: "heute",
    fromYear: 2024,
    toYear: 2026,
    title: "M.Sc. Internationales Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Vertiefung mit Schwerpunkt Produktion und Innovation, aktuell mit Note 1,8. Masterarbeit läuft parallel am RWTH-Lehrstuhl (siehe Rev. J).",
  },
  {
    rev: "H",
    from: "Sep 2024",
    to: "Mai 2026",
    fromYear: 2024,
    toYear: 2026,
    title: "Wissenschaftliche Hilfskraft",
    org: "Hochschule Düsseldorf, FB Maschinenbau & Verfahrenstechnik",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Das Dekanat im Tagesgeschäft unterstützt (Mitteilungen für den Fachbereich, Büromaterial, Eventorganisation) und dabei die organisatorische Seite eines Fachbereichs von innen kennengelernt.",
  },
  {
    rev: "J",
    from: "Jan 2026",
    to: "heute",
    fromYear: 2026,
    toYear: 2026,
    title: "Masterarbeit: Ökobilanz additiver Fertigung in der Luftfahrt",
    org: "RWTH Aachen",
    place: "Remote",
    kind: "beruf",
    story:
      "3D-gedruckte Bauteile sparen in der Luftfahrt Gewicht und Material. Aber lohnt sich das auch ökologisch, über den gesamten Lebenszyklus? Dafür eine Bewertungsmetrik entwickelt: Ökobilanzierung nach ISO 14040 plus ein Excel-Tool zur Berechnung des kumulierten Energieaufwands (KEA), um additive Fertigung dort einzusetzen, wo sie tatsächlich ökologisch sinnvoll ist. Bislang mit Note 1,2 bewertet.",
  },
  {
    rev: "K",
    from: "Mai 2026",
    to: "heute",
    fromYear: 2026,
    toYear: 2026,
    title: "Praktikum BI Consulting",
    org: "ATVISIO Consult GmbH",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Von der Kalkulation zum Dashboard: ETL-Strecken und Berichte für Kunden und intern in Power BI und Jedox gebaut, außerdem eine Schulung zu Microsoft Copilot in Power BI konzipiert und selbst gehalten.",
  },
];

export type Project = {
  title: string;
  org: string;
  period: string;
  context: string;
  approach: string;
  result: string;
  tags: string[];
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    title: "Was ein Heliostat wirklich kosten darf",
    org: "Bachelorarbeit am DLR",
    period: "2024",
    context:
      "Solarturm-Kraftwerke brauchen hunderte bis tausende Heliostaten, nachführbare Spiegel, die Sonnenlicht auf einen zentralen Receiver bündeln. Sie machen einen Großteil der Anlagenkosten aus, wurden aber bislang oft nur grob kalkuliert.",
    approach:
      "Bottom-Up-Kostenkalkulation direkt aus CAD-Geometrie: Stahlbearbeitung, Fertigungsschritte und Materialbedarf künftiger Heliostat-Designs Schritt für Schritt durchgerechnet, statt mit Pauschalwerten zu arbeiten.",
    result:
      "Belastbare Kostenmodelle für die Bewertung künftiger Heliostat-Generationen, als Fachbeitrag bei der SolarPACES Conference veröffentlicht.",
    tags: ["Herstellkostenrechnung", "Stahlkonstruktionen", "CAD", "Bottom-Up-Kalkulation"],
    link: {
      label: "SolarPACES Conference Proceedings, DOI",
      href: "https://doi.org/10.52825/solarpaces.v3i.2420",
    },
  },
  {
    title: "Wann sich 3D-Druck in der Luftfahrt ökologisch lohnt",
    org: "Masterarbeit an der RWTH Aachen",
    period: "2026",
    context:
      "Additive Fertigung spart in der Luftfahrt oft Gewicht und Material. Ob sie dadurch auch über den gesamten Lebenszyklus ökologisch vorteilhaft ist, hängt stark vom Einzelfall ab und war bisher kaum systematisch bewertbar.",
    approach:
      "Eine Bewertungsmetrik für die ökologischen Einflussfaktoren additiver Fertigung entwickelt: Ökobilanzierung nach ISO 14040, ergänzt um ein selbst gebautes Excel-Tool zur Berechnung des kumulierten Energieaufwands (KEA).",
    result: "Mit Note 1,2 bewertete Metrik, die flexible, fallbezogene Entscheidungen für oder gegen additive Fertigung ermöglicht.",
    tags: ["Ökobilanz", "Luftfahrt", "ISO 14040", "Bewertungsmetrik"],
  },
  {
    title: "Vom Rohdatensatz zum Kunden-Dashboard",
    org: "Praktikum bei ATVISIO Consult GmbH",
    period: "2026 – heute",
    context:
      "BI-Consulting lebt davon, dass Kunden ihren Daten trauen können. Dafür müssen ETL-Strecken sauber laufen und Berichte verständlich sein, nicht nur technisch korrekt.",
    approach:
      "ETL-Strecken und Berichte für Kunden und intern in Power BI und Jedox aufgebaut; zusätzlich eine Schulung zu Microsoft Copilot in Power BI konzipiert, um Kolleg:innen und Kunden den Einstieg zu erleichtern.",
    result: "Laufende Berichte im Kundeneinsatz und eine wiederverwendbare Copilot-Schulung für das Team.",
    tags: ["Power BI", "Jedox", "SQL", "Consulting"],
  },
  {
    title: "Zeiterfassung ohne Zettelwirtschaft",
    org: "Werkstudent bei IGH Infotec AG",
    period: "2023 – 2024",
    context:
      "Ein wachsendes Team brauchte ein digitales Zeiterfassungssystem statt manueller Prozesse, inklusive der Frage, wie man Kolleg:innen zuverlässig auf ein neues Werkzeug umstellt.",
    approach:
      "Timebutler als neues Zeiterfassungssystem eingerichtet und Kolleg:innen darin geschult, parallel Mitarbeitercontrolling und Monatsabschlüsse in Excel/Pivot weitergeführt.",
    result: "Eingeführtes System im Regelbetrieb, ohne Unterbrechung der laufenden Controlling-Prozesse.",
    tags: ["Projektmanagement", "Controlling", "Prozessdigitalisierung"],
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

// Methoden/Fachgebiete ohne eigene Skalen-Bewertung im CV.
export const competencies = [
  "Ökobilanz (LCA)",
  "Herstellkostenrechnung",
  "Stahlkonstruktionen",
  "Forschungsprojektmanagement",
  "Python",
  "Consulting",
  "Controlling",
  "Finanzen",
  "Marketing",
];

export const certifications = [
  { name: "Lean Six Sigma Yellow Belt", authority: "Lean Six Sigma Academy (LSSA)", date: "2025" },
  { name: "SQL Grundkurs 1 & 2", authority: "LinkedIn Learning", date: "2025" },
  { name: "Python Course", authority: "Kaggle", date: "2026" },
];

export const notes = [
  "Spielt beim VfB 06 Langenfeld und pfeift als Schiedsrichter im Kreis Remscheid/Solingen, auf beiden Seiten der Linie zu Hause.",
  "Baut in der Freizeit mit 3D-Druck und automatisiert eigene Projekte mit Claude (Cowork, Code).",
];
