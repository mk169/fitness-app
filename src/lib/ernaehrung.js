// Ernährung besteht aus zwei unabhängigen Ebenen:
//   1. KONZEPTE  – die Ernährungsweise (Standard, Ray Peat, Keto …)
//   2. FASTEN     – Methoden mit einem oder mehreren Essensfenstern.
// Beides lässt sich frei kombinieren.

export const KONZEPTE = [
  {
    id: "standard",
    name: "Ausgewogen",
    kurz: "Standard",
    farbe: "gray",
    idee: "Ausgewogene Mischkost nach deinen Makro-Zielen – kein Nahrungsmittel ist verboten.",
    prinzipien: [
      "Makro-Ziele aus dem Algorithmus als Rahmen",
      "Viel Gemüse, ausreichend Protein",
      "Vollkorn, gute Fette, wenig Zucker",
    ],
  },
  {
    id: "peat",
    name: "Ray Peat",
    kurz: "Pro-metabolisch",
    farbe: "amber",
    idee: "Stoffwechsel-orientiert nach Ray Peat: leicht verdauliche, sättigende Kost für Schilddrüse & Energie.",
    prinzipien: [
      "Fructose & Saccharose aus reifem Obst, Saft, Honig",
      "Milch, Käse, Gelatine als Protein",
      "Gesättigte Fette (Kokos, Butter), wenig PUFA",
      "Regelmäßig essen – Fasten wird eher gemieden",
    ],
  },
  {
    id: "keto",
    name: "Keto",
    kurz: "< 30 g Carbs",
    farbe: "emerald",
    idee: "Sehr kohlenhydratarm, fettbetont – Energie aus Ketonkörpern.",
    prinzipien: [
      "< 20–30 g Kohlenhydrate pro Tag",
      "Hoher Fettanteil, moderates Protein",
      "Elektrolyte beachten (Natrium, Kalium, Magnesium)",
    ],
  },
  {
    id: "highprotein",
    name: "High Protein",
    kurz: "proteinreich",
    farbe: "rose",
    idee: "Proteinbetont – ideal in Diät (Sättigung) und Aufbau (Muskelerhalt).",
    prinzipien: [
      "≥ 2 g Protein pro kg Körpergewicht",
      "Mageres Fleisch, Fisch, Eier, Quark, Hülsenfrüchte",
      "Protein auf alle Mahlzeiten verteilen",
    ],
  },
  {
    id: "mediterran",
    name: "Mediterran",
    kurz: "herzgesund",
    farbe: "sky",
    idee: "Traditionelle Mittelmeerküche – die am besten untersuchte Ernährungsform für Herz-Kreislauf-Gesundheit und Langlebigkeit.",
    prinzipien: [
      "Olivenöl als Hauptfettquelle, Nüsse & Samen",
      "Viel Gemüse, Hülsenfrüchte, Obst, Vollkorn",
      "Fisch & Meeresfrüchte mehrmals pro Woche",
      "Rotes Fleisch selten, Zucker & Fertigkost meiden",
    ],
  },
  {
    id: "paleo",
    name: "Paleo",
    kurz: "unverarbeitet",
    farbe: "orange",
    idee: "„Steinzeit-Ernährung“ – nur unverarbeitete Lebensmittel, keine Getreide, Milchprodukte oder Industriezucker.",
    prinzipien: [
      "Fleisch, Fisch, Eier, Gemüse, Obst, Nüsse",
      "Keine Getreideprodukte & Hülsenfrüchte",
      "Keine Milchprodukte & raffinierten Zucker",
      "Gute Fette aus Avocado, Kokos, Olivenöl",
    ],
  },
  {
    id: "vegan",
    name: "Pflanzlich",
    kurz: "vegan",
    farbe: "lime",
    idee: "Rein pflanzliche Kost – mit etwas Planung gut für Muskelaufbau und Gesundheit geeignet.",
    prinzipien: [
      "Proteinquellen: Hülsenfrüchte, Tofu, Tempeh, Seitan",
      "Vielfalt für alle essenziellen Aminosäuren",
      "Vitamin B12 supplementieren, auf Eisen & Omega-3 achten",
      "Vollwertig statt hochverarbeiteter Ersatzprodukte",
    ],
  },
  {
    id: "carnivore",
    name: "Carnivore",
    kurz: "tierisch",
    farbe: "red",
    idee: "Ausschließlich tierische Lebensmittel – maximal kohlenhydratarm, sehr eliminierend. Eher ein Experiment als Dauerlösung.",
    prinzipien: [
      "Fleisch, Innereien, Fisch, Eier, etwas Butter",
      "Nahezu keine Kohlenhydrate",
      "Fettreiche Stücke für ausreichend Energie",
      "Elektrolyte & regelmäßige Blutwerte im Blick behalten",
    ],
  },
  {
    id: "lowcarb",
    name: "Low Carb",
    kurz: "50–100 g Carbs",
    farbe: "teal",
    idee: "Moderat kohlenhydratreduziert – flexibler als Keto, gut für Fettabbau und stabile Blutzuckerwerte.",
    prinzipien: [
      "50–100 g Kohlenhydrate pro Tag",
      "Carbs vor allem rund ums Training",
      "Reichlich Protein & Gemüse, gute Fette",
      "Zucker & Weißmehl weitgehend meiden",
    ],
  },
  {
    id: "carbcycling",
    name: "Carb-Cycling",
    kurz: "Carbs wechseln",
    farbe: "violet",
    idee: "Kohlenhydrate nach Trainingsbelastung steuern: viel an harten Tagen, wenig an Ruhetagen – Leistung trifft Fettabbau.",
    prinzipien: [
      "High-Carb an intensiven Trainingstagen",
      "Low-Carb an Ruhe- & Cardio-Tagen",
      "Protein täglich hoch halten",
      "Fett steigt an Low-Carb-Tagen als Energiequelle",
    ],
  },
]

