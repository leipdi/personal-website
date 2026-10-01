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

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  claim:
    "Bindeglied zwischen Technik und Wirtschaft. Und die Frage, wie hilft KI wirklich bei Prozessen und Projekten",
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
  story: string; // KI-PLATZHALTER: kurzer Einstieg (Hauptstationen) bzw. ein Satz (Nebenstationen)
  // Nebenstationen: kompakte Zeile ohne Text, damit sie nicht so viel Raum bekommen wie die Abschlussarbeiten.
  minor?: true;
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
    facts: [{ label: "Note", value: "2,0" }],
    short: "Abitur",
    title: "Allgemeine Hochschulreife",
    org: "Konrad-Adenauer-Gymnasium",
    place: "Langenfeld",
    kind: "ausbildung",
    minor: true,
    story:
      "Abitur mit Note 2,0.",
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
      "Der Einstieg ins Wirtschaftsingenieurwesen. Die Bachelorarbeit am DLR entschied den Weg in Richtung Produktion und Energie.",
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
      "Die Schnittstelle zwischen Kunden und Softwareentwicklung.",
  },
  {
    from: "Feb 2023",
    to: "Feb 2024",
    fromYear: 2023,
    toYear: 2024,
    id: "werkstudent-controlling",
    tasks: [
      "Mitarbeitercontrolling und Monatsabschlüsse in Excel und Pivot-Tabellen",
      "Timebutler als neues Zeiterfassungssystem eingeführt",
      "Die Kolleg:innen auf das neue System geschult",
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
      "Gut ein Jahr im Controlling, dazu ein Einführungsprojekt.",
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
      "Für jedes Stahlteil ein Verfahren gewählt, etwa Laserschneiden für dünne Bleche",
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
      "Ein Heliostat ist ein nachgeführter Spiegel, der Sonnenlicht auf den Receiver eines Solarturms lenkt. Die Frage: Was kostet der neue Heliostat des DLR in Serie?",
  },
  {
    from: "2024",
    to: "heute",
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
      { label: "Note bisher", value: "1,8" },
    ],
    short: "M.Sc. Int. Wirtschaftsingenieurwesen",
    title: "M.Sc. Internationales Wirtschaftsingenieurwesen",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "ausbildung",
    story:
      "Die Vertiefung nach dem Bachelor, parallel zu Job, Praktikum und Masterarbeit.",
  },
  {
    from: "Sep 2024",
    to: "Mai 2026",
    fromYear: 2024,
    toYear: 2026,
    id: "hilfskraft",
    short: "Wissenschaftliche Hilfskraft",
    title: "Wissenschaftliche Hilfskraft",
    org: "Hochschule Düsseldorf, FB Maschinenbau & Verfahrenstechnik",
    place: "Düsseldorf",
    kind: "beruf",
    minor: true,
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
      { label: "Note bisher", value: "1,2" },
      { label: "Anteil Nutzung", value: "ca. 99 % der Energie" },
      { label: "Hohle Variante", value: "rund 68 % weniger" },
    ],
    tools: ["Excel"],
    visual: { image: "Die Luftleitschaufel aus Ultem 9085, massiv und hohl", note: "falls Diehl Aviation ein Bild freigibt" },
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
      "Eine Schulung zu Copilot in Power BI konzipiert und selbst gehalten",
    ],
    facts: [{ label: "Bereich", value: "BI Consulting" }],
    tools: ["Power BI", "Jedox", "Copilot in Power BI"],
    visual: { image: "Ausschnitt eines Berichts aus Power BI oder Jedox", note: "anonymisiert, ohne Kundendaten" },
    title: "Praktikum BI Consulting",
    org: "ATVISIO Consult GmbH",
    place: "Düsseldorf",
    kind: "beruf",
    project: "bi-consulting",
    story:
      "Daten aus mehreren Systemen zu Berichten zusammenführen, für Kunden und intern.",
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
      "Über zehn Jahre in einem A350 entfallen fast 99 % des Energieaufwands der Luftleitschaufel auf die Nutzung, Herstellung und Material sind Nebensache. Die hohle Variante braucht deshalb rund zwei Drittel weniger Energie als die massive. Ein Tool, das Zulieferer, Kabinenhersteller und Airlines auf weitere Bauteile anwenden können. Bislang mit Note 1,2 bewertet.",
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
  proof: string[];
  tools: string[]; // Schlüssel aus src/data/tools.ts (Logo oder Logo-Platzhalter)
  toolsQuestion?: string;
  learned: { label: string; href: string }[];
  // Bild der Box (Startseite, Text liegt darauf). Ohne image zeigt die Box einen
  // Bildplatzhalter mit imageIdea (KI-Vorschlag, was das Bild zeigen könnte).
  image?: { src: string; test?: true }; // test: Testbild von Daniel, wird noch ersetzt
  imageIdea: string;
};

