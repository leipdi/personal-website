// Quelle: Lebenslauf (PDF) + LinkedIn-Datenexport.
//
// KI-PLATZHALTER: Fakten (Titel, Arbeitgeber, Orte, Zeiträume, Noten, Software-Einstufungen,
// Zertifikate, Kontaktdaten) stammen aus CV/LinkedIn. Alle Fließtexte und Zuordnungen sind
// dagegen KI-Entwürfe und auf der Seite magenta als Platzhalter markiert:
//   profile.claim, career[].story, projects[].title/context/approach/result,
//   topSkills (komplett: Auswahl, Titel, Belegzeilen, Zuordnung von Stationen und Software),
//   competencies[].skill (Zuordnung CV-Methode -> Kernkompetenz), notes.
// Seit 2026-09-26 stützen sich die Texte zu Bachelor- und Masterarbeit (career-Stories, projects)
// zusätzlich auf die beiden Abschlussarbeiten ("Input Data/", nicht im Repo). Daniel hat die
// Veröffentlichung trotz Sperrvermerk freigegeben. Zahlen daraus sind echt, die Formulierung KI.
// Beim Ersetzen durch eigene Texte auch den <Placeholder>-Wrapper in der Seite entfernen.
// profile.claim: *Wort* wird kursiv gesetzt (Betonung, index.astro).

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  claim:
    "Bindeglied zwischen *Technik* und *Wirtschaft*. Und die Frage, wie KI wirklich bei Prozessen und Projekten hilft",
  location: "Langenfeld (Rheinland) / Düsseldorf",
  email: "daniel.lenski@hotmail.com",
  phone: "+49 157 74585248",
  linkedin: "linkedin.com/in/daniel-lenski-de",
  linkedinUrl: "https://linkedin.com/in/daniel-lenski-de",
};

export type CareerEntry = {
  id: string; // Anker der Station (#id) auf der Seite, stabil halten: die Kernkompetenzen verlinken darauf
  from: string;
  to: string;
  fromYear: number;
  toYear: number;
  title: string;
  org: string;
  place: string;
  kind: "ausbildung" | "beruf";
  story: string; // KI-PLATZHALTER: kurzer Einstieg
  // Slug eines Projekts auf /projekte/, falls es dazu eine ausführliche Fallstudie gibt.
  project?: string;
  // Meilenstein im Projektplan auf /werdegang/ (Raute): Abschluss oder Abgabe. at: "2024",
  // "Jun 2024" oder ein Tagesdatum "18.06.2024". Nur Fakten aus CV oder Abschlussarbeit.
  // tag = kurze Fahnenbeschriftung im Projektplan ("Abgabe BA")
  milestone?: { at: string; label: string; tag: string };
  // Werdegang-Station ausführlich (nur Hauptstationen):
  tasks?: string[]; // KI-PLATZHALTER: was er dort gemacht hat, aus CV/Abschlussarbeit umformuliert
  facts?: { label: string; value: string }[]; // Fakten aus CV/LinkedIn/Abschlussarbeit
  tools?: string[]; // Schlüssel aus src/data/tools.ts, nur was CV/Arbeit belegen
  visual?: "heliostat" | { image: string; note?: string }; // Bild rechts neben der Station
  // kurze Zeilenbeschriftung im Projektplan, wenn der Titel zu lang ist
  short?: string;
};

