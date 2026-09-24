// Quelle: Lebenslauf (PDF) + LinkedIn-Datenexport.
// Texte hier sind eigene Formulierungen auf Basis der Rohdaten, keine Kopien der CV-Zeilen.

// Die Startseite setzt den Claim als fortlaufenden Satz über die ganze Seite:
// der Anfang steht im Kopf, jeder Teilsatz eröffnet ein Band mit der Arbeit dazu.
// Jedes Band hat eine eigene Form (Schema, Blick ins Rechenmodell, reiner Text), siehe index.astro.
export const claimLead = "Ich übersetze technische Fragen in Zahlen:";

export const claimParts: {
  clause: string;
  project: string; // slug in `projects`
  body: string; // der Absatz im Band, nennt die Station im Satz statt in einer Metazeile
}[] = [
  {
    clause: "was ein Bauteil in der Fertigung kostet,",
    project: "heliostat",
    body: "In der Bachelorarbeit am DLR habe ich aus CAD-Daten berechnet, was die Stahlkonstruktion künftiger Heliostaten in der Fertigung kostet, Schritt für Schritt statt mit Pauschalwerten. Die Kostenmodelle sind als Fachbeitrag in den SolarPACES Conference Proceedings erschienen.",
  },
  {
    clause: "wie viel CO₂ ein Fertigungsverfahren verursacht,",
    project: "luftfahrt",
    body: "Die Masterarbeit an der RWTH Aachen fragt, wann ein 3D-gedrucktes Luftfahrtbauteil über seinen ganzen Lebenszyklus ökologisch besser ist als ein gefrästes: mit einer Ökobilanz nach ISO 14040 und einem eigenen Excel-Tool für den kumulierten Energieaufwand.",
  },
  {
    clause: "und wie aus den Daten eines Kunden ein Bericht wird.",
    project: "bi-consulting",
    body: "Seit Mai 2026 bin ich im BI Consulting bei ATVISIO in Düsseldorf. Ich baue ETL-Strecken und Berichte in Power BI und Jedox, für Kunden und intern, und habe eine Schulung zu Microsoft Copilot in Power BI konzipiert und selbst gehalten.",
  },
];

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  claim: [claimLead, ...claimParts.map((p) => p.clause)].join(" "),
  location: "Langenfeld (Rheinland) / Düsseldorf",
  email: "daniel.lenski@hotmail.com",
  phone: "+49 157 74585248",
  linkedin: "linkedin.com/in/daniel-lenski-de",
  linkedinUrl: "https://linkedin.com/in/daniel-lenski-de",
};

export type CareerEntry = {
  from: string;
  to: string;
  fromYear: number;
  toYear: number;
  title: string;
  org: string;
  place: string;
  kind: "ausbildung" | "beruf";
  story: string;
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
  title: string;
  org: string;
  period: string;
  context: string;
  approach: string;
  result: string;
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

// Methoden/Fachgebiete ohne eigene Skalen-Bewertung im CV. `where` nennt nur Stationen,
// in denen das Thema laut CV/LinkedIn tatsächlich vorkam; ohne Beleg bleibt es bei `others`.
export const competencies: { name: string; where: string; href: string }[] = [
  { name: "Ökobilanz (LCA) nach ISO 14040", where: "Masterarbeit, RWTH Aachen", href: "/projekte/#luftfahrt" },
  { name: "Herstellkostenrechnung", where: "Bachelorarbeit, DLR", href: "/projekte/#heliostat" },
  { name: "Stahlkonstruktionen", where: "Bachelorarbeit, DLR", href: "/projekte/#heliostat" },
  { name: "BI Consulting", where: "Praktikum, ATVISIO Consult", href: "/projekte/#bi-consulting" },
  { name: "Controlling und Finanzen", where: "Werkstudent, IGH Infotec", href: "/projekte/#zeiterfassung" },
];

export const otherCompetencies = ["Forschungsprojektmanagement", "Python", "Marketing"];

export const certifications = [
  { name: "Lean Six Sigma Yellow Belt", authority: "Lean Six Sigma Academy (LSSA)", date: "2025" },
  { name: "SQL Grundkurs 1 & 2", authority: "LinkedIn Learning", date: "2025" },
  { name: "Python Course", authority: "Kaggle", date: "2026" },
];

export const notes = [
  "Spielt beim VfB 06 Langenfeld und pfeift als Schiedsrichter im Kreis Remscheid/Solingen, auf beiden Seiten der Linie zu Hause.",
  "Baut in der Freizeit mit 3D-Druck und automatisiert eigene Projekte mit Claude (Cowork, Code).",
];