// Reihenfolge und Auswahl der Boxen: Vorgabe von Daniel (2026-09-25). Belegzeilen und
// Zuordnungen bleiben KI-Entwurf. Seit 2026-10-01 nur zwei kurze Belegzeilen je Box (die Box
// liegt auf einem Bild und soll ganz auf den Schirm passen); Details stehen auf /werdegang/.
export const topSkills: TopSkill[] = [
  {
    id: "kosten",
    title: "Bauteilkostenkalkulation",
    proof: [
      "Bottom-Up-Kostenmodell für den Stahlbau von Heliostaten",
      "Bachelorarbeit am DLR, veröffentlicht bei SolarPACES",
    ],
    // Software laut Daniel (2026-09-25): CAD in Inventor, Kalkulation per Hand in Excel
    tools: ["Autodesk Inventor", "Excel"],
    learned: [{ label: "Bachelorarbeit am DLR", href: "#bachelorarbeit" }],
    imageIdea: "Heliostat-Stahlbau oder das CAD-Modell",
  },
  {
    id: "data",
    title: "Data & AI",
    proof: [
      "ETL-Strecken und Berichte in Power BI und Jedox",
      "Selbst konzipierte Schulung zu Copilot in Power BI",
    ],
    // Python und Jedox auf Wunsch von Daniel (2026-09-25) nicht als Software-Logo
    tools: ["Power BI", "MSSQL", "Copilot in Power BI", "Claude"],
    learned: [
      { label: "Praktikum BI Consulting (ATVISIO)", href: "#praktikum-bi" },
      { label: "SQL Grundkurs (LinkedIn Learning)", href: "#z-sql" },
    ],
    imageIdea: "Ein Power-BI-Bericht auf dem Bildschirm",
  },
  {
    id: "prozesse",
    title: "Prozesse und Projekte",
    proof: [
      "Timebutler eingeführt, Kolleg:innen geschult",
      "Kundentermine vor- und nachbereitet",
    ],
    tools: ["Timebutler", "SAP"],
    learned: [
      { label: "Timebutler-Einführung (IGH Infotec)", href: "#werkstudent-controlling" },
      { label: "Praktikum Projektmanagement (IGH Infotec)", href: "#praktikum-pm" },
      { label: "Lean Six Sigma Yellow Belt", href: "#z-lean-six-sigma" },
    ],
    imageIdea: "Eine Schulung oder ein Kundentermin",
  },
  {
    id: "controlling",
    title: "Controlling",
    proof: [
      "Ein Jahr Mitarbeitercontrolling und Monatsabschlüsse",
      "Mit Excel und Pivot-Tabellen, bei IGH Infotec",
    ],
    tools: ["Excel"],
    learned: [
      { label: "Werkstudent Finanzen & Controlling (IGH Infotec)", href: "#werkstudent-controlling" },
    ],
    // Testbild von Daniel (2026-10-01), noch nicht das endgültige
    image: { src: "/img/kompetenzen/controlling.webp", test: true },
    imageIdea: "Monatsabschluss: Zahlen, Tabellen, Taschenrechner",
  },
];