// Fasten-Methoden. fenster = Standard-Essensfenster (Stunden 0–24). Bei
// Methoden ohne feste Uhrzeit (z. B. 5:2) bleibt fenster leer und es zählt
// fastenTage / Beschreibung.
export const FASTEN_METHODEN = [
  { id: "keins", name: "Kein Fasten", kurz: "durchgehend", fenster: [], beschreibung: "Keine feste Fastenphase – iss nach deinem Konzept." },
  { id: "14:10", name: "14:10", kurz: "sanft", fenster: [{ start: 10, ende: 20 }], beschreibung: "14 h fasten, 10 h essen. Guter Einstieg." },
  { id: "16:8", name: "16:8", kurz: "klassisch", fenster: [{ start: 12, ende: 20 }], beschreibung: "16 h fasten, 8 h Essensfenster." },
  { id: "18:6", name: "18:6", kurz: "fortgeschritten", fenster: [{ start: 14, ende: 20 }], beschreibung: "18 h fasten, 6 h essen." },
  { id: "omad", name: "OMAD 20:4", kurz: "1 Mahlzeit", fenster: [{ start: 17, ende: 21 }], beschreibung: "Eine Mahlzeit pro Tag, ~20 h fasten." },
  { id: "warrior", name: "Warrior 23:1", kurz: "sehr strikt", fenster: [{ start: 18, ende: 19 }], beschreibung: "23 h fasten mit einem einzigen, üppigen Abendessen." },
  { id: "5:2", name: "5:2", kurz: "2 Fastentage", fenster: [], beschreibung: "5 Tage normal, an 2 Tagen stark reduziert (~500–600 kcal)." },
  { id: "adf", name: "Alternierend (ADF)", kurz: "jeden 2. Tag", fenster: [], beschreibung: "Im Wechsel ein normaler und ein Fastentag (~500 kcal)." },
  { id: "eatstopeat", name: "Eat-Stop-Eat", kurz: "1–2× 24 h", fenster: [], beschreibung: "Ein- bis zweimal pro Woche ein volles 24-h-Fasten." },
  { id: "custom", name: "Eigene Fenster", kurz: "individuell", fenster: [{ start: 8, ende: 12 }, { start: 17, ende: 21 }], beschreibung: "Mehrere eigene Essensfenster frei definieren." },
]