// Älteste zuerst. from/to: "2020" (nur Jahr), "Okt 2021" (Monat + Jahr) oder "heute".
export const career: CareerEntry[] = [
  {
    from: "2013",
    to: "2020",
    fromYear: 2013,
    toYear: 2020,
    id: "abitur",
    milestone: { at: "2020", label: "Abitur, Note 2,0", tag: "Note 2,0" },
    tasks: ["Allgemeine Hochschulreife mit Note 2,0"],
    facts: [{ label: "Note", value: "2,0" }],
    short: "Abitur",
    title: "Allgemeine Hochschulreife",
    org: "Konrad-Adenauer-Gymnasium",
    place: "Langenfeld",
    kind: "ausbildung",
    story:
      "Die Schulzeit in Langenfeld.",
  },
  {
    from: "2020",
    to: "2024",
    fromYear: 2020,
    toYear: 2024,
    id: "bachelor",
    tasks: [
      "Grundstudium zwischen Technik und Betriebswirtschaft",
      "Parallel die ersten Stationen in der Praxis: Tutor, Praktikum, Werkstudent",
      "Abschluss mit der Bachelorarbeit am DLR",
    ],
    facts: [
      { label: "Abschluss", value: "Bachelor of Engineering" },
      { label: "Note", value: "1,8" },
    ],
    milestone: { at: "2024", label: "Bachelor of Engineering, Note 1,8", tag: "B.Eng., Note 1,8" },
    title: "B.Eng. Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Der Einstieg ins Wirtschaftsingenieurwesen: Grundstudium zwischen Technik und Betriebswirtschaft, parallel erste Stationen in der Praxis, abgeschlossen mit der Bachelorarbeit am DLR.",
  },
  {
    from: "Okt 2021",
    to: "Jul 2022",
    fromYear: 2021,
    toYear: 2022,
    id: "tutor",
    tasks: ["Mathematik-Tutorien für Erstsemester gehalten", "Der erste Job neben dem Studium"],
    title: "Mathematik-Tutor",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Der erste Job neben dem Studium: Mathematik-Tutorien für Erstsemester.",
  },
  {
    from: "Okt 2022",
    to: "Feb 2023",
    fromYear: 2022,
    toYear: 2023,
    id: "praktikum-pm",
    tasks: [
      "Kundentermine vor- und nachbereitet",
      "SAP-Tabellen in Kundensystemen gepflegt",
      "In Produktions- und Logistikfragen beraten",
    ],
    facts: [{ label: "Bereich", value: "Projektmanagement" }],
    tools: ["SAP"],
    short: "Praktikant Projektmanagement",
    title: "Praktikant Projektmanagement",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Die IGH Infotec AG bietet SAP-Add on Softwarelösungen für die Produktion und Logistik an. Schwerpunkt liegt bei der Visualisierung von Maschinendaten.",
  },
  {
    from: "Feb 2023",
    to: "Feb 2024",
    fromYear: 2023,
    toYear: 2024,
    id: "werkstudent-controlling",
    tasks: [
      "Mitarbeitercontrolling und Monatsabschlüsse in Excel und Pivot-Tabellen",
      "Timebutler als neues Zeiterfassungssystem eingeführt. Die Kolleg:innen auf das neue System geschult",
      "Operative Aufgaben im Tagesgeschäft. Rechnungen überprüft und eingescannt, offene Forderungen nachgehalten, etc.",
    ],
    facts: [{ label: "Bereich", value: "Finanzen & Controlling" }],
    tools: ["Excel", "Timebutler"],
    short: "Werkstudent Finanzen & Controlling",
    title: "Werkstudent Finanzen & Controlling",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    project: "zeiterfassung",
    story:
      "Interner Wechsel zu einer anderen Abteilung. Neues Entdecken und frischer Wind.",
  },
  {
    from: "Mär 2024",
    to: "Jun 2024",
    fromYear: 2024,
    toYear: 2024,
    id: "bachelorarbeit",
    tasks: [
      "Kalkulationssoftware verglichen; Costing24 ließ sich nur teilweise nutzen",
      "Aus den CAD-Daten Fertigungsstücklisten und Baumstrukturen abgeleitet",
      "Für jedes Bauteil ein Verfahren gewählt, etwa Laserschneiden für dünne Bleche oder Spritzguss für Kunststoffteile",
      "Bearbeitungszeiten, Maschinenstundensätze und Materialkosten berechnet",
    ],
    facts: [
      { label: "Herstellkosten", value: "ca. 116 € pro Heliostat" },
      { label: "Pro Spiegelfläche", value: "58 €/m²" },
      { label: "Veröffentlicht", value: "SolarPACES Conference" },
    ],
    tools: ["Autodesk Inventor", "Excel"],
    visual: "heliostat",
    short: "Bachelorarbeit am DLR",
    milestone: { at: "18.06.2024", label: "Abgabe der Bachelorarbeit", tag: "Abgabe BA" },
    title: "Bachelorarbeit: Herstellkostenoptimierung von Heliostaten",
    org: "DLR, Deutsches Zentrum für Luft- und Raumfahrt",
    place: "Jülich",
    kind: "beruf",
    project: "heliostat",
    story:
      "Ein Heliostat ist ein nachgeführter Spiegel, der Sonnenlicht auf den Receiver eines Solarturms lenkt. Ausgangslage: Neue Konstruktion eine Heliostaten. Die Frage: Was kostet der neue Heliostat des DLR in Serie und was sind die Produktionsschritte?",
  },
  {
    from: "2024",
    // abgeschlossen laut Daniel (2026-10-03), Monat unbekannt
    to: "2026",
    fromYear: 2024,
    toYear: 2026,
    id: "master",
    tasks: [
      "Schwerpunkt Produktion und Innovation",
      "Masterarbeit an der RWTH Aachen, gemeinsam mit Diehl Aviation",
      "Parallel Hilfskraft am Fachbereich und Praktikum im BI Consulting",
    ],
    facts: [
      { label: "Abschluss", value: "Master of Science" },
      { label: "Note", value: "1,5" },
    ],
    milestone: { at: "2026", label: "Master of Science, Note 1,5", tag: "M.Sc., Note 1,5" },
    short: "M.Sc. Int. Wirtschaftsingenieurwesen",
    title: "M.Sc. Internationales Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Die Vertiefung nach dem Bachelor, parallel zu Job, Praktikum und Masterarbeit, abgeschlossen mit 1,5.",
  },
  {
    from: "Sep 2024",
    to: "Mai 2026",
    fromYear: 2024,
    toYear: 2026,
    id: "hilfskraft",
    tasks: [
      "Mitteilungen für den Fachbereich verfasst",
      "Büromaterial und Veranstaltungen organisiert",
    ],
    short: "Wissenschaftliche Hilfskraft",
    title: "Wissenschaftliche Hilfskraft",
    org: "Hochschule Düsseldorf, FB Maschinenbau & Verfahrenstechnik",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Das Dekanat im Tagesgeschäft unterstützt: Mitteilungen für den Fachbereich, Büromaterial, Veranstaltungen.",
  },
  {
    from: "Jan 2026",
    // Abgabe laut Titelblatt der Arbeit: 01.06.2026 (der CV sagte noch "heute")
    to: "Jun 2026",
    fromYear: 2026,
    toYear: 2026,
    id: "masterarbeit",
    tasks: [
      "Anforderungskatalog aus ISO 14044, REACH und den ICAO-Vorgaben",
      "Excel-Tool für kumulierten Energieaufwand und Treibhauspotenzial über fünf Lebensphasen",
      "Erprobt mit Diehl Aviation an einer FDM-gedruckten Luftleitschaufel aus Ultem 9085",
    ],
    facts: [
      { label: "Note", value: "1,2" },
      { label: "Anteil Nutzung", value: "ca. 99 % der Energie" },
      { label: "Hohle Variante", value: "rund 68 % weniger" },
    ],
    tools: ["Excel"],
    short: "Masterarbeit, RWTH Aachen",
    milestone: { at: "01.06.2026", label: "Abgabe der Masterarbeit", tag: "Abgabe MA" },
    title: "Masterarbeit: Ökobilanz additiver Fertigung in der Luftfahrt",
    org: "RWTH Aachen, mit Diehl Aviation",
    place: "Remote",
    kind: "beruf",
    project: "luftfahrt",
    story:
      "Lohnt sich ein 3D-gedrucktes Kabinenteil ökologisch, über ein ganzes Flugzeugleben gerechnet? Dafür eine Bewertungsmetrik nach ISO 14044 entwickelt.",
  },
  {
    from: "Mai 2026",
    to: "heute",
    fromYear: 2026,
    toYear: 2026,
    id: "praktikum-bi",
    tasks: [
      "ETL-Strecken für Kunden und intern aufgebaut",
      "Berichte in Power BI und Jedox gebaut",
      "Eine Schulung zu Copilot in Power BI konzipiert",
      "Kunden die Lösung vorgestellt",
    ],
    facts: [{ label: "Bereich", value: "BI Consulting" }],
    tools: ["Power BI", "Jedox", "Copilot in Power BI"],
    title: "Praktikum BI Consulting",
    org: "ATVISIO Consult GmbH",
    place: "Düsseldorf",
    kind: "beruf",
    project: "bi-consulting",
    story:
      "Weitere Berufserfahrung sammeln und weitere Kenntnisse sammeln. Der Wille Power BI zu erlernen führte dazu, ein Praktikum im BI Consulting zu starten.",
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
    title: "Wann sich ein gedrucktes Kabinenteil ökologisch lohnt",
    org: "Masterarbeit an der RWTH Aachen",
    period: "2026",
    context:
      "Kabinenteile werden in der Luftfahrt immer öfter gedruckt, weil sich damit Gewicht und Werkzeugkosten sparen lassen. Ob das über den ganzen Lebenszyklus auch ökologisch aufgeht, ließ sich bisher kaum einheitlich bewerten: Eine Recherche in Web of Science fand zu Ökobilanz, Luftfahrt und Bewertungsrahmen 51 Arbeiten, mit additiver Fertigung dazu nur noch zwei.",
    approach:
      "Aus Normen (ISO 14044), Luftfahrtregeln (REACH, ICAO) und bestehenden Ansätzen einen Anforderungskatalog aufgestellt und darauf eine Bewertungsmetrik gebaut. Umgesetzt als Excel-Tool, das ein Modell des Oak Ridge National Laboratory für Kunststoff-Kabinenteile erweitert: kumulierter Energieaufwand (VDI 4600) und Treibhauspotenzial über fünf Lebensphasen, dazu ein Modul für Kabinenwechsel und eine Ampel für die übrigen Umweltkategorien. Erprobt mit Diehl Aviation an einer Luftleitschaufel aus Ultem 9085, gedruckt im FDM-Verfahren, einmal massiv und einmal hohl.",
    result:
      "Über zehn Jahre in einem A350 entfallen fast 99 % des Energieaufwands der Luftleitschaufel auf die Nutzung, Herstellung und Material sind Nebensache. Die hohle Variante braucht deshalb rund zwei Drittel weniger Energie als die massive. Ein Tool, das Zulieferer, Kabinenhersteller und Airlines auf weitere Bauteile anwenden können. Mit Note 1,2 bewertet.",
  },
  {
    slug: "heliostat",
    figure: "heliostat",
    title: "Was ein Heliostat in der Herstellung kostet",
    org: "Bachelorarbeit am DLR",
    period: "2024",
    context:
      "Solarturm-Kraftwerke brauchen tausende Heliostaten, nachgeführte Spiegel, die Sonnenlicht auf einen Receiver an der Turmspitze lenken. Sie machen einen großen Teil der Anlagenkosten aus. Das DLR hat einen neuen, günstigeren Heliostaten entworfen, und die Frage war, was er in Serie tatsächlich kosten würde.",
    approach:
      "Zuerst Kalkulationssoftware verglichen; die gewählte (Costing24) ließ sich nur teilweise nutzen. Deshalb bottom-up von Hand: aus den CAD-Daten Fertigungsstücklisten und Baumstrukturen abgeleitet, für jedes Teil ein Verfahren gewählt, das hohe Stückzahlen und viel Automatisierung erlaubt (etwa Laserschneiden für dünne Stahlteile), dann Bearbeitungszeiten, Maschinenstundensätze und Materialkosten je Kilogramm berechnet. Pylon, Ausleger und Traverse sind im Detail kalkuliert, Spritzgussteile mit dem Hersteller abgeschätzt, Zukaufteile recherchiert.",
    result:
      "Rund 116 € Herstellkosten pro Heliostat oder 58 € pro Quadratmeter Spiegelfläche, eine erste Abschätzung, die schon nah am Kostenziel liegt. Dazu Ansätze für Beschaffung und Marketing. Veröffentlicht als Fachbeitrag bei der SolarPACES Conference.",
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

// Ökobilanz hat seit 2026-09-25 keine eigene Box mehr, Python kein Software-Logo mehr
// (beides Vorgabe Daniel), daher stehen sie hier.
export const otherCompetencies = ["Ökobilanz (LCA) nach ISO 14040", "Python", "Forschungsprojektmanagement", "Marketing"];

// id = Anker im Abschnitt Kenntnisse (#id), die Kernkompetenzen verlinken darauf.
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
  // Hauptpunkte mit Unterpunkten (Daniel 2026-10-08: große Punkte, kleinere darunter; er
  // ergänzt später eigene Angaben). Unterpunkte aus den Stationen (career[].tasks/facts).
  proof: { text: string; sub?: string[] }[];
  tools: string[]; // Schlüssel aus src/data/tools.ts (Logo oder Logo-Platzhalter)
  toolsQuestion?: string;
  learned: { label: string; href: string }[];
  // Das Bild der Karte ist eine eigens gezeichnete Illustration (KI-generiert, im Bild
  // markiert): src/components/figures/kk/<Id>.astro, nach id ausgewählt.
};

// Reihenfolge und Auswahl der Boxen: Vorgabe von Daniel (2026-09-25). Belegzeilen und
// Zuordnungen bleiben KI-Entwurf. Je Box zwei Hauptpunkte mit Unterpunkten (seit 2026-10-08,
// die Karten sind Blätter im Stapel mit Platz dafür); Details stehen im Werdegang.
export const topSkills: TopSkill[] = [
  {
    id: "kosten",
    title: "Bauteilkostenkalkulation",
    proof: [
      {
        text: "Bachelorarbeit beim DLR: Herstellkostenanalyse eines Heliostaten",
        sub: [
          "Aus den CAD-Daten Fertigungsstücklisten und Baumstrukturen abgeleitet",
          "Je Bauteil ein Verfahren gewählt, Bearbeitungszeiten, Maschinenstundensätze und Materialkosten berechnet",
          "Ergebnis: ca. 116 € Herstellkosten pro Heliostat, 58 €/m² Spiegelfläche",
        ],
      },
      {
        text: "Ringprojekt im Studium: Turbolader als Gruppe konstruiert und hergestellt, meine Aufgabe PPS",
        sub: ["Planung und Steuerung der Laborbesuche",
          "Herstellkosten anhand von Materialdaten und Maschinendaten",
          "Vorstellen der Ergebnisse an ein Plenum"],
      },
    ],
    // Software laut Daniel (2026-09-25): CAD in Inventor, Kalkulation per Hand in Excel
    tools: ["Autodesk Inventor", "Excel"],
    learned: [
      { label: "Bachelorarbeit am DLR", href: "#bachelorarbeit" },
      { label: "Ringprojekt (B.Eng.)", href: "#bachelor" },
    ],
  },
  {
    id: "data",
    title: "Data & AI",
    proof: [
      {
        text: "Praktikum bei Atvisio",
        sub: [
          "ETL-Strecken für Kunden und intern aufgebaut",
          "Kunden die Lösung vorgestellt",
          "Webinar sowie Schulung zu Copilot in Power BI konzipiert",
        ],
      },
      {
        text: "KI Enthusiast",
        sub: [
          "KOMAcons GmbH: Integration eines geeigneten KI-Tools + Schulung der MA",
          "„Vibe Coding“ Beispiele: Portfolio Website",
        ],
      },
    ],
    // Python und Jedox auf Wunsch von Daniel (2026-09-25) nicht als Software-Logo
    tools: ["Power BI", "MSSQL", "Copilot in Power BI", "Claude"],
    learned: [
      { label: "Praktikum BI Consulting (ATVISIO)", href: "#praktikum-bi" },
      { label: "SQL Grundkurs (LinkedIn Learning)", href: "#z-sql" },
    ],
  },
  {
    id: "prozesse",
    title: "Prozesse und Projekte",
    proof: [
      {
        text: "Werkstudent Finanzen & Controlling bei IGH Infotec",
        sub: ["Timebutler als neue Zeiterfassung eingeführt, die Kolleg:innen geschult"],
      },
      {
        text: "Praktikum Projektmanagement bei IGH Infotec",
        sub: [
          "Kundentermine vor- und nachbereitet, SAP-Tabellen beim Kunden gepflegt",
          "In Produktions- und Logistikfragen beraten",
        ],
      },
      {
        text: "Ringprojekt (siehe auch Bauteilkostenkalkulation)",
        sub: ["Planung und Steuerung der Laborbesuche", "Vorstellen der Ergebnisse an ein Plenum"],
      },
      { text: "Lean Six Sigma Yellow Belt (2025)" },
    ],
    tools: ["Timebutler", "SAP"],
    learned: [
      { label: "Timebutler-Einführung (IGH Infotec)", href: "#werkstudent-controlling" },
      { label: "Praktikum Projektmanagement (IGH Infotec)", href: "#praktikum-pm" },
      { label: "Ringprojekt (B.Eng.)", href: "#bachelor" },
      { label: "Lean Six Sigma Yellow Belt", href: "#z-lean-six-sigma" },
    ],
  },
  {
    id: "controlling",
    title: "Controlling",
    proof: [
      {
        text: "Werkstudent Finanzen & Controlling bei IGH Infotec, Feb 2023 bis Feb 2024",
        sub: [
          "Ein Jahr Mitarbeitercontrolling und Monatsabschlüsse mit Excel und Pivot-Tabellen",
          "Operative Aufgaben im Tagesgeschäft: Rechnungen überprüft und eingescannt",
          "Offene Forderungen nachgehalten",
        ],
      },
    ],
    tools: ["Excel"],
    learned: [
      { label: "Werkstudent Finanzen & Controlling (IGH Infotec)", href: "#werkstudent-controlling" },
    ],
  },
];
