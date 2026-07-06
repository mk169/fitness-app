// Muskelgruppen und Übungen als gemeinsame Datenbasis für Trainingsplan
// und Körperkarte. Jede Übung nennt ihre primär und sekundär belasteten
// Muskelgruppen – darüber wird die Körpergrafik eingefärbt ("verlinkt").

// Muskelgruppen: key -> Anzeigename + auf welcher Ansicht sie liegen
// ("vorne" / "hinten" / "beides").
export const MUSKELGRUPPEN = {
  brust: { name: "Brust", ansicht: "vorne" },
  schultern: { name: "Schultern", ansicht: "beides" },
  bizeps: { name: "Bizeps", ansicht: "vorne" },
  trizeps: { name: "Trizeps", ansicht: "hinten" },
  unterarme: { name: "Unterarme", ansicht: "beides" },
  bauch: { name: "Bauch", ansicht: "vorne" },
  ruecken: { name: "Rücken (Lat)", ansicht: "hinten" },
  unterer_ruecken: { name: "Unterer Rücken", ansicht: "hinten" },
  trapez: { name: "Trapez / Nacken", ansicht: "hinten" },
  quadrizeps: { name: "Quadrizeps", ansicht: "vorne" },
  beinbizeps: { name: "Beinbizeps", ansicht: "hinten" },
  gesaess: { name: "Gesäß", ansicht: "hinten" },
  waden: { name: "Waden", ansicht: "beides" },
}

