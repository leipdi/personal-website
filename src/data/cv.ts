// Quelle: Lebenslauf (PDF) + LinkedIn-Datenexport.
//
// Fakten (Titel, Arbeitgeber, Orte, Zeiträume, Noten, Software-Einstufungen,
// Zertifikate, Kontaktdaten) stammen aus CV/LinkedIn. Alle Fließtexte und Zuordnungen sind
// dagegen aus KI-Entwürfen entstanden (seit 2026-10-09 von Daniel übernommen, auf der Seite
// nicht mehr markiert):
//   profile.claim, career[].story, projects (Texte),
//   topSkills (komplett: Auswahl, Titel, Belegzeilen, Zuordnung der Software).
// Seit 2026-09-26 stützen sich die Texte zu Bachelor- und Masterarbeit (career-Stories, projects)
// zusätzlich auf die beiden Abschlussarbeiten ("Input Data/", nicht im Repo). Daniel hat die
// Veröffentlichung trotz Sperrvermerk freigegeben. Zahlen daraus sind echt, die Formulierung KI.
// profile.claim: *Wort* wird kursiv gesetzt (Betonung, index.astro).

export const profile = {
  name: "Daniel Lenski",
  role: "Wirtschaftsingenieur, M.Sc.",
  claim:
    "Bindeglied zwischen *Technik* und *Wirtschaft*. Und die Frage, wie KI wirklich bei Prozessen und Projekten hilft",
  location: "Langenfeld (Rheinland) / Düsseldorf",
  email: "daniel.lenski@hotmail.com",
  linkedin: "linkedin.com/in/daniel-lenski-de",
  linkedinUrl: "https://linkedin.com/in/daniel-lenski-de",
};

// Kontakt (seit 2026-10-11): "Worum geht's?" Die Wahl schreibt Betreff und Anfang der E-Mail
// auf den Laptop-Bildschirm; "E-Mail schreiben" öffnet sie im Mailprogramm (mailto).
export const contactTopics: { id: string; label: string; subject: string; body: string }[] = [
  { id: "stelle", label: "Eine Stelle", subject: "Eine Stelle", body: "Hallo Daniel,\n\nwir suchen gerade jemanden für " },
  { id: "projekt", label: "Ein Projekt", subject: "Ein Projekt", body: "Hallo Daniel,\n\nich arbeite an einem Projekt und " },
  { id: "frage", label: "Eine Frage zu meinen Arbeiten", subject: "Eine Frage zu deinen Arbeiten", body: "Hallo Daniel,\n\nich habe eine Frage zu " },
  { id: "hallo", label: "Einfach Hallo", subject: "Hallo", body: "Hallo Daniel,\n\n" },
];

export type CareerEntry = {
  id: string; // Anker der Station (#id) auf der Seite, stabil halten: die Kernkompetenzen verlinken darauf
  from: string;
  to: string;
  title: string;
  org: string;
  place: string;
  kind: "ausbildung" | "beruf";
  story: string; // KI-PLATZHALTER: kurzer Einstieg
  // Meilenstein im Projektplan (Werdegang, Fahne am Balken): Abschluss oder Abgabe. at: "2024",
  // "Jun 2024" oder ein Tagesdatum "18.06.2024". Nur Fakten aus CV oder Abschlussarbeit.
  // tag = kurze Fahnenbeschriftung im Projektplan ("Abgabe BA")
  milestone?: { at: string; label: string; tag: string };
  // Werdegang-Station ausführlich (nur Hauptstationen):
  tasks?: string[]; // KI-PLATZHALTER: was er dort gemacht hat, aus CV/Abschlussarbeit umformuliert
  facts?: { label: string; value: string }[]; // Fakten aus CV/LinkedIn/Abschlussarbeit
  visual?: "heliostat"; // die Heliostat-Skizze in der Station
  // kurze Zeilenbeschriftung im Projektplan, wenn der Titel zu lang ist
  short?: string;
};