export function konzeptVon(id) {
  return KONZEPTE.find((k) => k.id === id) ?? KONZEPTE[0]
}
export function methodeVon(id) {
  return FASTEN_METHODEN.find((m) => m.id === id) ?? FASTEN_METHODEN[0]
}

export const FASTEN_STANDARD = { methode: "16:8", fenster: [{ start: 12, ende: 20 }] }

// ---- Mehrtägige Fastenphasen (z. B. 48-h- oder 72-h-Fasten) ----
// Eine Phase: { id, start: "JJJJ-MM-TT", tage: Zahl }

function tagesDiff(vonKey, bisKey) {
  const von = new Date(`${vonKey}T00:00:00`)
  const bis = new Date(`${bisKey}T00:00:00`)
  return Math.round((bis - von) / (1000 * 60 * 60 * 24))
}

// Status einer Phase an einem Datum: kommend / aktiv (mit Tag x) / beendet.
export function phasenStatus(phase, datumKey) {
  const tag = tagesDiff(phase.start, datumKey)
  if (tag < 0) return { status: "kommend", inTagen: -tag }
  if (tag >= phase.tage) return { status: "beendet" }
  return { status: "aktiv", tag: tag + 1 }
}

// Die heute aktive Phase (oder null).
export function aktivePhase(phasen, datumKey) {
  for (const p of phasen ?? []) {
    const s = phasenStatus(p, datumKey)
    if (s.status === "aktiv") return { ...p, tag: s.tag }
  }
  return null
}

export const FARBEN = {
  gray: { chip: "bg-white/10 text-muted", rand: "border-white/20", punkt: "bg-slate-400" },
  amber: { chip: "bg-amber-500/15 text-amber-300", rand: "border-amber-400/50", punkt: "bg-amber-400" },
  sky: { chip: "bg-sky-500/15 text-sky-300", rand: "border-sky-400/50", punkt: "bg-sky-400" },
  rose: { chip: "bg-rose-500/15 text-rose-300", rand: "border-rose-400/50", punkt: "bg-rose-400" },
  emerald: { chip: "bg-emerald-500/15 text-emerald-300", rand: "border-emerald-400/50", punkt: "bg-emerald-400" },
  orange: { chip: "bg-orange-500/15 text-orange-300", rand: "border-orange-400/50", punkt: "bg-orange-400" },
  lime: { chip: "bg-lime-500/15 text-lime-300", rand: "border-lime-400/50", punkt: "bg-lime-400" },
  red: { chip: "bg-red-500/15 text-red-300", rand: "border-red-400/50", punkt: "bg-red-400" },
  teal: { chip: "bg-teal-500/15 text-teal-300", rand: "border-teal-400/50", punkt: "bg-teal-400" },
  violet: { chip: "bg-violet-500/15 text-violet-300", rand: "border-violet-400/50", punkt: "bg-violet-400" },
}

// Aus einer Liste von Essensfenstern die aktuelle Fasten-Situation
// berechnen: ob gerade ein Fenster offen ist und wie lange bis zum
// nächsten Wechsel (in Stunden, dezimal).
export function fastenStatus(fenster, jetztStunde) {
  if (!fenster || fenster.length === 0) return null
  const offen = fenster.find((f) => jetztStunde >= f.start && jetztStunde < f.ende)
  if (offen) {
    return { imFenster: true, bis: offen.ende - jetztStunde, fenster: offen }
  }
  // Nächster Fensterbeginn (heute oder morgen).
  let minAbstand = Infinity
  let naechstes = null
  for (const f of fenster) {
    const abstand = (f.start - jetztStunde + 24) % 24
    if (abstand < minAbstand) {
      minAbstand = abstand
      naechstes = f
    }
  }
  return { imFenster: false, bis: minAbstand, fenster: naechstes }
}