// Übungsbibliothek. kategorie dient dem automatischen Verteilen auf
// Splits (Push/Pull/Beine/Core). muskeln = primär, sekundaer = optional.
export const UEBUNGEN = [
  { id: "bankdruecken", name: "Bankdrücken", kategorie: "Push", geraet: "Langhantel", muskeln: ["brust", "trizeps"], sekundaer: ["schultern"] },
  { id: "schraegbank", name: "Schrägbankdrücken", kategorie: "Push", geraet: "Langhantel", muskeln: ["brust", "schultern"], sekundaer: ["trizeps"] },
  { id: "liegestuetze", name: "Liegestütze", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["brust", "trizeps"], sekundaer: ["schultern", "bauch"] },
  { id: "schulterdruecken", name: "Schulterdrücken", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["schultern", "trizeps"] },
  { id: "seitheben", name: "Seitheben", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["schultern"] },
  { id: "trizepsdruecken", name: "Trizepsdrücken", kategorie: "Push", geraet: "Kabel", muskeln: ["trizeps"] },
  { id: "dips", name: "Dips", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["trizeps", "brust"], sekundaer: ["schultern"] },

  { id: "klimmzuege", name: "Klimmzüge", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["ruecken", "bizeps"], sekundaer: ["unterarme"] },
  { id: "latzug", name: "Latzug", kategorie: "Pull", geraet: "Kabel", muskeln: ["ruecken", "bizeps"] },
  { id: "rudern", name: "Rudern", kategorie: "Pull", geraet: "Langhantel", muskeln: ["ruecken", "trapez"], sekundaer: ["bizeps", "unterer_ruecken"] },
  { id: "kreuzheben", name: "Kreuzheben", kategorie: "Pull", geraet: "Langhantel", muskeln: ["unterer_ruecken", "beinbizeps", "gesaess"], sekundaer: ["ruecken", "trapez"] },
  { id: "bizepscurls", name: "Bizepscurls", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["bizeps"], sekundaer: ["unterarme"] },
  { id: "facepulls", name: "Face Pulls", kategorie: "Pull", geraet: "Kabel", muskeln: ["trapez", "schultern"] },

  { id: "kniebeugen", name: "Kniebeugen", kategorie: "Beine", geraet: "Langhantel", muskeln: ["quadrizeps", "gesaess"], sekundaer: ["beinbizeps", "unterer_ruecken"] },
  { id: "beinpresse", name: "Beinpresse", kategorie: "Beine", geraet: "Maschine", muskeln: ["quadrizeps", "gesaess"] },
  { id: "ausfallschritte", name: "Ausfallschritte", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "gesaess", "beinbizeps"] },
  { id: "beincurls", name: "Beincurls", kategorie: "Beine", geraet: "Maschine", muskeln: ["beinbizeps"] },
  { id: "wadenheben", name: "Wadenheben", kategorie: "Beine", geraet: "Maschine", muskeln: ["waden"] },

  { id: "crunches", name: "Crunches", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
  { id: "planke", name: "Planke", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
  { id: "beinheben", name: "Beinheben", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },

  // Calisthenics / ohne Gym – ergänzen die Splits im Heim-Modus.
  { id: "pikepush", name: "Pike Push-ups", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["schultern", "trizeps"] },
  { id: "tischrudern", name: "Tisch-Rudern (Australian Pull-ups)", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["ruecken", "bizeps"], sekundaer: ["trapez"] },
  { id: "superman", name: "Superman", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["unterer_ruecken"], sekundaer: ["gesaess"] },
  { id: "pistol", name: "Pistol Squats", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "gesaess"] },
  { id: "bulgarisch", name: "Bulgarische Kniebeugen", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "gesaess"], sekundaer: ["beinbizeps"] },
  { id: "glutebridge", name: "Glute Bridge", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["gesaess", "beinbizeps"] },
  { id: "wadenheben_einbein", name: "Wadenheben einbeinig", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["waden"] },

  // ---- Gym: weitere Übungen ----
  { id: "kh_bankdruecken", name: "Kurzhantel-Bankdrücken", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["brust", "trizeps"], sekundaer: ["schultern"] },
  { id: "fliegende", name: "Fliegende", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["brust"] },
  { id: "kabelzuege_kreuz", name: "Kabelzüge über Kreuz", kategorie: "Push", geraet: "Kabel", muskeln: ["brust"] },
  { id: "arnold_press", name: "Arnold Press", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["schultern"], sekundaer: ["trizeps"] },
  { id: "frontheben", name: "Frontheben", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["schultern"] },
  { id: "french_press", name: "French Press", kategorie: "Push", geraet: "SZ-Stange", muskeln: ["trizeps"] },
  { id: "ueberkopf_trizeps", name: "Überkopf-Trizepsdrücken", kategorie: "Push", geraet: "Kurzhantel", muskeln: ["trizeps"] },
  { id: "t_bar_rudern", name: "T-Bar-Rudern", kategorie: "Pull", geraet: "Langhantel", muskeln: ["ruecken", "trapez"], sekundaer: ["bizeps"] },
  { id: "kh_rudern", name: "Einarmiges Kurzhantel-Rudern", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["ruecken"], sekundaer: ["bizeps", "trapez"] },
  { id: "reverse_flys", name: "Reverse Flys", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["schultern", "trapez"] },
  { id: "shrugs", name: "Shrugs", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["trapez"] },
  { id: "hammercurls", name: "Hammercurls", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["bizeps", "unterarme"] },
  { id: "sz_curls", name: "SZ-Curls", kategorie: "Pull", geraet: "SZ-Stange", muskeln: ["bizeps"] },
  { id: "ueberzuege", name: "Überzüge", kategorie: "Pull", geraet: "Kurzhantel", muskeln: ["ruecken", "brust"] },
  { id: "good_mornings", name: "Good Mornings", kategorie: "Pull", geraet: "Langhantel", muskeln: ["unterer_ruecken", "beinbizeps"], sekundaer: ["gesaess"] },
  { id: "front_squats", name: "Frontkniebeugen", kategorie: "Beine", geraet: "Langhantel", muskeln: ["quadrizeps"], sekundaer: ["gesaess", "bauch"] },
  { id: "goblet_squats", name: "Goblet Squats", kategorie: "Beine", geraet: "Kurzhantel", muskeln: ["quadrizeps", "gesaess"] },
  { id: "rumaenisches_kh", name: "Rumänisches Kreuzheben", kategorie: "Beine", geraet: "Langhantel", muskeln: ["beinbizeps", "gesaess"], sekundaer: ["unterer_ruecken"] },
  { id: "hip_thrust", name: "Hip Thrust", kategorie: "Beine", geraet: "Langhantel", muskeln: ["gesaess"], sekundaer: ["beinbizeps"] },
  { id: "beinstrecker", name: "Beinstrecker", kategorie: "Beine", geraet: "Maschine", muskeln: ["quadrizeps"] },
  { id: "stehendes_wadenheben", name: "Stehendes Wadenheben", kategorie: "Beine", geraet: "Maschine", muskeln: ["waden"] },
  { id: "cable_crunch", name: "Kabel-Crunches", kategorie: "Core", geraet: "Kabel", muskeln: ["bauch"] },

  // ---- Calisthenics: weitere Übungen ----
  { id: "diamant_liegestuetze", name: "Diamant-Liegestütze", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["trizeps", "brust"] },
  { id: "breite_liegestuetze", name: "Breite Liegestütze", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["brust"], sekundaer: ["schultern"] },
  { id: "erhoehte_liegestuetze", name: "Erhöhte Liegestütze (Füße hoch)", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["brust", "schultern"], sekundaer: ["trizeps"] },
  { id: "archer_pushups", name: "Archer Push-ups", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["brust", "trizeps"] },
  { id: "handstand_pushups", name: "Handstand Push-ups (Wand)", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["schultern", "trizeps"] },
  { id: "bankdips", name: "Bank-Dips", kategorie: "Push", geraet: "Körpergewicht", muskeln: ["trizeps"] },
  { id: "chinups", name: "Chin-ups (Untergriff)", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["bizeps", "ruecken"] },
  { id: "breite_klimmzuege", name: "Breite Klimmzüge", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["ruecken"], sekundaer: ["bizeps"] },
  { id: "negativ_klimmzuege", name: "Negativ-Klimmzüge", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["ruecken", "bizeps"] },
  { id: "scapula_pulls", name: "Scapula Pull-ups", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["trapez", "ruecken"] },
  { id: "reverse_snow_angels", name: "Reverse Snow Angels", kategorie: "Pull", geraet: "Körpergewicht", muskeln: ["trapez", "schultern"], sekundaer: ["unterer_ruecken"] },
  { id: "sprungkniebeugen", name: "Sprungkniebeugen", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "waden"], sekundaer: ["gesaess"] },
  { id: "wandsitzen", name: "Wandsitzen", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps"] },
  { id: "stepups", name: "Step-ups", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "gesaess"] },
  { id: "nordic_curls", name: "Nordic Hamstring Curls", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["beinbizeps"] },
  { id: "einbein_glutebridge", name: "Einbeinige Glute Bridge", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["gesaess", "beinbizeps"] },
  { id: "seitliche_ausfallschritte", name: "Seitliche Ausfallschritte", kategorie: "Beine", geraet: "Körpergewicht", muskeln: ["quadrizeps", "gesaess"] },
  { id: "hollow_hold", name: "Hollow Body Hold", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
  { id: "mountain_climbers", name: "Mountain Climbers", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"], sekundaer: ["schultern"] },
  { id: "russian_twists", name: "Russian Twists", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
  { id: "seitstuetz", name: "Seitstütz", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
  { id: "v_ups", name: "V-Ups", kategorie: "Core", geraet: "Körpergewicht", muskeln: ["bauch"] },
]

export const KATEGORIEN = ["Push", "Pull", "Beine", "Core"]

export function uebungVon(id) {
  return UEBUNGEN.find((u) => u.id === id) ?? null
}

// Alle Muskelgruppen einer Übungsliste (primär) als Set von Keys.
export function muskelnVon(uebungIds) {
  const set = new Set()
  for (const id of uebungIds) {
    const u = uebungVon(id)
    if (u) u.muskeln.forEach((m) => set.add(m))
  }
  return set
}