// Älteste zuerst. from/to: "2020" (nur Jahr), "Okt 2021" (Monat + Jahr) oder "heute".
export const career: CareerEntry[] = [
  {
    from: "2013",
    to: "2020",
    id: "abitur",
    milestone: { at: "2020", label: "Abitur, Note 2,0", tag: "Note 2,0" },
    tasks: ["Allgemeine Hochschulreife mit Note 2,0"],
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
      "Der Einstieg ins Wirtschaftsingenieurwesen.",
  },
  {
    from: "Okt 2021",
    to: "Jul 2022",
    id: "tutor",
    tasks: ["Mathematik-Tutorien für Erstsemester gehalten"],
    title: "Mathematik-Tutor",
    org: "Hochschule Düsseldorf",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Der erste Job neben dem Studium.",
  },
  {
    from: "Okt 2022",
    to: "Feb 2023",
    id: "praktikum-pm",
    tasks: [
      "Kundentermine vor- und nachbereitet",
      "SAP-Tabellen in Kundensystemen gepflegt",
      "In Produktions- und Logistikfragen beraten",
    ],
    facts: [{ label: "Bereich", value: "Projektmanagement" }],
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
    id: "werkstudent-controlling",
    tasks: [
      "Mitarbeitercontrolling und Monatsabschlüsse in Excel und Pivot-Tabellen",
      "Timebutler als neues Zeiterfassungssystem eingeführt. Die Kolleg:innen auf das neue System geschult",
      "Operative Aufgaben im Tagesgeschäft. Rechnungen überprüft und eingescannt, offene Forderungen nachgehalten.",
    ],
    facts: [{ label: "Bereich", value: "Finanzen & Controlling" }],
    short: "Werkstudent Finanzen & Controlling",
    title: "Werkstudent Finanzen & Controlling",
    org: "IGH Infotec AG",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Interner Wechsel in eine andere Abteilung.",
  },
  {
    from: "Mär 2024",
    to: "Jun 2024",
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
    visual: "heliostat",
    short: "Bachelorarbeit am DLR",
    milestone: { at: "18.06.2024", label: "Abgabe der Bachelorarbeit", tag: "Abgabe BA" },
    title: "Bachelorarbeit: Herstellkostenoptimierung von Heliostaten",
    org: "DLR, Deutsches Zentrum für Luft- und Raumfahrt",
    place: "Jülich",
    kind: "beruf",
    story:
      "Ein Heliostat ist ein nachgeführter Spiegel, der Sonnenlicht auf den Receiver eines Solarturms lenkt. Ausgangslage: eine neue Konstruktion eines Heliostaten. Die Frage: Was kostet der neue Heliostat des DLR in Serie und was sind die Produktionsschritte?",
  },
  {
    from: "2024",
    // abgeschlossen laut Daniel (2026-10-03), Monat unbekannt
    to: "2026",
    id: "master",
    tasks: [
      "Schwerpunkt Produktion und Innovation",
      "Masterarbeit an der Hochschule Düsseldorf, gemeinsam mit der RWTH Aachen",
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
    id: "masterarbeit",
    tasks: [
      "Anforderungskatalog aus ISO 14044, REACH und den ICAO-Vorgaben",
      "Excel-Tool für kumulierten Energieaufwand und Treibhauspotenzial über fünf Lebensphasen",
      "Praxischeck mit Diehl Aviation an einer FDM-gedruckten Luftleitschaufel aus Ultem 9085",
    ],
    facts: [
      { label: "Note", value: "1,2" },
      { label: "Anteil Nutzung", value: "ca. 99 % der Energie" },
      { label: "Hohle Variante", value: "rund 68 % weniger" },
    ],
    short: "Masterarbeit, HSD und RWTH",
    milestone: { at: "01.06.2026", label: "Abgabe der Masterarbeit", tag: "Abgabe MA" },
    title: "Masterarbeit: Ökobilanz additiver Fertigung in der Luftfahrt",
    org: "Hochschule Düsseldorf, mit der RWTH Aachen",
    place: "Remote",
    kind: "beruf",
    story:
      "Lohnt sich ein 3D-gedrucktes Kabinenteil ökologisch, über das ganze Leben des Bauteils gerechnet? Dafür eine Bewertungsmetrik nach ISO 14044 entwickelt.",
  },
  {
    from: "Mai 2026",
    to: "Aug 2026",
    id: "praktikum-bi",
    tasks: [
      "ETL-Strecken für Kunden und intern aufgebaut",
      "Berichte in Power BI und Jedox gebaut",
      "Eine Schulung zu Copilot in Power BI konzipiert",
      "Kunden die Lösung vorgestellt",
    ],
    facts: [{ label: "Bereich", value: "BI Consulting" }],
    title: "Praktikum BI Consulting",
    org: "ATVISIO Consult GmbH",
    place: "Düsseldorf",
    kind: "beruf",
    story:
      "Mehr Berufserfahrung sammeln und Power BI lernen: Deshalb folgte ein Praktikum im BI Consulting.",
  },
  {
    from: "Okt 2026",
    to: "heute",
    id: "praktikum-digital-transformation",
    tasks: [
      "Einführung eines geeigneten KI-Systems mit Schulung der Mitarbeitenden",
    ],
    facts: [{ label: "Bereich", value: "Digital Transformation" }],
    title: "Praktikum Digital Transformation",
    org: "KOMAcons GmbH",
    place: "Langenfeld",
    kind: "beruf",
    story:
      "Die Prozesse eines kleinen Unternehmens über das ERP-System Odoo digitalisieren, dazu ein passendes KI-System einführen und klären, wo es sinnvoll hilft.",
  },
];

// Projekte auf der Seite (seit 2026-10-13), chronologisch. Schritt für Schritt aufgebaut,
// zuerst das Ringprojekt. Nur Fakten vom Besitzer, keine erfundenen Zahlen.
export type Project = {
  id: string; // Anker auf der Seite (#id), stabil halten
  tab: string; // kurzer Name in der Projektliste (Seitenleiste, auf Handys die Pille)
  year: string; // Jahr in der Projektliste
  title: string;
  org: string;
  period: string;
  team?: string; // in der Kopfzeile, wenn das Team nicht schon unter `brief` steht
  intro: string; // ein, zwei Sätze: worum es ging
  contribution: string; // der eigene Beitrag, im Überblick sichtbar
  outcome: string; // belegtes Ergebnis mit nötigen Einschränkungen
  detailsLabel?: string; // nur längere Projekte: technische Vertiefung aufklappen
  brief?: { label: string; text: string }[]; // die Eckpunkte vor der eigenen Rolle (Aufgabe, Team)
  role: string;
  lead?: string;
  tasks: { text: string; sub?: string }[];
  facts: { label: string; value: string }[];
  tools: string[]; // Schlüssel aus src/data/tools.ts (Logo oder markierter Platzhalter)
  link?: { label: string; href: string }; // z. B. die Veröffentlichung
  figure?: "ringprojekt" | "heliostat" | "luftfahrt";
  // vom Entwurf zum Teil (2026-10-15): beim Scrollen bleibt das Bild stehen, daneben die Schritte;
  // Texte nur aus den Aufgaben und Bildunterschriften oben, Bilder in public/img/projekte/
  steps?: ProjectStep[];
  beside?: ProjectImage; // ein Bild neben Aufgabe und Beitrag (Bachelorarbeit: DLRs Foto aus Jülich)
};

export type ProjectStep = {
  stage: string; // kurze Überschrift des Schritts
  text: string;
  img: ProjectImage;
};

export type ProjectImage = {
  id: string; // Datei public/img/projekte/<id>.webp (dazu <id>-640.webp, wenn `small`)
  small?: boolean;
  width: number;
  height: number;
  alt: string;
  cap: string;
  dlr?: boolean; // DLR-Foto: CC BY-NC-ND 3.0, nur verkleinert, nie beschnitten, Nachweis dabei
};

export const projects: Project[] = [
  {
    id: "ringprojekt",
    tab: "Ringprojekt",
    year: "2022",
    title: "Ringprojekt: eine Messhalterung für einen Turbolader konstruieren und fertigen",
    org: "Hochschule Düsseldorf",
    period: "5. Semester (Wintersemester 2022/23)",
    intro:
      "Im 5. Semester haben wir zu siebt eine Messhalterung für einen Turbolader entwickelt und selbst gefertigt, vom Entwurf am Rechner bis zur Messung.",
    contribution: "Als Verantwortlicher für Produktionsplanung und -steuerung habe ich Stückliste und Arbeitspläne in Infor aufgebaut, Fertigungszeiten erfasst und die Abschlusspräsentation übernommen.",
    outcome: "Im Team entstand die fertige Messhalterung aus Aluminium mit einem 3D-gedruckten Niederhalter.",
    detailsLabel: "Team und Fertigungsplanung im Detail",
    brief: [
      {
        label: "Aufgabe",
        text: "Eine Halterung, in der ein Turbolader vermessen wird. Sie wird aus Aluminium gegossen, gefräst und gebohrt; ein 3D-gedruckter Niederhalter wird angebohrt, angeschraubt und hält den Turbolader fest.",
      },
      {
        label: "Team",
        text: "Sieben Studierende, jede und jeder mit einer Rolle: Teamleitung, Produktionsplanung und -⁠steuerung (ich), Konstruktion, spanlose Fertigung (Guss), spanende Fertigung, Rapid Prototyping und Messtechnik. Entworfen wurde gemeinsam in der Gruppe, konstruiert in PROCAD, über das auch die Daten im Team liefen. Dazu kamen regelmäßige Gruppentermine.",
      },
    ],
    role: "Meine Rolle: Produktionsplanung und -⁠steuerung", // kein Umbruch vor oder nach dem Bindestrich
    lead: "Ich habe aus dem Entwurf die Fertigung geplant: welche Teile, welche Arbeitsgänge, in welcher Reihenfolge.",
    tasks: [
      { text: "Stückliste und Arbeitsgangfolge in Infor aufgebaut", sub: "Halterung und Niederhalter als Baum, darunter die Arbeitsgänge je Teil" },
      { text: "Arbeitspläne erstellt und gedruckt", sub: "Je einer für Guss, Spanen, Rapid Prototyping und Messtechnik, dazu der Montageplan für den Niederhalter" },
      { text: "Zeiten in der Fertigung erfasst", sub: "Daraus die Maschinenkosten der Verfahren berechnet, nebenbei fiktive Personalkosten" },
      { text: "Abschlusspräsentation gehalten", sub: "Für den erkrankten Teamleiter" },
    ],
    facts: [{ label: "Note", value: "1,2" }],
    tools: ["Infor (ERP)"],
    figure: "ringprojekt",
    steps: [
      {
        stage: "Planen",
        text: "Aus dem Entwurf habe ich die Fertigung geplant: Stückliste und Arbeitsgangfolge in Infor, Halterung und Niederhalter als Baum, darunter die Arbeitsgänge je Teil.",
        img: { id: "prototyp", small: true, width: 1200, height: 938, alt: "3D-gedruckter Prototyp der Halterung in Blau", cap: "Prototyp aus dem 3D-Drucker" },
      },
      {
        stage: "Fertigen",
        text: "Je ein Arbeitsplan für Guss, Spanen, Rapid Prototyping und Messtechnik. Während der Fertigung habe ich die Zeiten erfasst und daraus die Maschinenkosten der Verfahren berechnet.",
        img: { id: "rohguss", small: true, width: 1200, height: 938, alt: "Rohes Gussteil aus Aluminium mit rauer Oberfläche, noch unbearbeitet", cap: "Aluminium-Rohguss, noch unbearbeitet" },
      },
      {
        stage: "Endbauteil",
        text: "Die Abschlusspräsentation habe ich für den erkrankten Teamleiter gehalten.",
        img: {
          id: "fertig",
          small: true,
          width: 1200,
          height: 937,
          alt: "Fertige Halterung: gefräste Aluminiumplatte mit Bohrungen und einer Aufnahme, daran der schwarze 3D-gedruckte Niederhalter angeschraubt",
          cap: "Fertige Halterung: gefräst und gebohrt, der gedruckte Niederhalter angeschraubt",
        },
      },
    ],
  },
  // Bachelorarbeit (2026-10-14): Fakten aus der Arbeit (Endfassung, abgegeben 18.06.2024) und den
  // Kolloquiumsfolien, die Zahl der Heliostaten aus der DLR-Bildunterschrift. Die Kostentreppe
  // darunter (figures/HeliostatCost.astro) ist Tabelle 30 der Arbeit.
  {
    id: "heliostat",
    tab: "Bachelorarbeit",
    year: "2024",
    title: "Bachelorarbeit: Herstellkostenoptimierung von Heliostaten künftiger Solarturm-Anlagen", // offizieller Titel
    org: "DLR, Institut für Solarforschung, Jülich",
    period: "März bis Juni 2024",
    intro:
      "Für einen neuen Heliostaten des DLR sollte die wirtschaftlichste Fertigung in Großserie bestimmt werden. Heliostaten sind nachgeführte Spiegel, die Sonnenlicht auf einen Solarturm lenken.",
    contribution: "Ich habe aus dem CAD-Modell die Fertigung abgeleitet, Verfahren im technologischen Variantenvergleich ausgewählt und Material, Zukaufteile und Bearbeitungszeiten in Excel kalkuliert.",
    outcome: "Die Kalkulation ergibt rund 116 € Herstellkosten pro Heliostat für die angenommene Großserie, ohne Rüstkosten. Aus der Arbeit entstand ein SolarPACES-Konferenzbeitrag mit mir als Erstautor.",
    detailsLabel: "Variantenvergleich und Kalkulation im Detail",
    brief: [
      {
        label: "Ausgangslage",
        text: "Heliostaten machen 40 bis 50 % der Kosten eines Solarturmkraftwerks aus. Vom neuen Entwurf gab es ein CAD-Modell, aber keine belastbaren Kosten. Ein früherer Prototyp nach einer älteren Zeichnung war eine Einzelfertigung, seine Kosten kaum dokumentiert.",
      },
      {
        label: "Aufgabe",
        text: "Für jedes Bauteil die wirtschaftlichste Fertigung in Großserie auswählen und damit die Herstellkosten berechnen. Daneben Bezugsquellen für die Zukaufteile und erste Ideen für ein Marketingkonzept.",
      },
    ],
    role: "Mein Vorgehen",
    lead: "Eine fertige Kalkulationssoftware ließ sich nicht sinnvoll einsetzen. Also habe ich die Kosten von unten aufgebaut, vom einzelnen Blechteil bis zum fertigen Heliostaten.",
    tasks: [
      {
        text: "Kalkulationssoftware gesucht und getestet",
        sub: "Bei 4cost und simus systems wäre die Einführung ein eigenes Projekt gewesen. Costing24 rechnet nicht für Großserie, übernommen habe ich daraus die Maschinenstundensätze",
      },
      {
        text: "Aus dem CAD-Modell die Fertigung aufgebaut",
        sub: "Baumstrukturen nach Montageschritten statt nach CAD-Baugruppen, daraus die Fertigungsstücklisten; die Fertigung der Pylone zur Übersicht als Ausschnitt einer Fertigungsstraße in Witness abgebildet",
      },
      {
        text: "Fertigungsverfahren im technologischen Variantenvergleich ausgewählt",
        sub: "Je Bauteil die möglichen Verfahren aus der Fachliteratur zusammengetragen, nach Automatisierbarkeit, Betriebskosten und Bearbeitungszeit bei großen Stückzahlen bewertet und das wirtschaftlichste gewählt, etwa Laserschneiden für die dünnwandigen Stahlteile, Walzrunden und HF-Schweißen für das Rohr der Pylone",
      },
      {
        text: "Zeiten und Kosten in Excel berechnet",
        sub: "Bearbeitungszeiten mal Maschinenstundensatz, Material über den Preis je Kilogramm, Zukaufteile über Händlerpreise, einige über Staffelpreise auf große Stückzahlen hochgerechnet",
      },
    ],
    facts: [
      { label: "Pro Quadratmeter Spiegel", value: "ca. 58 €" },
    ],
    tools: ["Autodesk Inventor", "Excel", "Costing24", "Witness"],
    link: {
      label: "SolarPACES 2024: Konferenzbeitrag (Erstautor)",
      href: "https://doi.org/10.52825/solarpaces.v3i.2420",
    },
    figure: "heliostat",
    beside: {
      id: "juelich",
      small: true,
      width: 1200,
      height: 675,
      alt: "Blick aus dem Heliostatfeld: schräg gestellte Spiegel im Vordergrund, dahinter die beiden Solartürme, über ihnen die Sonne",
      cap: "Die beiden Solartürme in Jülich, fotografiert aus dem Heliostatfeld.",
      dlr: true,
    },
    steps: [
      {
        stage: "Vom Modell zur Fertigung",
        text: "Vom neuen Entwurf gab es ein CAD-Modell, aber keine belastbaren Kosten. Daraus habe ich Baumstrukturen nach Montageschritten aufgebaut und die Fertigungsstücklisten abgeleitet.",
        img: {
          id: "heliostat-cad",
          width: 335,
          height: 391,
          alt: "CAD-Modell des neuen Heliostaten: ein schwarzes Rohr als Säule, darauf ein Ausleger und ein schräg gestellter Spiegel mit Rahmen",
          cap: "Der Entwurf im CAD: für ihn habe ich die Kosten berechnet",
        },
      },
      {
        stage: "Von der Einzelfertigung zur Großserie",
        text: "Der frühere Prototyp war eine Einzelfertigung. Für die Großserie habe ich je Bauteil das wirtschaftlichste Verfahren gewählt, etwa Laserschneiden für die dünnwandigen Stahlteile, Walzrunden und HF-Schweißen für das Rohr der Pylone.",
        img: {
          id: "heliostat-prototyp",
          width: 387,
          height: 391,
          alt: "Früherer Prototyp im Freien: eine Säule aus Aluminium auf einer Bodenplatte, darauf der schräg gestellte Spiegel",
          cap: "Der frühere Prototyp, eine Einzelfertigung",
        },
      },
    ],
  },
  // Masterarbeit (2026-10-14): Fakten aus der Endfassung (01.06.2026). Relevanztabelle daneben
  // (figures/ImpactScreen.astro) = Tabelle 6, Ergebnis darunter (figures/LifeCycle.astro) =
  // Tabellen 25 und 26. Keine Betreuer- oder Kontaktdaten aus dem Titelblatt.
  {
    id: "luftfahrt",
    tab: "Masterarbeit",
    year: "2026",
    title: "Masterarbeit: Ökologische Einflussfaktoren für einen flexiblen Einsatz der additiven Fertigung in der Luftfahrt – Erstellen einer Bewertungsmetrik",
    org: "Hochschule Düsseldorf, mit der RWTH Aachen",
    period: "Januar bis Juni 2026",
    intro:
      "Wie lassen sich additiv und konventionell gefertigte Kabinenbauteile über ihren gesamten Lebenszyklus ökologisch vergleichen? Dafür sollte eine Bewertungsmetrik entwickelt und mit einem Industriepartner erprobt werden.",
    contribution: "Ich habe ein Excel-Tool für Energieaufwand und Treibhauspotenzial entwickelt, weitere Umweltwirkungen begründet eingeordnet und die Metrik mit Diehl Aviation an einer Luftleitschaufel erprobt.",
    outcome: "Im untersuchten Fall benötigt die hohl gedruckte Variante über zehn Jahre im A350 rund 68 % weniger Energie als die massiv gedruckte. Ein Vergleich mit einer konventionell gefertigten Variante war mangels Daten nicht möglich.",
    detailsLabel: "Aufbau und Erprobung der Metrik im Detail",
    brief: [
      {
        label: "Ausgangslage",
        text: "Eine Recherche in Web of Science fand zu Ökobilanz, Luftfahrt und Bewertungsrahmen 51 Arbeiten, mit additiver Fertigung dazu nur noch zwei. Eine Methode, die gedruckte Luftfahrtbauteile über den ganzen Lebenszyklus bewertet, fand sich nicht.",
      },
      {
        label: "Aufgabe",
        text: "Eine Bewertungsmetrik nach ISO 14044 entwickeln, mit der sich additiv und konventionell gefertigte Kabinenbauteile ökologisch vergleichen lassen, und sie mit einem Industriepartner erproben.",
      },
      {
        label: "Ansatz: quantitativ und qualitativ",
        text: "Berechnet werden kumulierter Energieaufwand und Treibhauspotenzial: Für sie gibt es Daten, und der Energieaufwand hängt eng mit den Treibhausgasen zusammen. Die übrigen Umweltwirkungen lassen sich ohne belastbare öffentliche Daten und eine vollwertige Ökobilanzsoftware nicht rechnen; sie werden begründet eingeordnet. Ausgewertet wird beides zusammen, weil der Energieaufwand allein nicht alle Umweltwirkungen abbildet.",
      },
    ],
    role: "Mein Vorgehen",
    lead: "Zuerst habe ich gesammelt, was eine solche Bewertung erfüllen muss. Darauf habe ich den rechnenden und den einordnenden Teil der Metrik aufgebaut und beide an einem echten Bauteil erprobt.",
    tasks: [
      {
        text: "Anforderungskatalog aufgestellt",
        sub: "Aus ISO 14040/14044, europäischem Umweltrecht wie REACH und den Luftfahrtregeln (EU-ETS, ICAO/CORSIA), dazu aus bestehenden Bewertungsansätzen. Das Recht gibt für Bauteile keine Grenzwerte vor, die Metrik vergleicht deshalb mit dem konventionell gefertigten Bauteil",
      },
      {
        text: "Quantitativ: ein Excel-Tool über fünf Lebensphasen gebaut",
        sub: "Rohmaterial, Produktion, Transport, Nutzung und Entsorgung; berechnet werden kumulierter Energieaufwand (VDI 4600) und Treibhauspotenzial, dazu ein Modul für Kabinenwechsel. Grundlage ist ein Modell des Oak Ridge National Laboratory, das ich für die Flugzeugkabine erweitert habe",
      },
      {
        text: "Fehlende Daten recherchiert",
        sub: "Materialdaten für Kunststoffe, Fertigungsenergien additiver Verfahren und den Kerosinverbrauch verschiedener Flugzeuge je Kilogramm Bauteil",
      },
      {
        text: "Qualitativ: eine Relevanztabelle abgeleitet",
        sub: "Die Kategorien von vier gängigen Wirkungsabschätzungsmethoden (CML-IA, ReCiPe 2016, ILCD 2011, IMPACT 2002+) in drei Screenings auf drei Stufen eingeordnet und jede Einstufung begründet; ohne Gewichtung: Nach ISO 14044 ist sie eine Wertentscheidung, die Arbeit überlässt sie dem Anwender",
      },
      {
        text: "Praxischeck mit Diehl Aviation",
        sub: "Gemeinsam ein Bauteil ausgewählt, eine im FDM-Verfahren gedruckte Luftleitschaufel aus Ultem 9085; die Daten über eine Eingabeliste erhoben, die massive mit einer hohlen Variante verglichen",
      },
    ],
    facts: [{ label: "Note", value: "1,2" }],
    tools: ["Excel"],
    figure: "luftfahrt",
  },
  // Portfolio-Website (2026-10-14; Name und "mit Hilfe von Agentic Coding" vom Besitzer, Besitzer: "shouldn't be that long, the website itself is the
  // project"): kurz, ohne Abbildung. Fakten aus dem Repo (erster Commit 15.09.2026, package.json,
  // AGENTS.md: Prozess mit Test- und Kritik-Agenten).
  {
    id: "website",
    tab: "Portfolio-Website",
    year: "2026",
    title: "Portfolio-Website",
    org: "Eigenes Projekt",
    period: "seit September 2026",
    intro:
      "Eine persönliche Website, die meinen Werdegang, meine Projekte und Interessen zusammenführt.",
    contribution: "Ich habe Inhalte und Gestaltung entwickelt und die Seite mit Hilfe von Agentic Coding in Claude Code umgesetzt, geprüft und überarbeitet.",
    outcome: "Entstanden ist diese durchgehende Seite mit Projekten und interaktivem Hobbyregal, veröffentlicht auf GitHub Pages.",
    role: "Mein Vorgehen",
    tasks: [
      {
        text: "Inhalte aus echten Quellen",
        sub: "Lebenslauf, LinkedIn und beide Abschlussarbeiten; Zahlen mit den Quellen abgeglichen",
      },
      {
        text: "Gestaltung über Entwürfe entschieden",
        sub: "Mockups verglichen, Gestaltung ausgewählt und iterativ überarbeitet",
      },
      {
        text: "Bauen, testen, korrigieren",
        sub: "Automatisierte Browsertests sowie separate Agenten für Fehlerprüfung und Designkritik",
      },
    ],
    facts: [],
    tools: ["Claude Code", "Astro", "Tailwind CSS", "three.js", "Playwright", "GitHub Pages"],
    link: { label: "Quellcode auf GitHub", href: "https://github.com/leipdi/personal-website" },
  },
];

export type RatedSkill = {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  group: "Software & BI" | "KI" | "Sprachen";
};

// Nur Skills mit expliziter Selbsteinschätzung im Original-CV, keine geschätzten Werte.
export const ratedSkills: RatedSkill[] = [
  { name: "Excel / Word / PowerPoint", level: 5, levelLabel: "sehr gut", group: "Software & BI" },
  { name: "Power BI", level: 4, levelLabel: "gut", group: "Software & BI" },
  { name: "MSSQL", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Jedox", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Autodesk Fusion", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  { name: "Autodesk Inventor", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  // Infor: Stufe vom Besitzer selbst (2026-10-13); SAP gemeinsam bestätigt am 2026-10-14.
  { name: "SAP / Infor", level: 2, levelLabel: "Grundkenntnisse", group: "Software & BI" },
  // KI-Kenntnisse: Auswahl und Stufen von Daniel abgestimmt (2026-10-09), nicht aus dem CV.
  { name: "Agentic Coding", level: 4, levelLabel: "gut", group: "KI" },
  { name: "Prompt & Context Engineering", level: 4, levelLabel: "gut", group: "KI" },
  { name: "Multi-Agent-Workflows", level: 3, levelLabel: "solide", group: "KI" },
  { name: "MCP & Connectors", level: 3, levelLabel: "solide", group: "KI" },
  { name: "Skills & Plugins", level: 3, levelLabel: "solide", group: "KI" },
  { name: "Deutsch", level: 5, levelLabel: "Muttersprache", group: "Sprachen" },
  { name: "Englisch", level: 4, levelLabel: "C1", group: "Sprachen" },
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

// KI-PLATZHALTER (komplett): die Kernkompetenzen-Blätter (Kernkompetenzen.astro).
// Ein erster KI-Vorschlag, den Daniel selbst überarbeitet: welche Kompetenzen, ihre Titel,
// die Belegzeilen (proof) und die Zuordnung der Software (tools)
// sind abgeleitet. Die Fakten in den Belegzeilen stammen nur aus den Stationen oben.
// Software steht nur dort, wo eine Station oder ein Zertifikat sie belegt.
export type TopSkillId = "kosten" | "data" | "prozesse" | "controlling";

export type TopSkill = {
  id: TopSkillId;
  title: string;
  // Hauptpunkte mit Unterpunkten (Daniel 2026-10-08: große Punkte, kleinere darunter; er
  // ergänzt später eigene Angaben). Unterpunkte aus den Stationen (career[].tasks/facts).
  proof: { text: string; sub?: string[] }[];
  tools: string[]; // Schlüssel aus src/data/tools.ts (Logo oder Logo-Platzhalter)
  // Das Bild der Karte steht in `arts` in Kernkompetenzen.astro, nach id ausgewählt.
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
        text: "Ringprojekt im Studium: eine Messhalterung für einen Turbolader als Gruppe konstruiert und hergestellt, meine Aufgabe PPS",
        sub: ["Planung und Steuerung der Laborbesuche",
          "Herstellkosten anhand von Materialdaten und Maschinendaten",
          "Vorstellen der Ergebnisse vor einem Plenum"],
      },
    ],
    // Software laut Daniel (2026-09-25): CAD in Inventor, Kalkulation per Hand in Excel
    tools: ["Autodesk Inventor", "Excel"],
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
        text: "KI-Enthusiast",
        sub: [
          "KOMAcons GmbH: Integration eines geeigneten KI-Tools mit Schulung der Mitarbeitenden",
          "Agentic Coding, zum Beispiel diese Portfolio-Website",
        ],
      },
    ],
    // Python und Jedox auf Wunsch von Daniel (2026-09-25) nicht als Software-Logo
    tools: ["Power BI", "MSSQL", "Copilot in Power BI", "Claude"],
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
        sub: ["Planung und Steuerung der Laborbesuche", "Vorstellen der Ergebnisse vor einem Plenum"],
      },
      { text: "Lean Six Sigma Yellow Belt (2025)" },
    ],
    tools: ["Timebutler", "SAP"],
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
  },
];
